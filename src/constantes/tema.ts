// Colores de la pantalla de Perfil en modo oscuro y claro. El dorado (COLOR_PERFIL) es igual en los dos.
export type Tema = {
  fondo: string;
  tarjeta: string;
  texto: string;
  textoSecundario: string;
  textoTenue: string; // flechas, versión, íconos inactivos
  borde: string;
  switchApagado: string;
};

export const TEMA_OSCURO: Tema = {
  fondo: '#1A1815',
  tarjeta: '#242119',
  texto: '#FFFFFF',
  textoSecundario: '#A9A49B',
  textoTenue: '#6B675F',
  borde: '#33302A',
  switchApagado: '#3D3A33',
};

export const TEMA_CLARO: Tema = {
  fondo: '#F7F3EA',
  tarjeta: '#FFFFFF',
  texto: '#1A1815',
  textoSecundario: '#6B675F',
  textoTenue: '#A9A49B',
  borde: '#E6DFCF',
  switchApagado: '#D8D2C2',
};
