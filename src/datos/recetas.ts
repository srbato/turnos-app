// Las recetas que emite el médico. Vienen de la API (ver contextos/RecetasContext.tsx).

export type Receta = {
  id: string;
  idPaciente: string; // a quién se la recetaron
  idMedico: string; // quién la hizo
  medicamento: string;
  abreviatura: string; // 3 letras para el ícono de la tarjeta
  indicacion: string; // cómo tomarlo
  medico: string; // nombre del médico que la hizo
  fechaEmision: string; // AAAA-MM-DD
  vigenciaDias: number; // días de validez desde la emisión
  codigo: string; // el que se muestra en la farmacia
  riesgo: boolean; // el médico la marcó como posiblemente riesgosa junto con otros medicamentos
};

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
