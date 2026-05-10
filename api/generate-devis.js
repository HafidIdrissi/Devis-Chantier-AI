const { generateDevis } = require("../lib/gemini");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  try {
    const devis = await generateDevis(req.body || {});
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(devis);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Erreur génération devis." });
  }
};
