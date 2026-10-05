// Datos mock de las recetas que emite el médico. Cuando exista el backend pasa a ser un fetch.

export type Receta = {
  id: string;
  idPaciente: string; // a quién se la recetaron (ver PACIENTES en datos/consultorio)
  medicamento: string;
  abreviatura: string; // 3 letras para el ícono de la tarjeta
  indicacion: string; // cómo tomarlo
  medico: string;
  fechaEmision: string; // AAAA-MM-DD
  vigenciaDias: number; // días de validez desde la emisión
  codigo: string; // el que se muestra en la farmacia
  riesgo: boolean; // el médico la marcó como posiblemente riesgosa junto con otros medicamentos
};

export const RECETAS: Receta[] = [
  {
    id: '1',
    idPaciente: 'p1',
    medicamento: 'Enalapril 10 mg',
    abreviatura: 'ENA',
    indicacion: '1 comprimido cada 24 h (8:00 h)',
    medico: 'Dr. Ricardo Paz',
    fechaEmision: '2026-09-28',
    vigenciaDias: 30,
    codigo: 'RX-2026-0481',
    riesgo: false,
  },
  {
    id: '2',
    idPaciente: 'p1',
    medicamento: 'Levotiroxina 50 mcg',
    abreviatura: 'LEV',
    indicacion: '1 comprimido en ayunas',
    medico: 'Dra. Lucía Fernández',
    fechaEmision: '2026-09-29',
    vigenciaDias: 60,
    codigo: 'RX-2026-0497',
    riesgo: false,
  },
  {
    id: '3',
    idPaciente: 'p1',
    medicamento: 'Vitamina D 2000 UI',
    abreviatura: 'VIT',
    indicacion: '1 gota por día con el almuerzo',
    medico: 'Dra. Lucía Fernández',
    fechaEmision: '2026-08-01',
    vigenciaDias: 30,
    codigo: 'RX-2026-0352',
    riesgo: false,
  },
  {
    id: 'r1',
    idPaciente: 'p2',
    medicamento: 'Atorvastatina 10 mg',
    abreviatura: 'ATO',
    indicacion: '1 comprimido por noche',
    medico: 'Dra. Lucía Fernández',
    fechaEmision: '2026-09-15',
    vigenciaDias: 30,
    codigo: 'RX-2026-0301',
    riesgo: false,
  },
  {
    id: 'r2',
    idPaciente: 'p5',
    medicamento: 'Bisoprolol 2,5 mg',
    abreviatura: 'BIS',
    indicacion: '1 comprimido por la mañana',
    medico: 'Dr. Ricardo Paz',
    fechaEmision: '2026-09-22',
    vigenciaDias: 30,
    codigo: 'RX-2026-0338',
    riesgo: false,
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
