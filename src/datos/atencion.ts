// Horarios de atención de los médicos. Cada médico tiene sus franjas (las carga Secretaría en su ficha) y de ahí
// salen sus horarios de turno: los usan el paciente al sacar turno, Secretaría en sus agendas y los médicos.

// Duraciones de turno que puede elegir Secretaría en Ajustes (minutos).
export const DURACIONES_DE_TURNO = [15, 20, 30, 45];

// Una franja de atención: un día de la semana (0 = domingo, 1 = lunes … 6 = sábado) y de qué hora a qué hora.
export type FranjaHoraria = {
  dia: number;
  desde: string; // HH:MM
  hasta: string; // HH:MM (un turno entra solo si termina antes de esa hora)
};

export const NOMBRES_DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
export const NOMBRES_DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// La semana en el orden en que se muestra: de lunes a domingo.
export const SEMANA = [1, 2, 3, 4, 5, 6, 0];

// Las mismas franjas para varios días de la semana. Ej: franjasDe([1, 3], '09:00', '13:00') = lunes y miércoles de 9 a 13.
export function franjasDe(dias: number[], desde: string, hasta: string) {
  const franjas: FranjaHoraria[] = [];
  dias.forEach((dia) => {
    franjas.push({ dia: dia, desde: desde, hasta: hasta });
  });
  return franjas;
}

// Horario de un médico que todavía no tiene uno cargado: de lunes a viernes, de 9 a 12 y de 15 a 17:20.
export const FRANJAS_POR_DEFECTO: FranjaHoraria[] = [
  ...franjasDe([1, 2, 3, 4, 5], '09:00', '12:00'),
  ...franjasDe([1, 2, 3, 4, 5], '15:00', '17:20'),
];

function aMinutos(hora: string) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

function aHora(minutos: number) {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

// Día de la semana de una fecha 'AAAA-MM-DD' (0 = domingo).
function diaDeLaSemana(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(anio, mes - 1, dia).getDay();
}

// ¿El médico atiende ese día ('AAAA-MM-DD')? Sí, si tiene alguna franja ese día de la semana.
export function atiendeEseDia(franjas: FranjaHoraria[], fecha: string) {
  const dia = diaDeLaSemana(fecha);
  return franjas.some((franja) => franja.dia === dia);
}

// ¿Esa hora cae dentro de alguna franja de ese día? Sirve para saber si un turno ya cargado quedó fuera de horario.
export function atiendeEnEseHorario(franjas: FranjaHoraria[], fecha: string, hora: string) {
  const dia = diaDeLaSemana(fecha);
  return franjas.some((franja) => franja.dia === dia && franja.desde <= hora && hora < franja.hasta);
}

// Horarios de turno de un médico en una fecha, según sus franjas y la duración que configuró Secretaría.
// Ej: con una franja de 9 a 12 y turnos de 20 minutos son 09:00, 09:20 … 11:40.
export function horasDelDia(franjas: FranjaHoraria[], fecha: string, duracionMinutos: number) {
  const dia = diaDeLaSemana(fecha);
  const horas: string[] = [];
  franjas.forEach((franja) => {
    if (franja.dia !== dia) return;
    for (let inicio = aMinutos(franja.desde); inicio + duracionMinutos <= aMinutos(franja.hasta); inicio += duracionMinutos) {
      horas.push(aHora(inicio));
    }
  });
  return horas.sort();
}

// Pasa lo que escribió Secretaría ("9", "9:30", "14:00") al formato HH:MM. Si no es una hora válida devuelve ''.
export function normalizarHora(texto: string) {
  const partes = texto.trim().split(':');
  if (partes.length > 2 || partes[0] === '') return '';
  const horas = Number(partes[0]);
  let minutos = 0;
  if (partes.length === 2) {
    minutos = Number(partes[1]);
  }
  if (!Number.isInteger(horas) || !Number.isInteger(minutos)) return '';
  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return '';
  return aHora(horas * 60 + minutos);
}

// Las franjas ordenadas de lunes a domingo y, dentro de cada día, por hora.
export function ordenarFranjas(franjas: FranjaHoraria[]) {
  return [...franjas].sort((a, b) => {
    if (a.dia !== b.dia) return SEMANA.indexOf(a.dia) - SEMANA.indexOf(b.dia);
    return a.desde < b.desde ? -1 : 1;
  });
}

// Los días en que atiende, como texto: "lun, mié, vie". Si son 3 o más días seguidos se acorta: "lun a vie".
export function textoDeDias(franjas: FranjaHoraria[]) {
  const posiciones: number[] = []; // posición de cada día en SEMANA (0 = lunes … 6 = domingo)
  SEMANA.forEach((dia, posicion) => {
    if (franjas.some((franja) => franja.dia === dia)) {
      posiciones.push(posicion);
    }
  });
  if (posiciones.length === 0) {
    return 'sin horarios';
  }
  const primero = posiciones[0];
  const ultimo = posiciones[posiciones.length - 1];
  if (posiciones.length >= 3 && ultimo - primero === posiciones.length - 1) {
    return `${NOMBRES_DIAS[SEMANA[primero]]} a ${NOMBRES_DIAS[SEMANA[ultimo]]}`;
  }
  return posiciones.map((posicion) => NOMBRES_DIAS[SEMANA[posicion]]).join(', ');
}
