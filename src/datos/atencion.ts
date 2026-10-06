// Horarios de atención de los médicos.

// Duraciones de turno que puede elegir Secretaría en Ajustes (minutos).
export const DURACIONES_DE_TURNO = [15, 20, 30, 45] as const;
export type DuracionDeTurno = (typeof DURACIONES_DE_TURNO)[number];

// Los dos bloques en que se atiende cada día: un turno entra solo si termina antes de que cierre el bloque.
const BLOQUES = [
  { desde: '09:00', hasta: '12:00' }, // mañana
  { desde: '15:00', hasta: '17:20' }, // tarde
];

function aMinutos(hora: string) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

function aHora(minutos: number) {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

// Horarios de turno de un día, según la duración que configuró Secretaría. Es la única grilla de la app: la usan el
// paciente al sacar turno, Secretaría en sus agendas y los médicos. Con 20 minutos son 09:00, 09:20 … 11:40 y
// 15:00 … 17:00.
export function horasDeAtencion(duracionMinutos: number) {
  const horas: string[] = [];
  BLOQUES.forEach((bloque) => {
    for (let inicio = aMinutos(bloque.desde); inicio + duracionMinutos <= aMinutos(bloque.hasta); inicio += duracionMinutos) {
      horas.push(aHora(inicio));
    }
  });
  return horas;
}

const NOMBRES_DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

// Días de la semana (0 = domingo) que aparecen en un texto como "mar y jue", "lun, mié, vie" o "lun a vie".
function diasDelTexto(texto: string) {
  const palabras =
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .match(/[a-z]+/g) ?? [];
  const dias = new Set<number>();
  palabras.forEach((palabra, i) => {
    const desde = palabra.length >= 3 ? NOMBRES_DIAS.indexOf(palabra.slice(0, 3)) : -1;
    if (desde < 0) return;
    const siguiente = palabras[i + 2];
    const hasta = palabras[i + 1] === 'a' && siguiente ? NOMBRES_DIAS.indexOf(siguiente.slice(0, 3)) : -1;
    if (hasta >= desde) {
      for (let d = desde; d <= hasta; d++) dias.add(d);
    } else {
      dias.add(desde);
    }
  });
  return dias;
}

// ¿El médico atiende ese día ('AAAA-MM-DD')? Si el texto no nombra ningún día, se asume de lunes a viernes.
export function atiendeEseDia(diasDeAtencion: string, fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const diaSemana = new Date(anio, mes - 1, dia).getDay();
  const dias = diasDelTexto(diasDeAtencion);
  return dias.size === 0 ? diaSemana >= 1 && diaSemana <= 5 : dias.has(diaSemana);
}
