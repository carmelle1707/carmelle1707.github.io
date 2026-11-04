import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "@/components/admin/inbox";
import { getInbox } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const archived = (await searchParams).vue === "archives";
  const messages = await getInbox(archived);
  const tabs = [
    { href: "/admin/messages", label: "Boîte de réception", current: !archived },
    { href: "/admin/messages?vue=archives", label: "Archives", current: archived },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-[32px] font-extrabold">Messages</h1>
        <p className="mt-1 text-muted">Les demandes envoyées depuis le formulaire de contact.</p>
      </div>
      <nav aria-label="Dossiers" className="flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={t.current ? "page" : undefined}
            className="-mb-px border-b-2 border-transparent px-3 py-2.5 font-semibold text-muted no-underline hover:text-ink aria-[current=page]:border-second aria-[current=page]:text-ink"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <Inbox messages={messages} archived={archived} />
    </div>
  );
}
