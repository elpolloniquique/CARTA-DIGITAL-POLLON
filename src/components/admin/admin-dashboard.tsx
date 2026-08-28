"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import { AdminLogin } from "@/components/admin/admin-login";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardView } from "@/components/admin/views/dashboard-view";
import { MenuView } from "@/components/admin/views/menu-view";
import { SettingsView } from "@/components/admin/views/settings-view";
import { defaultSettings } from "@/data/seed";
import {
  importSeedMenu,
  loadAdminData,
  mapCategoryToDb,
  mapProductToDb,
  mapSettingsToDb,
  uploadProductImage,
  uploadSiteAsset,
} from "@/lib/admin-data";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import type { AdminSection } from "@/types/admin";
import type { Category, Product, SiteSettings } from "@/types/menu";

export function AdminDashboard() {
  const isConfigured = hasSupabaseEnv();
  const [loading, setLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Inicia sesion para administrar tu carta.");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const loadDashboardData = useCallback(async () => {
    if (!isConfigured) return;

    setLoading(true);
    setStatusMessage("Cargando panel...");

    try {
      const data = await loadAdminData();
      setSettings(data.settings);
      setCategories(data.categories);
      setProducts(data.products);
      setStatusMessage("Panel actualizado.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "No pudimos cargar los datos del panel.",
      );
    } finally {
      setLoading(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    if (!isConfigured) return;

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const userEmail = data.session?.user.email ?? null;
      setSessionEmail(userEmail);

      if (userEmail) {
        void loadDashboardData();
      }
    });
  }, [isConfigured, loadDashboardData]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConfigured) return;

    setLoading(true);
    setStatusMessage("Iniciando sesion...");

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      setSessionEmail(data.user.email ?? email);
      setStatusMessage("Sesion iniciada correctamente.");
      await loadDashboardData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "No fue posible iniciar sesion.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    if (!isConfigured) return;

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSessionEmail(null);
    setCategories([]);
    setProducts([]);
    setStatusMessage("Sesion cerrada.");
  }

  async function handleSaveSettings() {
    if (!isConfigured) return;

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("site_settings").upsert(mapSettingsToDb(settings));
      if (error) throw error;
      setStatusMessage("Configuracion guardada.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "No pudimos guardar ajustes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImportSeed() {
    if (!isConfigured) return;

    setLoading(true);
    try {
      await importSeedMenu();
      setStatusMessage("Menu base importado correctamente.");
      await loadDashboardData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "No pudimos importar el menu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCategory(category: Category) {
    if (!isConfigured) return;

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("categories").upsert(mapCategoryToDb(category));
      if (error) throw error;
      setStatusMessage("Categoria guardada.");
      await loadDashboardData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "No pudimos guardar la categoria.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!isConfigured || !categoryId) return;

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("categories").delete().eq("id", categoryId);
      if (error) throw error;
      setStatusMessage("Categoria eliminada.");
      await loadDashboardData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "No pudimos eliminar la categoria.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct(product: Product) {
    if (!isConfigured) return;

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const payload = mapProductToDb({
        ...product,
        id: product.id || slugify(product.name),
      });
      const { error } = await supabase.from("products").upsert(payload);
      if (error) throw error;
      setStatusMessage("Producto guardado.");
      await loadDashboardData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "No pudimos guardar el producto.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(productId: string) {
    if (!isConfigured || !productId) return;
    if (!window.confirm("Eliminar este producto de forma permanente?")) return;

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      setStatusMessage("Producto eliminado.");
      await loadDashboardData();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "No pudimos eliminar el producto.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleProductActive(product: Product) {
    await handleSaveProduct({
      ...product,
      isActive: product.isActive === false,
    });
  }

  function handleDuplicateProduct(product: Product) {
    const copy: Product = {
      ...product,
      id: "",
      name: `${product.name} (copia)`,
      sortOrder: (product.sortOrder ?? 0) + 1,
    };
    void handleSaveProduct(copy);
  }

  if (!sessionEmail) {
    return (
      <AdminLogin
        email={email}
        password={password}
        loading={loading}
        statusMessage={statusMessage}
        isConfigured={isConfigured}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSignIn}
      />
    );
  }

  return (
    <AdminShell
      activeSection={activeSection}
      onNavigate={setActiveSection}
      userEmail={sessionEmail}
      onLogout={() => void handleSignOut()}
    >
      <div className="mb-5 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">
        {statusMessage}
      </div>

      {activeSection === "dashboard" ? <DashboardView products={products} /> : null}

      {activeSection === "menu" ? (
        <MenuView
          categories={categories}
          products={products}
          loading={loading}
          onSaveCategory={handleSaveCategory}
          onDeleteCategory={handleDeleteCategory}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onDuplicateProduct={handleDuplicateProduct}
          onToggleProductActive={handleToggleProductActive}
          onUploadImage={uploadProductImage}
        />
      ) : null}

      {activeSection === "settings" ? (
        <SettingsView
          settings={settings}
          loading={loading}
          onChange={setSettings}
          onSave={handleSaveSettings}
          onImportSeed={handleImportSeed}
          onUploadHeroImage={(file) => uploadSiteAsset(file, "hero")}
          onUploadLogoImage={(file) => uploadSiteAsset(file, "logo")}
        />
      ) : null}
    </AdminShell>
  );
}
