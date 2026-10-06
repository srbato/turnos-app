import type { Href } from 'expo-router';

import { MenuInferior, type SeccionMenu } from '@/components/menu-inferior';
import { COLOR_PACIENTE } from '@/constantes/colores';

type Seccion = 'inicio' | 'turnos' | 'salud' | 'perfil';

// Se usa "as Href" en Turnos porque los tipos generados de expo-router no reconocen esa ruta (Tabs).
const SECCIONES: SeccionMenu[] = [
  { id: 'inicio', icono: '☖', iconoActivo: '☗', texto: 'Inicio', ruta: '/paciente' },
  { id: 'turnos', icono: '☐', iconoActivo: '☑', texto: 'Turnos', ruta: '/paciente/mis-turnos' as Href },
  { id: 'salud', icono: '℞', iconoActivo: '⚕', texto: 'Medicamentos', ruta: '/paciente/medicamentos' },
  { id: 'perfil', icono: '◐', iconoActivo: '⚙', texto: 'Perfil', ruta: '/perfil?rol=paciente' },
];

// Menú de abajo del paciente. Va en las pantallas principales; no en los flujos de Sacar turno y
// Reprogramar, para que un toque sin querer no los interrumpa.
// activa es opcional: pantallas como Estudios no corresponden a ninguna sección del menú.
export function MenuPaciente({ activa }: { activa?: Seccion }) {
  return <MenuInferior secciones={SECCIONES} activa={activa} colorActivo={COLOR_PACIENTE} />;
}
