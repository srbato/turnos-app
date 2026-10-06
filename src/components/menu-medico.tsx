import { MenuInferior, type SeccionMenu } from '@/components/menu-inferior';
import { COLOR_MEDICO } from '@/constantes/colores';

type Seccion = 'agenda' | 'pacientes' | 'recetas' | 'perfil';

const SECCIONES: SeccionMenu[] = [
  { id: 'agenda', icono: '▤', iconoActivo: '▥', texto: 'Agenda', ruta: '/medico' },
  { id: 'pacientes', icono: '◍', iconoActivo: '◉', texto: 'Pacientes', ruta: '/medico/pacientes' },
  { id: 'recetas', icono: '℞', iconoActivo: '⚕', texto: 'Recetas', ruta: '/medico/recetas' },
  { id: 'perfil', icono: '◐', iconoActivo: '⚙', texto: 'Perfil', ruta: '/perfil?rol=medico' },
];

// Menú de abajo del médico: el mismo menú animado del paciente y la secretaría, con el azul del rol.
export function MenuMedico({ activa }: { activa?: Seccion }) {
  return <MenuInferior secciones={SECCIONES} activa={activa} colorActivo={COLOR_MEDICO} />;
}
