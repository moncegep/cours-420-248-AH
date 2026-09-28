import { useMemo, useState } from 'react';


// ─────────────────────────────────────────────────────────────────────────────
// Plateau des établissements collégiaux de l'île de Montréal
//
// Carte hexagonale en forme d'île. Chaque case est un établissement, placé
// selon sa position approximative ; le mont Royal, au centre, porte le
// sélecteur de discipline. Au survol, au focus clavier ou au toucher, la case
// se retourne et montre le programme de la discipline et la part des personnes
// diplômées en emploi lié. Le panneau sous la carte donne la répartition
// complète, sa portée et ses sources.
//
// Les données sont intégrées plus bas (DONNEES) ; la prop « donnees » permet
// d'en fournir d'autres de même forme.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Données : établissements, silhouette de l'île, disciplines et sources.
// Voir DONNEES._meta pour la méthode et la marche à suivre pour ajouter
// une discipline.
// ─────────────────────────────────────────────────────────────────────────────

export const DONNEES = {
  _meta: {
    titre: "Établissements collégiaux de l'île de Montréal : programmes et situation des personnes diplômées",
    consultation: "2026-09-27",
    methode: "Pour chaque discipline, l'offre par établissement provient des listes « Organismes scolaires offrant le programme » de l'Inforoute FPT (versions française et anglaise du programme). La situation des personnes diplômées provient de la fiche d'adéquation formation-emploi du ministère pour le même code de programme. Pour ajouter une discipline : repérer le programme sur inforoutefpt.org, relever les établissements de la liste, puis ouvrir le lien « Insertion au marché du travail » de la même page.",
    statuts: {
      offert: "Programme répertorié pour l'établissement par l'Inforoute FPT, avec au moins un groupe d'admission.",
      "a-verifier": "Information incomplète ou ambiguë dans la source : établissement listé sans groupe, absent d'une table alors qu'une page de groupe existe, ou nom d'établissement différent.",
      "non-repertorie": "Programme absent des listes de l'Inforoute FPT pour cet établissement. Ce n'est pas une preuve qu'il n'est pas offert.",
    },
    portee_indicateur: "La répartition est établie par programme pour l'ensemble du Québec. Elle est identique pour tous les établissements qui offrent le programme et ne compare pas les établissements entre eux.",
  },
  etablissements: [
    {
      id: "gerald-godin",
      nom: "Cégep Gérald-Godin",
      court: "Gérald-Godin",
      quartier: "Sainte-Geneviève",
      langue: "fr",
      reseau: "public",
      col: 2,
      rang: 0,
    },
    {
      id: "bois-de-boulogne",
      nom: "Cégep de Bois-de-Boulogne",
      court: "Bois-de-Boulogne",
      quartier: "Cartierville",
      langue: "fr",
      reseau: "public",
      col: 4,
      rang: 0,
    },
    { id: "ahuntsic", nom: "Collège Ahuntsic", court: "Ahuntsic", quartier: "Ahuntsic", langue: "fr", reseau: "public", col: 5, rang: 0 },
    {
      id: "andre-grasset",
      nom: "Collège André-Grasset",
      court: "André-Grasset",
      quartier: "Ahuntsic",
      langue: "fr",
      reseau: "prive",
      col: 6,
      rang: 0,
    },
    {
      id: "marie-victorin",
      nom: "Cégep Marie-Victorin",
      court: "Marie-Victorin",
      quartier: "Rivière-des-Prairies",
      langue: "fr",
      reseau: "public",
      col: 8,
      rang: 0,
    },
    {
      id: "john-abbott",
      nom: "John Abbott College",
      court: "John Abbott",
      quartier: "Sainte-Anne-de-Bellevue",
      langue: "en",
      reseau: "public",
      col: 0,
      rang: 1,
    },
    {
      id: "saint-laurent",
      nom: "Cégep de Saint-Laurent",
      court: "Saint-Laurent",
      quartier: "Saint-Laurent",
      langue: "fr",
      reseau: "public",
      col: 3,
      rang: 1,
    },
    { id: "vanier", nom: "Vanier College", court: "Vanier", quartier: "Saint-Laurent", langue: "en", reseau: "public", col: 4, rang: 1 },
    { id: "rosemont", nom: "Cégep de Rosemont", court: "Rosemont", quartier: "Rosemont", langue: "fr", reseau: "public", col: 7, rang: 1 },
    { id: "tav", nom: "Collège TAV", court: "TAV", quartier: "Côte-des-Neiges", langue: "bil", reseau: "prive", col: 3, rang: 2 },
    {
      id: "brebeuf",
      nom: "Collège Jean-de-Brébeuf",
      court: "Jean-de-Brébeuf",
      quartier: "Côte-des-Neiges",
      langue: "fr",
      reseau: "prive",
      col: 4,
      rang: 2,
    },
    {
      id: "maisonneuve",
      nom: "Collège de Maisonneuve",
      court: "Maisonneuve",
      quartier: "Hochelaga-Maisonneuve",
      langue: "fr",
      reseau: "public",
      col: 8,
      rang: 2,
    },
    { id: "teccart", nom: "Institut Teccart", court: "Teccart", quartier: "Hochelaga", langue: "fr", reseau: "prive", col: 9, rang: 2 },
    {
      id: "sainte-anne",
      nom: "Collégial international Sainte-Anne",
      court: "Sainte-Anne",
      quartier: "Lachine",
      langue: "fr",
      reseau: "prive",
      col: 2,
      rang: 3,
    },
    {
      id: "andre-laurendeau",
      nom: "Cégep André-Laurendeau",
      court: "André-Laurendeau",
      quartier: "LaSalle",
      langue: "fr",
      reseau: "public",
      col: 3,
      rang: 3,
    },
    { id: "dawson", nom: "Dawson College", court: "Dawson", quartier: "Westmount", langue: "en", reseau: "public", col: 4, rang: 3 },
    {
      id: "marianopolis",
      nom: "Collège Marianopolis",
      court: "Marianopolis",
      quartier: "Westmount",
      langue: "en",
      reseau: "prive",
      col: 5,
      rang: 3,
    },
    { id: "lasalle", nom: "Collège LaSalle", court: "LaSalle", quartier: "Centre-ville", langue: "bil", reseau: "prive", col: 6, rang: 3 },
    {
      id: "osullivan",
      nom: "Collège O'Sullivan de Montréal",
      court: "O'Sullivan",
      quartier: "Centre-ville",
      langue: "bil",
      reseau: "prive",
      col: 7,
      rang: 3,
    },
    {
      id: "vieux-montreal",
      nom: "Cégep du Vieux Montréal",
      court: "Vieux Montréal",
      quartier: "Quartier latin",
      langue: "fr",
      reseau: "public",
      col: 8,
      rang: 3,
    },
  ],
  ile: {
    _note: "Cases de terre formant la silhouette de l'île, en coordonnées décalées (rangs impairs décalés d'une demi-case).",
    rangs: [
      { rang: 0, de: 1, a: 8 },
      { rang: 1, de: 0, a: 9 },
      { rang: 2, de: 0, a: 9 },
      { rang: 3, de: 2, a: 8 },
    ],
    montRoyal: { col: 5, rang: 2 },
  },
  disciplines: [
    {
      id: "informatique",
      nom: "Informatique",
      programme: { code: "420.B0", nom: "Techniques de l'informatique", nomEn: "Computer Science Technology", type: "DEC technique" },
      sources: {
        offre: [
          "https://www.inforoutefpt.org/formation-technique/diplome-etudes-collegiales/531",
          "https://www.inforoutefpt.org/formation-technique/diplome-etudes-collegiales/533",
        ],
        situation: "https://adequation.inforoutefpt.org/tableau2.asp?QProgCode=420.B0",
        miseAJour: "2026-05-22",
      },
      situation: {
        "2024": { emploiLie: 42.7, emploiNonLie: 10.1, etudesLiees: 37.0, etudesNonLiees: 3.7, recherche: 5.3, inactifs: 1.1 },
        "2022": { emploiLie: 52.7, emploiNonLie: 8.8, etudesLiees: 29.1, etudesNonLiees: 3.4, recherche: 4.5, inactifs: 1.6 },
        "2020": { emploiLie: 50.3, emploiNonLie: 8.1, etudesLiees: 34.8, etudesNonLiees: 2.7, recherche: 3.1, inactifs: 0.9 },
      },
      offre: {
        ahuntsic: { statut: "offert" },
        "andre-laurendeau": { statut: "offert" },
        "bois-de-boulogne": { statut: "offert" },
        dawson: { statut: "a-verifier", note: "Absent des listes française et anglaise de l'Inforoute, qui semble incomplète pour cet établissement." },
        "gerald-godin": { statut: "offert" },
        "john-abbott": { statut: "a-verifier", note: "Listé par l'Inforoute, mais sans groupe d'admission détaillé." },
        maisonneuve: { statut: "offert", note: "Groupes de jour et de soir." },
        "marie-victorin": { statut: "offert" },
        rosemont: { statut: "offert" },
        "saint-laurent": { statut: "non-repertorie" },
        vanier: { statut: "offert", note: "Offert en anglais." },
        "vieux-montreal": { statut: "offert" },
        "andre-grasset": { statut: "a-verifier", note: "L'Inforoute répertorie ce programme sous le nom « Institut Grasset », et non « Collège André-Grasset »." },
        brebeuf: { statut: "non-repertorie" },
        marianopolis: { statut: "non-repertorie" },
        "sainte-anne": { statut: "non-repertorie" },
        lasalle: { statut: "offert", note: "Offert en français et en anglais." },
        tav: { statut: "non-repertorie" },
        osullivan: { statut: "offert" },
        teccart: { statut: "offert" },
      },
    },
    {
      id: "soins-infirmiers",
      nom: "Soins infirmiers",
      programme: { code: "180.A0", nom: "Soins infirmiers", nomEn: "Nursing", type: "DEC technique" },
      sources: {
        offre: [
          "https://www.inforoutefpt.org/formation-technique/diplome-etudes-collegiales/291",
          "https://www.inforoutefpt.org/formation-technique/diplome-etudes-collegiales/440",
        ],
        situation: "https://adequation.inforoutefpt.org/tableau2.asp?QProgCode=180.A0",
        miseAJour: "2026-05-22",
      },
      situation: {
        "2024": { emploiLie: 33.4, emploiNonLie: 2.3, etudesLiees: 59.8, etudesNonLiees: 2.3, recherche: 0.7, inactifs: 1.5 },
        "2022": { emploiLie: 40.5, emploiNonLie: 2.6, etudesLiees: 51.4, etudesNonLiees: 2.0, recherche: 0.8, inactifs: 2.7 },
        "2020": { emploiLie: 39.0, emploiNonLie: 3.1, etudesLiees: 53.7, etudesNonLiees: 1.9, recherche: 0.3, inactifs: 1.9 },
      },
      offre: {
        ahuntsic: { statut: "non-repertorie" },
        "andre-laurendeau": { statut: "offert" },
        "bois-de-boulogne": { statut: "offert" },
        dawson: { statut: "a-verifier", note: "Absent des tables, alors qu'une page de groupe « Soins infirmiers – Collège Dawson » existe sur l'Inforoute." },
        "gerald-godin": { statut: "offert" },
        "john-abbott": { statut: "a-verifier", note: "Listé par l'Inforoute, mais sans groupe d'admission détaillé." },
        maisonneuve: { statut: "offert", note: "Groupes de jour, et de jour et soir." },
        "marie-victorin": { statut: "non-repertorie" },
        rosemont: { statut: "offert" },
        "saint-laurent": { statut: "offert" },
        vanier: { statut: "offert", note: "Offert en anglais." },
        "vieux-montreal": { statut: "offert" },
        "andre-grasset": { statut: "non-repertorie" },
        brebeuf: { statut: "non-repertorie" },
        marianopolis: { statut: "non-repertorie" },
        "sainte-anne": { statut: "non-repertorie" },
        lasalle: { statut: "non-repertorie" },
        tav: { statut: "non-repertorie" },
        osullivan: { statut: "non-repertorie" },
        teccart: { statut: "non-repertorie" },
      },
    },
  ],
};

