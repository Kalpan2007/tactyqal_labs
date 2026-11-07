import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/admin/SignOutButton";

const links = [
  { href: "/admin", label: "Posts" },
  { href: "/admin/leads", label: "Consultation requests" },
  { href: "/api/docs", label: "API docs" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-fog text-night">
      <header className="sticky top-0 z-40 border-b border-rule-dark bg-night text-snow">
        <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between gap-6 px-5">
          <div className="flex items-center gap-8">
            <Link href="/" aria-label="Tactyqal Labs home">
              <Logo light />
            </Link>
            <nav aria-label="Admin">
              <ul className="flex items-center gap-5 text-[13px]">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-mute-dark transition-colors hover:text-snow">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
