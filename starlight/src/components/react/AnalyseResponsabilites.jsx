import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Analyse des responsabilités
//
// La page produits.php du guide, chaque ligne rattachée à la responsabilité
// qu'elle sert. Choisir une responsabilité isole ses lignes et affiche la
// raison pour laquelle cette partie du fichier devrait changer. Le compte des
// responsabilités distinctes est le point de départ du principe de
// responsabilité unique.
// ─────────────────────────────────────────────────────────────────────────────

const RESPONSABILITES = {
  chargement:   { nom: 'Chargement des fichiers', couleur: '#64748b', raison: "la structure des dossiers du projet est réorganisée" },
  connexion:    { nom: 'Connexion à la base',     couleur: '#0891b2', raison: "le serveur, les identifiants ou le système de base de données changent" },
  session:      { nom: 'État entre requêtes',     couleur: '#7c3aed', raison: "les messages passent par un autre mécanisme que la session" },
  requete:      { nom: 'Lecture de la requête',   couleur: '#2563eb', raison: "la même opération doit aussi accepter des données JSON" },
  validation:   { nom: 'Règles métier',           couleur: '#16a34a', raison: "une exigence sur un champ s'ajoute ou se modifie" },
  persistance:  { nom: 'Accès aux données',       couleur: '#b45309', raison: "la table, le schéma ou le stockage changent" },
  navigation:   { nom: 'Suite de navigation',     couleur: '#dc2626', raison: "l'écran affiché après une opération change" },
  presentation: { nom: 'Présentation',            couleur: '#db2777', raison: "la mise en page ou la mise en forme des valeurs change" },
};

