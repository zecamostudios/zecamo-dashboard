// ============================================================================
// Zecamo Dashboard — Genera el favicon y los iconos.
//
// La marca del panel ya existía en pantalla: la "Z" blanca sobre el degradé
// azul que está arriba de la barra lateral. El icono la reusa en vez de
// inventar otra cosa, así la pestaña y la aplicación dicen lo mismo.
//
// La "Z" va dibujada como TRAZADO, no como texto: así no depende de que haya
// una tipografía instalada en la máquina que genera el icono. Un icono que sale
// distinto según quién lo compile no es una marca.
//
// Los colores salen de globals.css (--color-primary y --color-primary-deep).
//
// Correrlo: node scripts/generar-iconos.mjs   (solo si cambia la marca)
// ============================================================================
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const AZUL = "#2B5BFF";       // --color-primary
const AZUL_HONDO = "#1A3FCC"; // --color-primary-deep

const svg = (lado) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${AZUL}"/><stop offset="100%" stop-color="${AZUL_HONDO}"/>
  </linearGradient></defs>
  <rect width="100" height="100" fill="url(#g)"/>
  <path d="M22 20 H78 V34 L46 66 H78 V80 H22 V66 L54 34 H22 Z" fill="#fff"/>
</svg>`);

const png = (lado) => sharp(svg(lado)).png().toBuffer();

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
  cab.writeUInt16LE(0, 0);            // reservado
  cab.writeUInt16LE(1, 2);            // tipo: 1 = icono
  cab.writeUInt16LE(1, 4);            // cantidad de imágenes
  cab.writeUInt8(lado, 6);            // ancho
  cab.writeUInt8(lado, 7);            // alto
  cab.writeUInt8(0, 8);               // colores de paleta
  cab.writeUInt8(0, 9);               // reservado
  cab.writeUInt16LE(1, 10);           // planos
  cab.writeUInt16LE(32, 12);          // bits por píxel
  cab.writeUInt32LE(datos.length, 14);
  cab.writeUInt32LE(22, 18);          // dónde empieza la imagen
  return Buffer.concat([cab, datos]);
}

// Next sirve estos tres por convención, solo por estar en app/, y emite las
// etiquetas del <head> él mismo. No hay que declarar nada a mano.
writeFileSync("app/icon.png", await png(512));
writeFileSync("app/apple-icon.png", await png(180));
writeFileSync("app/favicon.ico", envolverIco(await png(48), 48));

console.log("Iconos generados: icon.png (512), apple-icon.png (180), favicon.ico (48)");
