// Tabla propia de interacciones medicamentosas (no se usa ninguna API externa).
// Solo INFORMA la interacción al médico: nunca sugiere tratamientos ni alternativas.

type Interaccion = {
  // Fragmentos del nombre de cada medicamento, en minúscula ("enalapril" coincide con "Enalapril 10 mg").
  medicamentos: [string, string];
  descripcion: string;
};

const INTERACCIONES: Interaccion[] = [
  {
    medicamentos: ['enalapril', 'ibuprofeno'],
    descripcion: 'El ibuprofeno puede subir la presión y afectar el riñón.',
  },
  {
    medicamentos: ['bisoprolol', 'verapamilo'],
    descripcion: 'Puede enlentecer demasiado el ritmo del corazón.',
  },
  {
    medicamentos: ['atorvastatina', 'claritromicina'],
    descripcion: 'Puede aumentar el riesgo de daño muscular.',
  },
];

export type InteraccionDetectada = {
  medicamentos: [string, string]; // los nombres tal como los tiene cargados el paciente
  descripcion: string;
};

// Revisa una lista de nombres de medicamentos y devuelve las interacciones que encuentra.
export function detectarInteracciones(nombres: string[]): InteraccionDetectada[] {
  const encontradas: InteraccionDetectada[] = [];
  for (const interaccion of INTERACCIONES) {
    const primero = nombres.find((n) => n.toLowerCase().includes(interaccion.medicamentos[0]));
    const segundo = nombres.find((n) => n.toLowerCase().includes(interaccion.medicamentos[1]));
    if (primero && segundo) {
      encontradas.push({ medicamentos: [primero, segundo], descripcion: interaccion.descripcion });
    }
  }
  return encontradas;
}