// [texte, responsabilité] ; null pour une ligne neutre
const LIGNES = [
  ["<?php", null],
  ["", null],
  ["require_once __DIR__ . '/includes/db.php';", 'connexion'],
  ["require_once __DIR__ . '/includes/validation.php';", 'chargement'],
  ["session_start();", 'session'],
  ["", null],
  ["$categories = require __DIR__ . '/includes/categories.php';", 'chargement'],
  ["$erreurs    = [];", 'validation'],
  ["", null],
  ["if ($_SERVER['REQUEST_METHOD'] === 'POST') {", 'requete'],
  ["    $action = $_POST['action'] ?? '';", 'requete'],
  ["", null],
  ["    if ($action === 'creer') {", 'requete'],
  ["        [$erreurs, $valeurs] = validerProduit($_POST, $categories);", 'validation'],
  ["", null],
  ["        if (!$erreurs) {", 'validation'],
  ["            $insertion = $pdo->prepare(", 'persistance'],
  ["                'INSERT INTO produits (nom, categorie, prix, stock)", 'persistance'],
  ["                 VALUES (:nom, :categorie, :prix, :stock)'", 'persistance'],
  ["            );", 'persistance'],
  ["            $insertion->execute($valeurs);", 'persistance'],
  ["", null],
  ["            $_SESSION['message'] = 'Produit « ' . $valeurs['nom'] . ' » ajouté.';", 'session'],
  ["            header('Location: produits.php', true, 303);", 'navigation'],
  ["            exit;", 'navigation'],
  ["        }", null],
  ["    }", null],
  ["", null],
  ["    if ($action === 'supprimer') {", 'requete'],
  ["        $id = filter_var($_POST['id'] ?? '', FILTER_VALIDATE_INT);", 'requete'],
  ["", null],
  ["        if ($id !== false) {", 'requete'],
  ["            $suppression = $pdo->prepare('DELETE FROM produits WHERE id = :id');", 'persistance'],
  ["            $suppression->execute(['id' => $id]);", 'persistance'],
  ["", null],
  ["            $_SESSION['message'] = $suppression->rowCount() === 1", 'session'],
  ["                ? 'Produit supprimé.'", 'session'],
  ["                : \"Ce produit n'existait plus.\";", 'session'],
  ["        }", null],
  ["", null],
  ["        header('Location: produits.php', true, 303);", 'navigation'],
  ["        exit;", 'navigation'],
  ["    }", null],
  ["}", null],
  ["", null],
  ["$produits = $pdo", 'persistance'],
  ["    ->query('SELECT id, nom, categorie, prix, stock FROM produits ORDER BY nom')", 'persistance'],
  ["    ->fetchAll();", 'persistance'],
  ["", null],
  ["$message = $_SESSION['message'] ?? null;", 'session'],
  ["unset($_SESSION['message']);", 'session'],
  ["", null],
  ["include __DIR__ . '/includes/header.php';", 'presentation'],
  ["?>", null],
  ["", null],
  ["<?php if ($message !== null): ?>", 'presentation'],
  ["  <p class=\"message\"><?php echo htmlspecialchars($message); ?></p>", 'presentation'],
  ["<?php endif; ?>", 'presentation'],
  ["", null],
  ["<?php foreach ($produits as $produit): ?>", 'presentation'],
  ["  <tr>", 'presentation'],
  ["    <td><?php echo htmlspecialchars($produit['nom']); ?></td>", 'presentation'],
  ["    <td><?php echo number_format((float) $produit['prix'], 2, ',', ' '); ?> $</td>", 'presentation'],
  ["    <td>", 'presentation'],
  ["      <a href=\"produit-modifier.php?id=<?php echo (int) $produit['id']; ?>\">Modifier</a>", 'navigation'],
  ["      <form method=\"post\" action=\"produits.php\">", 'presentation'],
  ["        <input type=\"hidden\" name=\"action\" value=\"supprimer\">", 'requete'],
  ["        <input type=\"hidden\" name=\"id\" value=\"<?php echo (int) $produit['id']; ?>\">", 'requete'],
  ["        <button type=\"submit\">Supprimer</button>", 'presentation'],
  ["      </form>", 'presentation'],
  ["    </td>", 'presentation'],
  ["  </tr>", 'presentation'],
  ["<?php endforeach; ?>", 'presentation'],
  ["", null],
  ["<input type=\"text\" name=\"nom\" value=\"<?php echo valeurSoumise('nom'); ?>\">", 'presentation'],
  ["<?php messageErreur($erreurs, 'nom'); ?>", 'validation'],
  ["", null],
  ["<?php include __DIR__ . '/includes/footer.php'; ?>", 'presentation'],
];

const COMPTES = LIGNES.reduce((acc, [, r]) => {
  if (r) acc[r] = (acc[r] || 0) + 1;
  return acc;
}, {});
const TOTAL = LIGNES.filter(([, r]) => r).length;
const DISTINCTES = Object.keys(COMPTES).length;

