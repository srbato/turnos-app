import { Oferta } from '@/contextos/AdelantosContext';
import { Turno } from '@/contextos/TurnosContext';
import { HOY } from '@/datos/consultorio';

// Lista de espera = adelantos. Todos los pacientes sacan un turno; al sacarlo pueden pedir que se les ofrezca un
// horario antes si se libera uno (el turno queda con "adelantoDesde"). Las ofertas las crea la API con estas reglas;
// acá quedan las funciones que usan las pantallas para mostrar la lista y los horarios reservados. Reglas:
//   - Solo se ofrecen horarios libres a 3 días o más de hoy (así el paciente tiene tiempo de responder).
//   - Se ofrece a quien ya tiene un turno más tarde con el mismo médico y hace más tiempo que espera.
//   - Cada paciente tiene como máximo UNA oferta pendiente, y cada horario se ofrece a UN solo paciente a la vez.
//   - Si un paciente no acepta (o no contesta), ese horario pasa al siguiente que esté libre de ofertas.
export const DIAS_MINIMOS_ADELANTO = 3;

export function diasDesdeHoy(fecha: string) {
  const [a1, m1, d1] = HOY.split('-').map(Number);
  const [a2, m2, d2] = fecha.split('-').map(Number);
  return Math.round((new Date(a2, m2 - 1, d2).getTime() - new Date(a1, m1 - 1, d1).getTime()) / 86400000);
}

function momento(turno: Turno) {
  return `${turno.fecha} ${turno.hora}`;
}

function estaActivo(turno: Turno) {
  return turno.estado === 'pendiente' || turno.estado === 'confirmado';
}

// Identifica un horario de un médico (los horarios libres no tienen un id propio estable).
export function claveHorario(horario: Turno) {
  return `${horario.medico}|${horario.fecha}|${horario.hora}`;
}

function horarioOcupado(horario: Turno, turnos: Turno[]) {
  return turnos.some(
    (t) => estaActivo(t) && t.medico === horario.medico && t.fecha === horario.fecha && t.hora === horario.hora
  );
}

// Un horario libre de la agenda de un médico, con forma de turno cancelado (así toda la lógica de ofertas lo trata igual
// que un turno liberado). No tiene paciente.
export function crearHorarioLibre(
  medico: { id: string; nombre: string; especialidad: string; sala: string },
  fecha: string,
  hora: string,
  sede: string // nombre del consultorio al que pertenece el horario
): Turno {
  return {
    id: `horario-${medico.nombre}-${fecha}-${hora}`,
    idPaciente: '',
    idMedico: medico.id,
    medico: medico.nombre,
    especialidad: medico.especialidad,
    sala: medico.sala,
    fecha,
    hora,
    sede,
    estado: 'cancelado',
    instrucciones: [],
    cobertura: '',
  };
}

// Los que esperan: turnos activos con la opción de adelanto, el que hace más tiempo que espera primero.
export function listaDeEspera(turnos: Turno[]) {
  return turnos
    .filter((turno) => turno.adelantoDesde !== undefined && estaActivo(turno) && turno.fecha >= HOY)
    .sort((a, b) => {
      if (a.adelantoDesde !== b.adelantoDesde) return (a.adelantoDesde ?? '') < (b.adelantoDesde ?? '') ? -1 : 1;
      return momento(a) < momento(b) ? 1 : -1; // si empatan, el que tiene el turno más lejano
    });
}

// Una oferta sigue vigente si espera respuesta, el horario sigue libre y el turno del paciente sigue siendo más tarde.
export function ofertaVigente(oferta: Oferta, turnos: Turno[]) {
  const turno = turnos.find((t) => t.id === oferta.idTurno);
  return (
    oferta.estado === 'enviada' &&
    turno !== undefined &&
    estaActivo(turno) &&
    momento(turno) > momento(oferta.horario) &&
    !horarioOcupado(oferta.horario, turnos)
  );
}

export function ofertasVigentes(ofertas: Oferta[], turnos: Turno[]) {
  return ofertas.filter((oferta) => ofertaVigente(oferta, turnos));
}

// La oferta pendiente de un horario (si se lo ofrecieron a alguien): mientras espera respuesta, el horario queda reservado.
export function ofertaDelHorario(ofertas: Oferta[], turnos: Turno[], medico: string, fecha: string, hora: string) {
  return ofertasVigentes(ofertas, turnos).find(
    (o) => o.horario.medico === medico && o.horario.fecha === fecha && o.horario.hora === hora
  );
}

// Horas de un médico en una fecha que están reservadas por una oferta pendiente (no se pueden dar a otro paciente).
// idTurnoIgnorado: el turno del paciente que recibió la oferta no se bloquea a sí mismo.
export function horasReservadas(ofertas: Oferta[], turnos: Turno[], medico: string, fecha: string, idTurnoIgnorado?: string) {
  return ofertasVigentes(ofertas, turnos)
    .filter((o) => o.horario.medico === medico && o.horario.fecha === fecha && o.idTurno !== idTurnoIgnorado)
    .map((o) => o.horario.hora);
}

// A quiénes se les puede ofrecer un horario ahora, en orden: los de la lista del mismo médico con un turno más tarde,
// salvo los que ya respondieron por este horario y los que ya tienen otra oferta esperando respuesta.
export function candidatosDisponibles(horario: Turno, turnos: Turno[], ofertas: Oferta[]) {
  const clave = claveHorario(horario);
  const ocupados = ofertasVigentes(ofertas, turnos).map((o) => o.idTurno);
  return listaDeEspera(turnos).filter(
    (turno) =>
      turno.medico === horario.medico &&
      momento(turno) > momento(horario) &&
      !ocupados.includes(turno.id) &&
      !ofertas.some((o) => o.idTurno === turno.id && claveHorario(o.horario) === clave && o.estado !== 'enviada')
  );
}

// Puesto de un turno en la lista de espera de su médico (1 = el que hace más tiempo espera).
export function puestoEnLista(turno: Turno, turnos: Turno[]) {
  const delMedico = listaDeEspera(turnos).filter((otro) => otro.medico === turno.medico);
  return { posicion: delMedico.findIndex((otro) => otro.id === turno.id) + 1, total: delMedico.length };
}
