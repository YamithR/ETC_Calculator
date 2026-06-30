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

---

## GNOME Shell Extension

### Instalación

```bash
# Enlazar la extensión
ln -s "$PWD/etc-calculator@yamithr" ~/.local/share/gnome-shell/extensions/etc-calculator@yamithr

# Reiniciar GNOME Shell (Alt+F2 → r, escribir 'r' y Enter)

# Habilitar
gnome-extensions enable etc-calculator@yamithr
```

Aparecerá un indicador **ETC** en el panel superior. Al hacer clic se despliega el calculador.

### Desarrollo

Los cambios en `extension.js` o `stylesheet.css` se aplican al recargar la extensión:

```bash
# Recargar (Alt+F2 → r)
# O deshabilitar/habilitar:
gnome-extensions disable etc-calculator@yamithr && sleep 0.5 && gnome-extensions enable etc-calculator@yamithr
```

### Logs

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

---

## Desktop App (Electron)

### Requisitos

- Node.js >= 22
- npm >= 10

### Instalación

```bash
npm install
```

### Ejecutar

```bash
npm start
```

### Empaquetar

```bash
# Linux (.deb)
npm run build:linux

# Windows (.exe)
npm run build:win
```

Los artefactos se generan en la carpeta `dist/`.

---

## Tecnologías

- 🧩 **GNOME Shell Extension:** GJS + St (GNOME Shell Toolkit)
- 🖥️ **Desktop:** [Electron](https://www.electronjs.org/) + [electron-builder](https://www.electron.build/)
- 🌐 **Web:** HTML / CSS / JavaScript vanilla

## Licencia

MIT
