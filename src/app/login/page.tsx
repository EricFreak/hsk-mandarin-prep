import LoginForm from "@/components/auth/LoginForm";
import { resolveVisitorContinueHref } from "@/lib/auth/continue-destination";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SearchParams = { next?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const dest = await resolveVisitorContinueHref(searchParams.next ?? "/dashboard");

  // Already authenticated → never render the auth form.
  if (!dest.startsWith("/login")) {
    redirect(dest);
  }

  return <LoginForm />;
}
