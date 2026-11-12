import { Href } from 'expo-router';

import { MenuInferior, SeccionMenu } from '@/components/menu-inferior';
import { COLOR_PACIENTE } from '@/constantes/colores';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

type Seccion = 'inicio' | 'turnos' | 'salud' | 'perfil';

const SECCIONES: SeccionMenu[] = [
  { id: 'inicio', icono: '☖', iconoActivo: '☗', texto: 'inicio', ruta: '/paciente' },
  { id: 'turnos', icono: '☐', iconoActivo: '☑', texto: 'turnos', ruta: '/paciente/mis-turnos' },
  { id: 'salud', icono: '℞', iconoActivo: '⚕', texto: 'salud', ruta: '/paciente/medicamentos' },
  { id: 'perfil', icono: '◐', iconoActivo: '⚙', texto: 'perfil', ruta: '/perfil?rol=paciente' },
];

// Menú de abajo del paciente. Va en las pantallas principales; no en los flujos de Sacar turno y
// Reprogramar, para que un toque sin querer no los interrumpa.
// activa es opcional: pantallas como Estudios no corresponden a ninguna sección del menú.
export function MenuPaciente({ activa }: { activa?: Seccion }) {
  const { idioma } = usePreferencias();
  const nombres = TEXTOS_PACIENTE[idioma].menu;
  // El texto de cada sección se saca del idioma elegido.
  const secciones = SECCIONES.map((seccion) => ({ ...seccion, texto: nombres[seccion.id as Seccion] }));
  return <MenuInferior secciones={secciones} activa={activa} colorActivo={COLOR_PACIENTE} />;
}
