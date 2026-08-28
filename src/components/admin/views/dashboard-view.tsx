/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Heart, RefreshCw, TrendingUp, Users } from "lucide-react";

import { fetchAdminAnalytics } from "@/lib/analytics";
import type { AdminAnalytics } from "@/types/admin";
import type { Product } from "@/types/menu";

type DashboardViewProps = {
  products: Product[];
};

type PeriodFilter = "today" | "week" | "month";

function getVisitValue(analytics: AdminAnalytics, period: PeriodFilter) {
  if (period === "today") return analytics.visits.today;
  if (period === "month") return analytics.visits.month;
  return analytics.visits.week;
}

function BarChart({
  data,
  labelKey,
  valueKey,
  color = "#ef2b2d",
}: {
  data: { [key: string]: string | number }[];
  labelKey: string;
  valueKey: string;
  color?: string;
}) {
  const max = Math.max(...data.map((item) => Number(item[valueKey])), 1);

  return (
    <div className="flex h-56 items-end gap-2">
      {data.map((item) => {
        const value = Number(item[valueKey]);
        const height = `${Math.max((value / max) * 100, value > 0 ? 8 : 2)}%`;

        return (
          <div key={String(item[labelKey])} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{ height, backgroundColor: color }}
                title={`${value}`}
              />
            </div>
            <span className="text-[0.65rem] font-semibold uppercase text-neutral-500">
              {String(item[labelKey])}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardView({ products }: DashboardViewProps) {
  const [period, setPeriod] = useState<PeriodFilter>("week");
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const productStats = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        name: product.name,
        categorySlug: product.categorySlug,
        imageUrl: product.imageUrl,
      })),
    [products],
  );

  const refreshAnalytics = useCallback(async () => {
    const nextAnalytics = await fetchAdminAnalytics(productStats);
    setAnalytics(nextAnalytics);
    setLoading(false);
  }, [productStats]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const nextAnalytics = await fetchAdminAnalytics(productStats);
      if (mounted) {
        setAnalytics(nextAnalytics);
        setLoading(false);
      }
    };

    const startTimer = window.setTimeout(() => {
      void run();
    }, 0);

    const interval = window.setInterval(() => {
      void run();
    }, 15000);

    return () => {
      mounted = false;
      window.clearTimeout(startTimer);
      window.clearInterval(interval);
    };
  }, [productStats]);

  const visits = analytics?.visits;
  const favorites = analytics?.favorites ?? [];
  const currentVisits = analytics ? getVisitValue(analytics, period) : 0;
  const peakHour =
    visits?.byHour.reduce(
      (best, item) => (item.count > best.count ? item : best),
      { hour: 0, count: 0 },
    ) ?? { hour: 0, count: 0 };

  const hourlyData =
    visits?.byHour
      .filter((item) => item.hour >= 8 && item.hour <= 23)
      .map((item) => ({
        label: `${item.hour}h`,
        count: item.count,
      })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-black/8 bg-white p-1 shadow-sm">
          {(
            [
              ["today", "Hoy"],
              ["week", "Semana"],
              ["month", "Mes"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                period === value
                  ? "bg-[#ef2b2d] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void refreshAnalytics();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Visitas",
            value: currentVisits,
            icon: Eye,
            hint: period === "today" ? "Hoy" : period === "month" ? "Este mes" : "Ultimos 7 dias",
          },
          {
            label: "Visitas totales",
            value: visits?.total ?? 0,
            icon: Users,
            hint: "Registro acumulado",
          },
          {
            label: "Likes totales",
            value: favorites.reduce((sum, item) => sum + item.likes, 0),
            icon: Heart,
            hint: "Corazones en platos",
          },
          {
            label: "Hora pico",
            value: `${peakHour.hour}:00`,
            icon: TrendingUp,
            hint: `${peakHour.count} visitas`,
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-black/8 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-black text-[#111]">
                    {typeof card.value === "number" ? card.value.toLocaleString("es-CL") : card.value}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">{card.hint}</p>
                </div>
                <div className="rounded-xl bg-[#ef2b2d]/10 p-3 text-[#ef2b2d]">
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-black text-[#111]">Visitas por dia</h2>
          <p className="mt-1 text-sm text-neutral-500">Evolucion semanal de la carta digital</p>
          <div className="mt-6">
            <BarChart
              data={(visits?.byDay ?? []).map((item) => ({
                label: item.label,
                count: item.count,
              }))}
              labelKey="label"
              valueKey="count"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-black text-[#111]">Visitas por hora</h2>
          <p className="mt-1 text-sm text-neutral-500">Horarios con mas trafico (8:00 - 23:00)</p>
          <div className="mt-6">
            <BarChart
              data={hourlyData}
              labelKey="label"
              valueKey="count"
              color="#f97316"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#111]">Platos favoritos de los clientes</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Ranking en tiempo real segun los likes del corazon en la carta
            </p>
          </div>
          <span className="rounded-full bg-[#ef2b2d]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#ef2b2d]">
            En vivo
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500">
            Aun no hay likes registrados. Cuando los clientes den corazon a un plato, aparecera aqui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full min-w-[720px]">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Imagen</th>
                  <th>Plato</th>
                  <th>Categoria</th>
                  <th>Likes</th>
                </tr>
              </thead>
              <tbody>
                {favorites.slice(0, 10).map((item, index) => (
                  <tr key={item.productId}>
                    <td className="font-bold text-neutral-500">{index + 1}</td>
                    <td>
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="size-12 rounded-lg object-cover"
                      />
                    </td>
                    <td className="font-semibold text-[#111]">{item.productName}</td>
                    <td className="text-neutral-500">{item.categorySlug}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ef2b2d]/10 px-3 py-1 text-sm font-black text-[#ef2b2d]">
                        <Heart className="size-3.5 fill-current" />
                        {item.likes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