const H_HEX = 2 / Math.sqrt(3);          // hauteur d'un hexagone pointu, largeur = 1
const PAS_V = 0.75 * H_HEX;              // décalage vertical entre deux rangs
const HEXAGONE = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

const CATEGORIES = [
  { cle: 'emploiLie',      nom: 'En emploi lié',          couleur: '#15803d' },
  { cle: 'emploiNonLie',   nom: 'En emploi non lié',      couleur: '#84cc16' },
  { cle: 'etudesLiees',    nom: 'Aux études liées',       couleur: '#2563eb' },
  { cle: 'etudesNonLiees', nom: 'Aux études non liées',   couleur: '#93c5fd' },
  { cle: 'recherche',      nom: "À la recherche d'un emploi", couleur: '#d97706' },
  { cle: 'inactifs',       nom: 'Inactifs',               couleur: '#9ca3af' },
];

const STATUTS = {
  'offert':         { nom: 'répertorié',     couleur: '#0d9488' },
  'a-verifier':     { nom: 'à vérifier',     couleur: '#d97706' },
  'non-repertorie': { nom: 'non répertorié', couleur: '#94a3b8' },
};

const LANGUES = { fr: 'FR', en: 'EN', bil: 'Bil.' };
const LANGUES_LONG = { fr: 'francophone', en: 'anglophone', bil: 'bilingue' };
const RESEAUX = { public: 'public', prive: 'privé' };

