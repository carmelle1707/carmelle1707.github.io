import type { Metadata } from "next";
import { CollectionPage } from "@/components/admin/collection-page";

export const metadata: Metadata = { title: "Projets" };

export default function Page() {
  return <CollectionPage collection="projects" />;
}
