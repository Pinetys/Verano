# 🚀 Guía de Despliegue en GitHub Pages para "Verano"

Esta aplicación de campamento y entrenamientos de baloncesto ha sido preparada y optimizada con **arquitectura híbrida fuera de línea (resiliencia local)** para tu repositorio específico [Pinetys/Verano](https://github.com/Pinetys/Verano). 

Dado que GitHub Pages es una plataforma exclusiva para hosting de archivos estáticos (cliente), hemos diseñado un motor de contingencia inteligente. Si el navegador no puede encontrar el servidor de Express (por ejemplo, al estar alojado de forma estática en GitHub Pages), **la aplicación lo detecta de manera automatizada y conmuta al modelo biomecánico local**, el cual calcula estimulaciones calóricas, sudoración estival, fatiga rotuliana, y genera rutinas personalizadas de forma inmediata en el cliente.

---

## 🛠️ Modificaciones Realizadas para la Compatibilidad

1. **Vite Base Path (`vite.config.ts`)**: Se configuró `base: './'` para asegurar que todos los recursos (JS, CSS, imágenes) se carguen mediante rutas relativas. Esto evita el clásico error de "pantalla en blanco" que ocurre por directivas absolutas en las URL secundarias de GitHub Pages (como `Pinetys.github.io/Verano/`).
2. **Modelo de Análisis y Rutinas IA Local**: Implementamos conmutaciones dentro de `AIPlanAnalysis.tsx` y `PlayerProfileWorkspace.tsx` para realizar simulaciones de última generación en el propio navegador si la conexión al servidor de Node/Express no existe.
3. **Flujo de Despliegue Automatizado (`.github/workflows/deploy.yml`)**: Diseñamos un flujo de trabajo para GitHub Actions que se activa automáticamente al subir tus cambios a la rama principal de tu repositorio.

---

## 📋 Pasos para Publicar en GitHub Pages

Sigue estos sencillos pasos para activar tu sitio en vivo:

### Paso 1: Enlazar y Subir el Código a tu Repositorio
Como ya tienes tu repositorio en `https://github.com/Pinetys/Verano`:
1. Sube el código de este proyecto a tu repositorio utilizando Git:
   ```bash
   git init
   git add .
   git commit -m "Preparar y optimizar para GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/Pinetys/Verano.git
   git push -u origin main --force
   ```

### Paso 2: Permitir la Escritura/Despliegue a GitHub Actions
Por defecto, GitHub bloquea los permisos de escritura de los flujos automatizados de Actions. Para permitir que compile y publique la web:
1. En tu repositorio [Pinetys/Verano](https://github.com/Pinetys/Verano), haz clic en la pestaña **Settings** (Configuración) en el menú superior.
2. En la barra lateral izquierda, baja hasta la sección **Actions** y selecciona **General**.
3. Desplázate hasta el final de la pantalla donde dice **Workflow permissions**.
4. Selecciona la opción **Read and write permissions** (Permisos de lectura y escritura).
5. Haz clic en el botón **Save** (Guardar).

### Paso 3: Disparar el Despliegue Automatizado
¡Ya está todo listo! 
1. Realiza cualquier cambio o simplemente haz tu `push` inicial a la rama `main` o `master`.
2. Dirígete a la pestaña **Actions** de tu repositorio. Verás la tarea llamada **Deploy to GitHub Pages** compilarse en tiempo real.
3. Una vez que termine (se pondrá en color verde), se habrá creado automáticamente una rama de compilado rápido llamada `gh-pages`.

### Paso 4: Cambiar el origen de Pages
1. Vuelve a **Settings** en tu repositorio de GitHub.
2. Selecciona **Pages** en la barra lateral izquierda.
3. Verás la sección **Build and deployment**. Asegúrate de que:
   - *Source* esté configurado como **Deploy from a branch**.
   - *Branch* esté seleccionada como **gh-pages** y la carpeta de origen sea `/ (root)`.
4. ¡Listo! Arriba aparecerá tu enlace público oficial:
   👉 **`https://Pinetys.github.io/Verano/`**

---

¡Disfruta de tu planificador estival de baloncesto totalmente funcional y responsivo en la web! 🏀⚡
