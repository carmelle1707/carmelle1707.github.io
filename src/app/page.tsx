import { RichTitle } from "@/lib/rich-title";

// Page provisoire : les sections arrivent à l'étape 4.
export default function Home() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-[1120px] content-center gap-6 px-5">
      <span className="font-mono text-[13px] tracking-[0.08em] text-second uppercase">
        Portfolio · en reconstruction
      </span>
      <h1 className="text-[clamp(42px,6.6vw,80px)] font-extrabold">
        <RichTitle text="Je crée des sites et des apps mobiles qui font *travailler votre business*." />
      </h1>
    </main>
  );
}
