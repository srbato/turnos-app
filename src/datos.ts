// Datos de prueba de la app.
// Todavía no hay backend: por ahora todas las pantallas leen los datos de acá,
// así coinciden entre sí. Cuando haya backend, estos datos van a venir de la API.

// ============================================================
// PERSONAS
// ============================================================

export const PACIENTE = {
  nombre: 'Valentín',
  iniciales: 'VM',
  email: 'valentin@test.com',
  cobertura: 'Swiss Medical',
  plan: 'SMG20',
  numeroAfiliado: '62-4418902/01',
};

export const MEDICA = {
  nombre: 'Dra. Lucía Fernández',
  iniciales: 'LF',
  email: 'lucia.fernandez@consultoriosrivadavia.com',
  especialidad: 'Clínica médica',
  matricula: 'MN 118.402',
};

export const SECRETARIA = {
  nombre: 'Norma Aguilar',
  iniciales: 'NA',
  email: 'norma.aguilar@consultoriosrivadavia.com',
  horario: 'Lunes a viernes · 8:00 a 16:00',
};

export const ADMINISTRADOR = {
  nombre: 'Gustavo Aráoz',
  iniciales: 'GA',
  email: 'gustavo.araoz@consultoriosrivadavia.com',
};

export const NOMBRE_CONSULTORIO = 'Consultorios Rivadavia';

// ============================================================
// PACIENTE: TURNOS, ESTUDIOS Y LISTA DE ESPERA
// ============================================================

export type EstadoTurno = 'confirmado' | 'pendiente' | 'cancelado';

export type Turno = {
  id: string;
  medico: string;
  especialidad: string;
  consultorio: string;
  fecha: string; // formato AAAA-MM-DD
  hora: string; // formato HH:MM
  sede: string;
  estado: EstadoTurno;
  instrucciones: string[];
};

export const TURNOS_PACIENTE: Turno[] = [
  {
    id: '1',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    consultorio: 'Consultorio 3',
    fecha: '2026-09-29',
    hora: '10:30',
    sede: NOMBRE_CONSULTORIO,
    estado: 'confirmado',
    instrucciones: ['Ayuno de 8 horas antes del turno', 'Llevá la orden de Swiss Medical'],
  },
  {
    id: '2',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    consultorio: 'Consultorio 5',
    fecha: '2026-10-03',
    hora: '09:00',
    sede: NOMBRE_CONSULTORIO,
    estado: 'pendiente',
    instrucciones: [],
  },
  {
    id: '3',
    medico: 'Dra. Mariela Sosa',
    especialidad: 'Pediatría',
    consultorio: 'Consultorio 1',
    fecha: '2026-09-20',
    hora: '16:00',
    sede: NOMBRE_CONSULTORIO,
    estado: 'cancelado',
    instrucciones: [],
  },
  {
    id: '4',
    medico: 'Dr. Gustavo Ibáñez',
    especialidad: 'Traumatología',
    consultorio: 'Consultorio 2',
    fecha: '2026-10-10',
    hora: '11:15',
    sede: NOMBRE_CONSULTORIO,
    estado: 'confirmado',
    instrucciones: [],
  },
];

export type EstudioPendiente = {
  id: string;
  tipo: string;
  titulo: string;
  detalle: string;
};

export const ESTUDIOS_PENDIENTES: EstudioPendiente[] = [
  { id: '1', tipo: 'LAB', titulo: 'Laboratorio completo', detalle: 'Orden vence el 30/09' },
  { id: '2', tipo: 'ECO', titulo: 'Ecografía abdominal', detalle: 'Turno a coordinar' },
];

export type ListaEspera = {
  posicion: number;
  especialidad: string;
};

export const LISTA_ESPERA: ListaEspera | null = { posicion: 3, especialidad: 'Cardiología' };

// ============================================================
// PACIENTE: MEDICAMENTOS
// ============================================================

export type Medicamento = {
  id: string;
  abreviatura: string;
  nombre: string;
  detalle: string;
  riesgo: boolean;
};

export const MEDICAMENTOS: Medicamento[] = [
  {
    id: '1',
    abreviatura: 'ENA',
    nombre: 'Enalapril 10 mg',
    detalle: '1 comprimido · 8:00 h · hipertensión',
    riesgo: true,
  },
  {
    id: '2',
    abreviatura: 'IBU',
    nombre: 'Ibuprofeno 400 mg',
    detalle: 'Cada 8 h si hay dolor · automedicado',
    riesgo: true,
  },
  {
    id: '3',
    abreviatura: 'LEV',
    nombre: 'Levotiroxina 50 mcg',
    detalle: '1 comprimido en ayunas · tiroides',
    riesgo: false,
  },
  {
    id: '4',
    abreviatura: 'VIT',
    nombre: 'Vitamina D 2000 UI',
    detalle: '1 gota por día · con el almuerzo',
    riesgo: false,
  },
];

// ============================================================
// MÉDICA: AGENDA DE HOY
// ============================================================

export type EstadoTurnoAgenda = 'confirmado' | 'pendiente' | 'en_espera' | 'bloqueado';

export type TurnoAgenda = {
  id: string;
  hora: string;
  duracionMin: number;
  paciente: string;
  subtitulo: string;
  estado: EstadoTurnoAgenda;
  riesgoAlto: boolean;
};

export const TURNOS_HOY: TurnoAgenda[] = [
  {
    id: '1',
    hora: '09:00',
    duracionMin: 20,
    paciente: 'Sofía Gutiérrez',
    subtitulo: 'Control · OSDE 210 · preconsulta lista',
    estado: 'confirmado',
    riesgoAlto: false,
  },
  {
    id: '2',
    hora: '09:20',
    duracionMin: 20,
    paciente: 'Martín Bianchi',
    subtitulo: 'Interacción medicamentosa detectada',
    estado: 'confirmado',
    riesgoAlto: true,
  },
  {
    id: '3',
    hora: '09:40',
    duracionMin: 20,
    paciente: 'Jorge Almirón',
    subtitulo: 'Primera vez · PAMI · sin preconsulta',
    estado: 'pendiente',
    riesgoAlto: false,
  },
  {
    id: '4',
    hora: '10:00',
    duracionMin: 20,
    paciente: 'Camila Rossi',
    subtitulo: 'Resultados de laboratorio · Galeno',
    estado: 'en_espera',
    riesgoAlto: false,
  },
  {
    id: '5',
    hora: '10:20',
    duracionMin: 20,
    paciente: MEDICA.nombre,
    subtitulo: 'Bloqueo · ateneo clínico',
    estado: 'bloqueado',
    riesgoAlto: false,
  },
  {
    id: '6',
    hora: '11:00',
    duracionMin: 40,
    paciente: 'Elsa Domínguez',
    subtitulo: 'Sobreturno · 82 años · acompañada',
    estado: 'confirmado',
    riesgoAlto: false,
  },
];