const css = `
.anr { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:12px; overflow:hidden;
  background:var(--sl-color-bg, #fff); margin:1.5rem 0; }
.anr-head { margin-top: 0; padding:10px 14px; border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:var(--sl-color-gray-6, #f7f8fa); display:flex; align-items:center;
  justify-content:space-between; gap:10px; flex-wrap:wrap; }
.anr-title { font-size:14px; font-weight:700; letter-spacing:.03em; color:var(--sl-color-accent, #4f46e5); }
.anr-sub { font-size:13px; color:var(--sl-color-gray-3, #6b7280); margin-top:2px; }
.anr-compte { font-size:13px; font-weight:700; color:var(--sl-color-text, #2b3245);
  border:1px solid var(--sl-color-gray-5, #d7dce6); border-radius:999px; padding:3px 11px; white-space:nowrap; }
.anr-puces { display:flex; flex-wrap:wrap; gap:6px; padding:12px 14px 4px; }
.anr-puce { margin:0; display:inline-flex; align-items:center; gap:6px; font:inherit; font-size:12px;
  font-weight:600; padding:4px 10px; border-radius:999px; cursor:pointer; background:transparent;
  border:1px solid var(--sl-color-gray-5, #d7dce6); color:var(--sl-color-gray-2, #515a6e);
  transition:background .15s, border-color .15s, color .15s; }
.anr-puce:hover { background:var(--sl-color-gray-6, #f4f5f8); }
.anr-pastille { width:9px; height:9px; border-radius:3px; flex:0 0 auto; }
.anr-n { font-family:var(--sl-font-mono, monospace); font-size:11px; opacity:.7; }
.anr-raison { margin:8px 14px 0; padding:9px 12px; border-left:3px solid; border-radius:0 8px 8px 0;
  font-size:13px; line-height:1.55; color:var(--sl-color-text, #2b3245); }
.anr-raison-t { font-size:10px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  display:block; margin-bottom:2px; }
.anr-invite { margin:8px 14px 0; font-size:13px; color:var(--sl-color-gray-3, #94a3b8); }
.anr-pre { margin:12px 0 0; padding:10px 0; font-family:var(--sl-font-mono, 'Fira Code', monospace);
  font-size:13px; line-height:1.6; color:var(--sl-color-text, #2b3245); overflow-x:auto;
  border-top:1px solid var(--sl-color-gray-5, #e6e9ef); }
.anr-l { display:block; padding:0 12px 0 11px; white-space:pre; border-left:3px solid transparent;
  transition:opacity .15s, background .15s; }
.anr-cap { padding:10px 14px; border-top:1px solid var(--sl-color-gray-5, #e6e9ef);
  font-size:14px; line-height:1.5; color:var(--sl-color-text, #2b3245); }
`;

export default function AnalyseResponsabilites() {
  const [actif, setActif] = useState(null);
  const r = actif ? RESPONSABILITES[actif] : null;

  return (
    <div className="anr">
      <style>{css}</style>

      <div className="anr-head">
        <div>
          <div className="anr-title">produits.php, ligne par ligne</div>
          <div className="anr-sub">Choisissez une responsabilité pour isoler ses lignes.</div>
        </div>
        <span className="anr-compte">{DISTINCTES} responsabilités, {TOTAL} lignes</span>
      </div>

      <div className="anr-puces" role="group" aria-label="Responsabilités">
        {Object.entries(RESPONSABILITES).map(([cle, x]) => {
          const on = actif === cle;
          return (
            <button key={cle} className="anr-puce" aria-pressed={on}
                    onClick={() => setActif(on ? null : cle)}
                    style={on ? { background: x.couleur + '14', borderColor: x.couleur, color: x.couleur } : undefined}>
              <span className="anr-pastille" style={{ background: x.couleur }} />
              {x.nom}
              <span className="anr-n">{COMPTES[cle] || 0}</span>
            </button>
          );
        })}
      </div>

      {r ? (
        <div className="anr-raison" style={{ borderLeftColor: r.couleur, background: r.couleur + '0d' }}>
          <span className="anr-raison-t" style={{ color: r.couleur }}>Cette partie change si</span>
          {r.raison}.
        </div>
      ) : (
        <div className="anr-invite">
          Chaque couleur correspond à une raison différente de modifier ce fichier.
        </div>
      )}

      <pre className="anr-pre">
        {LIGNES.map(([texte, resp], i) => {
          const c = resp ? RESPONSABILITES[resp].couleur : null;
          const vif = !actif || resp === actif;
          return (
            <span key={i} className="anr-l"
                  style={{
                    borderLeftColor: c || 'transparent',
                    background: actif && resp === actif ? c + '14' : 'transparent',
                    opacity: vif ? 1 : 0.28,
                  }}>
              {texte || ' '}
            </span>
          );
        })}
      </pre>

      <div className="anr-cap">
        La validation a déjà quitté le fichier pour une fonction : c'est un premier découpage.
        Il reste pourtant {DISTINCTES - 1} autres raisons de rouvrir cette page, et chacune
        oblige à relire les autres pour ne rien casser.
      </div>
    </div>
  );
}