// Tipos de las personas y los turnos del consultorio, y funciones de fechas.
// Los datos vienen de la API (ver servicios/api.ts): acá solo está la forma que tienen dentro de la app.

// Un paciente del consultorio, como lo ven el médico y la secretaría.
export type Paciente = {
  id: string;
  dni: string; // el mismo DNI en dos consultorios es la misma persona, con una ficha distinta en cada uno
  nombre: string;
  apellido: string;
  iniciales: string;
  email: string;
  coberturaIds: string[]; // ids de sus obras sociales
  cobertura: string; // sus obras sociales, como texto ("Swiss Medical SMG20 / OSDE 210")
  plan: string;
  numeroAfiliado: string; // sus números de afiliado, como texto
  alergias: string;
  alerta: string; // aviso importante para el médico ('' si no hay ninguno)
  faltas: number; // faltas de antes de usar la app (lo usa el puntaje de ausentismo)
  asistencias: number; // asistencias de antes de usar la app (restan puntos de riesgo, ver datos/ausentismo.ts)
};

export type EstadoTurno = 'confirmado' | 'pendiente' | 'cancelado' | 'atendido' | 'ausente';

// Lo que el médico anota al atender un turno. Todas las consultas de un paciente forman su historia clínica.
export type Consulta = {
  motivo: string;
  diagnostico: string;
  indicaciones: string; // tratamiento, estudios, cuándo volver
  notas: string; // notas privadas del médico ('' si no hay)
};

// ============================================================
// FECHAS
// ============================================================

// Fecha de hoy como texto 'AAAA-MM-DD', el formato de los turnos.
const fechaHoy = new Date();
export const HOY = `${fechaHoy.getFullYear()}-${String(fechaHoy.getMonth() + 1).padStart(2, '0')}-${String(fechaHoy.getDate()).padStart(2, '0')}`;

// Fecha dentro de N días como texto 'AAAA-MM-DD'.
export function fechaDentroDe(dias: number) {
  const f = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), fechaHoy.getDate() + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}
