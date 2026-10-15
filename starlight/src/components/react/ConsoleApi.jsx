import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Console d'API simulée
//
// Reproduit, dans le navigateur, le comportement de l'API du catalogue :
// mêmes routes, mêmes règles de validation, mêmes codes de statut. On choisit
// une méthode, une adresse et un corps ; la console affiche la requête et la
// réponse HTTP brutes, l'explication du statut, et la commande curl
// équivalente pour reproduire l'essai sur la vraie API. Les données vivent en
// mémoire et persistent d'une requête à l'autre, jusqu'à réinitialisation.
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = ['sirop', 'tartinade', 'confiserie', 'coffret'];

const DONNEES_INITIALES = {
  prochainId: 7,
  produits: [
    { id: 1, nom: "Sirop d'érable doré 540 ml", categorie: 'sirop', prix: 14.5, stock: 12 },
    { id: 2, nom: "Sirop d'érable ambré 540 ml", categorie: 'sirop', prix: 15.25, stock: 7 },
    { id: 3, nom: "Beurre d'érable 250 g", categorie: 'tartinade', prix: 9.95, stock: 0 },
    { id: 4, nom: "Gelée d'érable 190 ml", categorie: 'tartinade', prix: 11, stock: 9 },
    { id: 5, nom: 'Tire sur la neige', categorie: 'confiserie', prix: 6.25, stock: 30 },
    { id: 6, nom: 'Coffret découverte', categorie: 'coffret', prix: 39, stock: 5 },
  ],
};

const LIBELLES = {
  200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request',
  404: 'Not Found', 405: 'Method Not Allowed', 422: 'Unprocessable Content',
};

const EXPLICATIONS = {
  200: "La requête a réussi ; le corps contient la représentation demandée.",
  201: "Une ressource a été créée ; l'en-tête Location donne son adresse.",
  204: "La requête a réussi et il n'y a rien à renvoyer : le produit n'existe plus.",
  400: "Le corps n'est pas un objet JSON lisible ; le serveur ne peut même pas l'examiner.",
  404: "Aucune ressource ne correspond à cette adresse.",
  405: "La ressource existe, mais n'accepte pas cette méthode ; l'en-tête Allow énumère celles qu'elle accepte.",
  422: "Le JSON est lisible, mais les données ne respectent pas les règles du catalogue.",
};

const PRESETS = [
  { label: 'Lister', methode: 'GET', url: '/api/produits', corps: '' },
  { label: 'Lire le produit 2', methode: 'GET', url: '/api/produits/2', corps: '' },
  { label: 'Produit inexistant', methode: 'GET', url: '/api/produits/99', corps: '' },
  {
    label: 'Créer', methode: 'POST', url: '/api/produits',
    corps: '{\n  "nom": "Sucre d\'érable 200 g",\n  "categorie": "confiserie",\n  "prix": 8.40,\n  "stock": 15\n}',
  },
  {
    label: 'Créer, données refusées', methode: 'POST', url: '/api/produits',
    corps: '{\n  "nom": "",\n  "categorie": "fromage",\n  "prix": -3,\n  "stock": 2.5\n}',
  },
  { label: 'JSON mal formé', methode: 'POST', url: '/api/produits', corps: '{ "nom": "Sirop", ' },
  {
    label: 'Remplacer le produit 3', methode: 'PUT', url: '/api/produits/3',
    corps: '{\n  "nom": "Beurre d\'érable 250 g",\n  "categorie": "tartinade",\n  "prix": 9.95,\n  "stock": 20\n}',
  },
  { label: 'Supprimer le produit 5', methode: 'DELETE', url: '/api/produits/5', corps: '' },
  { label: 'Méthode refusée', methode: 'PATCH', url: '/api/produits', corps: '' },
];

const METHODES = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const AVEC_CORPS = ['POST', 'PUT', 'PATCH'];

// Mêmes règles que valider() dans src/routes/produits.js : types JSON stricts.
function valider(d) {
  const erreurs = {};
  const nom = String(d.nom ?? '').trim();
  if (nom === '') erreurs.nom = 'Le nom est obligatoire.';
  else if (nom.length > 100) erreurs.nom = 'Le nom ne devrait pas dépasser 100 caractères.';

  if (!CATEGORIES.includes(d.categorie)) {
    erreurs.categorie = 'Choisissez une catégorie de la liste.';
  }

  if (typeof d.prix !== 'number' || !(d.prix >= 0)) {
    erreurs.prix = 'Le prix doit être un nombre positif.';
  }

  if (!Number.isInteger(d.stock) || d.stock < 0) {
    erreurs.stock = 'Le stock doit être un entier positif ou nul.';
  }
  return erreurs;
}

