import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login — Nenggala Academy",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — desktop only */}
      <aside className="relative hidden lg:flex lg:w-1/2">
        <Image
          src="/images/hero-banner.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-ink/75" />

        <div className="relative z-10 flex w-full flex-col justify-between p-10 text-paper xl:p-14">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:text-brand"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-brand font-display text-2xl font-bold">
                N
              </div>
              <div>
                <p className="font-display text-xl font-bold uppercase tracking-widest">
                  Nenggala
                </p>
                <p className="text-xs uppercase tracking-widest text-paper/60">
                  Academy
                </p>
              </div>
            </div>

            <h2 className="mt-10 font-display text-4xl font-bold uppercase leading-[1.05] xl:text-5xl">
              Berlatih,
              <br />
              Berkarya,
              <br />
              <span className="text-brand">Berprestasi!</span>
            </h2>
            <p className="mt-5 max-w-md text-sm text-paper/70">
              Sekolah beladiri Taekwondo, Nunchaku-Do, dan Gymnastic di Jakarta,
              Tangerang, dan Bogor.
            </p>
          </div>

          <p className="text-xs text-paper/40">
            © {new Date().getFullYear()} Nenggala Academy
          </p>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="flex flex-1 flex-col bg-paper">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-4 lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest transition-colors hover:text-brand"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand font-display text-base font-bold text-paper">
              N
            </div>
            <p className="font-display text-sm font-bold uppercase tracking-widest">
              Nenggala
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8 md:px-12">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
