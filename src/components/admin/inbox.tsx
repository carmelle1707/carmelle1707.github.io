"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteMessage, setMessageArchived, setMessageRead } from "@/actions/messages";
import type { InboxMessage } from "@/lib/admin-data";
import type { FormState } from "@/lib/form-state";
import { BUDGET_LABELS, PROJECT_TYPE_LABELS } from "@/schemas/constants";
import { ConfirmButton } from "./confirm-button";

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Abidjan",
});

const label = <T extends string>(labels: Record<T, string>, key: string) => labels[key as T] ?? key;

/** Réponse préparée dans la messagerie : objet repris, message d'origine cité (tronqué). */
function replyLink(m: InboxMessage) {
  const quoted = m.message.slice(0, 900).replace(/^/gm, "> ");
  const body = `Bonjour ${m.name},\n\nMerci pour votre message.\n\n\n\n---\nLe ${dateFormat.format(new Date(m.createdAt))}, vous avez écrit :\n${quoted}`;
  const subject = `Votre projet : ${label(PROJECT_TYPE_LABELS, m.projectType)}`;
  return `mailto:${m.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function notify(res: FormState | null) {
  if (res?.status === "success") toast.success(res.message);
  else toast.error(res?.status === "error" ? res.message : "Action impossible. Réessayez.");
}

export function Inbox({ messages, archived }: { messages: InboxMessage[]; archived: boolean }) {
  if (messages.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-line p-8 text-center text-muted">
        {archived
          ? "Aucun message archivé."
          : "Aucun message pour l'instant. Ceux du formulaire de contact arriveront ici."}
      </p>
    );
  }
  return (
    <ul className="m-0 grid list-none divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-surface p-0">
      {messages.map((m) => (
        <MessageRow key={m.id} m={m} />
      ))}
    </ul>
  );
}

function MessageRow({ m }: { m: InboxMessage }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<FormState>, silent = false) =>
    startTransition(async () => {
      const res = await fn().catch(() => null);
      if (!silent || res?.status !== "success") notify(res);
    });

  const toggle = () => {
    setOpen(!open);
    // Ouvrir un message non lu le marque comme lu, sans notification
    if (!open && !m.read) run(() => setMessageRead(m.id, true), true);
  };
  const panelId = `message-${m.id}`;

  return (
    <li className={m.read ? "" : "bg-second/5"} aria-busy={pending}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-start gap-x-3 border-0 bg-transparent px-4 py-3.5 text-left text-ink min-[641px]:px-5"
      >
        <span
          className={`mt-2 size-2 rounded-full ${m.read ? "bg-transparent" : "bg-second"}`}
          aria-hidden="true"
        />
        <span className="min-w-0">
          <span className={`block truncate ${m.read ? "font-medium" : "font-bold"}`}>
            {m.name}
            {!m.read && <span className="sr-only"> (non lu)</span>}
          </span>
          <span className="block truncate text-sm text-muted">
            {label(PROJECT_TYPE_LABELS, m.projectType)} · {m.message}
          </span>
        </span>
        <time dateTime={m.createdAt} className="pt-0.5 text-xs whitespace-nowrap text-muted">
          {dateFormat.format(new Date(m.createdAt))}
        </time>
      </button>

      {open && (
        <div
          id={panelId}
          className="grid gap-4 border-t border-line px-4 pt-4 pb-5 min-[641px]:px-5 min-[641px]:pl-10"
        >
          <dl className="m-0 grid gap-x-6 gap-y-1 text-sm min-[641px]:grid-cols-[auto_1fr]">
            <dt className="text-muted">Email</dt>
            <dd className="m-0 break-all">{m.email}</dd>
            <dt className="text-muted">Projet</dt>
            <dd className="m-0">{label(PROJECT_TYPE_LABELS, m.projectType)}</dd>
            <dt className="text-muted">Budget</dt>
            <dd className="m-0">{m.budget ? label(BUDGET_LABELS, m.budget) : "Non précisé"}</dd>
          </dl>
          <p className="m-0 leading-relaxed whitespace-pre-wrap">{m.message}</p>
          <div className="flex flex-wrap gap-2">
            <a href={replyLink(m)} className="admin-btn admin-btn-primary">
              Répondre par email
            </a>
            <button
              type="button"
              className="admin-btn"
              disabled={pending}
              onClick={() => run(() => setMessageArchived(m.id, !m.archived))}
            >
              {m.archived ? "Remettre dans la boîte" : "Archiver"}
            </button>
            {!m.archived && (
              <button
                type="button"
                className="admin-btn admin-btn-quiet"
                disabled={pending}
                onClick={() => {
                  setOpen(false);
                  run(() => setMessageRead(m.id, false));
                }}
              >
                Marquer non lu
              </button>
            )}
            <ConfirmButton
              label="Supprimer"
              ariaLabel={`Supprimer le message de ${m.name}`}
              title={`Supprimer le message de ${m.name} ?`}
              message="Il sera effacé définitivement. Pour le garder sans l'avoir sous les yeux, archivez-le plutôt."
              confirmLabel="Supprimer"
              onConfirm={async () => notify(await deleteMessage(m.id).catch(() => null))}
            />
          </div>
        </div>
      )}
    </li>
  );
}