function construire(d, id) {
  return { id, nom: d.nom.trim(), categorie: d.categorie, prix: d.prix, stock: d.stock };
}

// Reproduit l'API Express : route, méthode, corps, puis réponse.
function traiter(methode, url, corpsTexte, etat) {
  const rep = (statut, corps = null, entetes = {}) => ({ statut, corps, entetes, etat });

  const chemin = url.split('?')[0];
  if (!chemin.startsWith('/api/') && chemin !== '/api') {
    return rep(404, { erreur: 'Ressource introuvable.' });
  }
  const route = chemin.replace(/^\/api\/?/, '').replace(/\/+$/, '');
  const parties = route === '' ? [] : route.split('/');
  const brutId = parties[1];
  // Comme Number(req.params.id) : un identifiant non numérique ne désigne aucun produit.
  const id = brutId === undefined ? null : (/^\d+$/.test(brutId) ? Number(brutId) : -1);

  if ((parties[0] ?? '') !== 'produits' || parties.length > 2) {
    return rep(404, { erreur: 'Ressource introuvable.' });
  }

  // Comme express.json() : JSON illisible -> 400 propre ; sinon, objet exigé.
  const lireCorps = () => {
    if (corpsTexte.trim() === '') return { d: null };
    try {
      const d = JSON.parse(corpsTexte);
      return { d: d !== null && typeof d === 'object' && !Array.isArray(d) ? d : null };
    } catch { return { illisible: true }; }
  };
  const JSON_ILLISIBLE = { erreur: "Le corps de la requête n'est pas du JSON valide." };
  const PAS_UN_OBJET = { erreur: 'Le corps de la requête doit être un objet JSON.' };

  // Collection
  if (id === null) {
    if (methode === 'GET') return rep(200, etat.produits);
    if (methode === 'POST') {
      const { d, illisible } = lireCorps();
      if (illisible) return rep(400, JSON_ILLISIBLE);
      if (!d) return rep(400, PAS_UN_OBJET);
      const erreurs = valider(d);
      if (Object.keys(erreurs).length) return rep(422, { erreurs });
      const produit = construire(d, etat.prochainId);
      const nouvel = { prochainId: etat.prochainId + 1, produits: [...etat.produits, produit] };
      return { statut: 201, corps: produit, entetes: { Location: `/api/produits/${produit.id}` }, etat: nouvel };
    }
    return rep(405, { erreur: 'Méthode non prise en charge.' }, { Allow: 'GET, POST' });
  }

  // Élément : comme .all() en Express, une méthode non prévue répond 405 avant toute recherche
  if (!['GET', 'PUT', 'DELETE'].includes(methode)) {
    return rep(405, { erreur: 'Méthode non prise en charge.' }, { Allow: 'GET, PUT, DELETE' });
  }
  const produit = etat.produits.find((p) => p.id === id);
  if (!produit) return rep(404, { erreur: 'Produit introuvable.' });

  if (methode === 'GET') return rep(200, produit);
  if (methode === 'PUT') {
    const { d, illisible } = lireCorps();
    if (illisible) return rep(400, JSON_ILLISIBLE);
    if (!d) return rep(400, PAS_UN_OBJET);
    const erreurs = valider(d);
    if (Object.keys(erreurs).length) return rep(422, { erreurs });
    const modifie = construire(d, id);
    const nouvel = { ...etat, produits: etat.produits.map((p) => (p.id === id ? modifie : p)) };
    return { statut: 200, corps: modifie, entetes: {}, etat: nouvel };
  }
  if (methode === 'DELETE') {
    const nouvel = { ...etat, produits: etat.produits.filter((p) => p.id !== id) };
    return { statut: 204, corps: null, entetes: {}, etat: nouvel };
  }
  return rep(405, { erreur: 'Méthode non prise en charge.' }, { Allow: 'GET, PUT, DELETE' });
}

