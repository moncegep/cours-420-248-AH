import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Composition d'une page
//
// À gauche, les fichiers du site. À droite, le HTML que produit produits.php
// une fois toutes les inclusions résolues, chaque bloc étant marqué de son
// fichier d'origine. Sélectionner un fichier isole sa contribution ; dans le
// code source, les lignes include/require sont cliquables et mènent au fichier
// visé, ce qui rend l'assemblage parcourable dans les deux sens.
// ─────────────────────────────────────────────────────────────────────────────

const COULEURS = {
  'produits.php': '#4f46e5',
  'includes/header.php': '#0d9488',
  'includes/footer.php': '#0891b2',
  'partials/product-card.php': '#b45309',
  'data/products.php': '#64748b',
};

const FICHIERS = {
  'produits.php': {
    role: 'page',
    code: `<?php
$titre    = "Nos produits";
$products = require __DIR__ . "/data/products.php";
require __DIR__ . "/includes/header.php";
?>

<main>
  <h2><?php echo htmlspecialchars($titre); ?></h2>

  <?php foreach ($products as $p): ?>
    <?php include __DIR__ . "/partials/product-card.php"; ?>
  <?php endforeach; ?>
</main>

<?php require __DIR__ . "/includes/footer.php"; ?>`,
  },
  'includes/header.php': {
    role: 'en-tête commun',
    code: `<header>
  <h1>L'Érablière dorée</h1>
  <nav>
    <a href="index.php">Accueil</a>
    <a href="produits.php">Produits</a>
    <a href="contact.php">Contact</a>
  </nav>
</header>`,
  },
  'includes/footer.php': {
    role: 'pied de page commun',
    code: `<footer>
  <p>&copy; 2026 L'Érablière dorée</p>
</footer>`,
  },
  'partials/product-card.php': {
    role: 'fragment répété',
    code: `<article class="carte">
  <h3><?php echo htmlspecialchars($p["nom"]); ?></h3>
  <p><?php echo number_format($p["prix"], 2, ",", " "); ?> $</p>
</article>`,
  },
  'data/products.php': {
    role: 'données seules',
    code: `<?php
return [
  ["nom" => "Sirop d'érable 540 ml", "prix" => 14.50],
  ["nom" => "Beurre d'érable 250 g",  "prix" => 9.95],
];`,
  },
};

const ARBRE = [
  { type: 'fichier', id: 'produits.php', label: 'produits.php', p: 0 },
  { type: 'dossier', label: 'includes/', p: 0 },
  { type: 'fichier', id: 'includes/header.php', label: 'header.php', p: 1 },
  { type: 'fichier', id: 'includes/footer.php', label: 'footer.php', p: 1 },
  { type: 'dossier', label: 'partials/', p: 0 },
  { type: 'fichier', id: 'partials/product-card.php', label: 'product-card.php', p: 1 },
  { type: 'dossier', label: 'data/', p: 0 },
  { type: 'fichier', id: 'data/products.php', label: 'products.php', p: 1 },
];

const ASSEMBLAGE = [
  { src: 'data/products.php', note: 'aucune sortie : ce fichier retourne un tableau, il n\'affiche rien' },
  {
    src: 'includes/header.php',
    sortie: `<header>
  <h1>L'Érablière dorée</h1>
  <nav>…</nav>
</header>`,
  },
  { src: 'produits.php', sortie: `<main>\n  <h2>Nos produits</h2>` },
  {
    src: 'partials/product-card.php',
    tour: 'tour 1',
    sortie: `  <article class="carte">
    <h3>Sirop d'érable 540 ml</h3>
    <p>14,50 $</p>
  </article>`,
  },
  {
    src: 'partials/product-card.php',
    tour: 'tour 2',
    sortie: `  <article class="carte">
    <h3>Beurre d'érable 250 g</h3>
    <p>9,95 $</p>
  </article>`,
  },
  { src: 'produits.php', sortie: `</main>` },
  {
    src: 'includes/footer.php',
    sortie: `<footer>
  <p>© 2026 L'Érablière dorée</p>
</footer>`,
  },
];

const RE_INCLUSION = /(?:include|require)(?:_once)?\s+__DIR__\s*\.\s*"\/([^"]+)"/;