const pct = (v) => v.toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '\u00a0%';
const dateFr = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });

const css = `
.plc { border:1px solid var(--sl-color-gray-5, #e6e9ef); border-radius:12px; overflow:hidden;
  background:var(--sl-color-bg, #fff); margin:1.5rem 0; }
.plc-head { padding:10px 14px; border-bottom:1px solid var(--sl-color-gray-5, #e6e9ef);
  background:var(--sl-color-gray-6, #f7f8fa); display:flex; flex-wrap:wrap; gap:10px;
  align-items:center; justify-content:space-between; }
.plc-title { font-size:12px; font-weight:700; letter-spacing:.03em; color:var(--sl-color-accent, #4f46e5); }
.plc-sub { font-size:12px; color:var(--sl-color-gray-3, #6b7280); margin-top:2px; }
.plc-seg { display:inline-flex; border:1px solid var(--sl-color-gray-5, #d7dce6); border-radius:8px; overflow:hidden; }
.plc-seg button { margin:0; font:inherit; font-size:12px; font-weight:600; padding:5px 12px; border:0;
  background:transparent; color:var(--sl-color-gray-2, #515a6e); cursor:pointer; }
.plc-seg button + button { border-left:1px solid var(--sl-color-gray-5, #d7dce6); }
.plc-seg button[aria-pressed="true"] { background:var(--sl-color-accent-low, #eef0fe); color:var(--sl-color-accent, #4f46e5); }

.plc-defile { overflow-x:auto; padding:14px; background:linear-gradient(180deg, #dbeafe, #eff6ff); }
.plc-plateau { position:relative; min-width:640px; container-type:inline-size; }

.plc-case, .plc-terre, .plc-mont { position:absolute; margin:0; padding:0; border:0; background:none;
  clip-path:${HEXAGONE}; }
.plc-terre { background:#e7e5d8; transform:scale(.94); }
.plc-case { cursor:pointer; perspective:700px; }
.plc-case:focus-visible { outline:none; }
.plc-case:focus-visible .plc-face { box-shadow:inset 0 0 0 3px #1e293b; }

.plc-flip { position:absolute; inset:3%; transform-style:preserve-3d;
  transition:transform .45s cubic-bezier(.2,.8,.2,1); }
.plc-case[data-retourne="true"] .plc-flip { transform:rotateY(180deg); }
.plc-face { position:absolute; inset:0; clip-path:${HEXAGONE}; backface-visibility:hidden;
  -webkit-backface-visibility:hidden; display:flex; flex-direction:column; align-items:center;
  justify-content:center; text-align:center; padding:0 8%; box-sizing:border-box; color:#fff; }
.plc-arriere { transform:rotateY(180deg); background:#1e293b; }
.plc-nom { font-size:1.32cqw; font-weight:700; line-height:1.15; }
.plc-meta { font-size:.95cqw; opacity:.85; margin-top:.35cqw; letter-spacing:.02em; }
.plc-code { font-family:var(--sl-font-mono, monospace); font-size:1.15cqw; font-weight:700; opacity:.9; }
.plc-val { font-size:2cqw; font-weight:800; line-height:1.05; margin-top:.2cqw; }
.plc-lib { font-size:.9cqw; opacity:.85; line-height:1.15; }
.plc-mini { display:flex; width:70%; height:.55cqw; border-radius:99px; overflow:hidden; margin-top:.5cqw;
  background:rgba(255,255,255,.2); }
.plc-etat { font-size:1.1cqw; font-weight:700; line-height:1.2; }

.plc-mont { cursor:pointer; background:#166534; color:#fff; display:flex; flex-direction:column;
  align-items:center; justify-content:center; text-align:center; font:inherit; }
.plc-mont:hover { background:#15803d; }
.plc-mont:focus-visible { outline:none; box-shadow:inset 0 0 0 3px #fbbf24; }
.plc-mont-t { font-size:.9cqw; letter-spacing:.06em; text-transform:uppercase; opacity:.85; }
.plc-mont-d { font-size:1.35cqw; font-weight:800; line-height:1.15; margin:.25cqw 0; }
.plc-mont-c { font-size:.95cqw; opacity:.9; }

@media (prefers-reduced-motion: reduce) {
  .plc-flip { transition:none; transform:none !important; }
  .plc-arriere { transform:none; opacity:0; }
  .plc-case[data-retourne="true"] .plc-arriere { opacity:1; }
  .plc-case[data-retourne="true"] .plc-avant { opacity:0; }
}

.plc-legende { display:flex; flex-wrap:wrap; gap:6px 16px; padding:10px 14px 0; font-size:11.5px;
  color:var(--sl-color-gray-2, #515a6e); }
.plc-cle { display:inline-flex; align-items:center; gap:6px; }
.plc-past { width:11px; height:11px; border-radius:3px; display:inline-block; }

.plc-fiche { padding:12px 14px 14px; min-height:118px; }
.plc-fiche-t { font-size:15px; font-weight:700; margin:0; color:var(--sl-color-text, #1a1a2e); }
.plc-fiche-m { font-size:12px; color:var(--sl-color-gray-3, #6b7280); margin:2px 0 10px; }
.plc-prog { display:flex; flex-wrap:wrap; align-items:center; gap:6px 10px; font-size:13px;
  color:var(--sl-color-text, #1a1a2e); }
.plc-badge { font-size:11px; font-weight:700; padding:2px 9px; border-radius:99px; color:#fff; }
.plc-note { font-size:12.5px; color:var(--sl-color-gray-2, #515a6e); margin:6px 0 0; font-style:italic; }
.plc-barre { display:flex; height:14px; border-radius:7px; overflow:hidden; margin:12px 0 8px; }
.plc-parts { display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:4px 14px;
  font-size:12px; color:var(--sl-color-text, #1a1a2e); }
.plc-part { display:flex; align-items:center; gap:6px; }
.plc-part b { margin-left:auto; font-variant-numeric:tabular-nums; }
.plc-tend { font-size:12.5px; margin:10px 0 0; color:var(--sl-color-text, #1a1a2e); }
.plc-portee { font-size:12px; line-height:1.5; color:var(--sl-color-gray-2, #515a6e); margin:8px 0 0;
  border-left:3px solid #d97706; padding-left:10px; }
.plc-sources { font-size:11.5px; color:var(--sl-color-gray-3, #6b7280); margin:8px 0 0; }
.plc-sources a { color:inherit; }
.plc-resume { font-size:13px; line-height:1.55; color:var(--sl-color-text, #1a1a2e); margin:0; }
`;