const css = `
.capi { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:12px; overflow:hidden;
  background:var(--sl-color-bg, #fff); margin:1.5rem 0; }
.capi-head { padding:10px 14px; border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:var(--sl-color-gray-6, #f7f8fa); }
.capi-title { font-size:12px; font-weight:700; letter-spacing:.03em; color:var(--sl-color-accent, #4f46e5); }
.capi-sub { font-size:12px; color:var(--sl-color-gray-3, #6b7280); margin-top:2px; }
.capi-body { padding:14px; display:flex; flex-direction:column; gap:12px; }
.capi-chips { display:flex; flex-wrap:wrap; gap:6px; }
.capi-chip { margin:0; font:inherit; font-size:11px; font-weight:600; padding:4px 9px; border-radius:999px;
  cursor:pointer; border:1px solid var(--sl-color-gray-5, #d7dce6); background:transparent;
  color:var(--sl-color-gray-2, #515a6e); }
.capi-chip:hover { background:var(--sl-color-gray-6, #f1f2f6); }
.capi-ligne { display:flex; flex-wrap:wrap; gap:8px; align-items:stretch; }
.capi-seg { display:inline-flex; border:1px solid var(--sl-color-gray-5, #d7dce6); border-radius:8px; overflow:hidden; }
.capi-seg button { margin:0; font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:11.5px;
  font-weight:700; padding:6px 11px; border:0; background:transparent; color:var(--sl-color-gray-2, #515a6e); cursor:pointer; }
.capi-seg button + button { border-left:1px solid var(--sl-color-gray-5, #d7dce6); }
.capi-seg button[data-on="true"] { background:var(--sl-color-accent-low, #eef0fe); color:var(--sl-color-accent, #4f46e5); }
.capi-in, .capi-area { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:12.5px;
  padding:7px 10px; border:1px solid var(--sl-color-gray-5, #d7dce6); border-radius:8px;
  background:var(--sl-color-bg, #fff); color:var(--sl-color-text, #1c2230); box-sizing:border-box; }
.capi-in { flex:1 1 220px; min-width:0; }
.capi-area { width:100%; min-height:96px; resize:vertical; line-height:1.5; }
.capi-in:focus, .capi-area:focus { outline:2px solid var(--sl-color-accent, #4f46e5); outline-offset:1px; border-color:transparent; }
.capi-actions { display:flex; gap:8px; flex-wrap:wrap; }
.capi-b { margin:0; font:inherit; font-size:12.5px; font-weight:600; padding:7px 15px; border-radius:8px; cursor:pointer;
  border:1px solid var(--sl-color-accent, #4f46e5); background:var(--sl-color-accent, #4f46e5); color:#fff; }
.capi-b2 { background:transparent; color:var(--sl-color-gray-2, #515a6e); border-color:var(--sl-color-gray-5, #d7dce6); }
.capi-lab { font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  color:var(--sl-color-gray-3, #8a93a6); display:block; margin-bottom:4px; }
.capi-grille { display:grid; grid-template-columns:1fr; gap:10px; }
@media (min-width:760px) { .capi-grille { grid-template-columns:1fr 1fr; } }
.capi-bloc { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:8px; overflow:hidden; min-width:0; }
.capi-bloc-h { font-size:11px; font-weight:700; padding:5px 10px; background:var(--sl-color-gray-6, #f7f8fa);
  color:var(--sl-color-gray-2, #515a6e); border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  display:flex; justify-content:space-between; gap:8px; }
.capi-pre { margin:0; padding:9px 11px; font-family:var(--sl-font-mono, 'Fira Code', monospace);
  font-size:12px; line-height:1.55; white-space:pre-wrap; word-break:break-word;
  color:var(--sl-color-text, #2b3245); max-height:320px; overflow:auto; }
.capi-statut { font-weight:700; }
.capi-expl { border-left:3px solid; border-radius:0 8px 8px 0; padding:8px 12px; font-size:12.5px;
  line-height:1.55; color:var(--sl-color-text, #2b3245); }
.capi-vide { padding:12px; font-size:12.5px; font-style:italic; text-align:center; color:var(--sl-color-gray-3, #94a3b8); }
.capi-cap { padding:10px 14px; border-top:1px solid var(--sl-color-gray-5, #e6e9ef);
  font-size:12.5px; line-height:1.5; color:var(--sl-color-gray-2, #515a6e); }
`;

const couleurStatut = (s) => (s >= 400 ? '#dc2626' : s >= 300 ? '#d97706' : '#15803d');

