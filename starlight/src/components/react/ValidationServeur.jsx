import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Validation côté serveur
//
// Rien n'apparaît côté serveur tant qu'on n'a pas envoyé : c'est déjà une part
// du message. Deux boutons d'envoi. Le premier respecte les contraintes du
// formulaire ; le second forge une requête qui les ignore toutes, comme peut le
// faire n'importe quel outil en dehors du navigateur. Le même code de
// validation tourne dans les deux cas, et c'est lui qui tient.
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL = { nom: 'Nicolas Pierre', courriel: 'nicolas.pierre@exemple.test', quantite: '3', conditions: true };

const FORGE = { nom: '   ', courriel: 'nicolas.pierre(arobase)exemple', quantite: '-5' };

const CHAMPS = [
  { cle: 'nom', label: 'Nom', type: 'text', contraintes: ['required', 'maxlength="60"'] },
  { cle: 'courriel', label: 'Courriel', type: 'email', contraintes: ['required', 'type="email"'] },
  { cle: 'quantite', label: 'Quantité', type: 'number', contraintes: ['required', 'min="1"', 'max="10"'] },
];

const RE_COURRIEL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Chaque règle reçoit les valeurs normalisées et retourne un message, ou null.
const REGLES = [
  {
    cle: 'nom',
    libelle: 'nom : présent, 60 caractères au plus',
    php: 'if ($nom === "") { $erreurs["nom"] = "..."; }',
    verifier: (d) =>
      d.nom === '' ? 'Le nom est obligatoire.'
      : d.nom.length > 60 ? 'Le nom ne devrait pas dépasser 60 caractères.'
      : null,
  },
  {
    cle: 'courriel',
    libelle: 'courriel : présent, format plausible',
    php: 'filter_var($courriel, FILTER_VALIDATE_EMAIL)',
    verifier: (d) =>
      d.courriel === '' ? 'Le courriel est obligatoire.'
      : !RE_COURRIEL.test(d.courriel) ? "L'adresse ne ressemble pas à un courriel."
      : null,
  },
  {
    cle: 'quantite',
    libelle: 'quantité : entier, entre 1 et 10',
    php: 'filter_var($quantite, FILTER_VALIDATE_INT, ["options" => ["min_range" => 1, "max_range" => 10]])',
    verifier: (d) =>
      d.quantite === '' ? 'La quantité est obligatoire.'
      : !/^-?\d+$/.test(d.quantite) ? 'La quantité doit être un nombre entier.'
      : Number(d.quantite) < 1 || Number(d.quantite) > 10 ? 'La quantité doit se situer entre 1 et 10.'
      : null,
  },
  {
    cle: 'conditions',
    libelle: 'conditions : case cochée',
    php: 'isset($_POST["conditions"])',
    verifier: (d) => (d.conditions ? null : 'Les conditions doivent être acceptées.'),
  },
];

