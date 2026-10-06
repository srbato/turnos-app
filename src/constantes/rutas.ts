import type { Href } from 'expo-router';

// Los tipos que genera expo-router registran la agenda de Secretaría como '/secretaria/index', pero la ruta
// que funciona en la app (y en la URL) es '/secretaria'. Se declara acá una sola vez, con su cast.
export const RUTA_AGENDA_SECRETARIA = '/secretaria' as Href;