export default function PlateauCegeps({ donnees = DONNEES, discipline: disciplineInitiale = 'informatique' }) {
  const { etablissements, ile, disciplines, _meta: meta } = donnees;

  const [idDiscipline, setIdDiscipline] = useState(
    disciplines.some((d) => d.id === disciplineInitiale) ? disciplineInitiale : disciplines[0].id
  );
  const [survol, setSurvol] = useState(null);
  const [epingle, setEpingle] = useState(null);

  const discipline = disciplines.find((d) => d.id === idDiscipline);
  const actif = survol ?? epingle;
  const etabActif = etablissements.find((e) => e.id === actif);

  // Géométrie du plateau, en unités de largeur d'hexagone
  const geo = useMemo(() => {
    const maxCol = Math.max(...ile.rangs.map((r) => r.a + (r.rang % 2 ? 0.5 : 0)));
    const maxRang = Math.max(...ile.rangs.map((r) => r.rang));
    const largeur = maxCol + 1;
    const hauteur = maxRang * PAS_V + H_HEX;
    const place = (col, rang) => ({
      left: `${((col + (rang % 2 ? 0.5 : 0)) / largeur) * 100}%`,
      top: `${((rang * PAS_V) / hauteur) * 100}%`,
      width: `${(1 / largeur) * 100}%`,
      height: `${(H_HEX / hauteur) * 100}%`,
    });
    return { ratio: largeur / hauteur, place };
  }, [ile]);

  // Cases de terre sans établissement, pour la silhouette de l'île
  const terres = useMemo(() => {
    const occupees = new Set(etablissements.map((e) => `${e.col},${e.rang}`));
    occupees.add(`${ile.montRoyal.col},${ile.montRoyal.rang}`);
    const liste = [];
    ile.rangs.forEach(({ rang, de, a }) => {
      for (let col = de; col <= a; col++) {
        if (!occupees.has(`${col},${rang}`)) liste.push({ col, rang });
      }
    });
    return liste;
  }, [etablissements, ile]);

  const compte = useMemo(() => {
    const c = { offert: 0, 'a-verifier': 0, 'non-repertorie': 0 };
    etablissements.forEach((e) => { c[discipline.offre[e.id]?.statut ?? 'non-repertorie']++; });
    return c;
  }, [discipline, etablissements]);

  const changerDiscipline = (id) => { setIdDiscipline(id); setEpingle(null); };
  const disciplineSuivante = () => {
    const i = disciplines.findIndex((d) => d.id === idDiscipline);
    changerDiscipline(disciplines[(i + 1) % disciplines.length].id);
  };

  const s2024 = discipline.situation['2024'];

  return (
    <div className="plc">
      <style>{css}</style>

      <div className="plc-head">
        <div>
          <div className="plc-title">Les établissements collégiaux de l'île de Montréal</div>
          <div className="plc-sub">Survolez, touchez ou parcourez les cases au clavier ; un clic garde une case retournée.</div>
        </div>
        <div className="plc-seg" role="group" aria-label="Discipline">
          {disciplines.map((d) => (
            <button key={d.id} aria-pressed={d.id === idDiscipline} onClick={() => changerDiscipline(d.id)}>
              {d.nom}
            </button>
          ))}
        </div>
      </div>

      <div className="plc-defile">
        <div className="plc-plateau" style={{ aspectRatio: geo.ratio }} role="group"
             aria-label={`Carte des établissements, discipline ${discipline.nom}`}>
          {terres.map(({ col, rang }) => (
            <span key={`t${col}-${rang}`} className="plc-terre" style={geo.place(col, rang)} aria-hidden="true" />
          ))}

          <button className="plc-mont" style={geo.place(ile.montRoyal.col, ile.montRoyal.rang)}
                  onClick={disciplineSuivante}
                  aria-label={`Discipline affichée : ${discipline.nom}. Activer pour passer à la suivante.`}>
            <span className="plc-mont-t">Mont Royal</span>
            <span className="plc-mont-d">{discipline.nom}</span>
            {disciplines.length > 1 && <span className="plc-mont-c">changer ⇄</span>}
          </button>

          {etablissements.map((e) => {
            const offre = discipline.offre[e.id] ?? { statut: 'non-repertorie' };
            const st = STATUTS[offre.statut];
            const retourne = survol === e.id || epingle === e.id;
            return (
              <button key={e.id} className="plc-case" style={geo.place(e.col, e.rang)}
                      data-retourne={retourne}
                      aria-pressed={epingle === e.id}
                      aria-label={`${e.nom}, ${e.quartier}. ${discipline.programme.nom} : ${st.nom}.`}
                      onMouseEnter={() => setSurvol(e.id)} onMouseLeave={() => setSurvol(null)}
                      onFocus={() => setSurvol(e.id)} onBlur={() => setSurvol(null)}
                      onClick={() => setEpingle((p) => (p === e.id ? null : e.id))}>
                <span className="plc-flip">
                  <span className="plc-face plc-avant" style={{ background: st.couleur }}>
                    <span className="plc-nom">{e.court}</span>
                    <span className="plc-meta">{LANGUES[e.langue]} · {RESEAUX[e.reseau]}</span>
                  </span>
                  <span className="plc-face plc-arriere">
                    {offre.statut === 'offert' ? (
                      <>
                        <span className="plc-code">{discipline.programme.code}</span>
                        <span className="plc-val">{pct(s2024.emploiLie)}</span>
                        <span className="plc-lib">en emploi lié</span>
                        <span className="plc-mini" aria-hidden="true">
                          <span style={{ width: `${s2024.emploiLie}%`, background: '#22c55e' }} />
                          <span style={{ width: `${s2024.etudesLiees}%`, background: '#60a5fa' }} />
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="plc-code">{discipline.programme.code}</span>
                        <span className="plc-etat" style={{ color: offre.statut === 'a-verifier' ? '#fbbf24' : '#cbd5e1' }}>
                          {st.nom}
                        </span>
                      </>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="plc-legende">
        {Object.entries(STATUTS).map(([cle, s]) => (
          <span className="plc-cle" key={cle}>
            <span className="plc-past" style={{ background: s.couleur }} />
            {s.nom} ({compte[cle]})
          </span>
        ))}
      </div>

      <div className="plc-fiche">
        {etabActif ? (() => {
          const offre = discipline.offre[etabActif.id] ?? { statut: 'non-repertorie' };
          const st = STATUTS[offre.statut];
          const prog = discipline.programme;
          return (
            <>
              <p className="plc-fiche-t">{etabActif.nom}</p>
              <p className="plc-fiche-m">
                {etabActif.quartier} · {LANGUES_LONG[etabActif.langue]} · réseau {RESEAUX[etabActif.reseau]}
              </p>

              <div className="plc-prog">
                <span><b>{prog.code}</b> {prog.nom}{etabActif.langue !== 'fr' ? ` / ${prog.nomEn}` : ''}</span>
                <span className="plc-badge" style={{ background: st.couleur }}>{st.nom}</span>
              </div>
              {offre.note && <p className="plc-note">{offre.note}</p>}
              {offre.statut === 'non-repertorie' && (
                <p className="plc-note">{meta.statuts['non-repertorie']}</p>
              )}

              {offre.statut !== 'non-repertorie' && (
                <>
                  <div className="plc-barre" role="img"
                       aria-label={`Situation des personnes diplômées en 2024 : ${CATEGORIES.map((c) => `${c.nom} ${pct(s2024[c.cle])}`).join(', ')}.`}>
                    {CATEGORIES.map((c) => (
                      <span key={c.cle} style={{ width: `${s2024[c.cle]}%`, background: c.couleur }} />
                    ))}
                  </div>
                  <div className="plc-parts">
                    {CATEGORIES.map((c) => (
                      <span className="plc-part" key={c.cle}>
                        <span className="plc-past" style={{ background: c.couleur }} />
                        {c.nom}
                        <b>{pct(s2024[c.cle])}</b>
                      </span>
                    ))}
                  </div>
                  <p className="plc-tend">
                    En emploi lié : {pct(discipline.situation['2020'].emploiLie)} (2020),{' '}
                    {pct(discipline.situation['2022'].emploiLie)} (2022),{' '}
                    {pct(s2024.emploiLie)} (2024).
                  </p>
                  <p className="plc-portee">{meta.portee_indicateur}</p>
                </>
              )}

              <p className="plc-sources">
                Offre : Inforoute FPT (
                {discipline.sources.offre.map((u, i) => (
                  <span key={u}>{i > 0 && ', '}<a href={u} target="_blank" rel="noopener noreferrer">{i === 0 ? 'français' : 'anglais'}</a></span>
                ))}
                ), consultée le {dateFr(meta.consultation)}. Situation des personnes diplômées :{' '}
                <a href={discipline.sources.situation} target="_blank" rel="noopener noreferrer">fiche d'adéquation formation-emploi</a>
                {' '}du ministère, mise à jour le {dateFr(discipline.sources.miseAJour)}.
              </p>
            </>
          );
        })() : (
          <p className="plc-resume">
            <b>{discipline.programme.nom}</b> ({discipline.programme.code}) : répertorié pour {compte.offert} établissement
            {compte.offert > 1 ? 's' : ''} sur {etablissements.length}, à vérifier pour {compte['a-verifier']}.
            En 2024, {pct(s2024.emploiLie)} des personnes diplômées de ce programme étaient en emploi lié
            et {pct(s2024.etudesLiees)} poursuivaient des études liées, pour l'ensemble du Québec.
            Choisissez une case pour le détail et les sources.
          </p>
        )}
      </div>
    </div>
  );
}