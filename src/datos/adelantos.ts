import type { Oferta } from '@/contextos/AdelantosContext';
import type { Turno } from '@/contextos/TurnosContext';
import { HOY, NOMBRE_CONSULTORIO } from '@/datos/consultorio';

// Lista de espera = adelantos. Todos los pacientes sacan un turno; al sacarlo pueden pedir que se les ofrezca un
// horario antes si se libera uno (el turno queda con "adelantoDesde"). Reglas:
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

// Turnos cancelados de hoy en adelante cuyo horario nadie volvió a ocupar.
export function turnosLiberados(turnos: Turno[]) {
  return turnos
    .filter((turno) => turno.estado === 'cancelado' && turno.fecha >= HOY && !horarioOcupado(turno, turnos))
    .sort((a, b) => (momento(a) < momento(b) ? -1 : 1));
}

// Un horario libre de la agenda de un médico, con forma de turno cancelado (así toda la lógica de ofertas lo trata igual
// que un turno liberado). No tiene paciente.
export function crearHorarioLibre(
  medico: { nombre: string; especialidad: string; consultorio: string },
  fecha: string,
  hora: string
): Turno {
  return {
    id: `horario-${medico.nombre}-${fecha}-${hora}`,
    idPaciente: '',
    medico: medico.nombre,
    especialidad: medico.especialidad,
    consultorio: medico.consultorio,
    fecha,
    hora,
    sede: NOMBRE_CONSULTORIO,
    estado: 'cancelado',
    instrucciones: [],
    cobertura: '',
  };
}

// Los horarios libres que se pueden ofrecer: los liberados por cancelaciones y los que Secretaría publicó desde la
// agenda del médico, siempre que nadie los haya ocupado, cumplan los 3 días y no se hayan retirado de la oferta.
export function horariosParaOfrecer(turnos: Turno[], publicados: Turno[], retirados: string[] = []) {
  const libres = publicados.filter((slot) => !horarioOcupado(slot, turnos));
  return [...turnosLiberados(turnos), ...libres]
    .filter((horario) => permiteAdelanto(horario) && !retirados.includes(claveHorario(horario)))
    .sort((a, b) => (momento(a) < momento(b) ? -1 : 1));
}

export function permiteAdelanto(horario: Turno) {
  return diasDesdeHoy(horario.fecha) >= DIAS_MINIMOS_ADELANTO;
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
  const ocupados = new Set(ofertasVigentes(ofertas, turnos).map((o) => o.idTurno));
  return listaDeEspera(turnos).filter(
    (turno) =>
      turno.medico === horario.medico &&
      momento(turno) > momento(horario) &&
      !ocupados.has(turno.id) &&
      !ofertas.some((o) => o.idTurno === turno.id && claveHorario(o.horario) === clave && o.estado !== 'enviada')
  );
}

// Las ofertas que hay que crear ahora: cada horario libre sin oferta vigente se le ofrece al primer candidato disponible.
export function proximasOfertas(
  turnos: Turno[],
  publicados: Turno[],
  ofertas: Oferta[],
  retirados: string[] = []
): Oferta[] {
  const nuevas: Oferta[] = [];
  const vigentes = ofertasVigentes(ofertas, turnos);
  horariosParaOfrecer(turnos, publicados, retirados).forEach((horario) => {
    if (vigentes.some((o) => claveHorario(o.horario) === claveHorario(horario))) return;
    const candidato = candidatosDisponibles(horario, turnos, [...ofertas, ...nuevas])[0];
    if (!candidato) return;
    nuevas.push({
      id: `${candidato.id}|${claveHorario(horario)}`,
      idTurno: candidato.id,
      horario,
      estado: 'enviada',
    });
  });
  return nuevas;
}

// Puesto de un turno en la lista de espera de su médico (1 = el que hace más tiempo espera).
export function puestoEnLista(turno: Turno, turnos: Turno[]) {
  const delMedico = listaDeEspera(turnos).filter((otro) => otro.medico === turno.medico);
  return { posicion: delMedico.findIndex((otro) => otro.id === turno.id) + 1, total: delMedico.length };
}
