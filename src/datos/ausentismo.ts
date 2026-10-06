import type { Turno } from '@/contextos/TurnosContext';
import type { Paciente } from '@/datos/consultorio';

// Riesgo de ausentismo por REGLAS (no hay datos para entrenar un modelo). Solo suman puntos las FALTAS:
// cada vez que un paciente no se presenta a un turno suma 1 punto. No confirmar un turno no suma nada.
//   - 0 puntos: riesgo bajo
//   - 1 punto: riesgo medio
//   - 2 puntos o más: riesgo alto
const PUNTAJE_EN_RIESGO = 1;
const PUNTAJE_RIESGO_ALTO = 2;

export type Riesgo = {
  puntaje: number; // = cantidad de faltas
  nivel: 'bajo' | 'en-riesgo' | 'alto';
};

// Veces que el paciente faltó: las que ya tenía registradas más los turnos marcados "No asistió" en la app.
export function contarFaltas(paciente: Paciente, turnos: Turno[]) {
  const nuevas = turnos.filter((turno) => turno.idPaciente === paciente.id && turno.estado === 'ausente').length;
  return paciente.faltas + nuevas;
}

export function evaluarRiesgo(paciente: Paciente, turnos: Turno[]): Riesgo {
  const puntaje = contarFaltas(paciente, turnos);
  const nivel = puntaje >= PUNTAJE_RIESGO_ALTO ? 'alto' : puntaje >= PUNTAJE_EN_RIESGO ? 'en-riesgo' : 'bajo';
  return { puntaje, nivel };
}
