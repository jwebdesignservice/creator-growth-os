import { PageStub } from "@/components/page-stub";

export const metadata = { title: "Profile · Creator Growth OS" };

export default function ProfilePage() {
  return (
    <PageStub
      title="User Settings"
      description="Manage your profile, account and preferences."
      nextStep="Profile settings (name, email, phone, avatar, follower base, category), personal brand info (content pillars, preferred platforms, bio), security (password, 2FA, sessions) and notification preferences."
    />
  );
}
