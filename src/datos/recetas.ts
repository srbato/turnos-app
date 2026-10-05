// Datos mock de las recetas que emite el médico. Cuando exista el backend pasa a ser un fetch.

export type Receta = {
  id: string;
  medicamento: string;
  abreviatura: string; // 3 letras para el ícono de la tarjeta
  indicacion: string; // cómo tomarlo
  medico: string;
  fechaEmision: string; // AAAA-MM-DD
  vigenciaDias: number; // días de validez desde la emisión
  codigo: string; // el que se muestra en la farmacia
};

export const RECETAS: Receta[] = [
  {
    id: '1',
    medicamento: 'Enalapril 10 mg',
    abreviatura: 'ENA',
    indicacion: '1 comprimido cada 24 h (8:00 h)',
    medico: 'Dr. Ricardo Paz',
    fechaEmision: '2026-09-28',
    vigenciaDias: 30,
    codigo: 'RX-2026-0481',
  },
  {
    id: '2',
    medicamento: 'Levotiroxina 50 mcg',
    abreviatura: 'LEV',
    indicacion: '1 comprimido en ayunas',
    medico: 'Dra. Lucía Fernández',
    fechaEmision: '2026-09-29',
    vigenciaDias: 60,
    codigo: 'RX-2026-0497',
  },
  {
    id: '3',
    medicamento: 'Vitamina D 2000 UI',
    abreviatura: 'VIT',
    indicacion: '1 gota por día con el almuerzo',
    medico: 'Dra. Lucía Fernández',
    fechaEmision: '2026-08-01',
    vigenciaDias: 30,
    codigo: 'RX-2026-0352',
  },
];

// Fecha hasta la que vale la receta, como AAAA-MM-DD.
export function vencimientoReceta(receta: Receta) {
  const [anio, mes, dia] = receta.fechaEmision.split('-').map(Number);
  const vence = new Date(anio, mes - 1, dia + receta.vigenciaDias);
  const mm = String(vence.getMonth() + 1).padStart(2, '0');
  const dd = String(vence.getDate()).padStart(2, '0');
  return `${vence.getFullYear()}-${mm}-${dd}`;
}

// Vigente hasta el final del día de vencimiento.
export function recetaVigente(receta: Receta) {
  const [anio, mes, dia] = vencimientoReceta(receta).split('-').map(Number);
  const finDelDia = new Date(anio, mes - 1, dia, 23, 59, 59);
  return new Date() <= finDelDia;
}
