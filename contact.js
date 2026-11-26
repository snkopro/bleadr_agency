// Reçoit les demandes du formulaire et les envoie par e-mail avec Resend (https://resend.com).
// Variables à définir dans Vercel (Settings > Environment Variables) :
//   RESEND_API_KEY  la clé API Resend
//   CONTACT_TO      l'adresse qui reçoit les demandes (la vôtre)
//   CONTACT_FROM    l'expéditeur, sur votre domaine vérifié dans Resend, ex. "Bleader <contact@votre-domaine.fr>"
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

async function send(payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Méthode non autorisée'});
  const d = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const nom = String(d.nom || '').trim(), tel = String(d.tel || '').trim(), email = String(d.email || '').trim();
  if (d.site) return res.status(200).json({ok: true}); // champ piège anti-robots
  if (nom.length < 2 || tel.replace(/[^0-9+]/g, '').length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return res.status(400).json({error: 'Champs invalides'});

  const rows = [['Nom', nom], ['Téléphone', tel], ['E-mail', email], ['Métier', d.metier], ['Options', d.options || 'Aucune'], ['Total estimé', d.total], ['Projet', d.msg]];
  try {
    // 1. la demande arrive chez vous
    await send({
      from: process.env.CONTACT_FROM, to: process.env.CONTACT_TO, reply_to: email,
      subject: `Nouvelle demande de site : ${nom}`,
      html: `<h2>Nouvelle demande</h2><table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v) || '-'}</td></tr>`).join('')}</table>`
    });
    // 2. réponse automatique au client (votre option « Réponse automatique », en démonstration)
    await send({
      from: process.env.CONTACT_FROM, to: email, reply_to: process.env.CONTACT_TO,
      subject: 'Votre demande est bien reçue',
      html: `<p>Bonjour ${esc(nom.split(' ')[0])},</p><p>Merci pour votre demande. Je vous rappelle très vite au ${esc(tel)} pour parler de votre projet.</p><p>À bientôt,<br>Mathias, Bleader</p>`
    });
    return res.status(200).json({ok: true});
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: 'Envoi impossible'});
  }
}
