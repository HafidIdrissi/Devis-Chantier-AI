import { useState, useRef, useCallback } from "react";

// ─── Utils ────────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).substr(2, 9);
const fmt = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n || 0);
const todayFr = () => new Date().toLocaleDateString("fr-FR");
const TVA_OPTS = [0, 5.5, 10, 20];
const CATS = ["Main d'oeuvre", "Fournitures", "Matériaux", "Divers"];

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:         "#F7F6F3",
  surface:    "#FFFFFF",
  surfaceAlt: "#F0EEE9",
  border:     "#E5E1D8",
  borderMd:   "#CAC5BB",
  ink:        "#18170F",
  inkMid:     "#55524A",
  inkLight:   "#8C897F",
  accent:     "#1A4A7A",
  accentHv:   "#15406B",
  accentDk:   "#0F2E50",
  accentLt:   "#EBF2FA",
  accentMid:  "#3B72A8",
  gold:       "#B45309",
  goldLt:     "#FEF3C7",
  green:      "#166534",
  greenLt:    "#DCFCE7",
  red:        "#991B1B",
  redLt:      "#FEE2E2",
  blue:       "#1D4ED8",
  blueLt:     "#EFF6FF",
  r:          "10px",
  rLg:        "16px",
  rXl:        "22px",
  ff:         "'Inter', system-ui, -apple-system, sans-serif",
  sh1:        "0 1px 4px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
  sh2:        "0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.05)",
  sh3:        "0 10px 36px rgba(0,0,0,.1), 0 4px 12px rgba(0,0,0,.06)",
  sh4:        "0 24px 60px rgba(0,0,0,.14), 0 8px 20px rgba(0,0,0,.08)",
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{font-family:${T.ff};color:${T.ink};background:${T.bg};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
input,select,textarea,button{font-family:${T.ff}}
input:focus,select:focus,textarea:focus{outline:none !important;border-color:${T.accentMid} !important;box-shadow:0 0 0 3px rgba(59,114,168,.14) !important}
a{color:inherit}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.fade-up{animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both}

.btn{transition:all .16s cubic-bezier(.4,0,.2,1) !important}
.btn:active{transform:scale(.97) !important}
.btn-primary:hover{background:${T.accentHv} !important;transform:translateY(-1px) !important;box-shadow:0 6px 24px rgba(26,74,122,.3) !important}
.btn-outline:hover{background:${T.accentLt} !important;transform:translateY(-1px) !important}
.btn-ghost:hover{background:${T.surfaceAlt} !important}
.btn-white:hover{box-shadow:0 4px 18px rgba(0,0,0,.13) !important;transform:translateY(-1px) !important}
.btn-gold:hover{background:#92400E !important;transform:translateY(-1px) !important}

.feature-card{transition:transform .22s cubic-bezier(.4,0,.2,1),box-shadow .22s,border-color .22s !important}
.feature-card:hover{transform:translateY(-5px) !important;box-shadow:${T.sh3} !important;border-color:${T.borderMd} !important}

.trow{transition:background .1s}
.trow:hover>td{background:${T.accentLt} !important}

.metier-pill{transition:all .14s cubic-bezier(.4,0,.2,1) !important}
.metier-pill:hover{background:${T.accentLt} !important;border-color:${T.accentMid} !important;color:${T.accent} !important;transform:translateY(-1px) !important;box-shadow:${T.sh1} !important}

.add-row-btn{transition:background .13s,color .13s}
.add-row-btn:hover{background:${T.accentLt} !important;color:${T.accent} !important}

.stat-card{transition:transform .2s,box-shadow .2s}
.stat-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.15) !important}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${T.borderMd};border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:${T.inkLight}}
`;

// ─── Primitive components ─────────────────────────────────────────────────────
const iSt = { width:"100%", padding:"10px 14px", border:`1.5px solid ${T.border}`, borderRadius:T.r, fontSize:13, color:T.ink, background:T.surface, fontFamily:T.ff, outline:"none", transition:"border-color .15s, box-shadow .15s" };
const lbSt = { display:"block", fontSize:11, fontWeight:700, color:T.inkLight, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 };

function Btn({ children, onClick, v="primary", full=false, sm=false, disabled=false, style:sx={} }) {
  const base = { fontFamily:T.ff, fontWeight:600, cursor:disabled?"not-allowed":"pointer", borderRadius:T.r, border:"none", opacity:disabled?.45:1, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:6, justifyContent:"center", width:full?"100%":"auto", padding:sm?"8px 16px":"11px 24px", fontSize:sm?12:13, letterSpacing:"0.01em", ...sx };
  const vars = {
    primary: { background:T.accent, color:"#fff", boxShadow:"0 1px 4px rgba(26,74,122,.22)" },
    outline: { background:"transparent", color:T.accent, border:`1.5px solid ${T.accent}` },
    ghost:   { background:"transparent", color:T.inkMid, border:`1.5px solid ${T.border}` },
    white:   { background:T.surface, color:T.accent, border:`1.5px solid ${T.border}`, boxShadow:T.sh1 },
    gold:    { background:T.gold, color:"#fff", boxShadow:"0 1px 4px rgba(180,83,9,.22)" },
  };
  return (
    <button onClick={disabled?undefined:onClick} className={`btn btn-${v}`} style={{ ...base, ...vars[v], ...sx }}>
      {children}
    </button>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label style={lbSt}>{label}</label>}
      <input style={iSt} {...props} />
    </div>
  );
}

function Badge({ children, color="blue" }) {
  const map = { blue:{bg:T.blueLt,c:T.blue,br:"rgba(29,78,216,.15)"}, green:{bg:T.greenLt,c:T.green,br:"rgba(22,101,52,.15)"}, gold:{bg:T.goldLt,c:T.gold,br:"rgba(180,83,9,.15)"}, red:{bg:T.redLt,c:T.red,br:"rgba(153,27,27,.15)"} };
  const m = map[color]||map.blue;
  return <span style={{ background:m.bg, color:m.c, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:"0.04em", border:`1px solid ${m.br}` }}>{children}</span>;
}

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = {
  "Électricité": [
    { designation:"Tableau électrique 13 postes + disjoncteur", unite:"forfait", quantite:1, prix_unitaire_ht:480, tva:10, categorie:"Fournitures" },
    { designation:"Pose tableau électrique", unite:"h", quantite:4, prix_unitaire_ht:55, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Câble électrique 2.5mm² bobine 100m", unite:"bobine", quantite:2, prix_unitaire_ht:85, tva:10, categorie:"Matériaux" },
    { designation:"Prise de courant 16A", unite:"u", quantite:8, prix_unitaire_ht:12, tva:10, categorie:"Fournitures" },
    { designation:"Installation prise courant (pose + câblage)", unite:"u", quantite:8, prix_unitaire_ht:35, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Mise à la terre + test conformité", unite:"forfait", quantite:1, prix_unitaire_ht:220, tva:10, categorie:"Main d'oeuvre" },
  ],
  "Plomberie": [
    { designation:"Mitigeur lavabo", unite:"u", quantite:1, prix_unitaire_ht:120, tva:10, categorie:"Fournitures" },
    { designation:"Pose mitigeur", unite:"h", quantite:1.5, prix_unitaire_ht:60, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Tube cuivre Ø 16mm", unite:"ml", quantite:10, prix_unitaire_ht:8, tva:10, categorie:"Matériaux" },
    { designation:"Débouchage canalisation haute pression", unite:"forfait", quantite:1, prix_unitaire_ht:180, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Remplacement chasse d'eau WC", unite:"forfait", quantite:1, prix_unitaire_ht:95, tva:10, categorie:"Fournitures" },
  ],
  "Peinture": [
    { designation:"Peinture acrylique murs blanc mat 15L", unite:"pot", quantite:2, prix_unitaire_ht:65, tva:10, categorie:"Matériaux" },
    { designation:"Peinture plafond blanc 10L", unite:"pot", quantite:1, prix_unitaire_ht:45, tva:10, categorie:"Matériaux" },
    { designation:"Préparation support (rebouchage, ponçage)", unite:"m²", quantite:30, prix_unitaire_ht:8, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Application peinture murs 2 couches", unite:"m²", quantite:30, prix_unitaire_ht:12, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Application peinture plafond 2 couches", unite:"m²", quantite:15, prix_unitaire_ht:14, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Fournitures (bâches, rouleaux, masques)", unite:"forfait", quantite:1, prix_unitaire_ht:55, tva:10, categorie:"Fournitures" },
  ],
  "Maçonnerie": [
    { designation:"Béton prêt à l'emploi B25", unite:"m³", quantite:2, prix_unitaire_ht:130, tva:10, categorie:"Matériaux" },
    { designation:"Parpaing 20x20x50 palette", unite:"palette", quantite:3, prix_unitaire_ht:220, tva:10, categorie:"Matériaux" },
    { designation:"Mortier colle sac 25kg", unite:"sac", quantite:10, prix_unitaire_ht:14, tva:10, categorie:"Matériaux" },
    { designation:"Main d'oeuvre maçon qualifié", unite:"h", quantite:16, prix_unitaire_ht:55, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Évacuation gravats benne 5m³", unite:"u", quantite:1, prix_unitaire_ht:280, tva:20, categorie:"Divers" },
  ],
  "Menuiserie": [
    { designation:"Fenêtre PVC double vitrage 120x100cm", unite:"u", quantite:1, prix_unitaire_ht:420, tva:10, categorie:"Fournitures" },
    { designation:"Pose fenêtre PVC", unite:"h", quantite:3, prix_unitaire_ht:58, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Porte intérieure 83x204cm + encadrement", unite:"u", quantite:1, prix_unitaire_ht:280, tva:10, categorie:"Fournitures" },
    { designation:"Pose porte intérieure", unite:"h", quantite:4, prix_unitaire_ht:55, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Quincaillerie (poignées, gonds, joints)", unite:"forfait", quantite:1, prix_unitaire_ht:85, tva:10, categorie:"Fournitures" },
  ],
  "Salle de bain": [
    { designation:"Receveur douche italienne 90x90", unite:"u", quantite:1, prix_unitaire_ht:380, tva:10, categorie:"Fournitures" },
    { designation:"Paroi de douche verre 8mm", unite:"u", quantite:1, prix_unitaire_ht:320, tva:10, categorie:"Fournitures" },
    { designation:"Mitigeur thermostatique douche", unite:"u", quantite:1, prix_unitaire_ht:180, tva:10, categorie:"Fournitures" },
    { designation:"Carrelage sol antidérapant 30x30", unite:"m²", quantite:6, prix_unitaire_ht:35, tva:10, categorie:"Matériaux" },
    { designation:"Faïence murale 20x40", unite:"m²", quantite:18, prix_unitaire_ht:28, tva:10, categorie:"Matériaux" },
    { designation:"Pose carrelage sol", unite:"m²", quantite:6, prix_unitaire_ht:45, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Pose faïence murale", unite:"m²", quantite:18, prix_unitaire_ht:42, tva:10, categorie:"Main d'oeuvre" },
    { designation:"Installation douche + plomberie", unite:"forfait", quantite:1, prix_unitaire_ht:480, tva:10, categorie:"Main d'oeuvre" },
  ],
};

// ─── Gemini API via backend ──────────────────────────────────────────────────
async function genDevis({ description, imageBase64, imageType, companyName }) {
  const res = await fetch("/api/generate-devis", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ description, imageBase64, imageType, companyName }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Impossible de générer le devis.");
  return {
    ...data,
    lignes:(data.lignes || []).map(l => ({ ...l, id:l.id || uid() })),
  };
}

// ─── PDF builder ──────────────────────────────────────────────────────────────
function buildPDF(devis, co, cl, remise, acompte) {
  const htBrut = devis.lignes.reduce((s,l)=>s+l.quantite*l.prix_unitaire_ht,0);
  const mRem = remise.type==="%"?htBrut*(remise.valeur/100):remise.valeur;
  const ht = Math.max(0,htBrut-mRem);
  const ratio = htBrut>0?ht/htBrut:1;
  const tva = devis.lignes.reduce((s,l)=>s+l.quantite*l.prix_unitaire_ht*(l.tva/100),0)*ratio;
  const ttc = ht+tva;
  const mAc = acompte>0?ttc*(acompte/100):0;
  const num = "DEV-"+Date.now().toString().slice(-6);
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Devis ${num}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11.5px;color:#1a1a1a;padding:30px 36px;background:#fff;line-height:1.5}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #1A4A7A}
.logo-area h1{font-size:18px;font-weight:800;letter-spacing:-.5px;color:#1A4A7A}
.logo-area p{font-size:10.5px;color:#666;margin-top:3px;line-height:1.6}
.devis-stamp{text-align:right}
.stamp-box{display:inline-block;background:#1A4A7A;color:#fff;padding:6px 18px;border-radius:4px;font-weight:800;font-size:15px;letter-spacing:.5px}
.stamp-meta{font-size:10.5px;color:#666;margin-top:5px;line-height:1.7}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:22px}
.party{background:#F7F6F3;border:1px solid #E2DED6;border-radius:6px;padding:11px 14px}
.party-label{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#8C897F;margin-bottom:5px}
.party-name{font-size:13px;font-weight:700;margin-bottom:2px}
.party-info{font-size:10.5px;color:#55524A;line-height:1.65}
.devis-header{margin-bottom:16px}
.devis-title{font-size:15px;font-weight:700;margin-bottom:3px}
.devis-desc{font-size:10.5px;color:#666;line-height:1.6}
table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:10.5px}
thead{background:#1A4A7A;color:#fff}
thead th{padding:7px 9px;text-align:left;font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px}
tbody tr:nth-child(even){background:#F7F6F3}
tbody td{padding:7px 9px;border-bottom:1px solid #E2DED6;vertical-align:middle}
td.right{text-align:right;font-weight:600}
.badge{background:#E2DED6;color:#3A3830;font-size:8.5px;padding:2px 5px;border-radius:4px;font-weight:700}
.totals-wrap{display:flex;justify-content:flex-end;margin-bottom:16px}
.totals{width:250px}
.t-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;font-size:11.5px}
.t-remise{color:#166534}
.t-ttc{font-weight:800;font-size:13px;border-bottom:none;border-top:2px solid #1A4A7A;padding-top:6px;margin-top:3px}
.t-ac{color:#1D4ED8;font-weight:600}
.t-sol{color:#991B1B;font-weight:700;font-size:12px}
.conditions{background:#EBF2FA;border-left:3px solid #1A4A7A;padding:10px 14px;margin-bottom:16px;border-radius:0 5px 5px 0}
.conditions h4{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#8C897F;margin-bottom:4px}
.conditions p{font-size:10.5px;color:#333;line-height:1.7}
.signatures{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:22px;padding-top:18px;border-top:1px solid #E2DED6}
.sig-title{font-size:10.5px;font-weight:600;margin-bottom:46px;text-align:center}
.sig-line{border-top:1px solid #ccc;padding-top:5px;font-size:9.5px;color:#888;text-align:center}
.footer{text-align:center;font-size:9.5px;color:#aaa;margin-top:22px;padding-top:10px;border-top:1px solid #eee}
@media print{body{padding:12px 18px}@page{margin:8mm;size:A4}}
</style></head><body>
<div class="header">
  <div class="logo-area">
    <h1>${co.nom||"Mon Entreprise BTP"}</h1>
    <p>${co.adresse?co.adresse+"<br>":""}${co.siret?"SIRET : "+co.siret:""}${co.tva_intra?" &nbsp;&bull;&nbsp; TVA : "+co.tva_intra:""}${co.email?"<br>"+co.email:""}${co.telephone?" &nbsp;&bull;&nbsp; "+co.telephone:""}</p>
  </div>
  <div class="devis-stamp">
    <div class="stamp-box">DEVIS</div>
    <p class="stamp-meta">N&deg; ${num}<br>Émis le ${todayFr()}<br>Validité : ${devis.validite||"30 jours"}</p>
  </div>
</div>
<div class="parties">
  <div class="party"><div class="party-label">Émetteur</div><div class="party-name">${co.nom||"—"}</div><div class="party-info">${co.adresse||""}</div></div>
  <div class="party"><div class="party-label">Client</div><div class="party-name">${cl.nom||"Client"}</div><div class="party-info">${cl.adresse||""}${cl.email?"<br>"+cl.email:""}</div></div>
</div>
<div class="devis-header">
  <div class="devis-title">${devis.titre||"Devis BTP"}</div>
  <div class="devis-desc">${devis.description_generale||""}</div>
</div>
<table>
  <thead><tr>
    <th style="width:34%">Désignation</th><th style="width:12%">Catégorie</th>
    <th style="width:7%">Unité</th><th style="width:7%">Qté</th>
    <th style="width:11%">PU HT</th><th style="width:7%">TVA</th>
    <th style="width:11%;text-align:right">Total HT</th>
  </tr></thead>
  <tbody>
    ${devis.lignes.map(l=>`<tr>
      <td>${l.designation}</td>
      <td><span class="badge">${l.categorie||""}</span></td>
      <td>${l.unite}</td><td>${l.quantite}</td>
      <td>${fmt(l.prix_unitaire_ht)}</td><td>${l.tva}%</td>
      <td class="right">${fmt(l.quantite*l.prix_unitaire_ht)}</td>
    </tr>`).join("")}
  </tbody>
</table>
<div class="totals-wrap"><div class="totals">
  <div class="t-row"><span>Total HT brut</span><span>${fmt(htBrut)}</span></div>
  ${mRem>0?`<div class="t-row t-remise"><span>Remise (${remise.valeur}${remise.type})</span><span>− ${fmt(mRem)}</span></div><div class="t-row"><span>Total HT net</span><span>${fmt(ht)}</span></div>`:""}
  <div class="t-row"><span>TVA</span><span>${fmt(tva)}</span></div>
  <div class="t-row t-ttc"><span>TOTAL TTC</span><span>${fmt(ttc)}</span></div>
  ${mAc>0?`<div class="t-row t-ac"><span>Acompte (${acompte}%)</span><span>${fmt(mAc)}</span></div><div class="t-row t-sol"><span>Solde à payer</span><span>${fmt(ttc-mAc)}</span></div>`:""}
</div></div>
<div class="conditions"><h4>Conditions &amp; Modalités</h4><p>${devis.conditions||"Acompte de 30% à la commande. Solde à réception des travaux."}</p></div>
<div class="signatures">
  <div><div class="sig-title">Signature de l'entreprise</div><div class="sig-line">Nom, date et cachet</div></div>
  <div><div class="sig-title">Bon pour accord — Signature client</div><div class="sig-line">Précédé de "Bon pour accord"</div></div>
</div>
<div class="footer">Généré le ${todayFr()} &nbsp;&bull;&nbsp; ${co.nom||"Entreprise BTP"} &nbsp;&bull;&nbsp; Devis non contractuel avant signature</div>
<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script>
</body></html>`;
}

