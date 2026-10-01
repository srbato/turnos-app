// Funciones para trabajar con las fechas de los turnos.
// Las fechas se guardan como texto 'AAAA-MM-DD' y las horas como 'HH:MM'.

import { Turno } from './datos';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_ABREV = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function parsearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return { anio, mes, dia };
}

export function fechaHoraComoDate(fecha: string, hora: string) {
  const { anio, mes, dia } = parsearFecha(fecha);
  const [horas, minutos] = hora.split(':').map(Number);
  return new Date(anio, mes - 1, dia, horas, minutos);
}

export function detalleFecha(fecha: string) {
  const { anio, mes, dia } = parsearFecha(fecha);
  const fechaLocal = new Date(anio, mes - 1, dia);
  return {
    dia: fechaLocal.getDate(),
    mes: MESES_ABREV[fechaLocal.getMonth()],
    diaSemana: DIAS_SEMANA[fechaLocal.getDay()],
  };
}

export function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

// El próximo turno: el más cercano que no está cancelado y todavía no pasó.
// Si no hay ninguno, devuelve undefined.
export function buscarProximoTurno(turnos: Turno[]) {
  const ahora = new Date();
  return [...turnos]
    .filter((turno) => turno.estado !== 'cancelado' && fechaHoraComoDate(turno.fecha, turno.hora) >= ahora)
    .sort(
      (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
    )[0];
}
