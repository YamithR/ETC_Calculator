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

## Desarrollo

### Requisitos

- Node.js >= 22
- npm >= 10

### Instalación

```bash
git clone https://github.com/YamithR/ETC_Calculator.git
cd ETC_Calculator
npm install
```

### Ejecutar en modo desarrollo

```bash
npm start
```

### Empaquetar

```bash
# Linux (.deb)
npm run build:linux

# Windows (.exe) — requiere wine64
npm run build:win
```

Los artefactos se generan en la carpeta `dist/`.

## Tecnologías

- [Electron](https://www.electronjs.org/) — Escritorio multiplataforma
- HTML / CSS / JavaScript vanilla
- [electron-builder](https://www.electron.build/) — Empaquetado

## Licencia

MIT
