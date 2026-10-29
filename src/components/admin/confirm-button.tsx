"use client";

import { useId, useRef, useState } from "react";

type Props = {
  label: string;
  /** Nom accessible du bouton déclencheur, quand `label` seul est ambigu (« Supprimer » × 5) */
  ariaLabel?: string;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
};

/**
 * Bouton d'action irréversible : ouvre une vraie boîte de dialogue (<dialog> modale,
 * focus piégé et touche Échap gérés par le navigateur) avant d'agir.
 */
export function ConfirmButton({
  label,
  ariaLabel,
  title,
  message,
  confirmLabel,
  onConfirm,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      ref.current?.close();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="admin-btn admin-btn-quiet text-danger"
        aria-label={ariaLabel}
        onClick={() => ref.current?.showModal()}
      >
        {label}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        className="admin-dialog"
        onClick={(e) => e.target === ref.current && !busy && ref.current?.close()}
      >
        <div className="grid gap-3 p-6">
          <h2 id={titleId} className="text-xl font-bold">
            {title}
          </h2>
          <p className="text-muted">{message}</p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="admin-btn"
              autoFocus
              disabled={busy}
              onClick={() => ref.current?.close()}
            >
              Annuler
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-danger"
              disabled={busy}
              onClick={confirm}
            >
              {busy ? "Suppression…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
