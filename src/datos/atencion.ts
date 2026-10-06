// Horarios de atención de los médicos.

// Horarios que se ofrecen siempre (turnos de 20 minutos): mañana y tarde.
export const HORAS_BASE = [
  '09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40',
  '15:00', '15:20', '15:40', '16:00', '16:20', '16:40', '17:00',
];

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
