"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { setAvailable } from "@/actions/profile";

/** Bascule « Disponible » : effet immédiat à l'écran, annulé si l'enregistrement échoue. */
export function AvailabilitySwitch({ available }: { available: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(available);
  const [pending, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      setOptimistic(!optimistic);
      try {
        const res = await setAvailable(!optimistic);
        if (res.status === "success") toast.success(res.message);
        else if (res.status === "error") toast.error(res.message);
      } catch {
        toast.error("Enregistrement impossible. Réessayez.");
      }
    });

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p id="availability-label" className="font-semibold">
          Disponible pour de nouveaux projets
        </p>
        <p className="text-sm text-muted">
          {optimistic
            ? "Le badge vert est affiché en haut du site."
            : "Le badge est masqué sur le site."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={optimistic}
        aria-labelledby="availability-label"
        aria-busy={pending}
        onClick={toggle}
        className="admin-switch-button"
      >
        <span className="sr-only">{optimistic ? "Oui" : "Non"}</span>
      </button>
    </div>
  );
}
