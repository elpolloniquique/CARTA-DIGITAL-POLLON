# Carta Digital El Pollon

Proyecto nuevo reconstruido con `Next.js`, `React`, `Tailwind CSS` y `Supabase`, pensado para verse primero en celular con una interfaz moderna inspirada en las referencias visuales que compartiste.

## Que incluye

- Carta digital movil renovada con:
  - encabezado moderno
  - buscador
  - categorias deslizables
  - hero promocional
  - productos populares
  - grid de platos
  - modal de detalle
  - navegacion inferior
  - menu lateral
- Datos base del menu actual de El Pollon:
  - mismos nombres
  - mismas descripciones
  - mismos precios
- Panel admin base en `/admin` para:
  - iniciar sesion con Supabase Auth
  - importar el menu base
  - editar configuracion general
  - editar categorias
  - crear, editar y eliminar productos
  - ordenar platos con numero de posicion
  - subir fotos a Supabase Storage
  - usar URL de imagen o subir archivo desde tu PC
- Fallback local:
  - si todavia no conectas Supabase, la app publica carga los datos semilla del proyecto para que el diseño ya funcione.

## Stack usado

- `Next.js`
- `React`
- `TypeScript`
- `Tailwind CSS`
- `Supabase`
- `Vercel`

## 1. Instalar y correr local

Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Luego abre:

- Carta publica: [http://localhost:3000](http://localhost:3000)
- Panel admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## 2. Configurar Supabase

### Paso A. Crear proyecto

1. Entra a [Supabase](https://supabase.com/).
2. Crea un proyecto nuevo.
3. Espera a que termine la provision.

### Paso B. Obtener credenciales

En tu proyecto de Supabase ve a:

`Project Settings > API`

Necesitas copiar:

- `Project URL`
- `anon public key`

### Paso C. Crear `.env.local`

En la raiz del proyecto crea un archivo llamado `.env.local` usando `.env.example` como base:

```env
NEXT_PUBLIC_SUPABASE_URL=pega_aqui_tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=pega_aqui_tu_anon_key
```

## 3. Crear tablas, policies y storage

En Supabase ve a:

`SQL Editor > New query`

Abre este archivo del proyecto:

`supabase/sql/setup.sql`

Copia todo su contenido y pegalo en el editor SQL de Supabase. Luego ejecútalo.

Eso crea:

- tabla `categories`
- tabla `products`
- tabla `site_settings`
- bucket `product-images`
- permisos publicos de lectura
- permisos de escritura para usuarios autenticados

## 4. Crear usuario administrador

Como este proyecto usa `Supabase Auth`, crea tu usuario admin asi:

1. Ve a `Authentication > Users`.
2. Usa la opcion para crear un usuario.
3. Define correo y contrasena.
4. Ese mismo correo y contrasena los usaras en `/admin`.

### Acceso desde la carta digital

En el menu lateral rojo de la app ahora existe un acceso pequeno llamado:

- `Iniciar sesion`

Ese boton lleva al panel `/admin` y desde ahi solo podra entrar personal autorizado con su correo y contrasena creados en Supabase Auth.

## 5. Importar el menu actual al panel

Cuando Supabase ya este conectado:

1. Corre el proyecto con `npm run dev`.
2. Entra a `http://localhost:3000/admin`.
3. Inicia sesion con el usuario que creaste en Supabase Auth.
4. Presiona `Importar menu base`.

Eso sube a Supabase:

- las categorias base
- todos los productos actuales
- la configuracion general del sitio

## 6. Cambiar fotos desde el panel

El flujo quedo preparado asi:

1. Entra a `/admin`
2. Selecciona o crea un producto
3. Usa `Subir nueva imagen`
4. La imagen se guarda en el bucket `product-images`
5. Se genera una URL publica
6. Guarda el producto

La carta publica leerá esa nueva imagen automaticamente desde Supabase.

Tambien puedes:

- pegar una `URL de imagen`
- subir una imagen directamente desde tu `PC`
- cambiar nombre, descripcion, precio, categoria y orden del plato

## 7. Mientras aun no tengas fotos finales

El proyecto ya viene con imagenes de internet como placeholder para que el diseño se vea listo desde ahora.

Cuando reemplaces una foto desde el panel:

- el `image_url` del producto se actualiza en la base de datos
- la app publica mostrara esa foto nueva automaticamente

## 8. Desplegar en Vercel

### Paso A. Subir repositorio

Sube este proyecto a GitHub.

### Paso B. Importar en Vercel

1. Ve a [Vercel](https://vercel.com/)
2. Inicia sesion
3. Pulsa `Add New > Project`
4. Importa el repositorio
5. Si Vercel te pregunta por la carpeta del proyecto, selecciona `carta-digital`
6. Verifica que el framework detectado sea `Next.js`
7. En `Environment Variables` agrega:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Paso C. Deploy

Vercel detecta `Next.js` automaticamente. Solo debes desplegar.

### Paso D. Conectar bien Vercel con Supabase

Haz esto para que la carta publicada pueda leer la base de datos:

1. En Vercel entra a tu proyecto.
2. Ve a `Settings`.
3. Ve a `Environment Variables`.
4. Agrega:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

5. Guarda.
6. Luego ve a `Deployments`.
7. Pulsa `Redeploy` para reconstruir el proyecto con esas variables.

### Paso E. Probar panel admin publicado

Cuando Vercel termine, abre tu sitio publicado y entra a:

```text
https://tu-proyecto.vercel.app/admin
```

o abre el acceso `Iniciar sesion` desde el menu lateral rojo.

Desde ahi podras:

- iniciar sesion con Supabase Auth
- importar los datos base
- cambiar fotos
- cambiar precios
- cambiar nombres
- cambiar descripciones
- ordenar platos
- editar WhatsApp, URL web, direccion y textos generales

## 9. Si ya ejecutaste un SQL anterior en Supabase

No pasa nada. Solo vuelve a abrir:

`supabase/sql/setup.sql`

y vuelve a pegarlo en `SQL Editor`.

Ese archivo ya incluye la estructura necesaria para:

- productos
- categorias
- ajustes generales
- bucket de imagenes
- permisos
- campo `sort_order` para ordenar platos desde el panel

## Estructura importante

```text
src/app/page.tsx                      -> carta publica
src/app/admin/page.tsx                -> panel admin
src/components/menu/mobile-menu-app.tsx
src/components/admin/admin-dashboard.tsx
src/data/seed.ts                      -> menu base actual
src/lib/menu.ts                       -> lectura desde Supabase o seed local
src/lib/supabase/client.ts            -> cliente navegador
src/lib/supabase/server.ts            -> cliente servidor
supabase/sql/setup.sql                -> schema + policies + storage
```

## Notas importantes

- El diseño actual esta optimizado primero para celular, como pediste.
- El panel admin ya deja preparada la administracion real de productos, ajustes y fotos.
- Si Supabase no esta configurado, la parte publica igual funciona con datos locales.
- Si luego quieres, el siguiente paso natural es agregar:
  - panel de orden manual
  - favoritos persistentes
  - banners administrables
  - autenticacion con roles
  - historial de cambios

## Comandos utiles

```bash
npm run dev
npm run build
npm run start
npm run lint
```