const phpVal = (v) => '"' + String(v).replace(/"/g, '\\"') + '"';

const css = `
.vsr { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:12px; overflow:hidden;
  background:var(--sl-color-bg, #fff); margin:1.5rem 0; }
.vsr-head { margin: 0; padding:10px 14px; border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:var(--sl-color-gray-6, #f7f8fa); }
.vsr-title { font-size:15px; font-weight:700; letter-spacing:.03em; color:var(--sl-color-accent, #4f46e5); }
.vsr-sub { font-size:13px; color:var(--sl-color-gray-3, #6b7280); margin-top:2px; }
.vsr-body { padding:14px; display:flex; flex-direction:column; gap:12px; }
.vsr-zone { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:9px; overflow:hidden; }
.vsr-zh { display:flex; align-items:baseline; gap:8px; padding:6px 11px;
  background:var(--sl-color-gray-6, #f7f8fa); border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef); }
.vsr-zt { font-size:12px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  color:var(--sl-color-gray-2, #515a6e); }
.vsr-zd { font-size:12px; color:var(--sl-color-gray-3, #8a93a6); }
.vsr-zc { padding:10px 11px; display:flex; flex-direction:column; gap:9px; }
.vsr-f { display:flex; flex-direction:column; gap:4px; }
.vsr-fl { font-size:12px; font-weight:600; color:var(--sl-color-text, #2b3245);
  display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
.vsr-c { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:10px; font-weight:600;
  padding:1px 6px; border-radius:999px; border:1px solid var(--sl-color-gray-5, #d7dce6);
  color:var(--sl-color-gray-3, #8a93a6); }
.vsr-in { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:12.5px; padding:5px 8px;
  border:1px solid var(--sl-color-gray-5, #d7dce6); border-radius:6px; width:100%; box-sizing:border-box;
  background:var(--sl-color-bg, #fff); color:var(--sl-color-text, #1c2230); }
.vsr-in:focus { outline:2px solid var(--sl-color-accent, #4f46e5); outline-offset:1px; border-color:transparent; }
.vsr-in[data-err="true"] { border-color:#dc2626; }
.vsr-case { display:inline-flex; align-items:center; gap:6px; font-size:12.5px;
  color:var(--sl-color-text, #2b3245); cursor:pointer; }
.vsr-case input { margin:0; }
.vsr-msg { font-size:12px; color:#b91c1c; }
.vsr-boutons { display:flex; flex-wrap:wrap; gap:8px; }
.vsr-b { margin:0; font:inherit; font-size:12.5px; font-weight:600; padding:7px 14px; border-radius:8px;
  cursor:pointer; border:1px solid var(--sl-color-accent, #4f46e5);
  background:var(--sl-color-accent, #4f46e5); color:#fff; }
.vsr-b2 { background:transparent; color:#b45309; border-color:#b45309; }
.vsr-b3 { background:transparent; color:var(--sl-color-gray-2, #515a6e); border-color:var(--sl-color-gray-5, #d7dce6); }
.vsr-pre { margin:0; padding:9px 11px; font-family:var(--sl-font-mono, 'Fira Code', monospace);
  font-size:13px; line-height:1.6; white-space:pre-wrap; word-break:break-word;
  color:var(--sl-color-text, #2b3245); overflow-x:auto; }
.vsr-regle { display:flex; gap:9px; align-items:flex-start; }
.vsr-p { flex:0 0 auto; width:17px; height:17px; border-radius:50%; font-size:12px; font-weight:700;
  display:inline-flex; align-items:center; justify-content:center; color:#fff; margin-top:1px; }
.vsr-rt { font-size:12.5px; line-height:1.5; color:var(--sl-color-text, #2b3245); min-width:0; }
.vsr-rp { display:block; font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:11px;
  color:var(--sl-color-gray-3, #8a93a6); word-break:break-word; margin-top:1px; }
.vsr-rm { display:block; font-size:11.5px; color:#b91c1c; margin-top:1px; }
.vsr-verdict { border-left:3px solid; border-radius:0 9px 9px 0; padding:10px 12px; }
.vsr-vt { font-size:12px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  display:block; margin-bottom:4px; }
.vsr-vc { font-size:12.5px; line-height:1.55; color:var(--sl-color-text, #2b3245); }
.vsr-attente { padding:12px; font-size:12.5px; font-style:italic; text-align:center;
  color:var(--sl-color-gray-3, #94a3b8); }
.vsr-cap { padding:10px 14px; border-top:1px solid var(--sl-color-gray-5, #e6e9ef);
  font-size:14px; line-height:1.5; color:var(--sl-color-text, #2b3245); }
`;

export default function ValidationServeur() {
  const [v, setV] = useState(INITIAL);
  const [envoi, setEnvoi] = useState(null);

  const maj = (cle, val) => setV((p) => ({ ...p, [cle]: val }));

  const envoyer = (source) => {
    // Une case décochée n'est pas transmise : on l'omet du tableau reçu.
    const brut =
      source === 'forge'
        ? { ...FORGE }
        : { nom: v.nom, courriel: v.courriel, quantite: v.quantite, ...(v.conditions ? { conditions: 'oui' } : {}) };
    setEnvoi({ source, brut });
  };

  let normalise = null, resultats = null, erreurs = null;
  if (envoi) {
    normalise = {
      nom: String(envoi.brut.nom ?? '').trim(),
      courriel: String(envoi.brut.courriel ?? '').trim(),
      quantite: String(envoi.brut.quantite ?? '').trim(),
      conditions: envoi.brut.conditions !== undefined,
    };
    resultats = REGLES.map((r) => ({ ...r, message: r.verifier(normalise) }));
    erreurs = resultats.filter((r) => r.message);
  }

  const recu = envoi
    ? '[\n' + Object.entries(envoi.brut).map(([k, x]) => `  ${phpVal(k)} => ${phpVal(x)},`).join('\n') + '\n]'
    : null;

  return (
    <div className="vsr">
      <style>{css}</style>

      <div className="vsr-head">
        <div className="vsr-title">Ce que le serveur vérifie</div>
        <div className="vsr-sub">Deux façons d'envoyer les mêmes champs : par le formulaire, ou en le contournant.</div>
      </div>

      <div className="vsr-body">
        <div className="vsr-zone">
          <div className="vsr-zh">
            <span className="vsr-zt">Dans le navigateur</span>
            <span className="vsr-zd">contraintes déclarées dans le balisage</span>
          </div>
          <div className="vsr-zc">
            {CHAMPS.map((c) => {
              const err = erreurs && erreurs.find((e) => e.cle === c.cle);
              return (
                <div className="vsr-f" key={c.cle}>
                  <span className="vsr-fl">
                    {c.label}
                    {c.contraintes.map((k) => <span className="vsr-c" key={k}>{k}</span>)}
                  </span>
                  <input className="vsr-in" type={c.cle === 'quantite' ? 'number' : 'text'}
                         value={v[c.cle]} spellCheck={false} aria-label={c.label}
                         data-err={Boolean(err && envoi?.source === 'formulaire')}
                         onChange={(e) => maj(c.cle, e.target.value)} />
                  {err && envoi?.source === 'formulaire' && <span className="vsr-msg">{err.message}</span>}
                </div>
              );
            })}
            <label className="vsr-case">
              <input type="checkbox" checked={v.conditions} onChange={(e) => maj('conditions', e.target.checked)} />
              J'accepte les conditions <span className="vsr-c">required</span>
            </label>

            <div className="vsr-boutons">
              <button className="vsr-b" onClick={() => envoyer('formulaire')}>Envoyer le formulaire</button>
              <button className="vsr-b vsr-b2" onClick={() => envoyer('forge')}>Envoyer une requête forgée</button>
              {envoi && (
                <button className="vsr-b vsr-b3" onClick={() => { setEnvoi(null); setV(INITIAL); }}>
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </div>

        {!envoi ? (
          <div className="vsr-zone">
            <div className="vsr-attente">Rien ne s'exécute côté serveur tant que la requête n'est pas partie.</div>
          </div>
        ) : (
          <>
            <div className="vsr-zone">
              <div className="vsr-zh">
                <span className="vsr-zt">$_POST reçu</span>
                <span className="vsr-zd">
                  {envoi.source === 'forge'
                    ? 'requête forgée hors du navigateur : aucune contrainte du balisage ne s\'applique'
                    : 'envoyé par le formulaire'}
                </span>
              </div>
              <pre className="vsr-pre">{recu}</pre>
            </div>

            <div className="vsr-zone">
              <div className="vsr-zh">
                <span className="vsr-zt">Règles</span>
                <span className="vsr-zd">évaluées sur les valeurs normalisées par trim()</span>
              </div>
              <div className="vsr-zc">
                {resultats.map((r) => (
                  <div className="vsr-regle" key={r.cle}>
                    <span className="vsr-p" style={{ background: r.message ? '#dc2626' : '#15803d' }}>
                      {r.message ? '\u2715' : '\u2713'}
                    </span>
                    <span className="vsr-rt">
                      {r.libelle}
                      <span className="vsr-rp">{r.php}</span>
                      {r.message && <span className="vsr-rm">{r.message}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="vsr-verdict"
                 style={{ borderLeftColor: erreurs.length ? '#dc2626' : '#15803d',
                          background: (erreurs.length ? '#dc2626' : '#15803d') + '10' }}>
              <span className="vsr-vt" style={{ color: erreurs.length ? '#b91c1c' : '#15803d' }}>
                {erreurs.length ? `$erreurs contient ${erreurs.length} entrée${erreurs.length > 1 ? 's' : ''}` : '$erreurs est vide'}
              </span>
              <span className="vsr-vc">
                {erreurs.length
                  ? 'Le traitement est abandonné. La page se réaffiche avec les messages et les valeurs déjà saisies, pour que rien ne soit à retaper.'
                  : 'Le traitement peut avoir lieu, puis la réponse redirige vers une page consultable en GET.'}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="vsr-cap">
        Le bouton orange envoie un nom fait d'espaces, un courriel sans arobase et une quantité négative —
        trois valeurs que <code>required</code>, <code>type="email"</code> et <code>min="1"</code> auraient refusées
        dans le navigateur. Elles arrivent quand même. Les contraintes du balisage guident la personne qui remplit
        le formulaire ; les règles du serveur, elles, s'appliquent à toutes les requêtes.
      </div>
    </div>
  );
}