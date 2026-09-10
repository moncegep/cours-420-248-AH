import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Du formulaire à la superglobale
//
// Le pont que les étudiants ratent le plus souvent : l'attribut name du champ
// devient la clé du tableau côté PHP. Ici, remplir un champ met en évidence la
// ligne de balisage et l'entrée du tableau qui lui correspondent, dans la même
// couleur. La bascule GET/POST montre le même contenu passer par l'URL ou par
// le corps de la requête. Une case décochée disparaît du tableau : c'est visible
// plutôt que raconté.
// ─────────────────────────────────────────────────────────────────────────────

const CHAMPS = [
  { cle: 'nom', name: 'nom', label: 'Nom', type: 'text', couleur: '#4f46e5' },
  { cle: 'courriel', name: 'courriel', label: 'Courriel', type: 'email', couleur: '#0d9488' },
  { cle: 'quantite', name: 'quantite', label: 'Quantité', type: 'number', couleur: '#b45309' },
  { cle: 'infolettre', name: 'infolettre', label: 'Recevoir l\'infolettre', type: 'case', envoi: 'oui', couleur: '#0891b2' },
  {
    cle: 'interets', name: 'interets[]', label: 'Intérêts', type: 'cases', couleur: '#7c3aed',
    options: [
      { v: 'sirop', t: 'Sirop' },
      { v: 'miel', t: 'Miel' },
      { v: 'tire', t: 'Tire' },
    ],
  },
];

const INITIAL = {
  nom: 'Pacal Vincent',
  courriel: 'pascal.vincent@exemple.test',
  quantite: '3',
  infolettre: false,
  interets: ['sirop'],
};

const balisage = (c) => {
  if (c.type === 'case')
    return `<input type="checkbox" name="${c.name}" value="${c.envoi}"> ${c.label}`;
  if (c.type === 'cases')
    return c.options
      .map((o) => `<input type="checkbox" name="${c.name}" value="${o.v}"> ${o.t}`)
      .join('\n');
  return `<label>${c.label}\n  <input type="${c.type}" name="${c.name}">\n</label>`;
};

