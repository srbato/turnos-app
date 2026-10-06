import type { Turno } from '@/contextos/TurnosContext';
import { HOY, type Paciente } from '@/datos/consultorio';

// Riesgo de ausentismo por REGLAS (no hay datos para entrenar un modelo). Es transparente: cada alerta
// muestra qué reglas se activaron. Reglas (cada una suma puntos):
//   - faltas previas: 1 punto por cada falta (hasta 3)
//   - primera consulta: 1 punto
//   - reserva antigua (3 meses o más de anticipación): 1 punto
//   - sin confirmar: 1 punto (se aclara si el turno es hoy o mañana)
const DIAS_RESERVA_ANTIGUA = 90;
const PUNTAJE_EN_RIESGO = 2;
const PUNTAJE_RIESGO_ALTO = 3;

export type Riesgo = {
  puntaje: number;
  reglas: string[]; // textos cortos de las reglas que se activaron
  nivel: 'bajo' | 'en-riesgo' | 'alto';
};

function diasEntre(desde: string, hasta: string) {
  const [a1, m1, d1] = desde.split('-').map(Number);
  const [a2, m2, d2] = hasta.split('-').map(Number);
  const milisegundos = new Date(a2, m2 - 1, d2).getTime() - new Date(a1, m1 - 1, d1).getTime();
  return Math.round(milisegundos / 86400000);
}

// Calcula el riesgo de que el paciente no se presente a un turno. turnos = todos los turnos (para saber
// si es su primera consulta).
export function evaluarRiesgo(turno: Turno, paciente: Paciente, turnos: Turno[]): Riesgo {
  const reglas: string[] = [];
  let puntaje = 0;

  if (paciente.faltas > 0) {
    reglas.push(paciente.faltas === 1 ? '1 falta' : `${paciente.faltas} faltas`);
    puntaje += Math.min(paciente.faltas, 3);
  }

  const turnosAnteriores = turnos.filter(
    (otro) =>
      otro.idPaciente === paciente.id &&
      otro.id !== turno.id &&
      otro.estado !== 'cancelado' &&
      otro.fecha < turno.fecha
  );
  if (turnosAnteriores.length === 0) {
    reglas.push('primera consulta');
    puntaje += 1;
  }

  const diasDeAnticipacion = diasEntre(turno.reservadoEl ?? HOY, turno.fecha);
  if (diasDeAnticipacion >= DIAS_RESERVA_ANTIGUA) {
    reglas.push(`reserva de ${Math.floor(diasDeAnticipacion / 30)} meses`);
    puntaje += 1;
  }

  if (turno.estado === 'pendiente') {
    // Hoy o mañana: ya debería haberse confirmado.
    reglas.push(diasEntre(HOY, turno.fecha) <= 1 ? 'no confirmó a 24 h' : 'sin confirmar');
    puntaje += 1;
  }

  const nivel = puntaje >= PUNTAJE_RIESGO_ALTO ? 'alto' : puntaje >= PUNTAJE_EN_RIESGO ? 'en-riesgo' : 'bajo';
  return { puntaje, reglas, nivel };
}
