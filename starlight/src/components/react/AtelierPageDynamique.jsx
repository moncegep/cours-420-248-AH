import { useState, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Atelier : les trois ingrédients d'une page dynamique
//
// On modifie les données, on ajuste la logique, et le HTML produit se recompose
// aussitôt. Le gabarit de présentation, lui, ne bouge jamais : c'est tout le
// propos. L'échappement est appliqué pour de vrai, ce qui permet de voir ce que
// htmlspecialchars() fait à un nom contenant du balisage.
// ─────────────────────────────────────────────────────────────────────────────

const DONNEES_DEFAUT = [
  { nom: "Sirop d'érable 540 ml", prix: 14.5, stock: 8 },
  { nom: "Beurre d'érable 250 g", prix: 9.95, stock: 0 },
  { nom: 'Tire sur la neige', prix: 6.25, stock: 12 },
];

const GABARIT = `<h1><?php echo htmlspecialchars($titre); ?></h1>

<?php if (empty($afficher)): ?>
  <p>Aucun produit disponible.</p>
<?php else: ?>
  <ul>
    <?php foreach ($afficher as $p): ?>
      <li>
        <?php echo htmlspecialchars($p["nom"]); ?> —
        <?php echo number_format($p["prix"], 2, ",", " "); ?> $
      </li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>`;

const echapper = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const prixFr = (n) => Number(n).toFixed(2).replace('.', ',');

const css = `
.apd { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:12px; overflow:hidden;
  background:var(--sl-color-bg, #fff); margin:1.5rem 0; }
.apd-head { padding:10px 14px; border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:var(--sl-color-gray-6, #f7f8fa); }
.apd-title { font-size:12px; font-weight:700; letter-spacing:.03em; color:var(--sl-color-accent, #4f46e5); }
.apd-sub { font-size:12px; color:var(--sl-color-gray-3, #6b7280); margin-top:2px; }
.apd-body { padding:14px; display:flex; flex-direction:column; gap:14px; }
.apd-zone { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:9px; overflow:hidden; }
.apd-zone-head { display:flex; align-items:baseline; gap:8px; padding:6px 11px;
  background:var(--sl-color-gray-6, #f7f8fa); border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef); }
.apd-num { font-size:10px; font-weight:700; width:17px; height:17px; border-radius:50%; flex:0 0 auto;
  display:inline-flex; align-items:center; justify-content:center;
  background:var(--sl-color-accent, #4f46e5); color:#fff; }
.apd-zone-t { font-size:11px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  color:var(--sl-color-gray-2, #515a6e); }
.apd-zone-d { font-size:11px; color:var(--sl-color-gray-3, #8a93a6); }
.apd-zone-c { padding:10px 11px; }
.apd-ligne { display:grid; grid-template-columns:minmax(0,1fr) 74px 64px; gap:7px; margin-bottom:6px; }
.apd-ligne:last-child { margin-bottom:0; }
.apd-in { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:12.5px; padding:5px 8px;
  border:1px solid var(--sl-color-gray-5, #d7dce6); border-radius:6px; width:100%; box-sizing:border-box;
  background:var(--sl-color-bg, #fff); color:var(--sl-color-text, #1c2230); }
.apd-in:focus { outline:2px solid var(--sl-color-accent, #4f46e5); outline-offset:1px; border-color:transparent; }
.apd-cols { display:grid; grid-template-columns:minmax(0,1fr) 74px 64px; gap:7px; margin-bottom:4px;
  font-size:10px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--sl-color-gray-3, #8a93a6); }
.apd-opts { display:flex; flex-wrap:wrap; gap:8px 16px; align-items:center; }
.apd-opt { display:inline-flex; align-items:center; gap:6px; font-size:12.5px;
  color:var(--sl-color-text, #2b3245); cursor:pointer; }
.apd-opt input { margin:0; accent-color:var(--sl-color-accent, #4f46e5); }
.apd-var { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:11.5px;
  color:var(--sl-color-gray-3, #8a93a6); margin-top:7px; }
.apd-pre { margin:0; padding:10px 11px; font-family:var(--sl-font-mono, 'Fira Code', monospace);
  font-size:12.5px; line-height:1.55; white-space:pre-wrap; word-break:break-word;
  color:var(--sl-color-text, #2b3245); overflow-x:auto; }
.apd-php { background:var(--sl-color-accent-low, #eef0fe); color:var(--sl-color-accent, #4f46e5);
  border-radius:3px; padding:0 2px; font-weight:600; }
.apd-sorties { display:grid; gap:10px; grid-template-columns:1fr; }
@media (min-width:720px) { .apd-sorties { grid-template-columns:1fr 1fr; } }
.apd-out { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:9px; overflow:hidden; }
.apd-out-h { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:11px; font-weight:700;
  padding:5px 10px; background:var(--sl-color-gray-6, #f7f8fa); color:var(--sl-color-gray-2, #515a6e);
  border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef); }
.apd-vue { padding:12px 14px; }
.apd-vue h4 { font-size:15px; font-weight:700; margin:0 0 7px; color:var(--sl-color-text, #2b3245); }
.apd-vue ul { margin:0; padding-left:19px; }
.apd-vue li { font-size:13px; line-height:1.65; color:var(--sl-color-text, #2b3245); }
.apd-vide { font-size:13px; font-style:italic; color:var(--sl-color-gray-3, #8a93a6); margin:0; }
.apd-cap { padding:10px 14px; border-top:1px solid var(--sl-color-gray-5, #e6e9ef);
  font-size:13px; line-height:1.5; color:var(--sl-color-text, #2b3245); }
.apd-chip { margin:0; font-size:11px; font-weight:600; padding:4px 9px; border-radius:999px; cursor:pointer;
  border:1px solid var(--sl-color-gray-5, #d7dce6); background:transparent; color:var(--sl-color-gray-2, #515a6e); }
.apd-chip:hover { background:var(--sl-color-gray-6, #f1f2f6); }
.apd-chips { display:flex; flex-wrap:wrap; gap:6px; }
`;

function colorerPhp(code) {
  const morceaux = code.split(/(<\?php[\s\S]*?\?>|<\?=[\s\S]*?\?>)/g);
  return morceaux.map((m, i) =>
    m.startsWith('<?') ? <span key={i} className="apd-php">{m}</span> : <span key={i}>{m}</span>
  );
}

export default function AtelierPageDynamique() {
  const [titre, setTitre] = useState('Nos produits');
  const [produits, setProduits] = useState(DONNEES_DEFAUT);
  const [enStock, setEnStock] = useState(true);
  const [triPrix, setTriPrix] = useState(false);

  const majProduit = (i, champ, valeur) =>
    setProduits((prev) => prev.map((p, k) => (k === i ? { ...p, [champ]: valeur } : p)));

  const afficher = useMemo(() => {
    let liste = [...produits];
    if (enStock) liste = liste.filter((p) => Number(p.stock) > 0);
    if (triPrix) liste.sort((a, b) => Number(a.prix) - Number(b.prix));
    return liste;
  }, [produits, enStock, triPrix]);

  const html = useMemo(() => {
    const entete = `<h1>${echapper(titre)}</h1>\n\n`;
    if (afficher.length === 0) return entete + '<p>Aucun produit disponible.</p>';
    const items = afficher
      .map((p) => `  <li>\n    ${echapper(p.nom)} —\n    ${prixFr(p.prix)} $\n  </li>`)
      .join('\n');
    return entete + '<ul>\n' + items + '\n</ul>';
  }, [titre, afficher]);

  return (
    <div className="apd">
      <style>{css}</style>

      <div className="apd-head">
        <div className="apd-title">Données, logique, présentation</div>
        <div className="apd-sub">Modifiez les deux premières zones : la troisième ne change jamais.</div>
      </div>

      <div className="apd-body">
        <div className="apd-zone">
          <div className="apd-zone-head">
            <span className="apd-num">1</span>
            <span className="apd-zone-t">Données</span>
            <span className="apd-zone-d">ce qu'il y a à afficher</span>
          </div>
          <div className="apd-zone-c">
            <div className="apd-cols"><span>nom</span><span>prix</span><span>stock</span></div>
            {produits.map((p, i) => (
              <div className="apd-ligne" key={i}>
                <input className="apd-in" value={p.nom} spellCheck={false}
                       aria-label={`Nom du produit ${i + 1}`}
                       onChange={(e) => majProduit(i, 'nom', e.target.value)} />
                <input className="apd-in" type="number" step="0.05" min="0" value={p.prix}
                       aria-label={`Prix du produit ${i + 1}`}
                       onChange={(e) => majProduit(i, 'prix', e.target.value)} />
                <input className="apd-in" type="number" step="1" min="0" value={p.stock}
                       aria-label={`Stock du produit ${i + 1}`}
                       onChange={(e) => majProduit(i, 'stock', e.target.value)} />
              </div>
            ))}
            <div className="apd-chips" style={{ marginTop: 9 }}>
              <button className="apd-chip" onClick={() => majProduit(0, 'nom', '<b>Aubaine</b>')}>
                Mettre du balisage dans un nom
              </button>
              <button className="apd-chip" onClick={() => setProduits(DONNEES_DEFAUT)}>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        <div className="apd-zone">
          <div className="apd-zone-head">
            <span className="apd-num">2</span>
            <span className="apd-zone-t">Logique</span>
            <span className="apd-zone-d">ce qu'on décide d'afficher</span>
          </div>
          <div className="apd-zone-c">
            <div className="apd-opts">
              <label className="apd-opt">
                <input type="checkbox" checked={enStock} onChange={(e) => setEnStock(e.target.checked)} />
                Uniquement les produits en stock
              </label>
              <label className="apd-opt">
                <input type="checkbox" checked={triPrix} onChange={(e) => setTriPrix(e.target.checked)} />
                Trier par prix croissant
              </label>
            </div>
            <div className="apd-ligne" style={{ gridTemplateColumns: '1fr', marginTop: 9 }}>
              <input className="apd-in" value={titre} spellCheck={false} aria-label="Titre de la page"
                     onChange={(e) => setTitre(e.target.value)} />
            </div>
            <div className="apd-var">
              $titre, $afficher ({afficher.length} produit{afficher.length > 1 ? 's' : ''} retenu
              {afficher.length > 1 ? 's' : ''} sur {produits.length})
            </div>
          </div>
        </div>

        <div className="apd-zone">
          <div className="apd-zone-head">
            <span className="apd-num">3</span>
            <span className="apd-zone-t">Présentation</span>
            <span className="apd-zone-d">gabarit fixe</span>
          </div>
          <pre className="apd-pre">{colorerPhp(GABARIT)}</pre>
        </div>

        <div className="apd-sorties">
          <div className="apd-out">
            <div className="apd-out-h">HTML produit</div>
            <pre className="apd-pre">{html}</pre>
          </div>
          <div className="apd-out">
            <div className="apd-out-h">Ce que voit l'utilisateur</div>
            <div className="apd-vue">
              <h4>{titre}</h4>
              {afficher.length === 0 ? (
                <p className="apd-vide">Aucun produit disponible.</p>
              ) : (
                <ul>
                  {afficher.map((p, i) => (
                    <li key={i}>{p.nom} — {prixFr(p.prix)} $</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="apd-cap">
        Le gabarit ne connaît pas les produits : il parcourt <code>$afficher</code>, quel qu'en soit le contenu.
        Écrivez <code>&lt;b&gt;</code> dans un nom pour voir <code>htmlspecialchars()</code> le neutraliser dans
        le HTML produit — le balisage s'affiche comme du texte au lieu d'être interprété.
      </div>
    </div>
  );
}