import { MenuInferior, SeccionMenu } from '@/components/menu-inferior';
import { COLOR_SECRETARIA } from '@/constantes/colores';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';
import { RUTA_AGENDA_SECRETARIA } from '@/constantes/rutas';

type Seccion = 'agendas' | 'espera' | 'alertas' | 'personal' | 'ajustes';

const SECCIONES: SeccionMenu[] = [
  { id: 'agendas', icono: '▤', iconoActivo: '▥', texto: 'agendas', ruta: RUTA_AGENDA_SECRETARIA },
  { id: 'espera', icono: '≡', iconoActivo: '☰', texto: 'espera', ruta: '/secretaria/espera' },
  { id: 'alertas', icono: '△', iconoActivo: '▲', texto: 'alertas', ruta: '/secretaria/alertas' },
  { id: 'personal', icono: '☺', iconoActivo: '☻', texto: 'personal', ruta: '/secretaria/personal' },
  { id: 'ajustes', icono: '◌', iconoActivo: '⚙', texto: 'ajustes', ruta: '/secretaria/ajustes' },
];

// Menú de abajo de Secretaría (las 5 secciones del mockup).
export function MenuSecretaria({ activa }: { activa?: Seccion }) {
  const { idioma } = usePreferencias();
  const nombres = TEXTOS_SECRETARIA[idioma].menu;
  // El texto de cada sección se saca del idioma elegido.
  const secciones = SECCIONES.map((seccion) => ({ ...seccion, texto: nombres[seccion.id as Seccion] }));
  return <MenuInferior secciones={secciones} activa={activa} colorActivo={COLOR_SECRETARIA} />;
}
