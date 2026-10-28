export const SERVICE_ICONS = ["web", "app", "mobile", "design", "shop", "seo", "support"] as const;

export const SERVICE_ICON_LABELS: Record<(typeof SERVICE_ICONS)[number], string> = {
  web: "Site web",
  app: "Application / tableau de bord",
  mobile: "Mobile",
  design: "Design",
  shop: "E-commerce",
  seo: "Référencement",
  support: "Maintenance / support",
};

export const PROJECT_TYPES = [
  "site-vitrine",
  "application-web",
  "application-mobile",
  "autre",
] as const;

export const PROJECT_TYPE_LABELS: Record<(typeof PROJECT_TYPES)[number], string> = {
  "site-vitrine": "Site vitrine",
  "application-web": "Application web",
  "application-mobile": "Application mobile",
  autre: "Autre",
};

export const BUDGETS = ["moins-300k", "300k-1m", "plus-1m", "a-definir"] as const;

export const BUDGET_LABELS: Record<(typeof BUDGETS)[number], string> = {
  "moins-300k": "Moins de 300 000 FCFA",
  "300k-1m": "300 000 – 1 000 000 FCFA",
  "plus-1m": "Plus de 1 000 000 FCFA",
  "a-definir": "À définir ensemble",
};