function doPrint(devis, co, cl, remise, acompte) {
  const html = buildPDF(devis, co, cl, remise, acompte);
  const blob = new Blob([html], { type:"text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    const a = Object.assign(document.createElement("a"), { href:url, download:`devis-${Date.now().toString().slice(-6)}.html` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  setTimeout(()=>URL.revokeObjectURL(url), 15000);
}
function doDownload(devis, co, cl, remise, acompte) {
  const html = buildPDF(devis, co, cl, remise, acompte).replace(/<script>[\s\S]*?<\/script>/g,"");
  const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"})), download:`devis-${Date.now().toString().slice(-6)}.html` });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ─── Templates modal ──────────────────────────────────────────────────────────
function TemplatesModal({ onInsert, onClose }) {
  const [metier, setMetier] = useState(Object.keys(TEMPLATES)[0]);
  const [sel, setSel] = useState([]);
  const toggle = i => setSel(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i]);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(15,18,30,.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:T.surface, borderRadius:T.rXl, width:"100%", maxWidth:660, overflow:"hidden", boxShadow:T.sh4, border:`1px solid ${T.border}` }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontWeight:800, fontSize:15, color:T.ink, letterSpacing:"-0.3px" }}>Templates de prestations</p>
            <p style={{ fontSize:12, color:T.inkLight, marginTop:2 }}>Sélectionnez les lignes à insérer</p>
          </div>
          <button onClick={onClose} style={{ background:T.surfaceAlt, border:"none", cursor:"pointer", fontSize:16, color:T.inkMid, lineHeight:1, width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ display:"flex", gap:6, padding:"14px 24px 0", flexWrap:"wrap" }}>
          {Object.keys(TEMPLATES).map(m=>(
            <button key={m} onClick={()=>{setMetier(m);setSel([]);}}
              style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, fontFamily:T.ff, cursor:"pointer", border:"1.5px solid", borderColor:metier===m?T.accent:T.border, background:metier===m?T.accentLt:"transparent", color:metier===m?T.accent:T.inkMid, transition:"all .14s" }}>
              {m}
            </button>
          ))}
        </div>
        <div style={{ maxHeight:300, overflowY:"auto", padding:"10px 24px" }}>
          {TEMPLATES[metier].map((l,i)=>(
            <div key={i} onClick={()=>toggle(i)} className="tpl-item"
              style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, cursor:"pointer", marginBottom:3, border:"1px solid", borderColor:sel.includes(i)?T.accent:"transparent", background:sel.includes(i)?T.accentLt:T.bg, transition:"all .12s" }}>
              <div style={{ width:18, height:18, borderRadius:4, border:`1.5px solid`, borderColor:sel.includes(i)?T.accent:T.borderMd, background:sel.includes(i)?T.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {sel.includes(i)&&<span style={{ color:"#fff", fontSize:11, fontWeight:700, lineHeight:1 }}>✓</span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, color:T.ink, fontWeight:500 }}>{l.designation}</p>
                <p style={{ fontSize:11, color:T.inkLight, marginTop:2 }}>{l.quantite} {l.unite} · {fmt(l.prix_unitaire_ht)}/unité · TVA {l.tva}%</p>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:T.accent, flexShrink:0 }}>{fmt(l.quantite*l.prix_unitaire_ht)}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"14px 24px", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:T.bg }}>
          <span style={{ fontSize:12, color:T.inkLight }}>{sel.length} sélectionnée(s)</span>
          <div style={{ display:"flex", gap:8 }}>
            <Btn v="ghost" sm onClick={()=>setSel(TEMPLATES[metier].map((_,i)=>i))}>Tout sélectionner</Btn>
            <Btn v="primary" sm disabled={sel.length===0} onClick={()=>onInsert(TEMPLATES[metier].filter((_,i)=>sel.includes(i)).map(l=>({...l,id:uid()})))}>
              Insérer {sel.length > 0 ? `(${sel.length})` : ""}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  const [legalPage, setLegalPage] = useState(null);
  const features = [
    { icon:"📸", title:"Photo ou description", desc:"Prenez une photo du chantier ou décrivez les travaux en quelques mots.", color:"#EBF2FA", iconBg:"#DBEAFE" },
    { icon:"🤖", title:"IA génère votre devis", desc:"Gemini analyse et crée instantanément un devis professionnel complet.", color:"#F0FDF4", iconBg:"#DCFCE7" },
    { icon:"✏️", title:"Éditez en temps réel", desc:"Modifiez chaque ligne, ajustez les prix, appliquez vos remises.", color:"#FFFBEB", iconBg:"#FEF3C7" },
    { icon:"📄", title:"Export PDF instantané", desc:"Imprimez ou téléchargez un devis aux normes françaises prêt à signer.", color:"#FFF1F2", iconBg:"#FFE4E6" },
  ];
  const metiers = ["⚡ Électricien","🔧 Plombier","🎨 Peintre","🧱 Maçon","🪵 Menuisier","🪟 Carreleur","🏠 Couvreur","🔥 Chauffagiste"];
  const stats = [
    { v:"30s", l:"pour générer un devis", sub:"Depuis la description" },
    { v:"6", l:"métiers du BTP couverts", sub:"Templates pré-remplis" },
    { v:"100%", l:"conforme législation FR", sub:"TVA, normes, mentions" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.surface }}>
      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,.85)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${T.accentMid}, ${T.accentDk})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(26,74,122,.3)" }}>
              <span style={{ color:"#fff", fontWeight:900, fontSize:16, letterSpacing:"-0.5px" }}>D</span>
            </div>
            <span style={{ fontWeight:800, fontSize:17, color:T.ink, letterSpacing:"-0.5px" }}>DevisBTP</span>
            <Badge color="blue">IA</Badge>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Btn v="ghost" sm onClick={onStart}>Connexion</Btn>
            <Btn v="primary" sm onClick={onStart} style={{ boxShadow:"0 2px 12px rgba(26,74,122,.28)" }}>Essayer gratuitement →</Btn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background:`radial-gradient(ellipse at 15% 60%, rgba(59,114,168,.1) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(26,74,122,.07) 0%, transparent 50%), linear-gradient(170deg, #EBF2FA 0%, ${T.surface} 55%)`, padding:"88px 24px 80px" }}>
        <div style={{ maxWidth:780, margin:"0 auto", textAlign:"center" }} className="fade-up">
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:T.goldLt, border:`1px solid rgba(180,83,9,.2)`, borderRadius:20, padding:"6px 16px", marginBottom:28 }}>
            <span style={{ fontSize:12, color:T.gold, fontWeight:700, letterSpacing:"0.02em" }}>✦ Nouveau · IA intégrée</span>
          </div>
          <h1 style={{ fontSize:"clamp(34px,5.5vw,56px)", fontWeight:900, color:T.ink, letterSpacing:"-2px", lineHeight:1.1, marginBottom:22 }}>
            Générez vos devis BTP<br />
            <span style={{ color:T.accent }}>en 30 secondes</span> avec l'IA
          </h1>
          <p style={{ fontSize:17, color:T.inkMid, lineHeight:1.75, maxWidth:540, margin:"0 auto 40px" }}>
            Décrivez vos travaux ou prenez une photo du chantier. Notre IA génère un devis professionnel complet, conforme aux normes françaises, prêt à envoyer au client.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn onClick={onStart} style={{ fontSize:15, padding:"14px 36px", borderRadius:T.rLg, boxShadow:`0 6px 24px rgba(26,74,122,.32)`, fontWeight:700 }}>
              Créer mon premier devis →
            </Btn>
            <Btn v="ghost" style={{ fontSize:15, padding:"14px 28px", borderRadius:T.rLg }} onClick={onStart}>
              Voir la démo
            </Btn>
          </div>
          <p style={{ fontSize:12, color:T.inkLight, marginTop:18, display:"flex", alignItems:"center", justifyContent:"center", gap:16 }}>
            <span>✓ Gratuit</span>
            <span>✓ Sans inscription</span>
            <span>✓ Données confidentielles</span>
          </p>
        </div>

        {/* App preview */}
        <div style={{ maxWidth:880, margin:"56px auto 0", background:T.surface, borderRadius:T.rXl, border:`1px solid ${T.border}`, boxShadow:T.sh4, overflow:"hidden" }}>
          <div style={{ background:"#F2F0EB", padding:"11px 16px", display:"flex", alignItems:"center", gap:6, borderBottom:`1px solid ${T.border}` }}>
            {["#FC5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{ width:11, height:11, borderRadius:"50%", background:c }} />)}
            <div style={{ flex:1, background:"rgba(0,0,0,.07)", borderRadius:6, height:22, marginLeft:10, maxWidth:300 }} />
          </div>
          <div style={{ padding:28 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 2.2fr", gap:20 }}>
              <div>
                <div style={{ background:T.accentLt, border:`2px dashed ${T.accentMid}`, borderRadius:12, height:130, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:"rgba(59,114,168,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📷</div>
                  <p style={{ fontSize:11, color:T.accentMid, fontWeight:600 }}>Photo chantier</p>
                </div>
                <div style={{ marginTop:12, background:T.bg, borderRadius:10, padding:12, border:`1px solid ${T.border}` }}>
                  <div style={{ height:7, background:T.border, borderRadius:4, marginBottom:7 }} />
                  <div style={{ height:7, background:T.border, borderRadius:4, width:"75%", marginBottom:7 }} />
                  <div style={{ height:7, background:T.border, borderRadius:4, width:"55%" }} />
                </div>
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div>
                    <div style={{ height:13, background:T.ink, borderRadius:4, width:160, opacity:.12, marginBottom:5 }} />
                    <div style={{ height:9, background:T.border, borderRadius:4, width:220 }} />
                  </div>
                  <div style={{ background:T.accent, borderRadius:8, padding:"6px 14px", display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ height:8, background:"rgba(255,255,255,.7)", borderRadius:3, width:56 }} />
                  </div>
                </div>
                <div style={{ background:T.bg, borderRadius:10, overflow:"hidden", border:`1px solid ${T.border}` }}>
                  <div style={{ background:"#EEECEA", padding:"8px 12px", display:"flex", gap:8 }}>
                    {[45,20,15,20].map((w,i)=><div key={i} style={{ height:7, background:T.borderMd, borderRadius:3, flex:w }} />)}
                  </div>
                  {[1,2,3,4].map(i=>(
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"center", padding:"9px 12px", borderBottom:i<4?`1px solid ${T.border}`:"none", background:i%2===0?T.surface:"transparent" }}>
                      <div style={{ flex:2, height:7, background:T.border, borderRadius:4 }} />
                      <div style={{ flex:1, height:7, background:T.border, borderRadius:4, opacity:.6 }} />
                      <div style={{ flex:1, height:7, background:T.accentLt, borderRadius:4 }} />
                      <div style={{ flex:1, height:7, background:T.accentLt, borderRadius:4, opacity:.7 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:14 }}>
                  <div style={{ background:`linear-gradient(135deg, ${T.accentLt}, #F0F7FF)`, borderRadius:10, padding:"10px 18px", textAlign:"right", border:`1px solid rgba(59,114,168,.15)` }}>
                    <div style={{ height:7, background:T.accentMid, borderRadius:3, width:70, marginBottom:5, opacity:.4 }} />
                    <div style={{ height:14, background:T.accent, borderRadius:4, width:100 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background:T.accent, padding:"48px 24px" }}>
        <div style={{ maxWidth:780, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {stats.map(({v,l,sub},i)=>(
            <div key={l} className="stat-card" style={{ textAlign:"center", padding:"24px 20px", borderRight:i<2?"1px solid rgba(255,255,255,.12)":undefined }}>
              <p style={{ fontSize:42, fontWeight:900, color:"#fff", letterSpacing:"-2px", lineHeight:1 }}>{v}</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.85)", marginTop:6, fontWeight:600 }}>{l}</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:3 }}>{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:"80px 24px", background:T.bg }}>
        <div style={{ maxWidth:1020, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <Badge color="blue">Fonctionnalités</Badge>
            <h2 style={{ fontSize:34, fontWeight:900, letterSpacing:"-1px", marginTop:14, marginBottom:12, color:T.ink }}>Tout ce dont un artisan a besoin</h2>
            <p style={{ fontSize:15, color:T.inkMid, maxWidth:460, margin:"0 auto", lineHeight:1.7 }}>Conçu pour les pros du BTP qui veulent gagner du temps sur l'administratif.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16 }}>
            {features.map(({icon,title,desc,iconBg})=>(
              <div key={title} className="feature-card" style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.rLg, padding:26, boxShadow:T.sh1 }}>
                <div style={{ width:48, height:48, borderRadius:12, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:16 }}>{icon}</div>
                <p style={{ fontWeight:700, fontSize:14, marginBottom:8, color:T.ink, letterSpacing:"-0.2px" }}>{title}</p>
                <p style={{ fontSize:13, color:T.inkMid, lineHeight:1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Métiers */}
      <section style={{ padding:"64px 24px", background:T.surface, borderTop:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:820, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.8px", marginBottom:10, color:T.ink }}>Pour tous les métiers du BTP</h2>
          <p style={{ fontSize:14, color:T.inkMid, marginBottom:32, lineHeight:1.6 }}>Templates pré-remplis pour chaque corps de métier</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
            {metiers.map(m=>(
              <div key={m} className="metier-pill" style={{ background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:24, padding:"9px 20px", fontSize:13, fontWeight:600, color:T.inkMid, cursor:"default" }}>{m}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"80px 24px", background:`linear-gradient(145deg, ${T.accent} 0%, ${T.accentDk} 100%)`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 80% 20%, rgba(255,255,255,.06) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(255,255,255,.04) 0%, transparent 40%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:560, margin:"0 auto", textAlign:"center", position:"relative" }}>
          <h2 style={{ fontSize:36, fontWeight:900, color:"#fff", letterSpacing:"-1px", marginBottom:16, lineHeight:1.15 }}>Prêt à gagner du temps ?</h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.75)", marginBottom:36, lineHeight:1.75 }}>
            Rejoignez les artisans qui ont déjà adopté DevisBTP IA.<br />Votre premier devis en 30 secondes, c'est maintenant.
          </p>
          <Btn v="white" onClick={onStart} style={{ fontSize:15, padding:"15px 40px", borderRadius:T.rLg, boxShadow:"0 6px 24px rgba(0,0,0,.22)", fontWeight:700 }}>
            Créer un devis gratuitement →
          </Btn>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginTop:18 }}>Aucune carte requise · 100% gratuit</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:T.ink, padding:"52px 24px 28px" }}>
        <div style={{ maxWidth:1020, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:48, marginBottom:40 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg, ${T.accentMid}, ${T.accentDk})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ color:"#fff", fontWeight:900, fontSize:15 }}>D</span>
                </div>
                <span style={{ fontWeight:800, fontSize:16, color:"#fff", letterSpacing:"-0.4px" }}>DevisBTP IA</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.4)", lineHeight:1.75, maxWidth:260 }}>
                La solution IA pour générer des devis BTP professionnels en 30 secondes. Conçu pour les artisans français.
              </p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,.2)", marginTop:16 }}>© 2025 DevisBTP</p>
            </div>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.25)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>Produit</p>
              {["Fonctionnalités","Métiers couverts","Tarifs"].map(l=>(
                <p key={l} style={{ marginBottom:11 }}><a href="#" style={{ fontSize:13, color:"rgba(255,255,255,.45)", textDecoration:"none", transition:"color .15s" }}>{l}</a></p>
              ))}
            </div>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.25)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>Légal & Contact</p>
              {[{label:"Mentions légales",key:"mentions"},{label:"CGU",key:"cgu"},{label:"Contact",key:"contact"}].map(({label,key})=>(
                <p key={key} style={{ marginBottom:11 }}>
                  <button onClick={()=>setLegalPage(key)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"rgba(255,255,255,.45)", padding:0, fontFamily:T.ff }}>{label}</button>
                </p>
              ))}
              <p style={{ marginTop:14 }}><a href="mailto:idrissihafez@gmail.com" style={{ fontSize:12, color:"rgba(255,255,255,.25)", textDecoration:"none" }}>idrissihafez@gmail.com</a></p>
            </div>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <p style={{ fontSize:12, color:"rgba(255,255,255,.18)" }}>Conforme législation française · RGPD · TVA autoliquidation supportée</p>
            <div style={{ display:"flex", gap:18 }}>
              {[{label:"Mentions légales",key:"mentions"},{label:"CGU",key:"cgu"},{label:"Contact",key:"contact"}].map(({label,key})=>(
                <button key={key} onClick={()=>setLegalPage(key)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"rgba(255,255,255,.25)", fontFamily:T.ff, padding:0 }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
      {legalPage && <LegalModal page={legalPage} onClose={()=>setLegalPage(null)} />}
    </div>
  );
}

// ─── Section helper ───────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom:22 }}>
      <h3 style={{ fontSize:13, fontWeight:700, color:T.ink, marginBottom:8, paddingBottom:6, borderBottom:`1px solid ${T.border}`, textTransform:"uppercase", letterSpacing:"0.06em" }}>{title}</h3>
      {children}
    </div>
  );
}

// ─── Legal Modal ──────────────────────────────────────────────────────────────
function LegalModal({ page, onClose }) {
  const EMAIL = "idrissihafez@gmail.com";
  const pages = {
    mentions: {
      title:"Mentions légales",
      body:(
        <div style={{ fontSize:13.5, color:"#374151", lineHeight:1.8 }}>
          <Section title="Éditeur du site">
            <p><strong>DevisBTP IA</strong> est édité par :</p>
            <p style={{ marginTop:6 }}><strong>Nom :</strong> Idriss Ihafez<br/><strong>Statut :</strong> Entrepreneur individuel<br/><strong>Email :</strong> <a href={"mailto:"+EMAIL} style={{ color:T.accent }}>{EMAIL}</a></p>
          </Section>
          <Section title="Hébergement">
            <p>Le site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street Suite 701, San Francisco, CA 94104, États-Unis.</p>
          </Section>
          <Section title="Propriété intellectuelle">
            <p>L'ensemble des contenus (textes, images, logos, code source) sont la propriété exclusive de l'éditeur, sauf mention contraire, et protégés par le droit de la propriété intellectuelle français.</p>
          </Section>
          <Section title="Responsabilité">
            <p>Les devis générés par l'IA sont fournis à titre indicatif. L'éditeur ne saurait être tenu responsable d'erreurs dans les devis générés ni des conséquences de leur utilisation sans vérification préalable par un professionnel qualifié.</p>
          </Section>
          <Section title="Données personnelles & RGPD">
            <p>Conformément au RGPD (UE) 2016/679, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer : <a href={"mailto:"+EMAIL} style={{ color:T.accent }}>{EMAIL}</a></p>
            <p style={{ marginTop:6 }}>Les photos et descriptions saisies sont transmises à Gemini API pour générer le devis et ne sont pas conservées par DevisBTP.</p>
          </Section>
          <Section title="Cookies">
            <p>Ce site n'utilise pas de cookies de traçage ou publicitaires. Seuls des cookies techniques essentiels au bon fonctionnement peuvent être déposés.</p>
          </Section>
          <Section title="Droit applicable">
            <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
          </Section>
        </div>
      ),
    },
    cgu: {
      title:"Conditions Générales d'Utilisation",
      body:(
        <div style={{ fontSize:13.5, color:"#374151", lineHeight:1.8 }}>
          <p style={{ color:"#9CA3AF", fontSize:12, marginBottom:18 }}>Dernière mise à jour : janvier 2025</p>
          <Section title="1. Objet">
            <p>Les présentes CGU régissent l'utilisation de la plateforme <strong>DevisBTP IA</strong>, service de génération automatique de devis pour les professionnels du BTP.</p>
          </Section>
          <Section title="2. Accès au service">
            <p>L'accès est gratuit et ne nécessite pas d'inscription. Le service est destiné aux professionnels et entreprises du secteur BTP.</p>
          </Section>
          <Section title="3. Obligations de l'utilisateur">
            <ul style={{ marginLeft:18, lineHeight:2 }}>
              <li>Utiliser le service dans un cadre légal et professionnel</li>
              <li>Vérifier les devis générés avant tout envoi à un client</li>
              <li>Ne pas uploader de photos contenant des données personnelles de tiers sans leur consentement</li>
              <li>Ne pas tenter de détourner ou d'abuser du service</li>
            </ul>
          </Section>
          <Section title="4. Devis générés par l'IA">
            <p>Les devis sont générés automatiquement par Gemini API. Ils sont fournis à titre d'aide et nécessitent une vérification avant utilisation commerciale. L'éditeur ne garantit pas l'exactitude des prix, quantités ou taux de TVA appliqués.</p>
          </Section>
          <Section title="5. Propriété des données">
            <p>Les devis et données saisies appartiennent à l'utilisateur. DevisBTP IA n'exploite pas ces données à des fins commerciales. Elles sont traitées par Gemini API pour générer la réponse.</p>
          </Section>
          <Section title="6. Limitation de responsabilité">
            <p>DevisBTP IA est fourni "en l'état". L'éditeur ne peut être tenu responsable de toute perte financière résultant de l'utilisation des devis générés sans vérification préalable.</p>
          </Section>
          <Section title="7. Modifications">
            <p>L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les modifications importantes seront communiquées aux utilisateurs.</p>
          </Section>
          <Section title="8. Contact">
            <p>Pour toute question relative aux CGU : <a href={"mailto:"+EMAIL} style={{ color:T.accent }}>{EMAIL}</a></p>
          </Section>
        </div>
      ),
    },
    contact: {
      title:"Contact",
      body:(
        <div style={{ fontSize:13.5, color:"#374151", lineHeight:1.8 }}>
          <div style={{ background:T.accentLt, borderRadius:14, padding:28, marginBottom:24, textAlign:"center", border:`1px solid rgba(59,114,168,.15)` }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✉️</div>
            <p style={{ fontWeight:800, fontSize:16, color:T.ink, marginBottom:6, letterSpacing:"-0.3px" }}>Contactez-nous</p>
            <p style={{ color:"#6B7280", fontSize:13 }}>Nous répondons dans les 24h ouvrées</p>
            <a href={"mailto:"+EMAIL} style={{ display:"inline-block", marginTop:18, background:T.accent, color:"#fff", padding:"12px 30px", borderRadius:10, fontSize:14, fontWeight:600, textDecoration:"none", boxShadow:"0 2px 12px rgba(26,74,122,.25)" }}>
              {EMAIL}
            </a>
          </div>
          <Section title="Support technique">
            <p>Bug, question d'utilisation ou suggestion d'amélioration :</p>
            <p style={{ marginTop:6 }}><strong>Email :</strong> <a href={"mailto:"+EMAIL} style={{ color:T.accent }}>{EMAIL}</a></p>
            <p style={{ marginTop:4 }}><strong>Objet suggéré :</strong> [DevisBTP] + description courte</p>
          </Section>
          <Section title="Partenariats & intégrations">
            <p>Vous souhaitez intégrer DevisBTP IA à votre logiciel métier ou proposer un partenariat ?</p>
            <p style={{ marginTop:6 }}><a href={"mailto:"+EMAIL} style={{ color:T.accent }}>Écrivez-nous</a> avec l'objet <strong>[Partenariat]</strong>.</p>
          </Section>
          <Section title="Droits RGPD">
            <p>Pour exercer vos droits (accès, rectification, suppression) :</p>
            <p style={{ marginTop:6 }}><a href={"mailto:"+EMAIL} style={{ color:T.accent }}>{EMAIL}</a> — objet <strong>[RGPD]</strong></p>
          </Section>
        </div>
      ),
    },
  };
  const { title, body } = pages[page]||pages.contact;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(15,18,30,.65)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:T.rXl, width:"100%", maxWidth:660, maxHeight:"88vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:T.sh4 }}>
        <div style={{ padding:"22px 28px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:T.ink, letterSpacing:"-0.5px" }}>{title}</h2>
          <button onClick={onClose} style={{ background:T.surfaceAlt, border:"none", cursor:"pointer", fontSize:16, color:T.inkMid, width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ padding:"24px 28px", overflowY:"auto", flex:1 }}>{body}</div>
        <div style={{ padding:"16px 28px", borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"flex-end", flexShrink:0, background:T.bg }}>
          <Btn onClick={onClose} sm>Fermer</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── App (editor) ─────────────────────────────────────────────────────────────
function Editor({ onBack }) {
  const [step, setStep] = useState("input");
  const [err, setErr] = useState("");
  const [desc, setDesc] = useState("");
  const [imgB64, setImgB64] = useState(null);
  const [imgType, setImgType] = useState(null);
  const [imgPrev, setImgPrev] = useState(null);
  const fileRef = useRef();
  const [co, setCo] = useState({ nom:"", adresse:"", siret:"", tva_intra:"", email:"", telephone:"" });
  const [cl, setCl] = useState({ nom:"", adresse:"", email:"" });
  const [showCo, setShowCo] = useState(false);
  const [devis, setDevis] = useState(null);
  const [showTpl, setShowTpl] = useState(false);
  const [remise, setRemise] = useState({ valeur:0, type:"%" });
  const [acompte, setAcompte] = useState(0);

  const loadImg = useCallback(file => {
    if (!file) return;
    const r = new FileReader();
    r.onload = e => { const d=e.target.result; setImgPrev(d); setImgB64(d.split(",")[1]); setImgType(file.type); };
    r.readAsDataURL(file);
  },[]);

  const generate = async () => {
    if (!desc.trim()&&!imgB64) { setErr("Ajoutez une description ou une photo."); return; }
    setErr(""); setStep("loading");
    try {
      const d = await genDevis({ description:desc, imageBase64:imgB64, imageType:imgType, companyName:co.nom });
      setDevis(d); setRemise({valeur:0,type:"%"}); setAcompte(0); setStep("edit");
    } catch(e) { setErr("Erreur : "+e.message); setStep("input"); }
  };

  const htBrut = devis ? devis.lignes.reduce((s,l)=>s+l.quantite*l.prix_unitaire_ht,0) : 0;
  const mRem = remise.type==="%"?htBrut*(remise.valeur/100):remise.valeur;
  const ht = Math.max(0,htBrut-mRem);
  const ratio = htBrut>0?ht/htBrut:1;
  const tva = devis ? devis.lignes.reduce((s,l)=>s+l.quantite*l.prix_unitaire_ht*(l.tva/100),0)*ratio : 0;
  const ttc = ht+tva;

  const upd = (id,f,v) => setDevis(d=>({...d,lignes:d.lignes.map(l=>l.id===id?{...l,[f]:["designation","unite","categorie"].includes(f)?v:parseFloat(v)||0}:l)}));
  const del = id => setDevis(d=>({...d,lignes:d.lignes.filter(l=>l.id!==id)}));
  const addLine = () => setDevis(d=>({...d,lignes:[...d.lignes,{id:uid(),designation:"Nouvelle prestation",unite:"forfait",quantite:1,prix_unitaire_ht:0,tva:10,categorie:"Divers"}]}));

  const tdSt = { padding:"10px 12px", fontSize:13, color:T.ink };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.ff }}>
      {showTpl && <TemplatesModal onInsert={ls=>{setDevis(d=>({...d,lignes:[...d.lignes,...ls]}));setShowTpl(false);}} onClose={()=>setShowTpl(false)} />}

      {/* Header */}
      <header style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, zIndex:40, boxShadow:T.sh1 }}>
        <div style={{ maxWidth:1140, margin:"0 auto", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onBack} style={{ background:T.bg, border:`1px solid ${T.border}`, cursor:"pointer", color:T.inkMid, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", width:32, height:32, borderRadius:8, transition:"all .14s" }}>←</button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg, ${T.accentMid}, ${T.accentDk})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 6px rgba(26,74,122,.25)" }}>
                <span style={{ color:"#fff", fontWeight:900, fontSize:14 }}>D</span>
              </div>
              <span style={{ fontWeight:800, fontSize:15, color:T.ink, letterSpacing:"-0.4px" }}>DevisBTP</span>
              <Badge color="blue">IA</Badge>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {step==="edit"&&devis&&<>
              <Btn v="ghost" sm onClick={()=>doDownload(devis,co,cl,remise,acompte)}>↓ Télécharger</Btn>
              <Btn v="primary" sm onClick={()=>doPrint(devis,co,cl,remise,acompte)}>Imprimer / PDF</Btn>
            </>}
            <button onClick={()=>setShowCo(!showCo)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, fontFamily:T.ff, cursor:"pointer", border:`1.5px solid ${showCo?T.accent:T.border}`, background:showCo?T.accentLt:"transparent", color:showCo?T.accent:T.inkMid, transition:"all .14s" }}>
              ⚙ Entreprise
            </button>
          </div>
        </div>
      </header>

      {/* Company drawer */}
      {showCo && (
        <div style={{ background:T.surfaceAlt, borderBottom:`1px solid ${T.border}` }}>
          <div style={{ maxWidth:1140, margin:"0 auto", padding:"20px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:28 }}>
            <div>
              <p style={{ ...lbSt, color:T.accent, marginBottom:12 }}>Votre entreprise</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {[["nom","Nom"],["adresse","Adresse"],["siret","SIRET"],["tva_intra","N° TVA"],["email","Email"],["telephone","Tél"]].map(([k,lb])=>(
                  <input key={k} placeholder={lb} value={co[k]} onChange={e=>setCo(x=>({...x,[k]:e.target.value}))} style={{ ...iSt, fontSize:12, padding:"8px 11px" }} />
                ))}
              </div>
            </div>
            <div>
              <p style={{ ...lbSt, color:T.accent, marginBottom:12 }}>Client</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[["nom","Nom"],["adresse","Adresse"],["email","Email"]].map(([k,lb])=>(
                  <input key={k} placeholder={lb} value={cl[k]} onChange={e=>setCl(x=>({...x,[k]:e.target.value}))} style={{ ...iSt, fontSize:12, padding:"8px 11px" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth:1140, margin:"0 auto", padding:"40px 24px" }}>

        {/* INPUT */}
        {(step==="input"||step==="loading") && (
          <div style={{ maxWidth:580, margin:"0 auto" }} className="fade-up">
            <div style={{ marginBottom:36, textAlign:"center" }}>
              <h1 style={{ fontSize:30, fontWeight:900, color:T.ink, letterSpacing:"-0.8px", lineHeight:1.2, marginBottom:12 }}>
                Nouveau devis
              </h1>
              <p style={{ fontSize:14, color:T.inkMid, lineHeight:1.7 }}>
                Décrivez les travaux ou déposez une photo du chantier.<br />
                L'IA génère votre devis complet en quelques secondes.
              </p>
            </div>

            {/* Upload zone */}
            <div
              onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type.startsWith("image/"))loadImg(f);}}
              onDragOver={e=>e.preventDefault()}
              onClick={()=>!imgPrev&&fileRef.current?.click()}
              style={{ border:`2px dashed ${T.borderMd}`, borderRadius:T.rLg, minHeight:160, overflow:"hidden", cursor:imgPrev?"default":"pointer", marginBottom:14, background:T.surface, transition:"border-color .2s, box-shadow .2s" }}>
              {imgPrev ? (
                <div style={{ position:"relative" }}>
                  <img src={imgPrev} alt="" style={{ width:"100%", maxHeight:230, objectFit:"cover", display:"block" }} />
                  <button onClick={e=>{e.stopPropagation();setImgPrev(null);setImgB64(null);setImgType(null);}}
                    style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,.6)", color:"#fff", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                  <span style={{ position:"absolute", bottom:10, left:10, background:T.greenLt, color:T.green, fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, border:`1px solid rgba(22,101,52,.15)` }}>✓ Photo chargée</span>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:160, gap:10 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:T.accentLt, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>📷</div>
                  <p style={{ fontSize:13, color:T.inkMid, fontWeight:600 }}>Déposez une photo du chantier</p>
                  <p style={{ fontSize:12, color:T.inkLight }}>ou cliquez pour sélectionner · JPG, PNG, WEBP</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>loadImg(e.target.files[0])} />
            </div>

            <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4}
              placeholder="Ex : Rénovation salle de bain 8m² — dépose carrelage existant, pose nouveau carrelage sol et mur, remplacement baignoire par douche à l'italienne, peinture plafond..."
              style={{ ...iSt, resize:"none", lineHeight:1.7, marginBottom:14, padding:"12px 14px" }} />

            {err && <div style={{ marginBottom:14, background:T.redLt, border:`1px solid rgba(239,68,68,.25)`, color:T.red, fontSize:13, padding:"11px 14px", borderRadius:T.r }}>{err}</div>}

            {step==="loading" ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 0", gap:14 }}>
                <div style={{ width:40, height:40, border:`3px solid ${T.accentLt}`, borderTopColor:T.accent, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
                <p style={{ fontSize:13, color:T.inkMid, fontWeight:500 }}>L'IA analyse et génère votre devis…</p>
              </div>
            ) : (
              <Btn full onClick={generate} style={{ fontSize:14, padding:"14px", borderRadius:T.rLg, boxShadow:`0 4px 20px rgba(26,74,122,.28)`, fontWeight:700 }}>
                Générer le devis avec l'IA
              </Btn>
            )}
            <p style={{ textAlign:"center", fontSize:11, color:T.inkLight, marginTop:14 }}>Clé protégée côté serveur</p>
          </div>
        )}

        {/* EDIT */}
        {step==="edit"&&devis && (
          <div className="fade-up">
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22, gap:12, flexWrap:"wrap" }}>
              <div>
                <h2 style={{ fontSize:21, fontWeight:800, letterSpacing:"-0.5px", color:T.ink }}>{devis.titre}</h2>
                <p style={{ fontSize:13, color:T.inkMid, marginTop:4, lineHeight:1.6 }}>{devis.description_generale}</p>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <Btn v="ghost" sm onClick={()=>{setStep("input");setDevis(null);}}>← Nouveau devis</Btn>
                <Btn v="outline" sm onClick={()=>doDownload(devis,co,cl,remise,acompte)}>↓ Télécharger</Btn>
                <Btn v="primary" sm onClick={()=>doPrint(devis,co,cl,remise,acompte)}>Imprimer / PDF</Btn>
              </div>
            </div>

            {/* Table */}
            <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.rLg, overflow:"hidden", marginBottom:16, boxShadow:T.sh1 }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"#ECEAE5", borderBottom:`1.5px solid ${T.border}` }}>
                      {["Désignation","Catégorie","Unité","Qté","PU HT (€)","TVA","Total HT",""].map(h=>(
                        <th key={h} style={{ padding:"11px 12px", textAlign:"left", fontSize:10.5, fontWeight:700, color:T.inkMid, textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {devis.lignes.map((l,i)=>(
                      <tr key={l.id} className="trow" style={{ borderBottom:`1px solid ${T.border}`, background:i%2===0?T.surface:T.bg }}>
                        <td style={tdSt}>
                          <input value={l.designation} onChange={e=>upd(l.id,"designation",e.target.value)}
                            style={{ background:"transparent", border:"none", outline:"none", width:"100%", fontSize:13, color:T.ink, fontFamily:T.ff, minWidth:180 }} />
                        </td>
                        <td style={tdSt}>
                          <select value={l.categorie} onChange={e=>upd(l.id,"categorie",e.target.value)}
                            style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:7, fontSize:11, padding:"4px 7px", color:T.ink, fontFamily:T.ff }}>
                            {CATS.map(c=><option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td style={tdSt}>
                          <input value={l.unite} onChange={e=>upd(l.id,"unite",e.target.value)}
                            style={{ background:"transparent", border:"none", outline:"none", width:52, fontSize:13, color:T.ink, textAlign:"center", fontFamily:T.ff }} />
                        </td>
                        <td style={tdSt}>
                          <input type="number" value={l.quantite} onChange={e=>upd(l.id,"quantite",e.target.value)}
                            style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:7, fontSize:13, padding:"4px 6px", width:62, color:T.ink, textAlign:"center", fontFamily:T.ff }} />
                        </td>
                        <td style={tdSt}>
                          <input type="number" value={l.prix_unitaire_ht} onChange={e=>upd(l.id,"prix_unitaire_ht",e.target.value)}
                            style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:7, fontSize:13, padding:"4px 8px", width:92, color:T.ink, textAlign:"right", fontFamily:T.ff }} />
                        </td>
                        <td style={tdSt}>
                          <select value={l.tva} onChange={e=>upd(l.id,"tva",e.target.value)}
                            style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:7, fontSize:11, padding:"4px 7px", color:T.ink, fontFamily:T.ff }}>
                            {TVA_OPTS.map(t=><option key={t} value={t}>{t}%</option>)}
                          </select>
                        </td>
                        <td style={{ ...tdSt, textAlign:"right", fontWeight:700, color:T.accent, fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap" }}>
                          {fmt(l.quantite*l.prix_unitaire_ht)}
                        </td>
                        <td style={{ padding:"10px 10px" }}>
                          <button onClick={()=>del(l.id)} style={{ background:"none", border:"none", cursor:"pointer", color:T.borderMd, fontSize:18, lineHeight:1, transition:"color .13s" }}
                            onMouseEnter={e=>e.target.style.color=T.red} onMouseLeave={e=>e.target.style.color=T.borderMd}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display:"flex", borderTop:`1px solid ${T.border}` }}>
                <button onClick={addLine} className="add-row-btn" style={{ flex:1, padding:13, background:"none", border:"none", cursor:"pointer", fontSize:13, color:T.inkMid, fontFamily:T.ff, display:"flex", alignItems:"center", justifyContent:"center", gap:6, borderRight:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:18, lineHeight:1 }}>+</span> Ligne manuelle
                </button>
                <button onClick={()=>setShowTpl(true)} className="add-row-btn" style={{ flex:1, padding:13, background:"none", border:"none", cursor:"pointer", fontSize:13, color:T.accent, fontFamily:T.ff, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  ⊞ Ajouter depuis templates
                </button>
              </div>
            </div>

            {/* Bottom 3 cols */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              {/* Conditions */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.rLg, padding:22, boxShadow:T.sh1 }}>
                <p style={lbSt}>Conditions & modalités</p>
                <textarea value={devis.conditions||""} onChange={e=>setDevis(d=>({...d,conditions:e.target.value}))}
                  rows={5} style={{ background:"transparent", border:"none", outline:"none", width:"100%", fontSize:12, color:T.inkMid, resize:"none", lineHeight:1.7, fontFamily:T.ff }}
                  placeholder="Conditions de paiement, délais, garanties..." />
                <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, borderTop:`1px solid ${T.border}`, paddingTop:10 }}>
                  <span style={{ fontSize:12, color:T.inkLight }}>Validité :</span>
                  <input value={devis.validite||"30 jours"} onChange={e=>setDevis(d=>({...d,validite:e.target.value}))}
                    style={{ ...iSt, width:100, fontSize:12, padding:"6px 9px" }} />
                </div>
              </div>

              {/* Remise + Acompte */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.rLg, padding:22, boxShadow:T.sh1 }}>
                <p style={lbSt}>Remise & Acompte</p>
                <div style={{ marginBottom:18 }}>
                  <p style={{ fontSize:12, color:T.inkMid, marginBottom:9, fontWeight:600 }}>Remise commerciale</p>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <input type="number" min="0" value={remise.valeur}
                      onChange={e=>setRemise(r=>({...r,valeur:parseFloat(e.target.value)||0}))}
                      style={{ ...iSt, width:82, textAlign:"right", fontSize:13, padding:"7px 10px" }} />
                    <div style={{ display:"flex", border:`1.5px solid ${T.border}`, borderRadius:T.r, overflow:"hidden" }}>
                      {["%","€"].map(t=>(
                        <button key={t} onClick={()=>setRemise(r=>({...r,type:t}))}
                          style={{ padding:"7px 14px", fontSize:13, fontWeight:600, fontFamily:T.ff, cursor:"pointer", border:"none", background:remise.type===t?T.accent:"transparent", color:remise.type===t?"#fff":T.inkMid, transition:"all .13s" }}>
                          {t}
                        </button>
                      ))}
                    </div>
                    {mRem>0&&<span style={{ fontSize:13, fontWeight:700, color:T.green }}>−{fmt(mRem)}</span>}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize:12, color:T.inkMid, marginBottom:9, fontWeight:600 }}>Acompte</p>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {[0,20,30,40,50].map(v=>(
                      <button key={v} onClick={()=>setAcompte(v)}
                        style={{ padding:"5px 11px", fontSize:12, fontWeight:600, fontFamily:T.ff, cursor:"pointer", borderRadius:7, border:"1.5px solid", borderColor:acompte===v?T.accent:T.border, background:acompte===v?T.accentLt:"transparent", color:acompte===v?T.accent:T.inkMid, transition:"all .13s" }}>
                        {v===0?"Aucun":`${v}%`}
                      </button>
                    ))}
                  </div>
                  {acompte>0&&(
                    <div style={{ marginTop:10, padding:"9px 12px", background:T.blueLt, borderRadius:9, fontSize:12, border:`1px solid rgba(29,78,216,.1)` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", color:T.blue }}><span>Acompte {acompte}%</span><span style={{ fontWeight:700 }}>{fmt(ttc*acompte/100)}</span></div>
                      <div style={{ display:"flex", justifyContent:"space-between", color:T.red, marginTop:3 }}><span>Solde</span><span style={{ fontWeight:700 }}>{fmt(ttc*(1-acompte/100))}</span></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Totaux */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.rLg, padding:22, boxShadow:T.sh1 }}>
                <p style={lbSt}>Récapitulatif</p>
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {[["Total HT brut", fmt(htBrut), T.inkMid, T.ink],
                    ...(mRem>0?[
                      [`Remise (${remise.valeur}${remise.type})`, `−${fmt(mRem)}`, T.green, T.green],
                      ["Total HT net", fmt(ht), T.inkMid, T.ink],
                    ]:[]),
                    ["TVA", fmt(tva), T.inkMid, T.ink],
                  ].map(([l,v,lc,vc])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                      <span style={{ color:lc }}>{l}</span>
                      <span style={{ color:vc, fontVariantNumeric:"tabular-nums" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:14, borderTop:`2px solid ${T.accent}`, marginTop:4 }}>
                    <span style={{ fontWeight:800, fontSize:13, color:T.ink, textTransform:"uppercase", letterSpacing:"0.04em" }}>Total TTC</span>
                    <span style={{ fontWeight:900, fontSize:24, color:T.accent, fontVariantNumeric:"tabular-nums", letterSpacing:"-0.5px" }}>{fmt(ttc)}</span>
                  </div>
                  {acompte>0&&<>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:T.blue }}>
                      <span>Acompte ({acompte}%)</span><span style={{ fontWeight:600 }}>{fmt(ttc*acompte/100)}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:T.red, fontWeight:700 }}>
                      <span>Solde à payer</span><span>{fmt(ttc*(1-acompte/100))}</span>
                    </div>
                  </>}
                </div>
                <Btn full onClick={()=>doPrint(devis,co,cl,remise,acompte)} style={{ marginTop:18, borderRadius:T.r, fontWeight:700 }}>Imprimer / PDF</Btn>
                <Btn full v="outline" onClick={()=>doDownload(devis,co,cl,remise,acompte)} style={{ marginTop:8, borderRadius:T.r }}>↓ Télécharger HTML</Btn>
                <p style={{ fontSize:11, color:T.inkLight, marginTop:10, textAlign:"center", lineHeight:1.6 }}>Ouvrir le .html → Imprimer → Enregistrer en PDF</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {page==="landing" ? <Landing onStart={()=>setPage("app")} /> : <Editor onBack={()=>setPage("landing")} />}
    </>
  );
}
