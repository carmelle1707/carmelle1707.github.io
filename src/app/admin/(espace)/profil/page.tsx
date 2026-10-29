import type { Metadata } from "next";
import { ProfileForm } from "@/components/admin/profile-form";
import { getAdminProfile } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const profile = await getAdminProfile();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-[32px] font-extrabold">Profil</h1>
        <p className="mt-1 text-muted">Ce qui s&apos;affiche en haut du site.</p>
      </div>
      <ProfileForm profile={profile} uploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} />
    </div>
  );
}
