import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Extraction progressive
//
// Quatre états du même écran. On part d'une page statique où les trois
// ingrédients sont confondus — la logique y est « pré-évaluée » : l'auteur a
// trié, filtré et formaté de tête avant d'écrire le HTML. On sort ensuite les
// données, puis la logique, puis on rend la structure dynamique.
//
// Le rendu affiché ne change jamais d'une étape à l'autre : c'est le propos.
// Seule bouge la place de chaque responsabilité, indiquée par les trois jetons.
// ─────────────────────────────────────────────────────────────────────────────

const C = { d: '#0d9488', l: '#b45309', s: '#4f46e5' };
const NOM = { d: 'données', l: 'logique', s: 'structure' };

// [texte, marque] — marque ∈ d (données) | l (logique) | s (structure) | null
const ETAPES = [
  {
    titre: 'Page statique',
    fichier: 'produits.html',
    intro:
      'Tout est écrit à la main. Les trois produits du catalogue n\'apparaissent pas : il en manque un, et l\'ordre n\'est pas celui du catalogue.',
    lignes: [
      ['<h1>Nos produits</h1>', 's'],
      ['<ul>', 's'],
      ['  <li>Tire sur la neige — 6,25 $</li>', 'd'],
      ['  <li>Sirop d\'érable 540 ml — 14,50 $</li>', 'd'],
      ['</ul>', 's'],
    ],
    etat: { d: 0, l: 0, s: 0 },
    coince:
      'La logique existe pourtant : quelqu\'un a décidé d\'écarter le produit en rupture, de trier par prix et d\'écrire « 14,50 $ ». Ces décisions ont été prises de tête, puis effacées. Rien dans le fichier n\'en garde la trace, et personne ne peut les vérifier.',
  },
  {
    titre: 'Les données sortent',
    fichier: 'produits.php',
    intro:
      'Le catalogue complet est rassemblé en haut du fichier, dans un tableau. Il devient une source unique, modifiable à un seul endroit.',
    lignes: [
      ['<?php', null],
      ['$products = [', 'd'],
      ['  ["nom" => "Sirop d\'érable 540 ml", "prix" => 14.50, "stock" => 8],', 'd'],
      ['  ["nom" => "Beurre d\'érable 250 g",  "prix" => 9.95,  "stock" => 0],', 'd'],
      ['  ["nom" => "Tire sur la neige",      "prix" => 6.25,  "stock" => 12],', 'd'],
      ['];', 'd'],
      ['?>', null],
      ['', null],
      ['<h1>Nos produits</h1>', 's'],
      ['<ul>', 's'],
      ['  <li><?php echo $products[2]["nom"]; ?> — 6,25 $</li>', 's'],
      ['  <li><?php echo $products[0]["nom"]; ?> — 14,50 $</li>', 's'],
      ['</ul>', 's'],
    ],
    etat: { d: 1, l: 0, s: 0 },
    coince:
      'Le tableau contient trois produits, la page en affiche deux, choisis par leur indice. Les prix restent écrits en dur. La logique n\'a pas bougé : elle est toujours dans la tête de l\'auteur, simplement déguisée en $products[2].',
  },
  {
    titre: 'La logique s\'écrit',
    fichier: 'produits.php',
    intro:
      'Les décisions prises de tête deviennent du code : écarter les ruptures, trier par prix, formater le montant. On peut désormais les lire, les discuter, les corriger.',
    lignes: [
      ['<?php', null],
      ['$products = [ /* les trois produits, inchangés */ ];', 'd'],
      ['', null],
      ['$afficher = array_filter($products, fn($p) => $p["stock"] > 0);', 'l'],
      ['usort($afficher, fn($a, $b) => $a["prix"] <=> $b["prix"]);', 'l'],
      ['?>', null],
      ['', null],
      ['<h1>Nos produits</h1>', 's'],
      ['<ul>', 's'],
      ['  <li><?php echo $afficher[0]["nom"]; ?> —', 's'],
      ['      <?php echo number_format($afficher[0]["prix"], 2, ",", " "); ?> $</li>', 's'],
      ['  <li><?php echo $afficher[1]["nom"]; ?> —', 's'],
      ['      <?php echo number_format($afficher[1]["prix"], 2, ",", " "); ?> $</li>', 's'],
      ['</ul>', 's'],
    ],
    etat: { d: 1, l: 1, s: 0 },
    coince:
      'La logique dit maintenant « deux produits ». Le HTML, lui, écrit toujours deux <li> en dur. Remettez le beurre d\'érable en stock et la page mentira : elle en affichera deux sur trois, sans prévenir. La structure doit suivre la logique.',
  },
  {
    titre: 'La structure suit',
    fichier: 'produits.php',
    intro:
      'La boucle remplace la répétition, la condition prend en charge le cas vide. Le HTML ne sait plus combien de produits il affiche — et c\'est exactement ce qu\'on lui demande.',
    lignes: [
      ['<?php', null],
      ['$titre    = "Nos produits";', 'd'],
      ['$products = [ /* les trois produits, inchangés */ ];', 'd'],
      ['', null],
      ['$afficher = array_filter($products, fn($p) => $p["stock"] > 0);', 'l'],
      ['usort($afficher, fn($a, $b) => $a["prix"] <=> $b["prix"]);', 'l'],
      ['?>', null],
      ['', null],
      ['<h1><?php echo htmlspecialchars($titre); ?></h1>', 's'],
      ['', null],
      ['<?php if (empty($afficher)): ?>', 's'],
      ['  <p>Aucun produit disponible.</p>', 's'],
      ['<?php else: ?>', 's'],
      ['  <ul>', 's'],
      ['    <?php foreach ($afficher as $p): ?>', 's'],
      ['      <li>', 's'],
      ['        <?php echo htmlspecialchars($p["nom"]); ?> —', 's'],
      ['        <?php echo number_format($p["prix"], 2, ",", " "); ?> $', 's'],
      ['      </li>', 's'],
      ['    <?php endforeach; ?>', 's'],
      ['  </ul>', 's'],
      ['<?php endif; ?>', 's'],
    ],
    etat: { d: 1, l: 1, s: 1 },
    coince: null,
    bilan:
      'Ajouter un produit, en épuiser un, changer le tri : plus une seule ligne de HTML à toucher. Chaque ingrédient a désormais une place, et une seule.',
  },
];

