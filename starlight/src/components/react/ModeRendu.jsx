import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Mode de rendu
//
// Même résultat à l'écran, mais produit à deux endroits différents.
//
// Rendu serveur :
//   PHP exécute la boucle et les conditions avant d'envoyer la réponse.
//
// Rendu client :
//   le navigateur reçoit les données et le JavaScript, puis exécute lui-même
//   la boucle et les conditions pour construire l'interface.
// ─────────────────────────────────────────────────────────────────────────────

const ETAPES = [
  { cle: 'source', titre: 'Fichier source', lieu: 'sur le serveur' },
  { cle: 'reseau', titre: 'Réponse HTTP', lieu: 'sur le réseau' },
  { cle: 'ecran', titre: 'Affichage', lieu: 'dans le navigateur' },
];

const PRODUITS = [
  { nom: 'Clavier', prix: 49.99, stock: 4 },
  { nom: 'Souris', prix: 29.99, stock: 0 },
  { nom: 'Écran', prix: 219.99, stock: 2 },
];

const MODES = {
  serveur: {
    label: 'Rendu côté serveur',
    sousTitre: 'PHP construit le HTML avant l’envoi',

    source: {
      nom: 'produits.php',
      langue: 'php',
      code: `<h1>Nos produits</h1>

<p><?= count($products) ?> produits au catalogue.</p>

<ul>
<?php foreach ($products as $product): ?>
  <li>
    <?= $product['name'] ?> — <?= $product['price'] ?> $

    <?php if ($product['stock'] > 0): ?>
      <strong>Disponible</strong>
    <?php else: ?>
      <strong>Rupture de stock</strong>
    <?php endif; ?>
  </li>
<?php endforeach; ?>
</ul>`,
    },

    reseau: {
      nom: 'corps de la réponse',
      langue: 'html',
      code: `<h1>Nos produits</h1>

<p>3 produits au catalogue.</p>

<ul>
  <li>
    Clavier — 49.99 $
    <strong>Disponible</strong>
  </li>

  <li>
    Souris — 29.99 $
    <strong>Rupture de stock</strong>
  </li>

  <li>
    Écran — 219.99 $
    <strong>Disponible</strong>
  </li>
</ul>`,
    },

    ecran: {
      attente: false,
    },

    constats: {
      source:
        'PHP contient une boucle foreach et une condition if. Ces instructions déterminent quels éléments HTML doivent être produits.',
      reseau:
        'La boucle et les conditions ont déjà été exécutées. Le navigateur reçoit uniquement leur résultat : trois <li> et les mentions « Disponible » ou « Rupture de stock ».',
      ecran:
        'Le navigateur affiche directement le HTML reçu. Il n’a pas besoin de connaître la boucle, la condition ou même PHP.',
    },
  },

  client: {
    label: 'Rendu côté client',
    sousTitre: 'JavaScript construit l’interface après l’envoi',

    source: {
      nom: 'produits.html',
      langue: 'html + javascript',
      code: `<h1>Nos produits</h1>

<p id="compte">Chargement…</p>
<ul id="produits"></ul>

<script>
const products = [
  { name: 'Clavier', price: 49.99, stock: 4 },
  { name: 'Souris', price: 29.99, stock: 0 },
  { name: 'Écran', price: 219.99, stock: 2 }
];

document.querySelector('#compte').textContent =
  products.length + ' produits au catalogue.';

for (const product of products) {
  const li = document.createElement('li');

  const etat = product.stock > 0
    ? 'Disponible'
    : 'Rupture de stock';

  li.innerHTML =
    product.name + ' — ' + product.price + ' $ ' +
    '<strong>' + etat + '</strong>';

  document.querySelector('#produits').append(li);
}
</script>`,
    },

    reseau: {
      nom: 'corps de la réponse',
      langue: 'html + javascript',
      code: `<h1>Nos produits</h1>

<p id="compte">Chargement…</p>
<ul id="produits"></ul>

<script>
const products = [
  { name: 'Clavier', price: 49.99, stock: 4 },
  { name: 'Souris', price: 29.99, stock: 0 },
  { name: 'Écran', price: 219.99, stock: 2 }
];

// Le navigateur devra encore
// exécuter la boucle et la condition.
...
</script>`,
    },

    ecran: {
      attente: true,
    },

    constats: {
      source:
        'Le fichier contient la structure initiale de la page, les données et le JavaScript chargé de fabriquer les éléments de la liste.',
      reseau:
        'La réponse contient encore la boucle et la condition JavaScript. Contrairement au rendu serveur, leur résultat HTML n’existe pas encore.',
      ecran:
        'Après réception de la page, le navigateur exécute JavaScript : il compte les produits, parcourt le tableau et choisit pour chacun entre « Disponible » et « Rupture de stock ».',
    },
  },
};

