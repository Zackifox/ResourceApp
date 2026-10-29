import Link from "next/link";
import { FileText, FolderTree, LayoutDashboard, Megaphone, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Administration" };

const liens = [
  { href: "/admin", label: "Tableau de bord", icone: LayoutDashboard },
  { href: "/admin/structure", label: "Instituts & filières", icone: FolderTree },
  { href: "/admin/ressources", label: "Ressources PDF", icone: FileText },
  { href: "/admin/communiques", label: "Communiqués", icone: Megaphone },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icone: Users },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="md:w-56 md:shrink-0">
        <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-attenue uppercase">Administration</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {liens.map(({ href, label, icone: Icone }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white"
            >
              <Icone size={18} className="text-primaire" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
