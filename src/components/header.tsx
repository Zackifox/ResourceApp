import Link from "next/link";
import { Menu, LogOut, Shield, User } from "lucide-react";
import { getSession } from "@/lib/auth";
import { deconnexion } from "@/app/actions/auth";

const liens = [
  { href: "/", label: "Accueil" },
  { href: "/instituts", label: "Ressources" },
  { href: "/communiques", label: "Communiqués" },
  { href: "/recherche", label: "Recherche" },
];

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 border-b border-bordure bg-white/95 backdrop-blur">
      {/* Liseré aux couleurs du Tchad */}
      <div className="flex h-1">
        <div className="flex-1 bg-primaire" />
        <div className="flex-1 bg-or" />
        <div className="flex-1 bg-rouge" />
      </div>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primaire text-sm font-bold text-or">
            UET
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-primaire">UET-UCAO</span>
            <span className="block text-xs text-attenue">Plateforme pédagogique</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-texte hover:bg-fond"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <MenuUtilisateur session={session} />
        </div>

        {/* Menu mobile, sans JavaScript */}
        <details className="relative md:hidden">
          <summary className="btn-secondaire list-none px-2.5" aria-label="Menu">
            <Menu size={20} />
          </summary>
          <div className="carte absolute right-0 mt-2 flex w-60 flex-col gap-1 p-2">
            {liens.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm hover:bg-fond">
                {l.label}
              </Link>
            ))}
            <hr className="my-1 border-bordure" />
            <MenuUtilisateur session={session} />
          </div>
        </details>
      </div>
    </header>
  );
}

function MenuUtilisateur({ session }: { session: Awaited<ReturnType<typeof getSession>> }) {
  if (!session) {
    return (
      <>
        <Link href="/connexion" className="btn-secondaire">
          Connexion
        </Link>
        <Link href="/inscription" className="btn-primaire">
          Inscription
        </Link>
      </>
    );
  }

  return (
    <>
      {session.isAdmin && (
        <Link href="/admin" className="btn-secondaire">
          <Shield size={16} /> Administration
        </Link>
      )}
      <span className="flex items-center gap-1.5 px-2 text-sm text-attenue">
        <User size={16} /> {session.profile?.nom}
      </span>
      <form action={deconnexion}>
        <button className="btn-secondaire w-full px-2.5" title="Se déconnecter">
          <LogOut size={16} />
          <span className="md:hidden">Se déconnecter</span>
        </button>
      </form>
    </>
  );
}