const css = `
.cmp { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:12px; overflow:hidden;
  background:var(--sl-color-bg, #fff); margin:1.5rem 0; }
.cmp-head { margin: 0; padding:10px 14px; border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:var(--sl-color-gray-6, #f7f8fa); display:flex; align-items:center; justify-content:space-between; gap:10px; }
.cmp-title { font-size:12px; font-weight:700; letter-spacing:.03em; color:var(--sl-color-accent, #4f46e5); }
.cmp-sub { font-size:12px; color:var(--sl-color-gray-3, #6b7280); margin-top:2px; }
.cmp-reset { margin:0; font-size:11px; font-weight:600; padding:5px 10px; border-radius:7px; cursor:pointer;
  border:1px solid var(--sl-color-gray-5, #d7dce6); background:transparent;
  color:var(--sl-color-gray-2, #515a6e); white-space:nowrap; }
.cmp-reset:hover { background:var(--sl-color-gray-6, #f1f2f6); }
.cmp-grid { display:grid; grid-template-columns:1fr; gap:12px; padding:14px; }
@media (min-width:760px) { .cmp-grid { grid-template-columns:210px minmax(0,1fr); } }
.cmp-col { display:flex; flex-direction:column; gap:7px; min-width:0; }
.cmp-lab { font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  color:var(--sl-color-gray-3, #8a93a6); }
.cmp-arbre { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:9px; padding:5px; }
.cmp-dossier { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:12px; font-weight:700;
  color:var(--sl-color-gray-3, #8a93a6); padding:4px 8px; }
.cmp-f { margin:0; display:flex; align-items:center; gap:7px; width:100%; text-align:left; cursor:pointer;
  font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:12px; padding:4px 8px; border:0;
  border-radius:6px; background:transparent; color:var(--sl-color-text, #2b3245); }
.cmp-f:hover { background:var(--sl-color-gray-6, #f1f2f6); }
.cmp-f[data-on="true"] { background:var(--sl-color-gray-6, #eef0fe); font-weight:700; }
.cmp-pastille { width:9px; height:9px; border-radius:3px; flex:0 0 auto; }
.cmp-bloc { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:9px; overflow:hidden; }
.cmp-bloc-h { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:11px; font-weight:700;
  padding:5px 10px; background:var(--sl-color-gray-6, #f7f8fa); color:var(--sl-color-gray-2, #515a6e);
  border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef); display:flex; justify-content:space-between; gap:10px; }
.cmp-role { font-weight:600; color:var(--sl-color-gray-3, #8a93a6); }
.cmp-pre { margin:0; padding:9px 0; font-family:var(--sl-font-mono, 'Fira Code', monospace);
  font-size:12.5px; line-height:1.6; color:var(--sl-color-text, #2b3245); overflow-x:auto; }
.cmp-l { display:block; padding:0 11px; white-space:pre-wrap; word-break:break-word; }
.cmp-lien { margin:0; display:block; width:100%; text-align:left; cursor:pointer; border:0; padding:0 11px;
  font:inherit; white-space:pre-wrap; word-break:break-word;
  background:var(--sl-color-accent-low, #eef0fe); color:var(--sl-color-accent, #4f46e5); font-weight:600; }
.cmp-lien:hover { filter:brightness(.96); }
.cmp-fleche { font-size:10px; opacity:.75; font-weight:400; }
.cmp-sortie { display:flex; flex-direction:column; gap:5px; }
.cmp-part { border-left:3px solid; border-radius:0 7px 7px 0; padding:6px 10px;
  background:var(--sl-color-gray-6, #f9fafc); transition:opacity .15s; }
.cmp-part-h { display:flex; align-items:center; gap:7px; margin-bottom:3px; }
.cmp-src { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:10.5px; font-weight:700; }
.cmp-tour { font-size:10px; font-weight:600; color:var(--sl-color-gray-3, #8a93a6);
  border:1px solid var(--sl-color-gray-5, #d7dce6); border-radius:999px; padding:0 6px; }
.cmp-code { margin:0; font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:12px;
  line-height:1.5; white-space:pre-wrap; word-break:break-word; color:var(--sl-color-text, #2b3245); }
.cmp-rien { font-size:11.5px; font-style:italic; color:var(--sl-color-gray-3, #8a93a6); }
.cmp-cap { padding:10px 14px; border-top:1px solid var(--sl-color-gray-5, #e6e9ef);
  font-size:13px; line-height:1.5; color:var(--sl-color-text, #2b3245); min-height:1.5em; }
`;

