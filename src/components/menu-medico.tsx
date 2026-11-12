import { MenuInferior, SeccionMenu } from '@/components/menu-inferior';
import { COLOR_MEDICO } from '@/constantes/colores';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_MEDICO } from '@/datos/textos-medico';

type Seccion = 'agenda' | 'pacientes' | 'recetas' | 'perfil';

const SECCIONES: SeccionMenu[] = [
  { id: 'agenda', icono: '▤', iconoActivo: '▥', texto: 'agenda', ruta: '/medico' },
  { id: 'pacientes', icono: '◍', iconoActivo: '◉', texto: 'pacientes', ruta: '/medico/pacientes' },
  { id: 'recetas', icono: '℞', iconoActivo: '⚕', texto: 'recetas', ruta: '/medico/recetas' },
  { id: 'perfil', icono: '◐', iconoActivo: '⚙', texto: 'perfil', ruta: '/perfil?rol=medico' },
];

// Menú de abajo del médico: el mismo menú animado del paciente y la secretaría, con el azul del rol.
export function MenuMedico({ activa }: { activa?: Seccion }) {
  const { idioma } = usePreferencias();
  const nombres = TEXTOS_MEDICO[idioma].menu;
  // El texto de cada sección se saca del idioma elegido.
  const secciones = SECCIONES.map((seccion) => ({ ...seccion, texto: nombres[seccion.id as Seccion] }));
  return <MenuInferior secciones={secciones} activa={activa} colorActivo={COLOR_MEDICO} />;
}
