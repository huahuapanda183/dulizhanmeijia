import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign In | Glamnetic" };

export default function LoginPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[440px] px-4 py-16">
          <h1 className="heading-track text-[28px] font-medium text-ink text-center mb-8">
            Sign In
          </h1>
          <AuthForm mode="login" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
