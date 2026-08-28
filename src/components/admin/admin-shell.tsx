"use client";

import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Settings,
  UtensilsCrossed,
} from "lucide-react";

import type { AdminSection } from "@/types/admin";

type AdminShellProps = {
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  userEmail: string;
  onLogout: () => void;
  children: React.ReactNode;
};

const NAV_ITEMS: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "settings", label: "Configuracion", icon: Settings },
];

const SECTION_META: Record<AdminSection, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Visitas a la carta digital y platos favoritos en tiempo real",
  },
  menu: {
    title: "Menu",
    subtitle: "Gestiona categorias, productos, precios, orden e imagenes",
  },
  settings: {
    title: "Configuracion",
    subtitle: "Personaliza el header y footer de la carta digital",
  },
};

export function AdminShell({
  activeSection,
  onNavigate,
  userEmail,
  onLogout,
  children,
}: AdminShellProps) {
  const meta = SECTION_META[activeSection];

  return (
    <div className="admin-layout min-h-screen bg-[#eef1f5] text-[#1a1a1a]">
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-[#141414] text-white">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#ef2b2d] text-lg font-black">
              EP
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#ef2b2d]">
                El Pollon
              </p>
              <p className="text-xs text-white/65">Panel administrativo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#ef2b2d] text-white shadow-[0_10px_24px_rgba(239,43,45,0.35)]"
                    : "text-white/75 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-5 py-5">
          <p className="truncate text-sm text-white/85">{userEmail}</p>
          <p className="mt-1 text-xs font-semibold text-[#f8c250]">Super Admin</p>
          <button
            type="button"
            onClick={onLogout}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <LogOut className="size-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <div className="admin-main ml-[260px] min-h-screen">
        <header className="sticky top-0 z-30 border-b border-black/8 bg-[#eef1f5]/90 px-8 py-6 backdrop-blur">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-neutral-500">
            Administracion / {meta.title}
          </p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[2rem] font-black tracking-tight text-[#111]">{meta.title}</h1>
              <p className="mt-1 text-sm text-neutral-600">{meta.subtitle}</p>
            </div>
            <div className="hidden items-center gap-2 rounded-2xl border border-black/8 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm md:flex">
              <BarChart3 className="size-4 text-[#ef2b2d]" />
              Carta digital en vivo
            </div>
          </div>
        </header>

        <main className="px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
