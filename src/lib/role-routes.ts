export type RoleScope = "citizen" | "governance" | "admin";

type ProfileRoleInput = {
  userType?: string | null;
  role?: string | null;
};

type NavLink = {
  label: string;
  href: string;
  description: string;
};

export function getRoleScope({ userType, role }: ProfileRoleInput): RoleScope {
  if (role === "admin") {
    return "admin";
  }

  if (userType === "governance") {
    return "governance";
  }

  return "citizen";
}

export function getRoleHomePath(profile: ProfileRoleInput): string {
  return getRoleHomeHref(getRoleScope(profile));
}

export function getRoleHomeHref(scope: RoleScope): string {
  switch (scope) {
    case "admin":
      return "/admin/home";
    case "governance":
      return "/governance/home";
    default:
      return "/citizen/home";
  }
}

export function getRoleProfileHref(scope: RoleScope): string {
  switch (scope) {
    case "admin":
      return "/admin/profile";
    case "governance":
      return "/governance/profile";
    default:
      return "/citizen/profile";
  }
}

export function getRoleNavLinks(scope: RoleScope): NavLink[] {
  switch (scope) {
    case "admin":
      return [
        {
          label: "Overview",
          href: "/admin/home",
          description: "Ringkasan operasional admin",
        },
        {
          label: "Verification Queue",
          href: "/admin/queue",
          description: "Verifikasi warga yang menunggu",
        },

        {
          label: "Profile",
          href: "/admin/profile",
          description: "Identitas akun admin",
        },
      ];
    case "governance":
      return [
        {
          label: "Homepage",
          href: "/governance/home",
          description: "Dashboard pemerintah wilayah",
        },
        {
          label: "POL.IS Rules",
          href: "/governance/legal",
          description: "Atur pernyataan dan ringkasan regulasi",
        },
        {
          label: "Building Proposals",
          href: "/governance/proposals",
          description: "Tinjau proposal dan atur jadwal fase",
        },
        {
          label: "Tracker Board",
          href: "/governance/tracker",
          description: "Kelola progres proposal dan kebijakan",
        },
        {
          label: "Profile",
          href: "/governance/profile",
          description: "Identitas akun pemerintah",
        },
      ];
    default:
      return [
        {
          label: "Regulasi",
          href: "/citizen/legal",
          description: "Beri opini dan suara pada regulasi",
        },
        {
          label: "Proposal Pembangunan",
          href: "/citizen/proposals",
          description: "Ajukan dan pilih prioritas pembangunan",
        },
        {
          label: "Anggaran Daerah",
          href: "/citizen/budget",
          description: "Lihat alokasi anggaran publik",
        },
        {
          label: "Lacak Proses",
          href: "/citizen/tracker",
          description: "Pantau progres kebijakan dan proyek",
        },
        {
          label: "Dokumen Transparansi",
          href: "/citizen/transparency",
          description: "Arsip keputusan final",
        },
      ];
  }
}

export function isRolePath(pathname: string, scope: RoleScope): boolean {
  return pathname === `/${scope}` || pathname.startsWith(`/${scope}/`);
}
