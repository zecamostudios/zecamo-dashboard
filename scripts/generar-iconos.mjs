// ============================================================================
// Zecamo Dashboard — Genera el favicon y los iconos desde el logotipo real.
//
// ⚠️ EL LOGOTIPO REAL ES `public/brand/logo-z.png`.
// Viene del repo `zecamo-landing`. NO usar `logo-z.svg` de ahí: ese archivo es
// un marcador de posición y lo dice adentro ("TODO: reemplazar con logo real").
// Si alguien genera el icono desde el SVG, publica una Z genérica dibujada a
// mano en vez de la marca.
//
// EL RECORTE, Y POR QUÉ ES ASÍ
// El original trae mucho aire alrededor de la Z. A 16 píxeles eso deja la marca
// diminuta en el centro de un cuadrado casi vacío. Se recorta al 80% CENTRADO
// del original, que agranda la Z conservando el degradé del fondo tal cual.
//
// Se probó recomponer la Z sobre un color plano muestreado del archivo y NO
// sirve: el fondo tiene un degradé sutil, así que quedaba una costura visible
// entre el color plano y el borde del logo.
//
// Correrlo: node scripts/generar-iconos.mjs   (solo si cambia la marca)
// ============================================================================
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const LOGO = "public/brand/logo-z.png";
/** Qué proporción del original se conserva. Menos = la Z se ve más grande. */
const RECORTE = 0.8;

async function icono(lado) {
  const m = await sharp(LOGO).metadata();
  const w = Math.round(m.width * RECORTE);
  const h = Math.round(m.height * RECORTE);
  return sharp(LOGO)
    .extract({
      left: Math.round((m.width - w) / 2),
      top: Math.round((m.height - h) / 2),
      width: w,
      height: h,
    })
    .resize(lado, lado, { fit: "cover" })
    // `ensureAlpha` no es decorativo: el contenedor .ico EXIGE que el PNG de
    // adentro sea RGBA, y el logotipo de Zecamo no trae canal alfa. Sin esto,
    // el build de Next muere con "Format error decoding Ico: The PNG is not in
    // RGBA format!" — un error que apunta al .ico y cuya causa está en el PNG.
    .ensureAlpha()
    .png()
    .toBuffer();
}

/**
 * Envuelve un PNG en un contenedor .ico.
 *
 * Los navegadores piden /favicon.ico aunque el HTML declare otro icono, así que
 * sin este archivo queda un 404 en cada visita. El formato admite un PNG adentro
 * tal cual desde Windows Vista: son 22 bytes de cabecera, y no vale sumar una
 * dependencia solo para esto.
 */
function envolverIco(datos, lado) {
  const cab = Buffer.alloc(22);
  cab.writeUInt16LE(0, 0);
  cab.writeUInt16LE(1, 2);
  cab.writeUInt16LE(1, 4);
  cab.writeUInt8(lado, 6);
  cab.writeUInt8(lado, 7);
  cab.writeUInt8(0, 8);
  cab.writeUInt8(0, 9);
  cab.writeUInt16LE(1, 10);
  cab.writeUInt16LE(32, 12);
  cab.writeUInt32LE(datos.length, 14);
  cab.writeUInt32LE(22, 18);
  return Buffer.concat([cab, datos]);
}

// Next sirve estos tres por convención, solo por estar en app/, y emite las
// etiquetas del <head> él mismo.
writeFileSync("app/icon.png", await icono(512));
writeFileSync("app/apple-icon.png", await icono(180));
writeFileSync("app/favicon.ico", envolverIco(await icono(48), 48));

console.log("Iconos generados desde el logotipo real de Zecamo.");
