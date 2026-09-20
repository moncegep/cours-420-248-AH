import './MatriceCrud.css';

import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Matrice CRUD
//
// Vue comparative des quatre opérations : ce que chacune demande côté HTTP,
// ce qu'elle exécute côté SQL, et ce qui se passe si la requête est rejouée.
// C'est la dernière colonne qui porte le message : la rejouabilité explique
// pourquoi lire se fait en GET et pourquoi supprimer ne s'y fait pas.
// ─────────────────────────────────────────────────────────────────────────────

const OPERATIONS = [
  {
    cle: 'lire',
    nom: 'Lire',
    couleur: '#2563eb',
    methode: 'GET',
    adresse: 'produits.php',
    sql: 'SELECT',
    rejeu: 'sans effet',
    rejeuOk: true,
    note:
      "Une lecture ne change rien. L'adresse peut donc être partagée, mise en favori, rechargée autant de fois qu'on veut. C'est aussi pourquoi les filtres et la recherche passent en GET : l'état de la liste tient dans l'adresse.",
  },
  {
    cle: 'creer',
    nom: 'Créer',
    couleur: '#16a34a',
    methode: 'POST',
    adresse: 'produits.php',
    sql: 'INSERT',
    rejeu: 'ajoute un doublon',
    rejeuOk: false,
    note:
      "Rejouer l'envoi insère une deuxième ligne. D'où la redirection après l'insertion : la page finalement affichée résulte d'un GET, et le rafraîchissement ne rejoue plus que cette lecture.",
  },
  {
    cle: 'modifier',
    nom: 'Modifier',
    couleur: '#d97706',
    methode: 'GET puis POST',
    adresse: 'produit-modifier.php?id=7',
    sql: 'SELECT puis UPDATE',
    rejeu: 'réécrit les mêmes valeurs',
    rejeuOk: true,
    note:
      "Deux requêtes : un GET qui charge la ligne dans le formulaire, un POST qui l'enregistre. Réappliquer le même UPDATE donne le même résultat, ce qui rend l'opération idempotente — mais la redirection reste utile pour sortir de l'état « réponse à un POST ».",
  },
  {
    cle: 'supprimer',
    nom: 'Supprimer',
    couleur: '#dc2626',
    methode: 'POST',
    adresse: 'produits.php',
    sql: 'DELETE',
    rejeu: 'ne trouve plus rien à supprimer',
    rejeuOk: true,
    note:
      "Le second envoi ne supprime rien de plus, mais la suppression passe tout de même par un POST : un lien peut être suivi par un préchargement du navigateur, un robot d'indexation ou un accélérateur de page, sans que personne n'ait cliqué.",
  },
];

const COLONNES = [
  { cle: 'methode', titre: 'Méthode HTTP' },
  { cle: 'adresse', titre: 'Adresse', mono: true },
  { cle: 'sql', titre: 'SQL', mono: true },
];


export default function MatriceCrud() {
  const [actif, setActif] = useState(null);
  const op = OPERATIONS.find((o) => o.cle === actif);

  return (
    <div className="mcr">
      <div className="mcr-head">
        <div className="mcr-title">Les quatre opérations</div>
        <div className="mcr-sub">Choisissez une ligne pour savoir ce qu'implique un rafraîchissement.</div>
      </div>

      <div className="mcr-scroll">
        <table className="mcr-t">
          <thead>
            <tr>
              <th>Opération</th>
              {COLONNES.map((c) => <th key={c.cle}>{c.titre}</th>)}
              <th>Si la requête est rejouée</th>
            </tr>
          </thead>
          <tbody>
            {OPERATIONS.map((o) => (
              <tr key={o.cle} className="mcr-ligne" data-on={actif === o.cle}
                  onClick={() => setActif(actif === o.cle ? null : o.cle)}>
                <td>
                  <span className="mcr-op" style={{ color: o.couleur }}>
                    <span className="mcr-pastille" style={{ background: o.couleur }} />
                    {o.nom}
                  </span>
                </td>
                {COLONNES.map((c) => (
                  <td key={c.cle} className={c.mono ? 'mcr-mono' : undefined}>{o[c.cle]}</td>
                ))}
                <td>
                  <span className="mcr-rejeu">
                    <span className="mcr-marque" style={{ color: o.rejeuOk ? '#15803d' : '#b91c1c' }}>
                      {o.rejeuOk ? '\u2713' : '\u2715'}
                    </span>
                    {o.rejeu}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {op ? (
        <div className="mcr-note" style={{ borderLeftColor: op.couleur, background: op.couleur + '0d' }}>
          <span className="mcr-note-t" style={{ color: op.couleur }}>{op.nom}</span>
          {op.note}
        </div>
      ) : (
        <div className="mcr-invite">
          Une seule des quatre opérations laisse une trace indésirable quand on rafraîchit la page.
        </div>
      )}
    </div>
  );
}