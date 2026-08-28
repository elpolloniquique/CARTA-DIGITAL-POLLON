"use client";

import { SiteImageField } from "@/components/admin/site-image-field";
import type { SiteSettings } from "@/types/menu";

type SettingsViewProps = {
  settings: SiteSettings;
  loading: boolean;
  onChange: (settings: SiteSettings) => void;
  onSave: () => Promise<void>;
  onImportSeed: () => Promise<void>;
  onUploadHeroImage: (file: File) => Promise<string>;
  onUploadLogoImage: (file: File) => Promise<string>;
};

export function SettingsView({
  settings,
  loading,
  onChange,
  onSave,
  onImportSeed,
  onUploadHeroImage,
  onUploadLogoImage,
}: SettingsViewProps) {
  function updateField<Key extends keyof SiteSettings>(key: Key, value: SiteSettings[Key]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={loading}
          className="rounded-xl bg-[#ef2b2d] px-5 py-2.5 text-sm font-bold text-white"
        >
          Guardar cambios
        </button>
        <button
          type="button"
          onClick={() => void onImportSeed()}
          disabled={loading}
          className="rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold"
        >
          Importar menu base
        </button>
      </div>

      <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#111]">Imagenes de la carta</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Foto de fondo del inicio y logotipo visibles en la carta publica
        </p>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <SiteImageField
            label="Foto de fondo (debajo del header)"
            description="Se muestra detras de los botones de categorias en el inicio."
            value={settings.heroBackgroundUrl}
            onChange={(url) => updateField("heroBackgroundUrl", url)}
            onUpload={onUploadHeroImage}
            previewClassName="h-44 w-full object-cover"
          />
          <SiteImageField
            label="Logotipo El Pollon"
            description="Aparece en el header y menu lateral. Si esta vacio, se muestra el texto."
            value={settings.logoUrl}
            onChange={(url) => updateField("logoUrl", url)}
            onUpload={onUploadLogoImage}
            previewClassName="mx-auto h-24 w-24 object-contain"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#111]">Header de la carta</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Titulo, subtitulo y datos visibles en la parte superior
          </p>
          <div className="mt-5 space-y-4">
            {(
              [
                ["restaurantName", "Nombre del restaurante"],
                ["locationLabel", "Ubicacion corta"],
                ["heroTitle", "Titulo principal"],
                ["heroSubtitle", "Subtitulo principal"],
                ["primaryColor", "Color primario"],
                ["secondaryColor", "Color secundario"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-semibold text-neutral-600">{label}</span>
                <input
                  value={settings[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#111]">Footer y contacto</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Enlaces, direccion y horarios del pie de pagina
          </p>
          <div className="mt-5 space-y-4">
            {(
              [
                ["whatsappUrl", "URL de WhatsApp"],
                ["deliveryUrl", "URL del sitio web"],
                ["address", "Direccion"],
                ["schedule", "Horario de atencion"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-semibold text-neutral-600">{label}</span>
                <input
                  value={settings[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none"
                />
              </label>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-[#111]">Vista previa rapida</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-black/8">
          {settings.heroBackgroundUrl ? (
            <div className="relative h-44">
              <img
                src={settings.heroBackgroundUrl}
                alt="Vista previa del hero"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="mb-2 h-10 object-contain"
                  />
                ) : null}
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                  {settings.locationLabel}
                </p>
                <h3 className="mt-1 text-2xl font-black">{settings.heroTitle}</h3>
              </div>
            </div>
          ) : (
            <div
              className="px-6 py-8 text-white"
              style={{
                background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
              }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                {settings.locationLabel}
              </p>
              <h3 className="mt-2 text-3xl font-black">{settings.heroTitle}</h3>
              <p className="mt-2 max-w-xl text-sm text-white/85">{settings.heroSubtitle}</p>
            </div>
          )}
          <div className="grid gap-2 bg-neutral-50 px-6 py-5 text-sm text-neutral-700 sm:grid-cols-3">
            <p>{settings.address}</p>
            <p>{settings.schedule}</p>
            <p className="truncate">{settings.whatsappUrl}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