const JETONS = {
  d: ['écrites dans le HTML', 'rassemblées dans un tableau'],
  l: ['dans la tête de l\'auteur', 'écrite en PHP, vérifiable'],
  s: ['répétée à la main', 'une boucle, un cas vide'],
};

const css = `
.exp { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:12px; overflow:hidden;
  background:var(--sl-color-bg, #fff); margin:1.5rem 0; }
.exp-head { margin:0; padding:10px 14px; border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:var(--sl-color-gray-6, #f7f8fa); }
.exp-title { font-size:12px; font-weight:700; letter-spacing:.03em; color:var(--sl-color-accent, #4f46e5); }
.exp-sub { font-size:12px; color:var(--sl-color-gray-3, #6b7280); margin-top:2px; }
.exp-body { padding:14px; display:flex; flex-direction:column; gap:12px; }
.exp-fil { display:flex; flex-wrap:wrap; }
.exp-et { margin:0; flex:1 1 140px; min-width:0; font:inherit; text-align:left; cursor:pointer;
  border:1px solid var(--sl-color-gray-5, #e6e9ef); background:transparent; padding:7px 10px; }
.exp-et:first-child { border-radius:8px 0 0 8px; }
.exp-et:last-child { border-radius:0 8px 8px 0; }
.exp-et + .exp-et { border-left:0; }
.exp-et[data-on="true"] { background:var(--sl-color-accent-low, #eef0fe); border-color:var(--sl-color-accent, #4f46e5); }
.exp-et[data-on="true"] + .exp-et { border-left-color:var(--sl-color-accent, #4f46e5); }
.exp-n { font-size:10px; font-weight:700; color:var(--sl-color-gray-3, #8a93a6); display:block; }
.exp-t { font-size:12px; font-weight:700; color:var(--sl-color-text, #2b3245); display:block; }
.exp-intro { font-size:13px; line-height:1.55; color:var(--sl-color-text, #2b3245); margin:0; }
.exp-jetons { display:flex; flex-wrap:wrap; gap:7px; }
.exp-j { display:inline-flex; align-items:center; gap:6px; font-size:11.5px; padding:4px 10px;
  border-radius:999px; border:1px solid; }
.exp-jn { font-weight:700; }
.exp-jv { opacity:.85; }
.exp-bloc { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:9px; overflow:hidden; }
.exp-bloc-h { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:11px; font-weight:700;
  padding:5px 10px; background:var(--sl-color-gray-6, #f7f8fa); color:var(--sl-color-gray-2, #515a6e);
  border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef); }
.exp-code { margin:0; padding:9px 0; font-family:var(--sl-font-mono, 'Fira Code', monospace);
  font-size:12.5px; line-height:1.6; color:var(--sl-color-text, #2b3245); overflow-x:auto; }
.exp-l { display:block; padding:0 11px; white-space:pre-wrap; word-break:break-word;
  border-left:3px solid transparent; }
.exp-coince { border-left:3px solid #b45309; background:#b4530910; border-radius:0 8px 8px 0;
  padding:8px 11px; font-size:12.5px; line-height:1.55; color:var(--sl-color-text, #2b3245); }
.exp-bilan { border-left:3px solid #0d9488; background:#0d948810; border-radius:0 8px 8px 0;
  padding:8px 11px; font-size:12.5px; line-height:1.55; color:var(--sl-color-text, #2b3245); }
.exp-etiq { font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  display:block; margin-bottom:2px; }
.exp-nav { padding:10px 14px; border-top:1px solid var(--sl-color-gray-5, #e6e9ef);
  display:flex; align-items:center; justify-content:space-between; gap:10px; }
.exp-b { margin:0; font-size:12px; font-weight:600; padding:5px 12px; border-radius:7px; cursor:pointer;
  border:1px solid var(--sl-color-gray-5, #d7dce6); background:transparent; color:var(--sl-color-gray-2, #515a6e); }
.exp-b:hover:enabled { background:var(--sl-color-gray-6, #f1f2f6); }
.exp-b:disabled { opacity:.4; cursor:default; }
.exp-cst { font-size:11.5px; color:var(--sl-color-gray-3, #8a93a6); text-align:center; }
`;

