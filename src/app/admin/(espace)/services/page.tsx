import type { Metadata } from "next";
import { CollectionPage } from "@/components/admin/collection-page";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <CollectionPage collection="services" />;
}
