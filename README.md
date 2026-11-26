# Bleader, site de l'agence

Site une page (HTML, GSAP, Lenis) et une fonction `api/contact.js` qui envoie les demandes du formulaire par e-mail.

## Mise en ligne sur Vercel
1. Importer ce dossier (ou le dépôt GitHub) dans Vercel, sans framework ni commande de build.
2. Créer un compte Resend, ajouter et vérifier votre domaine (enregistrements DNS chez votre registrar).
3. Dans Vercel, Settings > Environment Variables, ajouter `RESEND_API_KEY`, `CONTACT_TO` et `CONTACT_FROM`.
4. Dans Vercel, Settings > Domains, ajouter votre nom de domaine et suivre les indications DNS.
5. Tester le formulaire : la demande arrive sur `CONTACT_TO`, et le client reçoit une réponse automatique.
