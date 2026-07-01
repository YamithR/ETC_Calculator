# ETC Calculator

**Estimated Cargo Completion Time Calculator**

Herramienta para calcular tiempos estimados de finalización de carga marítima, incluyendo tiempos intermedios, desatraque e inspección subacuática.

## Características

- Cálculo de **Loading Time**, **Dead Time** y **Total Completion Time**
- Cálculo de **Intermediate Time** con waiting time
- Estimación de fechas/hora para: Intermediate, Unberthing, Underwater Inspection y ETC final
- Soporte de **expresiones matemáticas** en los campos de entrada (`+`, `-`, `*`, `/`, `(`, `)`)
- Validaciones integradas
- Actualización de resultados en **tiempo real**
- Interfaz **corporate minimalista** (azul, blanco, beige)

## Descarga

Descarga la última versión desde [Releases](https://github.com/YamithR/ETC_Calculator/releases).

| Plataforma | Archivo |
|-----------|---------|
| Linux (.deb) | `ETC_Calculator_x.x.x_amd64.deb` |
| Windows (.exe) | `ETC_Calculator Setup x.x.x.exe` |

## Versiones

Este proyecto tiene **tres versiones** paralelas:

| Versión | Plataforma | Carpeta |
|---------|-----------|---------|
| 🌐 Web Prototype | Cualquier navegador | `index.html` |
| 🖥️ Desktop (Electron) | Linux (.deb) / Windows (.exe) | `main.js` + `preload.js` + `package.json` |
| 🧩 GNOME Shell Extension | Linux con GNOME 45+ | `etc-calculator@yamithr/` |
| 🤖 Android (.apk) | Android 12+ | `index.html` + `capacitor.config.json` |

---

## GNOME Shell Extension

Añade un indicador **ETC** en el panel superior. Al hacer clic se despliega el calculador completo con todos los cálculos en tiempo real.

### Requisitos

- **GNOME Shell 45, 46, 47 o 48** (comprobar con `gnome-shell --version`)
- Linux con sesión **Wayland** o **Xorg**

### Instalación (paso a paso)

**Paso 1 — Clonar el repositorio** (si no lo tienes ya):

```bash
git clone https://github.com/YamithR/ETC_Calculator.git
cd ETC_Calculator
```

**Paso 2 — Crear el enlace simbólico** a la carpeta de extensiones de GNOME:

```bash
ln -sfn "$PWD/etc-calculator@yamithr" ~/.local/share/gnome-shell/extensions/etc-calculator@yamithr
```

Verifica que el enlace sea correcto:

```bash
ls -la ~/.local/share/gnome-shell/extensions/etc-calculator@yamithr/
# Debe mostrar: ... -> /ruta/completa/ETC_Calculator/etc-calculator@yamithr
# Y dentro debe aparecer: extension.js  metadata.json  stylesheet.css
```

**Paso 3 — Cerrar sesión y volver a iniciarla**

En **Wayland** (el más común en GNOME moderno) no se puede reiniciar el shell. Debes cerrar sesión y volver a entrar para que GNOME detecte la nueva extensión.

**Paso 4 — Habilitar la extensión**

Una vez que hayas iniciado sesión de nuevo, abre una terminal y ejecuta:

```bash
gnome-extensions enable etc-calculator@yamithr
```

Si el comando no devuelve error, la extensión está activada.

**Paso 5 — Verificar que funciona**

Busca el indicador **ETC** en el panel superior (esquina superior derecha, junto al reloj). Haz clic para abrir el calculador.

Si no ves el indicador, comprueba los logs:

```bash
journalctl -o cat /usr/bin/gnome-shell --since "5 min ago" | grep -i "etc"
```

### Solución de problemas

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| No aparece **ETC** en el panel | El enlace simbólico apunta a la ruta incorrecta | Repite el Paso 2 con `ln -sfn RUTA_CORRECTA` |
| La extensión no se encuentra | No reiniciaste sesión después de crear el enlace | Cierra sesión y vuelve a entrar (Paso 3) |
| `gnome-extensions enable` falla | El UUID de `metadata.json` no coincide con el nombre de la carpeta | Verifica que la carpeta se llame exactamente `etc-calculator@yamithr` |
| Error en logs: `Requiring St, version none` | GNOME Shell no pudo cargar la extensión | Revisa `journalctl` para ver el error completo y repórtalo |

### Desarrollo (después de la instalación inicial)

Cuando edites `extension.js` o `stylesheet.css`, recarga la extensión sin reiniciar sesión:

```bash
gnome-extensions disable etc-calculator@yamithr
gnome-extensions enable etc-calculator@yamithr
```

Para ver errores de JavaScript en tiempo real:

```bash
journalctl -o cat /usr/bin/gnome-shell -f
```

---

## Android App (Capacitor)

Aplicación Android nativa generada con [Capacitor](https://capacitorjs.com/) a partir del mismo `index.html`.

### Requisitos

- Node.js >= 22
- npm >= 10
- **Android Studio** (instalado vía `sudo snap install android-studio --classic`)

### Preparar el proyecto Android

```bash
# Sincronizar web app con proyecto Android
npx cap sync

# Abrir en Android Studio para build
npx cap open android
```

### Build del .apk desde terminal

```bash
cd android
./gradlew assembleDebug
```

El `.apk` se genera en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

> **Nota:** La primera vez que builds, Gradle descarga dependencias (~300 MB). Asegúrate de tener buena conexión a internet.

---

## Tecnologías

- 🤖 **Android:** [Capacitor](https://capacitorjs.com/) + WebView nativo
- 🧩 **GNOME Shell Extension:** GJS + St (GNOME Shell Toolkit)
- 🖥️ **Desktop:** [Electron](https://www.electronjs.org/) + [electron-builder](https://www.electron.build/)
- 🌐 **Web:** HTML / CSS / JavaScript vanilla

## Licencia

MIT