const phpVal = (v) => '"' + String(v).replace(/"/g, '\\"') + '"';

// Rend un couple clé/valeur façon tableau PHP, sur une ou plusieurs lignes.
const phpEntree = (cle, val) => {
  if (Array.isArray(val))
    return `  ${phpVal(cle)} => [\n` + val.map((x) => `    ${phpVal(x)},`).join('\n') + '\n  ],';
  return `  ${phpVal(cle)} => ${phpVal(val)},`;
};

const urlencode = (s) => encodeURIComponent(s).replace(/%20/g, '+');

const css = `
.fsg { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:12px; overflow:hidden;
  background:var(--sl-color-bg, #fff); margin:1.5rem 0; }
.fsg-head { margin: 0; padding:10px 14px; border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:var(--sl-color-gray-6, #f7f8fa); }
.fsg-title { font-size:15px; font-weight:700; letter-spacing:.03em; color:var(--sl-color-accent, #4f46e5); }
.fsg-sub { font-size:13px; color:var(--sl-color-gray-3, #6b7280); margin-top:2px; }
.fsg-body { padding:14px; display:flex; flex-direction:column; gap:12px; }
.fsg-seg { display:inline-flex; border:1px solid var(--sl-color-gray-5, #d7dce6); border-radius:8px;
  overflow:hidden; align-self:flex-start; }
.fsg-seg button { margin:0; font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:13px;
  font-weight:700; padding:5px 16px; border:0; background:transparent;
  color:var(--sl-color-gray-2, #515a6e); cursor:pointer; }
.fsg-seg button + button { border-left:1px solid var(--sl-color-gray-5, #d7dce6); }
.fsg-seg button[data-on="true"] { background:var(--sl-color-accent-low, #eef0fe); color:var(--sl-color-accent, #4f46e5); }
.fsg-grid { display:grid; grid-template-columns:1fr; gap:12px; }
@media (min-width:760px) { .fsg-grid { grid-template-columns:minmax(0,1fr) minmax(0,1.1fr); } }
.fsg-col { display:flex; flex-direction:column; gap:9px; min-width:0; }
.fsg-lab { font-size:11px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
  color:var(--sl-color-gray-3, #8a93a6); }
.fsg-f { display:flex; flex-direction:column; gap:4px; padding:7px 9px; border-radius:8px;
  border:1px solid transparent; transition:background .15s, border-color .15s; }
.fsg-f[data-on="true"] { border-color:currentColor; }
.fsg-fl { font-size:12px; font-weight:600; color:var(--sl-color-text, #2b3245); }
.fsg-fn { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:11px; font-weight:700; }
.fsg-in { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:13px; padding:5px 8px;
  border:1px solid var(--sl-color-gray-5, #d7dce6); border-radius:6px; width:100%; box-sizing:border-box;
  background:var(--sl-color-bg, #fff); color:var(--sl-color-text, #1c2230); }
.fsg-in:focus { outline:2px solid var(--sl-color-accent, #4f46e5); outline-offset:1px; border-color:transparent; }
.fsg-cases { display:flex; flex-wrap:wrap; gap:6px 14px; }
.fsg-case { display:inline-flex; align-items:center; gap:6px; font-size:13px;
  color:var(--sl-color-text, #2b3245); cursor:pointer; }
.fsg-case input { margin:0; }
.fsg-bloc { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:8px; overflow:hidden; }
.fsg-bloc-h { font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:12px; font-weight:700;
  padding:5px 10px; background:var(--sl-color-gray-6, #f7f8fa); color:var(--sl-color-gray-2, #515a6e);
  border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef); }
.fsg-pre { margin:0; padding:9px 0; font-family:var(--sl-font-mono, 'Fira Code', monospace);
  font-size:13px; line-height:1.6; color:var(--sl-color-text, #2b3245); overflow-x:auto; }
.fsg-l { display:block; padding:0 11px; white-space:pre-wrap; word-break:break-word;
  border-left:3px solid transparent; }
.fsg-vide { padding:9px 11px; font-size:13px; font-style:italic; color:var(--sl-color-gray-3, #94a3b8); }
.fsg-url { padding:9px 11px; font-family:var(--sl-font-mono, 'Fira Code', monospace); font-size:13px;
  line-height:1.6; word-break:break-all; color:var(--sl-color-text, #2b3245); }
.fsg-cap { padding:10px 14px; border-top:1px solid var(--sl-color-gray-5, #e6e9ef);
  font-size:14px; line-height:1.5; color:var(--sl-color-text, #2b3245); }
`;

export default function FormulaireSuperglobale() {
  const [methode, setMethode] = useState('POST');
  const [v, setV] = useState(INITIAL);
  const [actif, setActif] = useState(null);

  const maj = (cle, val) => setV((p) => ({ ...p, [cle]: val }));
  const bascule = (cle, opt) =>
    setV((p) => {
      const l = p[cle];
      return { ...p, [cle]: l.includes(opt) ? l.filter((x) => x !== opt) : [...l, opt] };
    });

  // Ce que le navigateur transmet réellement : une case décochée n'est pas envoyée.
  const envoye = CHAMPS.map((c) => {
    if (c.type === 'case') return v[c.cle] ? [c.cle, c.envoi, c] : null;
    if (c.type === 'cases') return v[c.cle].length ? [c.cle, v[c.cle], c] : null;
    return [c.cle, v[c.cle], c];
  }).filter(Boolean);

  const paires = envoye.flatMap(([cle, val, c]) =>
    Array.isArray(val)
      ? val.map((x) => [`${urlencode(c.name)}`, urlencode(x), c])
      : [[urlencode(cle), urlencode(val), c]]
  );
  const query = paires.map(([k, val]) => `${k}=${val}`).join('&');

  const bloc = (titre, contenu) => (
    <div className="fsg-bloc">
      <div className="fsg-bloc-h">{titre}</div>
      {contenu}
    </div>
  );

  const tableau = (rempli) =>
    !rempli || envoye.length === 0 ? (
      <div className="fsg-vide">[]</div>
    ) : (
      <pre className="fsg-pre">
        <span className="fsg-l">[</span>
        {envoye.map(([cle, val, c]) =>
          phpEntree(cle, val)
            .split('\n')
            .map((ligne, k) => (
              <span className="fsg-l" key={cle + k}
                    style={actif === c.cle ? { borderLeftColor: c.couleur, background: c.couleur + '14' } : undefined}>
                {ligne}
              </span>
            ))
        )}
        <span className="fsg-l">]</span>
      </pre>
    );

  return (
    <div className="fsg">
      <style>{css}</style>

      <div className="fsg-head">
        <div className="fsg-title">Du formulaire à la superglobale</div>
        <div className="fsg-sub">L'attribut <code>name</code> du champ devient la clé du tableau. Survolez un champ pour voir le lien.</div>
      </div>

      <div className="fsg-body">
        <div className="fsg-seg" role="group" aria-label="Méthode du formulaire">
          {['GET', 'POST'].map((m) => (
            <button key={m} data-on={methode === m} onClick={() => setMethode(m)}>{m}</button>
          ))}
        </div>

        <div className="fsg-grid">
          <div className="fsg-col">
            <span className="fsg-lab">Le formulaire</span>
            {CHAMPS.map((c) => (
              <div className="fsg-f" key={c.cle} data-on={actif === c.cle}
                   style={{ color: c.couleur, background: actif === c.cle ? c.couleur + '10' : 'transparent' }}
                   onMouseEnter={() => setActif(c.cle)} onMouseLeave={() => setActif(null)}>
                <span className="fsg-fl">
                  {c.label} <span className="fsg-fn" style={{ color: c.couleur }}>name="{c.name}"</span>
                </span>
                {c.type === 'case' ? (
                  <label className="fsg-case">
                    <input type="checkbox" checked={v[c.cle]} onFocus={() => setActif(c.cle)}
                           onChange={(e) => maj(c.cle, e.target.checked)} />
                    envoie <code>{c.envoi}</code> si cochée
                  </label>
                ) : c.type === 'cases' ? (
                  <div className="fsg-cases">
                    {c.options.map((o) => (
                      <label className="fsg-case" key={o.v}>
                        <input type="checkbox" checked={v[c.cle].includes(o.v)} onFocus={() => setActif(c.cle)}
                               onChange={() => bascule(c.cle, o.v)} />
                        {o.t}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input className="fsg-in" type={c.type === 'number' ? 'number' : 'text'} value={v[c.cle]}
                         spellCheck={false} aria-label={c.label} onFocus={() => setActif(c.cle)}
                         onChange={(e) => maj(c.cle, e.target.value)} />
                )}
              </div>
            ))}
          </div>

          <div className="fsg-col">
            <span className="fsg-lab">Le balisage correspondant</span>
            <div className="fsg-bloc">
              <div className="fsg-bloc-h">{`<form method="${methode.toLowerCase()}" action="traitement.php">`}</div>
              <pre className="fsg-pre">
                {CHAMPS.flatMap((c) =>
                  balisage(c).split('\n').map((ligne, k) => (
                    <span className="fsg-l" key={c.cle + k}
                          style={actif === c.cle ? { borderLeftColor: c.couleur, background: c.couleur + '14' } : undefined}
                          onMouseEnter={() => setActif(c.cle)} onMouseLeave={() => setActif(null)}>
                      {'  ' + ligne}
                    </span>
                  ))
                )}
                <span className="fsg-l">{'  <button type="submit">Envoyer</button>'}</span>
              </pre>
            </div>

            {methode === 'GET' &&
              bloc('adresse demandée', <div className="fsg-url">/traitement.php{query ? '?' + query : ''}</div>)}

            {bloc('$_GET', tableau(methode === 'GET'))}
            {bloc('$_POST', tableau(methode === 'POST'))}
          </div>
        </div>
      </div>

      <div className="fsg-cap">
        Décochez toutes les cases : leurs clés disparaissent du tableau au lieu d'y figurer à vide. Un champ
        non transmis n'est pas une valeur vide, il est absent — d'où l'usage de <code>isset()</code> ou de
        l'opérateur <code>??</code> avant de lire une case à cocher.
      </div>
    </div>
  );
}