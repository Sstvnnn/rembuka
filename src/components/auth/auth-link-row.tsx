import Link from "next/link";

type AuthLinkRowProps = {
  question: string;
  href: string;
  label: string;
};

export function AuthLinkRow({ question, href, label }: AuthLinkRowProps) {
  return (
    <p className="text-sm text-slate-600 font-medium">
      {question}{" "}
      <Link
        className="font-bold text-[#11538C] hover:text-[#0c3e6b] transition-colors"
        href={href}
      >
        {label}
      </Link>
    </p>
  );
}
