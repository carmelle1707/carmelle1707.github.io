import { Bricolage_Grotesque, Figtree, Instrument_Serif, JetBrains_Mono } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

export const instrument = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
});

export const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  display: "swap",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});

export const fontVariables = [bricolage, instrument, figtree, jetbrains]
  .map((f) => f.variable)
  .join(" ");