// Met en évidence les fragments <?php ... ?>, <?= ... ?>
function colorerPhp(code) {
  const morceaux = code.split(/(<\?(?:php|=)[\s\S]*?\?>)/g);

  return morceaux.map((m, i) =>
    m.startsWith('<?') ? (
      <span key={i} className="mrd-php">{m}</span>
    ) : (
      <span key={i}>{m}</span>
    )
  );
}

const css = `
.mrd {
  border:1px solid var(--sl-color-gray-5, #e6e9ef);
  border-radius:12px;
  overflow:hidden;
  background:var(--sl-color-bg, #fff);
  margin:1.5rem 0;
}

.mrd-head {
  margin:0;
  padding:10px 14px;
  border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:var(--sl-color-gray-6, #f7f8fa);
}

.mrd-title {
  font-size:12px;
  font-weight:700;
  letter-spacing:.03em;
  color:var(--sl-color-accent, #4f46e5);
}

.mrd-sub {
  font-size:12px;
  color:var(--sl-color-gray-3, #6b7280);
  margin-top:2px;
}

.mrd-body {
  padding:14px;
  display:flex;
  flex-direction:column;
  gap:12px;
}

.mrd-seg {
  display:inline-flex;
  border:1px solid var(--sl-color-gray-5, #d7dce6);
  border-radius:8px;
  overflow:hidden;
  align-self:flex-start;
}

.mrd-seg button {
  margin:0;
  font:inherit;
  font-size:12px;
  font-weight:700;
  padding:5px 14px;
  border:0;
  background:transparent;
  color:var(--sl-color-gray-2, #515a6e);
  cursor:pointer;
}

.mrd-seg button + button {
  border-left:1px solid var(--sl-color-gray-5, #d7dce6);
}

.mrd-seg button[data-on="true"] {
  background:var(--sl-color-accent-low, #eef0fe);
  color:var(--sl-color-accent, #4f46e5);
}

.mrd-fil {
  display:flex;
  align-items:stretch;
  gap:0;
  flex-wrap:wrap;
}

.mrd-etape {
  margin:0;
  flex:1 1 130px;
  min-width:0;
  font:inherit;
  text-align:left;
  cursor:pointer;
  border:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:transparent;
  padding:7px 10px;
}

.mrd-etape:first-child {
  border-radius:8px 0 0 8px;
}

.mrd-etape:last-child {
  border-radius:0 8px 8px 0;
}

.mrd-etape + .mrd-etape {
  border-left:0;
}

.mrd-etape[data-on="true"] {
  background:var(--sl-color-accent-low, #eef0fe);
  border-color:var(--sl-color-accent, #4f46e5);
}

.mrd-etape[data-on="true"] + .mrd-etape {
  border-left-color:var(--sl-color-accent, #4f46e5);
}

.mrd-en {
  font-size:12px;
  font-weight:700;
  color:var(--sl-color-text, #2b3245);
  display:block;
}

.mrd-el {
  font-size:11px;
  color:var(--sl-color-gray-3, #8a93a6);
  display:block;
  margin-top:1px;
}

.mrd-block {
  border:1px solid var(--sl-color-gray-5, #e6e9ef);
  border-radius:8px;
  overflow:hidden;
}

.mrd-block-head {
  font-family:var(--sl-font-mono, 'Fira Code', monospace);
  font-size:11px;
  font-weight:700;
  padding:5px 10px;
  background:var(--sl-color-gray-6, #f7f8fa);
  color:var(--sl-color-gray-2, #515a6e);
  border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  display:flex;
  justify-content:space-between;
  gap:10px;
}

.mrd-tag {
  font-weight:600;
  color:var(--sl-color-gray-3, #8a93a6);
}

.mrd-pre {
  margin:0;
  padding:9px 11px;
  font-family:var(--sl-font-mono, 'Fira Code', monospace);
  font-size:12.5px;
  line-height:1.55;
  white-space:pre-wrap;
  word-break:break-word;
  color:var(--sl-color-text, #2b3245);
  overflow-x:auto;
}

.mrd-php {
  background:var(--sl-color-accent-low, #eef0fe);
  color:var(--sl-color-accent, #4f46e5);
  border-radius:3px;
  padding:0 2px;
  font-weight:600;
}

.mrd-nav {
  padding:14px;
  background:var(--sl-color-gray-6, #f7f8fa);
}

.mrd-bar {
  display:flex;
  gap:5px;
  align-items:center;
  padding:5px 9px;
  border-radius:6px 6px 0 0;
  background:var(--sl-color-gray-5, #e6e9ef);
}

.mrd-dot {
  width:9px;
  height:9px;
  border-radius:50%;
  background:var(--sl-color-gray-3, #b6bdca);
}

.mrd-vue {
  border:1px solid var(--sl-color-gray-5, #e6e9ef);
  border-top:0;
  border-radius:0 0 6px 6px;
  background:var(--sl-color-bg, #fff);
  padding:14px 16px;
}

.mrd-h1 {
  font-size:17px;
  font-weight:700;
  margin:0 0 4px;
  color:var(--sl-color-text, #2b3245);
}

.mrd-p {
  font-size:13.5px;
  margin:0 0 10px;
  color:var(--sl-color-text, #2b3245);
}

.mrd-produits {
  margin:0;
  padding-left:20px;
  font-size:13px;
}

.mrd-produits li {
  margin:5px 0;
}

.mrd-dispo {
  font-size:11px;
  font-weight:700;
  margin-left:6px;
}

.mrd-attente {
  font-size:11px;
  color:#b45309;
  margin-top:10px;
  display:block;
  font-style:italic;
}

.mrd-cap {
  padding:10px 14px;
  border-top:1px solid var(--sl-color-gray-5, #e6e9ef);
  font-size:13px;
  line-height:1.5;
  color:var(--sl-color-text, #2b3245);
  min-height:1.5em;
}
`;

