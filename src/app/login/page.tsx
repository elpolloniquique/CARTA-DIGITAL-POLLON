import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-red-300">Acceso admin</p>
        <h1 className="mt-3 text-4xl font-black">Panel de administracion</h1>
        <p className="mt-4 text-sm leading-7 text-neutral-300">
          El inicio de sesion del administrador se gestiona desde el panel principal para simplificar
          la conexion con Supabase Auth.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-flex rounded-2xl bg-red-500 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white"
        >
          Ir al panel
        </Link>
      </div>
    </main>
  );
}
