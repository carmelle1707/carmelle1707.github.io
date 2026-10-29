import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <p className="font-mono text-[13px] tracking-[0.08em] text-second uppercase">
          Administration
        </p>
        <h1 className="mt-2 text-[34px] font-extrabold">Connexion</h1>
        <p className="mt-2 text-muted">Accès réservé à la gestion du portfolio.</p>
        <div className="mt-8 rounded-[14px] border border-line bg-surface p-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm">
          <Link href="/" className="text-muted underline-offset-4 hover:text-ink hover:underline">
            ← Retour au site
          </Link>
        </p>
      </div>
    </main>
  );
}
