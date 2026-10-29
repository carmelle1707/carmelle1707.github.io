import { SERVICE_ICONS, SERVICE_ICON_LABELS } from "@/schemas/constants";

/**
 * Description des listes modifiables de l'admin, partagée par le serveur (lecture du formulaire)
 * et le client (affichage des champs). Les projets ont leur propre écran (étape 10).
 */

export type FieldDef = {
  name: string;
  label: string;
  /** lines = une valeur par ligne, enregistrée en tableau */
  kind: "text" | "textarea" | "lines" | "select";
  required?: boolean;
  hint?: string;
  maxLength?: number;
  options?: readonly { value: string; label: string }[];
};

export type CollectionItem = { id: string } & Record<string, string | string[]>;

type CollectionDef = {
  title: string;
  intro: string;
  /** « un service », « une étape »… pour les boutons et confirmations */
  one: string;
  path: string;
  fields: readonly FieldDef[];
  summary: (item: CollectionItem) => { title: string; detail?: string };
};

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : (v ?? ""));
const count = (v: string | string[] | undefined, one: string, many: string) => {
  const n = Array.isArray(v) ? v.length : 0;
  return `${n} ${n > 1 ? many : one}`;
};

export const COLLECTIONS = {
  services: {
    title: "Services",
    intro: "Les offres présentées en cartes, dans l'ordre affiché sur le site.",
    one: "un service",
    path: "/admin/services",
    fields: [
      {
        name: "icon",
        label: "Icône",
        kind: "select",
        required: true,
        options: SERVICE_ICONS.map((v) => ({ value: v, label: SERVICE_ICON_LABELS[v] })),
      },
      { name: "title", label: "Nom du service", kind: "text", required: true, maxLength: 80 },
      { name: "desc", label: "Description", kind: "textarea", required: true, maxLength: 400 },
      {
        name: "features",
        label: "Ce qui est inclus",
        kind: "lines",
        hint: "Un point par ligne (12 maximum).",
      },
      { name: "for", label: "Idéal pour", kind: "text", maxLength: 160 },
    ],
    summary: (i) => ({
      title: str(i.title),
      detail: `${SERVICE_ICON_LABELS[i.icon as keyof typeof SERVICE_ICON_LABELS] ?? ""} · ${count(i.features, "point", "points")}`,
    }),
  },
  steps: {
    title: "Méthode",
    intro: "Les étapes de travail, de gauche à droite sur le site.",
    one: "une étape",
    path: "/admin/methode",
    fields: [
      { name: "title", label: "Nom de l'étape", kind: "text", required: true, maxLength: 60 },
      { name: "desc", label: "Description", kind: "textarea", required: true, maxLength: 400 },
    ],
    summary: (i) => ({ title: str(i.title), detail: str(i.desc) }),
  },
  skills: {
    title: "Compétences",
    intro: "Les catégories d'outils et de technologies.",
    one: "une catégorie",
    path: "/admin/competences",
    fields: [
      { name: "group", label: "Catégorie", kind: "text", required: true, maxLength: 40 },
      {
        name: "items",
        label: "Outils",
        kind: "lines",
        hint: "Un outil par ligne. Ils apparaissent aussi dans le bandeau défilant.",
      },
    ],
    summary: (i) => ({ title: str(i.group), detail: str(i.items) }),
  },
  education: {
    title: "Parcours",
    intro: "Formations et expériences, de la plus récente à la plus ancienne.",
    one: "une entrée",
    path: "/admin/parcours",
    fields: [
      {
        name: "period",
        label: "Période",
        kind: "text",
        required: true,
        maxLength: 30,
        hint: "Par exemple : 2023 – 2026",
      },
      {
        name: "title",
        label: "Établissement ou poste",
        kind: "text",
        required: true,
        maxLength: 100,
      },
      { name: "desc", label: "Description", kind: "textarea", maxLength: 400 },
    ],
    summary: (i) => ({ title: str(i.title), detail: str(i.period) }),
  },
  marquee: {
    title: "Bandeau défilant",
    intro: "Les grands mots qui défilent sous l'accroche.",
    one: "un mot",
    path: "/admin/bandeau",
    fields: [
      { name: "text", label: "Mot ou expression", kind: "text", required: true, maxLength: 40 },
    ],
    summary: (i) => ({ title: str(i.text) }),
  },
} satisfies Record<string, CollectionDef>;

export type EditableCollection = keyof typeof COLLECTIONS;
export const EDITABLE_COLLECTIONS = Object.keys(COLLECTIONS) as EditableCollection[];

/** Titre et détail affichés dans la liste de l'admin. */
export const summaryOf = (key: EditableCollection, item: CollectionItem) =>
  (COLLECTIONS[key] as CollectionDef).summary(item);

/** Valeur brute d'un champ à partir du formulaire (les listes : une ligne = une valeur). */
export function readField(field: FieldDef, formData: FormData): string | string[] {
  const raw = String(formData.get(field.name) ?? "");
  return field.kind === "lines" ? raw.split(/\r?\n/).map((l) => l.trim()) : raw;
}