export default function ModeRendu() {
  const [mode, setMode] = useState('serveur');
  const [etape, setEtape] = useState('source');

  const m = MODES[mode];

  return (
    <div className="mrd">
      <style>{css}</style>

      <div className="mrd-head">
        <div className="mrd-title">Où le HTML est-il produit ?</div>
        <div className="mrd-sub">{m.sousTitre}</div>
      </div>

      <div className="mrd-body">

        <div className="mrd-seg" role="group" aria-label="Mode de rendu">
          {Object.entries(MODES).map(([cle, v]) => (
            <button
              key={cle}
              data-on={mode === cle}
              onClick={() => setMode(cle)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="mrd-fil" role="group" aria-label="Moment du trajet">
          {ETAPES.map((e) => (
            <button
              key={e.cle}
              className="mrd-etape"
              data-on={etape === e.cle}
              onClick={() => setEtape(e.cle)}
            >
              <span className="mrd-en">{e.titre}</span>
              <span className="mrd-el">{e.lieu}</span>
            </button>
          ))}
        </div>

        {etape === 'ecran' ? (
          <div className="mrd-nav">

            <div className="mrd-bar" aria-hidden="true">
              <span className="mrd-dot" />
              <span className="mrd-dot" />
              <span className="mrd-dot" />
            </div>

            <div className="mrd-vue">
              <p className="mrd-h1">Nos produits</p>
              <p className="mrd-p">3 produits au catalogue.</p>

              <ul className="mrd-produits">
                {PRODUITS.map((produit) => (
                  <li key={produit.nom}>
                    {produit.nom} — {produit.prix.toFixed(2)} $
                    <strong className="mrd-dispo">
                      {produit.stock > 0
                        ? 'Disponible'
                        : 'Rupture de stock'}
                    </strong>
                  </li>
                ))}
              </ul>

              {m.ecran.attente && (
                <span className="mrd-attente">
                  Avant l’exécution du JavaScript, la liste était vide et
                  le navigateur affichait « Chargement… ».
                </span>
              )}
            </div>

          </div>
        ) : (
          <div className="mrd-block">

            <div className="mrd-block-head">
              <span>{m[etape].nom}</span>
              <span className="mrd-tag">{m[etape].langue}</span>
            </div>

            <pre className="mrd-pre">
              {colorerPhp(m[etape].code)}
            </pre>

          </div>
        )}

      </div>

      <div className="mrd-cap">
        {m.constats[etape]}
      </div>
    </div>
  );
}