export default function ConsoleApi() {
  const [etat, setEtat] = useState(DONNEES_INITIALES);
  const [methode, setMethode] = useState('GET');
  const [url, setUrl] = useState('/api/produits');
  const [corps, setCorps] = useState('');
  const [echange, setEchange] = useState(null);

  const appliquer = (p) => { setMethode(p.methode); setUrl(p.url); setCorps(p.corps); };

  const envoyer = () => {
    const envoieCorps = AVEC_CORPS.includes(methode) && corps.trim() !== '';
    const res = traiter(methode, url, envoieCorps ? corps : '', etat);
    setEtat(res.etat);
    // envoi : corps de la requête ; corps : corps de la réponse
    setEchange({ ...res, methode, url, envoi: envoieCorps ? corps : '' });
  };

  const requeteBrute = (e) =>
    `${e.methode} ${e.url} HTTP/1.1\nHost: localhost:3000\nAccept: application/json` +
    (e.envoi ? `\nContent-Type: application/json\n\n${e.envoi}` : '');

  const reponseBrute = (e) => {
    const lignes = [`HTTP/1.1 ${e.statut} ${LIBELLES[e.statut]}`];
    if (e.corps !== null) lignes.push('Content-Type: application/json; charset=utf-8');
    Object.entries(e.entetes).forEach(([k, v]) => lignes.push(`${k}: ${v}`));
    return lignes.join('\n') + (e.corps !== null ? '\n\n' + JSON.stringify(e.corps, null, 2) : '');
  };

  const curl = (e) => {
    const base = `curl -i -X ${e.methode} http://localhost:3000${e.url}`;
    if (!e.envoi) return base;
    const plat = e.envoi.replace(/\s*\n\s*/g, ' ').replace(/'/g, "'\\''");
    return `${base} \\\n  -H "Content-Type: application/json" \\\n  -d '${plat}'`;
  };

  return (
    <div className="capi">
      <style>{css}</style>

      <div className="capi-head">
        <div className="capi-title">Console d'API (simulée)</div>
        <div className="capi-sub">
          Mêmes routes, mêmes règles et mêmes statuts que l'API de la page. Les données
          persistent d'un envoi à l'autre : {etat.produits.length} produit{etat.produits.length > 1 ? 's' : ''} en mémoire.
        </div>
      </div>

      <div className="capi-body">
        <div className="capi-chips">
          {PRESETS.map((p) => (
            <button key={p.label} className="capi-chip" onClick={() => appliquer(p)}>{p.label}</button>
          ))}
        </div>

        <div className="capi-ligne">
          <div className="capi-seg" role="group" aria-label="Méthode HTTP">
            {METHODES.map((m) => (
              <button key={m} data-on={methode === m} onClick={() => setMethode(m)}>{m}</button>
            ))}
          </div>
          <input className="capi-in" value={url} spellCheck={false} aria-label="Adresse"
                 onChange={(e) => setUrl(e.target.value)} />
        </div>

        {AVEC_CORPS.includes(methode) && (
          <div>
            <span className="capi-lab">Corps de la requête (JSON)</span>
            <textarea className="capi-area" value={corps} spellCheck={false} aria-label="Corps JSON"
                      onChange={(e) => setCorps(e.target.value)} />
          </div>
        )}

        <div className="capi-actions">
          <button className="capi-b" onClick={envoyer}>Envoyer</button>
          <button className="capi-b capi-b2"
                  onClick={() => { setEtat(DONNEES_INITIALES); setEchange(null); }}>
            Réinitialiser les données
          </button>
        </div>

        {!echange ? (
          <div className="capi-bloc"><div className="capi-vide">Choisissez un essai ou composez une requête, puis envoyez-la.</div></div>
        ) : (
          <>
            <div className="capi-expl"
                 style={{ borderLeftColor: couleurStatut(echange.statut), background: couleurStatut(echange.statut) + '10' }}>
              <span className="capi-statut" style={{ color: couleurStatut(echange.statut) }}>
                {echange.statut} {LIBELLES[echange.statut]}
              </span>
              {' · '}{EXPLICATIONS[echange.statut]}
            </div>

            <div className="capi-grille">
              <div className="capi-bloc">
                <div className="capi-bloc-h"><span>Requête</span></div>
                <pre className="capi-pre">{requeteBrute(echange)}</pre>
              </div>
              <div className="capi-bloc">
                <div className="capi-bloc-h"><span>Réponse</span></div>
                <pre className="capi-pre">{reponseBrute(echange)}</pre>
              </div>
            </div>

            <div className="capi-bloc">
              <div className="capi-bloc-h"><span>Même essai sur la vraie API, avec curl</span></div>
              <pre className="capi-pre">{curl(echange)}</pre>
            </div>
          </>
        )}
      </div>

      <div className="capi-cap">
        Essayez de supprimer deux fois le même produit : la seconde requête répond 404, mais
        l'état du catalogue ne change plus. C'est ce qu'on entend par une méthode idempotente.
      </div>
    </div>
  );
}