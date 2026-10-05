// Estructura de la preconsulta: qué se le pregunta al paciente y qué se guarda.

export type RespuestasPreconsulta = {
  motivo: string;
  duracion: string;
  sintomas: string[];
  medicacion: string;
  alergias: string;
  adicional: string;
};

export const RESPUESTAS_VACIAS: RespuestasPreconsulta = {
  motivo: '',
  duracion: '',
  sintomas: [],
  medicacion: '',
  alergias: '',
  adicional: '',
};

// Una preconsulta enviada. Se copian los datos del turno para que el médico no dependa de los turnos del paciente.
export type Preconsulta = {
  turnoId: string;
  paciente: string;
  medico: string;
  especialidad: string;
  fecha: string; // AAAA-MM-DD
  hora: string; // HH:MM
  respuestas: RespuestasPreconsulta;
  enviadaEl: string; // AAAA-MM-DD HH:MM
};

type TipoPaso = 'texto' | 'sintomas';

type Paso = {
  clave: keyof RespuestasPreconsulta;
  tipo: TipoPaso;
};

// Orden en el que el asistente hace las preguntas.
export const PASOS: Paso[] = [
  { clave: 'motivo', tipo: 'texto' },
  { clave: 'duracion', tipo: 'texto' },
  { clave: 'sintomas', tipo: 'sintomas' },
  { clave: 'medicacion', tipo: 'texto' },
  { clave: 'alergias', tipo: 'texto' },
  { clave: 'adicional', tipo: 'texto' },
];

export const SINTOMAS = [
  'Dolor de cabeza',
  'Náuseas',
  'Fiebre',
  'Mareos',
  'Visión borrosa',
  'Tos',
  'Cansancio',
  'Dolor de pecho',
  'Dificultad para respirar',
];

// Síntomas ante los que se le recomienda al paciente no esperar al turno.
export const SINTOMAS_DE_ALARMA = ['Dolor de pecho', 'Dificultad para respirar'];

export const ETIQUETAS_CAMPOS: Record<keyof RespuestasPreconsulta, string> = {
  motivo: 'Motivo de la consulta',
  duracion: 'Desde cuándo',
  sintomas: 'Síntomas',
  medicacion: 'Medicación actual',
  alergias: 'Alergias',
  adicional: 'Algo más',
};