export default function CompositionPage() {
  // null = aucune sélection : la page assemblée se lit d'un bloc.
  const [choisi, setChoisi] = useState(null);
  const actif = choisi ?? 'produits.php';
  const setActif = (id) => setChoisi((prec) => (prec === id ? null : id));

  const rendreSource = (id) =>
    FICHIERS[id].code.split('\n').map((ligne, i) => {
      const m = ligne.match(RE_INCLUSION);
      const cible = m && FICHIERS[m[1]] ? m[1] : null;
      if (!cible) return <span className="cmp-l" key={i}>{ligne || ' '}</span>;
      return (
        <button className="cmp-lien" key={i} onClick={() => setActif(cible)}
                title={`Ouvrir ${cible}`}>
          {ligne} <span className="cmp-fleche">▸ {cible}</span>
        </button>
      );
    });

  const legende =
    choisi === null
      ? 'Le HTML final ne vient pas d\'un seul fichier : chaque bloc porte le nom de celui qui l\'a produit. Choisissez un fichier pour isoler sa contribution.'
      : actif === 'produits.php'
      ? 'La page ne contient presque rien : elle prépare deux variables, puis délègue l\'en-tête, chaque carte et le pied de page.'
      : actif === 'data/products.php'
      ? 'Ce fichier ne produit aucun HTML. Il retourne un tableau, que produits.php récupère avec require.'
      : actif === 'partials/product-card.php'
      ? 'Le fragment est inclus une fois par tour de boucle. Il utilise $p, la variable de la boucle : un fichier inclus partage la portée de son appelant.'
      : 'Ce fichier est inclus par toutes les pages du site. Le modifier une fois change le site entier.';

  return (
    <div className="cmp">
      <style>{css}</style>

      <div className="cmp-head">
        <div>
          <div className="cmp-title">Composition d'une page</div>
          <div className="cmp-sub">Choisissez un fichier, ou suivez une ligne <code>include</code>.</div>
        </div>
        <button className="cmp-reset" onClick={() => setChoisi(null)}>Tout afficher</button>
      </div>

      <div className="cmp-grid">
        <div className="cmp-col">
          <span className="cmp-lab">Fichiers du site</span>
          <div className="cmp-arbre">
            {ARBRE.map((n, i) =>
              n.type === 'dossier' ? (
                <div className="cmp-dossier" key={i} style={{ paddingLeft: 8 + n.p * 12 }}>{n.label}</div>
              ) : (
                <button className="cmp-f" key={i} data-on={choisi === n.id}
                        style={{ paddingLeft: 8 + n.p * 12 }} onClick={() => setActif(n.id)}>
                  <span className="cmp-pastille" style={{ background: COULEURS[n.id] }} />
                  {n.label}
                </button>
              )
            )}
          </div>

          <div className="cmp-bloc">
            <div className="cmp-bloc-h">
              <span>{actif}</span>
              <span className="cmp-role">{FICHIERS[actif].role}</span>
            </div>
            <pre className="cmp-pre">{rendreSource(actif)}</pre>
          </div>
        </div>

        <div className="cmp-col">
          <span className="cmp-lab">HTML produit par produits.php</span>
          <div className="cmp-sortie">
            {ASSEMBLAGE.map((b, i) => {
              const vif = choisi === null || b.src === choisi;
              return (
                <div className="cmp-part" key={i}
                     style={{ borderLeftColor: COULEURS[b.src], opacity: vif ? 1 : 0.42 }}>
                  <div className="cmp-part-h">
                    <span className="cmp-src" style={{ color: COULEURS[b.src] }}>{b.src}</span>
                    {b.tour && <span className="cmp-tour">{b.tour}</span>}
                  </div>
                  {b.sortie ? <pre className="cmp-code">{b.sortie}</pre>
                            : <span className="cmp-rien">{b.note}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cmp-cap">{legende}</div>
    </div>
  );
}