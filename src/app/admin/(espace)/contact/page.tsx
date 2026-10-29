import type { Metadata } from "next";
import { ContactInfoForm } from "@/components/admin/contact-form";
import { getAdminContact } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const contact = await getAdminContact();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-[32px] font-extrabold">Contact</h1>
        <p className="mt-1 text-muted">La dernière section du site.</p>
      </div>
      <ContactInfoForm contact={contact} />
    </div>
  );
}
