import Link from "next/link";

type AuthLinkRowProps = {
  question: string;
  href: string;
  label: string;
};

export function AuthLinkRow({ question, href, label }: AuthLinkRowProps) {
  return (
    <p className="text-sm text-[#617580]">
      {question}{" "}
      <Link className="font-semibold text-[#3F5C73] hover:text-[#2c4354]" href={href}>
        {label}
      </Link>
    </p>
  );
}
