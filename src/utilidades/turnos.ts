import { COLOR_CANCELADO, COLOR_CONFIRMADO, COLOR_PENDIENTE } from '@/constantes/colores';
import { Turno } from '@/contextos/TurnosContext';

const COLOR_ATENDIDO = '#5A6B7D'; // gris azulado: el turno ya se realizó
const COLOR_AUSENTE = '#B03A3A'; // rojo oscuro: el paciente no se presentó
import { EstadoTurno } from '@/datos/consultorio';

export const COLORES_ESTADO: Record<EstadoTurno, string> = {
  confirmado: COLOR_CONFIRMADO,
  pendiente: COLOR_PENDIENTE,
  cancelado: COLOR_CANCELADO,
  atendido: COLOR_ATENDIDO,
  ausente: COLOR_AUSENTE,
};

export const ETIQUETAS_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'Confirmado',
  pendiente: 'Pendiente',
  cancelado: 'Cancelado',
  atendido: 'Atendido',
  ausente: 'No asistió',
};

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

// Pasa una fecha (Date) a texto 'AAAA-MM-DD', el formato que usan los turnos.
export function fechaComoTexto(fecha: Date) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

// El próximo turno: el más cercano que no está cancelado ni atendido y todavía no pasó.
// Si no hay ninguno, devuelve undefined.
export function buscarProximoTurno(turnos: Turno[]) {
  const ahora = new Date();
  return [...turnos]
    .filter(
      (turno) =>
        turno.estado !== 'cancelado' &&
        turno.estado !== 'atendido' &&
        turno.estado !== 'ausente' &&
        fechaHoraComoDate(turno.fecha, turno.hora) >= ahora
    )
    .sort(
      (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
    )[0];
}
