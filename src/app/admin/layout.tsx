import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      {children}
      <Toaster position="bottom-right" theme="system" richColors closeButton />
    </div>
  );
}
