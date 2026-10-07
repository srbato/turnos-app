import { Turno } from '@/contextos/TurnosContext';
import { Paciente } from '@/datos/consultorio';
import { COLOR_CANCELADO, COLOR_CONFIRMADO, COLOR_PENDIENTE } from '@/constantes/colores';

// Riesgo de ausentismo por REGLAS (no hay datos para entrenar un modelo). Las faltas suman y la buena conducta resta:
//   - cada falta (no se presentó):            +1 punto
//   - cada vez que asistió:                   -0,5 puntos
//   - cada turno que confirmó (recompensa):   -0,2 puntos
// El puntaje no baja de 0. No confirmar un turno no suma nada: solo cuenta lo que el paciente hace.
// Desde cuántos puntos el riesgo es medio o alto, y cuántos avisos tiene que mandar Secretaría antes de poder
// reprogramar o cancelar el turno de un paciente de riesgo alto, los configura Secretaría en Ajustes (ReglasRiesgo).
export const PUNTOS_POR_FALTA = 1;
export const PUNTOS_POR_ASISTENCIA = 0.5;
export const PUNTOS_POR_CONFIRMACION = 0.2;

export type ReglasRiesgo = {
  medio: number; // puntos desde los que el riesgo es medio
  alto: number; // puntos desde los que el riesgo es alto
  avisos: number; // avisos que tiene que mandar Secretaría antes de poder reprogramar o cancelar
};

// Valores con los que arranca cada consultorio.
export const REGLAS_RIESGO_POR_DEFECTO: ReglasRiesgo = { medio: 1, alto: 2, avisos: 3 };

export type NivelRiesgo = 'bajo' | 'en-riesgo' | 'alto';

export type Riesgo = {
  puntaje: number; // ya con las restas, redondeado a un decimal y nunca menor a 0
  nivel: NivelRiesgo;
  faltas: number;
  asistencias: number;
  confirmaciones: number;
};

// Veces que el paciente faltó: las que ya tenía registradas más los turnos marcados "No asistió" en la app.
export function contarFaltas(paciente: Paciente, turnos: Turno[]) {
  const nuevas = turnos.filter((turno) => turno.idPaciente === paciente.id && turno.estado === 'ausente').length;
  return paciente.faltas + nuevas;
}

// Veces que asistió: las registradas más los turnos marcados como atendidos en la app.
export function contarAsistencias(paciente: Paciente, turnos: Turno[]) {
  const nuevas = turnos.filter((turno) => turno.idPaciente === paciente.id && turno.estado === 'atendido').length;
  return paciente.asistencias + nuevas;
}

// Turnos que confirmó (los que están confirmados y los que confirmó antes de que lo atendieran).
export function contarConfirmaciones(paciente: Paciente, turnos: Turno[]) {
  return turnos.filter(
    (turno) =>
      turno.idPaciente === paciente.id &&
      (turno.estado === 'confirmado' || (turno.estado === 'atendido' && turno.confirmo === true))
  ).length;
}

export function evaluarRiesgo(
  paciente: Paciente,
  turnos: Turno[],
  reglas: ReglasRiesgo = REGLAS_RIESGO_POR_DEFECTO
): Riesgo {
  const faltas = contarFaltas(paciente, turnos);
  const asistencias = contarAsistencias(paciente, turnos);
  const confirmaciones = contarConfirmaciones(paciente, turnos);
  const bruto =
    faltas * PUNTOS_POR_FALTA - asistencias * PUNTOS_POR_ASISTENCIA - confirmaciones * PUNTOS_POR_CONFIRMACION;
  const puntaje = Math.round(Math.max(0, bruto) * 10) / 10;
  let nivel: NivelRiesgo = 'bajo';
  if (puntaje >= reglas.alto) {
    nivel = 'alto';
  } else if (puntaje >= reglas.medio) {
    nivel = 'en-riesgo';
  }
  return { puntaje, nivel, faltas, asistencias, confirmaciones };
}

// El puntaje como texto con coma ("1,8"), sin decimal si es entero ("2").
export function textoPuntaje(puntaje: number) {
  return Number.isInteger(puntaje) ? String(puntaje) : String(puntaje).replace('.', ',');
}

// Nombre del nivel para mostrar en pantalla: "alto", "medio" o "bajo".
export function nombreNivelRiesgo(nivel: NivelRiesgo | undefined) {
  if (nivel === 'alto') {
    return 'alto';
  }
  if (nivel === 'en-riesgo') {
    return 'medio';
  }
  return 'bajo';
}

// Color del nivel: rojo (alto), ámbar (medio) o verde (bajo).
export function colorNivelRiesgo(nivel: NivelRiesgo | undefined) {
  if (nivel === 'alto') {
    return COLOR_CANCELADO;
  }
  if (nivel === 'en-riesgo') {
    return COLOR_PENDIENTE;
  }
  return COLOR_CONFIRMADO;
}
