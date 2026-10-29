import Link from "next/link";

export default function PageIntrouvable() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-5xl font-bold text-primaire">404</p>
      <h1 className="mt-2 text-xl font-semibold">Page introuvable</h1>
      <p className="mt-2 text-attenue">Cette page n&apos;existe pas ou a été supprimée.</p>
      <Link href="/" className="btn-primaire mt-6">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
