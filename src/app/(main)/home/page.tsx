import Link from "next/link";
import { LogOut, Mail, MapPin, ShieldCheck, UserRound, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="group rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(63,92,115,0.1)] transition hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(63,92,115,0.14)]">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#eff4f7] text-[#3F5C73] transition group-hover:bg-[#3F5C73] group-hover:text-white">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-[#243746]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#617580]">{description}</p>
    </article>
  );
}

export default async function HomePage() {
  const user = await requireUser();
  const nik = user.user_metadata.nik as string | undefined;
  const fullName = (user.user_metadata.full_name as string | undefined) ?? "Verified citizen";
  const location = (user.user_metadata.location as string | undefined) ?? "Unknown";
  const email = user.email ?? (user.user_metadata.email as string | undefined) ?? "-";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8fb_0%,#f8efeb_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] border border-white/70 bg-white/85 px-6 py-5 shadow-[0_18px_50px_rgba(63,92,115,0.12)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4FB3B3]">
                Citizen Dashboard
              </p>
              <div>
                <h1 className="font-heading text-3xl font-semibold text-[#243746]">
                  Welcome to Rembuka
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#617580] sm:text-base">
                  Your account is ready to access the platform.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#d9e2e8] bg-[#f8fbfc] px-4 py-3 text-sm text-[#2f495b]">
                  <div className="flex items-center gap-2 text-[#3F5C73]">
                    <UserRound className="size-4" />
                    <p className="font-semibold">Username</p>
                  </div>
                  <p className="mt-1 text-sm">{fullName}</p>
                </div>
                <div className="rounded-2xl border border-[#d9e2e8] bg-[#f8fbfc] px-4 py-3 text-sm text-[#2f495b]">
                  <div className="flex items-center gap-2 text-[#F25C7A]">
                    <MapPin className="size-4" />
                    <p className="font-semibold">Location</p>
                  </div>
                  <p className="mt-1 text-sm">{location}</p>
                </div>
                <div className="rounded-2xl border border-[#d9e2e8] bg-[#f8fbfc] px-4 py-3 text-sm text-[#2f495b]">
                  <p className="font-semibold">Demo NIK</p>
                  <p className="mt-1 font-mono text-xs sm:text-sm">{nik ?? "-"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button asChild className="h-11 rounded-2xl bg-[#3F5C73] px-5 text-white hover:bg-[#314b60]">
                  <Link href="/profile">Edit profile</Link>
                </Button>
                <form action="/signout" method="post">
                  <Button className="h-11 rounded-2xl bg-[#F25C7A] px-5 text-white hover:bg-[#df4d69]">
                    <LogOut className="mr-2 size-4" />
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-[#dbe6eb] bg-[#3F5C73] p-7 text-white shadow-[0_20px_55px_rgba(63,92,115,0.24)]">
            <div className="flex items-center gap-3 text-[#a9efef]">
              <ShieldCheck className="size-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.22em]">
                Active Session
              </p>
            </div>
            <h2 className="mt-4 font-heading text-3xl font-semibold">
              Your account is ready for participation across the platform.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9e8ef] sm:text-base">
              Protected routing is enabled, your session is stored securely, and your profile information is available throughout the application.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(63,92,115,0.1)]">
            <div className="flex items-center gap-3 text-[#F25C7A]">
              <MapPin className="size-5" />
              <p className="text-sm font-semibold uppercase tracking-[0.22em]">
                Registered Profile
              </p>
            </div>
            <p className="mt-5 text-2xl font-semibold text-[#243746]">{location}</p>
            <div className="mt-4 flex items-center gap-2 text-sm text-[#617580]">
              <Mail className="size-4" />
              <span>{email}</span>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Policy Voting"
            description="Collect citizen opinion on draft policies and measure consensus quickly."
            icon={<Vote className="size-5" />}
          />
          <FeatureCard
            title="Regional Planning"
            description="Open structured development proposals with verified civic identity."
            icon={<MapPin className="size-5" />}
          />
          <FeatureCard
            title="Route Security"
            description="Access control is enforced through middleware and server-side session checks."
            icon={<ShieldCheck className="size-5" />}
          />
        </section>
      </div>
    </main>
  );
}
