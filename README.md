# Astral Fit

Aplicación web de entrenamiento personal con diseño minimalista blanco y verde.

## Incluye

- Pantalla de bienvenida y registro/inicio de sesión.
- Perfil con edad, peso, estatura, objetivo, experiencia y equipamiento.
- Secciones Inicio, Rutina, Progreso y Asistente.
- Selección de pecho, espalda, piernas y abdominales.
- Rutinas de demostración con técnica, material, series, repeticiones, descanso y enlaces de búsqueda de tutoriales en YouTube.
- Registro manual de ejercicios.
- Historial de actividad.
- Integración preparada para Firebase y un backend de IA.

**Importante:** hasta configurar Firebase y el backend, la aplicación funciona parcialmente en modo de demostración. Los datos de demostración no se sincronizan entre dispositivos y la IA no estará activa.

## Requisitos

- Node.js 20 o superior recomendado.
- Una cuenta de GitHub.
- Una cuenta de Firebase.
- Para activar el asistente: un proyecto de Google AI/Gemini y un backend desplegado.

## Ejecutar en tu ordenador

1. Descarga y descomprime el proyecto.
2. Instala Node.js desde https://nodejs.org/
3. Abre una terminal en la carpeta `astral-fit`.
4. Ejecuta:

```bash
npm install
npm run dev
```

5. Abre la dirección local que muestre Vite en la terminal.

Para comprobar la versión de producción:

```bash
npm run build
npm run preview
```

## Conectar Firebase

1. Entra en https://console.firebase.google.com/ y crea un proyecto.
2. Añade una aplicación web y copia la configuración de Firebase.
3. En Authentication, activa el proveedor **Correo electrónico/contraseña**.
4. Crea una base de datos de Cloud Firestore.
5. Copia `.env.example` a un archivo llamado `.env`.
6. Rellena `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_APP_ID`.
7. Configura reglas de Firestore antes de guardar información real.
8. Reinicia el servidor de desarrollo después de editar `.env`.

### Reglas iniciales sugeridas para Firestore

Estas reglas son una base de mínimo privilegio para las colecciones usadas por la aplicación. Revisa y prueba las reglas en el simulador de Firebase antes de usar datos reales. Solo usuarios autenticados pueden leer/escribir su documento y sus propios registros.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, create, update: if request.auth != null
        && request.auth.uid == userId;
      allow delete: if request.auth != null
        && request.auth.uid == userId;
    }
    match /workouts/{workoutId} {
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid;
      allow read, delete: if request.auth != null
        && resource.data.uid == request.auth.uid;
      allow update: if request.auth != null
        && resource.data.uid == request.auth.uid
        && request.resource.data.uid == request.auth.uid;
    }
  }
}
```

No publiques claves privadas ni contraseñas. La configuración Firebase del cliente no sustituye las reglas de seguridad.

## Activar Gemini de forma segura

El frontend está preparado para llamar a una URL de backend indicada por `VITE_AI_ENDPOINT`. El frontend **no debe llamar a Gemini directamente con una clave secreta**.

El backend debe:
- Verificar el token Firebase del usuario.
- Validar el cuerpo y limitar el tamaño y frecuencia de las solicitudes.
- Guardar la clave Gemini en secretos del servidor, nunca en variables `VITE_*`.
- Aceptar `action: "routine"` y devolver `{ "exercises": [...] }`.
- Aceptar `action: "chat"` y devolver `{ "reply": "..." }`.
- Validar la salida de IA antes de enviarla al navegador.
- Aplicar límites de uso y manejo de errores.

Cuando despliegues el backend, configura `VITE_AI_ENDPOINT` con su URL HTTPS y vuelve a construir la web.

## Publicar en GitHub Pages

GitHub Pages publica la interfaz estática; no ejecuta el backend de IA.

1. Crea un repositorio público llamado `astral-fit` en GitHub.
2. Sube los archivos del proyecto (incluido `src/`, `package.json`, `index.html` y `vite.config.js`).
3. En la pestaña **Settings → Pages**, selecciona **GitHub Actions** como origen.
4. Crea `.github/workflows/deploy.yml` con el siguiente contenido.
5. En GitHub, abre **Settings → Secrets and variables → Actions** y añade las variables `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` y `VITE_AI_ENDPOINT` si ya has configurado los servicios.
6. Ejecuta el workflow y espera a que termine correctamente.

```yaml
name: Deploy Astral Fit to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm install
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_AI_ENDPOINT: ${{ secrets.VITE_AI_ENDPOINT }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Si el nombre del repositorio no es `astral-fit`, puede ser necesario ajustar `base` en `vite.config.js` a `/<nombre-del-repositorio>/`. Para un repositorio llamado `usuario.github.io`, usa `base: "/"`.

## Nota de salud

Las rutinas son orientativas. Ajusta la dificultad a la experiencia real, prioriza la técnica y detén el ejercicio si aparece dolor o algún síntoma preocupante. La aplicación no diagnostica enfermedades ni reemplaza a profesionales sanitarios.
