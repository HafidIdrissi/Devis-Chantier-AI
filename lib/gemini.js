const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function parseJsonText(raw) {
  const cleaned = String(raw || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
  throw new Error("Réponse Gemini non exploitable.");
}

function normalizeDevis(devis) {
  const lines = Array.isArray(devis.lignes) ? devis.lignes : [];
  return {
    titre: devis.titre || "Devis travaux BTP",
    description_generale: devis.description_generale || "",
    lignes: lines.slice(0, 12).map(line => ({
      id: line.id || Math.random().toString(36).slice(2, 11),
      designation: String(line.designation || "Prestation").slice(0, 180),
      unite: String(line.unite || "forfait").slice(0, 20),
      quantite: Number(line.quantite) || 1,
      prix_unitaire_ht: Number(line.prix_unitaire_ht) || 0,
      tva: [0, 5.5, 10, 20].includes(Number(line.tva)) ? Number(line.tva) : 10,
      categorie: ["Main d'oeuvre", "Fournitures", "Matériaux", "Divers"].includes(line.categorie)
        ? line.categorie
        : "Divers",
    })),
    conditions: devis.conditions || "Devis indicatif à confirmer après visite technique. Prix valables selon disponibilité des matériaux.",
    validite: devis.validite || "30 jours",
  };
}

function buildGeminiRequest({ description, imageBase64, imageType, companyName }) {
  const parts = [];
  if (imageBase64 && imageType) {
    parts.push({ inlineData: { mimeType: imageType, data: imageBase64 } });
  }
  parts.push({
    text: [
      "Tu es un assistant expert en devis BTP français.",
      "Génère un devis professionnel réaliste à partir de la demande.",
      "Réponds uniquement en JSON valide, sans markdown.",
      "Structure exacte: {\"titre\":\"\",\"description_generale\":\"\",\"lignes\":[{\"designation\":\"\",\"unite\":\"\",\"quantite\":1,\"prix_unitaire_ht\":0,\"tva\":10,\"categorie\":\"Main d'oeuvre\"}],\"conditions\":\"\",\"validite\":\"30 jours\"}.",
      "Contraintes: 6 à 10 lignes, prix HT réalistes en France, catégories parmi Main d'oeuvre/Fournitures/Matériaux/Divers, TVA 10% rénovation, 20% neuf, 5.5% rénovation énergétique.",
      `Entreprise: ${companyName || "Entreprise BTP"}.`,
      `Demande client: ${description || "Analyser la photo chantier fournie."}`,
    ].join("\n"),
  });

  return {
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.35,
      responseMimeType: "application/json",
    },
  };
}

function validatePayload(payload) {
  const description = String(payload.description || "").trim();
  const imageBase64 = payload.imageBase64 ? String(payload.imageBase64) : "";

  if (!description && !imageBase64) {
    throw new Error("Ajoutez une description ou une photo.");
  }
  if (description.length > 2500) {
    throw new Error("Description trop longue pour la démo.");
  }
  if (imageBase64.length > 7_000_000) {
    throw new Error("Image trop volumineuse pour la démo.");
  }
}

async function generateDevis(payload) {
  validatePayload(payload);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Clé Gemini manquante. Ajoutez GEMINI_API_KEY dans les variables d'environnement.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildGeminiRequest(payload)),
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error?.message || `Erreur Gemini ${response.status}`;
    throw new Error(message);
  }

  const text = data?.candidates?.[0]?.content?.parts?.find(part => part.text)?.text;
  return normalizeDevis(parseJsonText(text));
}

module.exports = { generateDevis };