export default function ExtractionProgressive() {
  const [i, setI] = useState(0);
  const e = ETAPES[i];

  return (
    <div className="exp">
      <style>{css}</style>

      <div className="exp-head">
        <div className="exp-title">D'une page statique à une page dynamique</div>
        <div className="exp-sub">Le résultat affiché est le même aux quatre étapes. Seule change la place de chaque ingrédient.</div>
      </div>

      <div className="exp-body">
        <div className="exp-fil" role="group" aria-label="Étape de la transformation">
          {ETAPES.map((et, k) => (
            <button className="exp-et" key={k} data-on={i === k} onClick={() => setI(k)}>
              <span className="exp-n">Étape {k + 1}</span>
              <span className="exp-t">{et.titre}</span>
            </button>
          ))}
        </div>

        <div className="exp-jetons">
          {['d', 'l', 's'].map((cle) => {
            const acquis = e.etat[cle] === 1;
            return (
              <span className="exp-j" key={cle}
                    style={{
                      borderColor: acquis ? C[cle] : 'var(--sl-color-gray-5, #d7dce6)',
                      background: acquis ? C[cle] + '14' : 'transparent',
                      color: acquis ? C[cle] : 'var(--sl-color-gray-3, #8a93a6)',
                    }}>
                <span className="exp-jn">{NOM[cle]}</span>
                <span className="exp-jv">{JETONS[cle][acquis ? 1 : 0]}</span>
              </span>
            );
          })}
        </div>

        <p className="exp-intro">{e.intro}</p>

        <div className="exp-bloc">
          <div className="exp-bloc-h">{e.fichier}</div>
          <pre className="exp-code">
            {e.lignes.map(([texte, m], k) => (
              <span className="exp-l" key={k}
                    style={m ? { borderLeftColor: C[m], background: C[m] + '0f' } : undefined}>
                {texte || ' '}
              </span>
            ))}
          </pre>
        </div>

        {e.coince && (
          <div className="exp-coince">
            <span className="exp-etiq" style={{ color: '#b45309' }}>Ce qui coince encore</span>
            {e.coince}
          </div>
        )}
        {e.bilan && (
          <div className="exp-bilan">
            <span className="exp-etiq" style={{ color: '#0d9488' }}>Ce qu'on a gagné</span>
            {e.bilan}
          </div>
        )}
      </div>

      <div className="exp-nav">
        <button className="exp-b" onClick={() => setI(i - 1)} disabled={i === 0}>← Étape précédente</button>
        <span className="exp-cst">Affichage identique aux quatre étapes</span>
        <button className="exp-b" onClick={() => setI(i + 1)} disabled={i === ETAPES.length - 1}>Étape suivante →</button>
      </div>
    </div>
  );
}