import mongoose, { Schema, model } from "mongoose";
import { BUDGETS, PROJECT_TYPES, SERVICE_ICONS } from "@/schemas/constants";
import { baseOptions, mediaField } from "./shared";

// En dev, Next.js recharge ce fichier : on remplace le modèle au lieu de le déclarer deux fois
function getModel<T extends Schema>(name: string, schema: T) {
  if (mongoose.models[name]) mongoose.deleteModel(name);
  return model(name, schema);
}

// --- Compte admin unique ---
const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  baseOptions,
);
export const AdminUser = getModel("AdminUser", adminUserSchema);

// --- Documents uniques (clé fixe « main ») ---
const profileSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    role: { type: String, required: true },
    available: { type: Boolean, default: true },
    status: { type: String, default: "" },
    headline: { type: String, required: true },
    lead: { type: String, required: true },
    photo: mediaField,
    location: { type: String, default: "" },
    language: { type: String, default: "" },
    response: { type: String, default: "" },
    badge: { type: String, default: "" },
    cv: mediaField,
  },
  baseOptions,
);
export const Profile = getModel("Profile", profileSchema);

const contactSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    title: { type: String, required: true },
    text: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    email: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
  },
  baseOptions,
);
export const Contact = getModel("Contact", contactSchema);

// --- Listes ordonnées ---
const order = { type: Number, default: 0, index: true };

const serviceSchema = new Schema(
  {
    icon: { type: String, enum: SERVICE_ICONS, default: "web" },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    features: { type: [String], default: [] },
    for: { type: String, default: "" },
    order,
  },
  baseOptions,
);
export const Service = getModel("Service", serviceSchema);

const stepSchema = new Schema(
  { title: { type: String, required: true }, desc: { type: String, required: true }, order },
  baseOptions,
);
export const Step = getModel("Step", stepSchema);

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    tag: { type: String, default: "" },
    desc: { type: String, required: true },
    role: { type: String, default: "" },
    stack: { type: [String], default: [] },
    image: mediaField,
    demoUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    published: { type: Boolean, default: false, index: true },
    order,
  },
  baseOptions,
);
export const Project = getModel("Project", projectSchema);

const skillGroupSchema = new Schema(
  { group: { type: String, required: true }, items: { type: [String], default: [] }, order },
  baseOptions,
);
export const SkillGroup = getModel("SkillGroup", skillGroupSchema);

const educationSchema = new Schema(
  {
    period: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, default: "" },
    order,
  },
  baseOptions,
);
export const Education = getModel("Education", educationSchema);

const marqueeWordSchema = new Schema(
  { text: { type: String, required: true }, order },
  baseOptions,
);
export const MarqueeWord = getModel("MarqueeWord", marqueeWordSchema);

// --- Messages du formulaire de contact ---
const messageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    projectType: { type: String, enum: PROJECT_TYPES, required: true },
    budget: { type: String, enum: BUDGETS },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false, index: true },
  },
  baseOptions,
);
export const Message = getModel("Message", messageSchema);

// --- Limitation de fréquence (les documents expirent tout seuls) ---
const rateLimitSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { versionKey: false },
);
export const RateLimit = getModel("RateLimit", rateLimitSchema);

/** Modèles des listes réordonnables par glisser-déposer. */
export const orderedModels = {
  services: Service,
  steps: Step,
  projects: Project,
  skills: SkillGroup,
  education: Education,
  marquee: MarqueeWord,
} as const;

export type OrderedCollection = keyof typeof orderedModels;
