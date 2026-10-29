"use client";

import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { startSiteMotion } from "@/lib/site-motion";

/** Barre de progression, curseur et démarrage des animations du site public. */
export function SiteMotion() {
  useEffect(() => startSiteMotion(), []);
  return (
    <>
      <div className="progress" aria-hidden="true" data-progress />
      <div className="cursor" aria-hidden="true" data-cursor-ring data-hidden="true">
        <b>Voir</b>
      </div>
      <div className="cursor-dot" aria-hidden="true" data-cursor-dot data-hidden="true" />
    </>
  );
}
