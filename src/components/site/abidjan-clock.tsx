"use client";

import { useSyncExternalStore } from "react";

const format = () =>
  new Date().toLocaleTimeString("fr-FR", {
    timeZone: "Africa/Abidjan",
    hour: "2-digit",
    minute: "2-digit",
  }) + " GMT";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}

/** Heure d'Abidjan en direct (le serveur affiche « GMT » en attendant). */
export function AbidjanClock() {
  const time = useSyncExternalStore(subscribe, format, () => "GMT");
  return (
    <time className="live" suppressHydrationWarning>
      {time}
    </time>
  );
}
