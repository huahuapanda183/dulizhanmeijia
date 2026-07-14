import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Create Account | LynxiGlam" };

export default function RegisterPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 bg-cream">
        <div className="mx-auto max-w-[440px] px-4 py-16">
          <h1 className="heading-track text-[28px] font-medium text-ink text-center mb-8">
            Create Account
          </h1>
          <AuthForm mode="register" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
