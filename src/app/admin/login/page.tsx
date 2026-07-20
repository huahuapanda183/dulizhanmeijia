import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Sign in | LynxiGlam Admin" };

/**
 * The one /admin route that src/proxy.ts lets through unauthenticated — without
 * it the gate would redirect to itself forever.
 */
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
