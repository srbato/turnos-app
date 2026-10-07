import { MenuInferior, SeccionMenu } from '@/components/menu-inferior';
import { COLOR_SECRETARIA } from '@/constantes/colores';
import { RUTA_AGENDA_SECRETARIA } from '@/constantes/rutas';

type Seccion = 'agendas' | 'espera' | 'alertas' | 'personal' | 'ajustes';

const SECCIONES: SeccionMenu[] = [
  { id: 'agendas', icono: '▤', iconoActivo: '▥', texto: 'Agendas', ruta: RUTA_AGENDA_SECRETARIA },
  { id: 'espera', icono: '≡', iconoActivo: '☰', texto: 'Espera', ruta: '/secretaria/espera' },
  { id: 'alertas', icono: '△', iconoActivo: '▲', texto: 'Alertas', ruta: '/secretaria/alertas' },
  { id: 'personal', icono: '☺', iconoActivo: '☻', texto: 'Personal', ruta: '/secretaria/personal' },
  { id: 'ajustes', icono: '◌', iconoActivo: '⚙', texto: 'Ajustes', ruta: '/secretaria/ajustes' },
];

// Menú de abajo de Secretaría (las 5 secciones del mockup).
export function MenuSecretaria({ activa }: { activa?: Seccion }) {
  return <MenuInferior secciones={SECCIONES} activa={activa} colorActivo={COLOR_SECRETARIA} />;
}
