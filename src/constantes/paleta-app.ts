// Colores neutros de las pantallas de la app (todo lo que no es el color del rol) en modo claro y oscuro.
// Los colores de cada rol (azul del médico, verde de la secretaría...) viven en colores.ts y no cambian con el modo.
// El Perfil tiene su propia paleta dorada, en tema.ts.
import { COLOR_MEDICO, COLOR_PACIENTE, COLOR_SECRETARIA, FONDO_PACIENTE, FONDO_SECRETARIA } from '@/constantes/colores';

// Mezcla un color '#RRGGBB' con blanco (55 %) para que se vea sobre fondos oscuros.
export function aclarar(hex: string) {
  const canales = [1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16));
  const mezclados = canales.map((canal) => Math.round(canal + (255 - canal) * 0.55));
  return '#' + mezclados.map((canal) => canal.toString(16).padStart(2, '0')).join('');
}

export type PaletaApp = {
  fondo: string; // fondo de la pantalla
  tarjeta: string; // tarjetas, modales y campos sobre el fondo
  texto: string; // títulos y texto principal
  textoSecundario: string;
  textoTenue: string; // textos de ayuda, placeholders, íconos inactivos
  borde: string; // bordes de campos y tablas
  bordeSuave: string; // líneas finas (por ejemplo, sobre la barra de abajo)
  relleno: string; // fondos sutiles: cabeceras de tabla, chips grises, barras vacías
  chipAzul: string;
  chipRojo: string;
  bordeAcento: string; // borde de tarjetas y campos (en la secretaría, con un tinte verdoso en modo claro)
  acento: string; // color del rol usado como texto (en modo oscuro se aclara para que se lea)
};

export const PALETA_CLARA: PaletaApp = {
  fondo: '#F4F5F7',
  tarjeta: '#FFFFFF',
  texto: '#1A1A1A',
  textoSecundario: '#5A5A5A',
  textoTenue: '#8A8A8A',
  borde: '#D5D8DD',
  bordeSuave: '#EDEDED',
  relleno: '#F0F1F3',
  chipAzul: '#E6ECF5',
  chipRojo: '#FBDCDC',
  bordeAcento: '#D5D8DD',
  acento: COLOR_MEDICO,
};

export const PALETA_OSCURA: PaletaApp = {
  fondo: '#14161A',
  tarjeta: '#1F2328',
  texto: '#F1F2F4',
  textoSecundario: '#A9ADB4',
  textoTenue: '#8A8F98',
  borde: '#3A3F47',
  bordeSuave: '#2E3238',
  relleno: '#2B2F36',
  chipAzul: '#233450',
  chipRojo: '#4A2A2D',
  bordeAcento: '#3A3F47',
  acento: aclarar(COLOR_MEDICO),
};

export type RolPaleta = 'medico' | 'paciente' | 'secretaria';

// Cada rol cambia el fondo (en claro) y el color de acento; el resto de los neutros es común.
export function paletaApp(modoOscuro: boolean, rol: RolPaleta = 'medico'): PaletaApp {
  const base = modoOscuro ? PALETA_OSCURA : PALETA_CLARA;
  if (rol === 'paciente') {
    return {
      ...base,
      fondo: modoOscuro ? base.fondo : FONDO_PACIENTE,
      chipAzul: modoOscuro ? base.chipAzul : FONDO_PACIENTE,
      acento: modoOscuro ? aclarar(COLOR_PACIENTE) : COLOR_PACIENTE,
    };
  }
  if (rol === 'secretaria') {
    return {
      ...base,
      fondo: modoOscuro ? base.fondo : FONDO_SECRETARIA,
      chipAzul: modoOscuro ? '#1F3A38' : FONDO_SECRETARIA,
      bordeAcento: modoOscuro ? base.bordeAcento : '#B9DAD6',
      acento: modoOscuro ? aclarar(COLOR_SECRETARIA) : COLOR_SECRETARIA,
    };
  }
  return base;
}
