import type {
  ContactInput,
  EducationInput,
  ProfileInput,
  ProjectInput,
  ServiceInput,
  SkillGroupInput,
  StepInput,
} from "@/schemas/content";

type WithId<T> = T & { id: string };

/** Tout ce dont la page publique a besoin, en objets simples (sérialisables). */
export type SiteContent = {
  profile: ProfileInput;
  contact: ContactInput;
  marquee: string[];
  services: WithId<ServiceInput>[];
  steps: WithId<StepInput>[];
  projects: WithId<ProjectInput>[];
  skills: WithId<SkillGroupInput>[];
  education: WithId<EducationInput>[];
};
