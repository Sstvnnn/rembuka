import Link from "next/link";
import { CheckCircle2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfirmedPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,179,179,0.26),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(242,92,122,0.22),transparent_24%),linear-gradient(135deg,#eff5f7_0%,#f8ece6_48%,#f5f8fb_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(63,92,115,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(63,92,115,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <section className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/92 p-8 shadow-[0_24px_90px_rgba(63,92,115,0.18)] backdrop-blur">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-[#eaf7f7] text-[#2e7d7d] shadow-[6px_6px_0_rgba(79,179,179,0.16)]">
          <CheckCircle2 className="size-8" />
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4FB3B3]">
            Email confirmed
          </p>
          <h1 className="font-heading text-4xl font-semibold text-[#243746]">
            You are all set
          </h1>
          <p className="max-w-xl text-base leading-7 text-[#587080]">
            Your email has been confirmed successfully. You can now sign in and continue to your account.
          </p>
        </div>

        <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-[#d8e2e8] bg-[#f8fbfc] p-5 text-sm text-[#587080] sm:grid-cols-2">
          <div className="rounded-[1.25rem] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#3F5C73]">
              <MailCheck className="size-4" />
              <p className="font-semibold">Next step</p>
            </div>
            <p className="mt-2 leading-6">
              Sign in using your identity number and password to access your account.
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-white p-4 shadow-sm">
            <p className="font-semibold text-[#3F5C73]">Profile</p>
            <p className="mt-2 leading-6">
              After signing in, you can review your profile details and manage your account settings.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="h-11 rounded-2xl bg-[#3F5C73] px-5 text-white hover:bg-[#314b60]">
            <Link href="/login">Continue to sign in</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-2xl px-5">
            <Link href="/register">Back to registration</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
