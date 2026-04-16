import type { ReactNode } from "react";

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ badge, title, description, children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,179,179,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(242,92,122,0.16),transparent_26%),linear-gradient(135deg,#eef4f7_0%,#f8eeea_48%,#f7fafc_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(63,92,115,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(63,92,115,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[-5rem] h-56 w-56 rounded-full bg-[#4FB3B3]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-5rem] h-64 w-64 rounded-full bg-[#F25C7A]/12 blur-3xl" />

      <section className="relative z-10 grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6 text-[#243746]">
          <span className="inline-flex items-center rounded-full border border-[#aac3d1] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#3F5C73] shadow-sm backdrop-blur">
            {badge}
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl font-heading text-4xl leading-tight font-semibold sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-[#587080] sm:text-lg">
              {description}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(63,92,115,0.08)] backdrop-blur">
              <p className="text-sm font-semibold">Secure access</p>
              <p className="mt-2 text-sm leading-6 text-[#6c7f8a]">
                Sign in with your registered account and continue where you left off.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(63,92,115,0.08)] backdrop-blur">
              <p className="text-sm font-semibold">Account recovery</p>
              <p className="mt-2 text-sm leading-6 text-[#6c7f8a]">
                Email confirmation and password reset are available whenever needed.
              </p>
            </div>
          </div>
        </div>

        {children}
      </section>
    </main>
  );
}
