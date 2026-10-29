import type { Metadata } from "next";
import { CollectionPage } from "@/components/admin/collection-page";

export const metadata: Metadata = { title: "Compétences" };

export default function Page() {
  return <CollectionPage collection="skills" />;
}
