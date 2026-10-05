// Datos de prueba de las personas del consultorio (pacientes, médicos con su usuario) y turnos de ejemplo.
// Todavía no hay backend: cuando lo haya, estos datos van a venir de la API.

// ============================================================
// PERSONAS
// ============================================================

export type Paciente = {
  id: string;
  nombre: string;
  apellido: string;
  iniciales: string;
  email: string;
  cobertura: string;
  plan: string;
  numeroAfiliado: string;
  alergias: string;
  alerta: string; // aviso importante para el médico ('' si no hay ninguno)
};

// El primero de la lista (Valentín) es el paciente que usa la app.
// Los demás son pacientes de ejemplo que aparecen en las agendas de los médicos.
export const PACIENTES: Paciente[] = [
  {
    id: 'p1',
    nombre: 'Valentín',
    apellido: 'Martínez',
    iniciales: 'VM',
    email: 'valentin@test.com',
    cobertura: 'Swiss Medical',
    plan: 'SMG20',
    numeroAfiliado: '62-4418902/01',
    alergias: 'penicilina',
    alerta: '',
  },
  {
    id: 'p2',
    nombre: 'Sofía',
    apellido: 'Gutiérrez',
    iniciales: 'SG',
    email: 'sofia@test.com',
    cobertura: 'OSDE',
    plan: '210',
    numeroAfiliado: '31-5566778/02',
    alergias: 'ninguna',
    alerta: '',
  },
  {
    id: 'p3',
    nombre: 'Martín',
    apellido: 'Bianchi',
    iniciales: 'MB',
    email: 'martin@test.com',
    cobertura: 'Medifé',
    plan: 'Bronce',
    numeroAfiliado: '44-1122334/01',
    alergias: 'aspirina',
    alerta: 'Interacción medicamentosa detectada',
  },
  {
    id: 'p4',
    nombre: 'Jorge',
    apellido: 'Almirón',
    iniciales: 'JA',
    email: 'jorge@test.com',
    cobertura: 'PAMI',
    plan: '',
    numeroAfiliado: '15-9988776/00',
    alergias: 'ninguna',
    alerta: '',
  },
  {
    id: 'p5',
    nombre: 'Camila',
    apellido: 'Rossi',
    iniciales: 'CR',
    email: 'camila@test.com',
    cobertura: 'Galeno',
    plan: 'Oro',
    numeroAfiliado: '27-3344556/01',
    alergias: 'látex',
    alerta: '',
  },
  {
    id: 'p6',
    nombre: 'Elsa',
    apellido: 'Domínguez',
    iniciales: 'ED',
    email: 'elsa@test.com',
    cobertura: 'PAMI',
    plan: '',
    numeroAfiliado: '15-1234567/00',
    alergias: 'ninguna',
    alerta: '',
  },
];

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
// MÉDICOS (para sacar turno y para iniciar sesión como médico)
// ============================================================

export type Medico = {
  nombre: string;
  iniciales: string;
  especialidad: string;
  consultorio: string;
  matricula: string;
  // Usuario de prueba para entrar como este médico (todavía no hay backend).
  email: string;
  password: string;
};

export const MEDICOS: Medico[] = [
  {
    nombre: 'Dr. Ricardo Paz',
    iniciales: 'RP',
    especialidad: 'Cardiología',
    consultorio: 'Consultorio 5',
    matricula: 'MN 104.233',
    email: 'paz@t.com',
    password: 'm',
  },
  {
    nombre: 'Dra. Ana Torres',
    iniciales: 'AT',
    especialidad: 'Cardiología',
    consultorio: 'Consultorio 4',
    matricula: 'MN 121.876',
    email: 'torres@t.com',
    password: 'm',
  },
  {
    nombre: MEDICA.nombre,
    iniciales: MEDICA.iniciales,
    especialidad: MEDICA.especialidad,
    consultorio: 'Consultorio 3',
    matricula: MEDICA.matricula,
    email: 'm@t.com',
    password: 'm',
  },
  {
    nombre: 'Dra. Mariela Sosa',
    iniciales: 'MS',
    especialidad: 'Pediatría',
    consultorio: 'Consultorio 1',
    matricula: 'MN 098.551',
    email: 'sosa@t.com',
    password: 'm',
  },
  {
    nombre: 'Dr. Gustavo Ibáñez',
    iniciales: 'GI',
    especialidad: 'Traumatología',
    consultorio: 'Consultorio 2',
    matricula: 'MN 112.640',
    email: 'ibanez@t.com',
    password: 'm',
  },
];

export const ESPECIALIDADES = ['Cardiología', 'Clínica médica', 'Pediatría', 'Traumatología'];

// ============================================================
// TURNOS (de todos los pacientes)
// ============================================================

// Fecha de hoy como texto 'AAAA-MM-DD'. Los turnos de ejemplo de las agendas
// de los médicos son de hoy, así siempre aparecen al abrir la app.
const fechaHoy = new Date();
export const HOY = `${fechaHoy.getFullYear()}-${String(fechaHoy.getMonth() + 1).padStart(2, '0')}-${String(fechaHoy.getDate()).padStart(2, '0')}`;

export type EstadoTurno = 'confirmado' | 'pendiente' | 'cancelado' | 'atendido';

// Turno de ejemplo (sin cobertura): TurnosContext lo completa y lo usa como dato inicial.
export type TurnoDeEjemplo = {
  id: string;
  idPaciente: string; // id del paciente (ver PACIENTES)
  medico: string;
  especialidad: string;
  consultorio: string;
  fecha: string; // formato AAAA-MM-DD
  hora: string; // formato HH:MM
  sede: string;
  estado: EstadoTurno;
  instrucciones: string[];
};

export const TURNOS_DE_EJEMPLO: TurnoDeEjemplo[] = [
  // ----- Turnos de Valentín (el paciente que usa la app) -----
  {
    id: '1',
    idPaciente: 'p1',
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
    idPaciente: 'p1',
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
    idPaciente: 'p1',
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
    idPaciente: 'p1',
    medico: 'Dr. Gustavo Ibáñez',
    especialidad: 'Traumatología',
    consultorio: 'Consultorio 2',
    fecha: '2026-10-10',
    hora: '11:15',
    sede: NOMBRE_CONSULTORIO,
    estado: 'confirmado',
    instrucciones: [],
  },

  // ----- Turnos de hoy de otros pacientes (agenda de la Dra. Fernández) -----
  {
    id: '5',
    idPaciente: 'p2',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    consultorio: 'Consultorio 3',
    fecha: HOY,
    hora: '09:00',
    sede: NOMBRE_CONSULTORIO,
    estado: 'confirmado',
    instrucciones: [],
  },
  {
    id: '6',
    idPaciente: 'p3',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    consultorio: 'Consultorio 3',
    fecha: HOY,
    hora: '09:20',
    sede: NOMBRE_CONSULTORIO,
    estado: 'confirmado',
    instrucciones: [],
  },
  {
    id: '7',
    idPaciente: 'p4',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    consultorio: 'Consultorio 3',
    fecha: HOY,
    hora: '09:40',
    sede: NOMBRE_CONSULTORIO,
    estado: 'pendiente',
    instrucciones: [],
  },
  {
    id: '8',
    idPaciente: 'p5',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    consultorio: 'Consultorio 3',
    fecha: HOY,
    hora: '10:00',
    sede: NOMBRE_CONSULTORIO,
    estado: 'pendiente',
    instrucciones: [],
  },
  {
    id: '9',
    idPaciente: 'p6',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    consultorio: 'Consultorio 3',
    fecha: HOY,
    hora: '11:00',
    sede: NOMBRE_CONSULTORIO,
    estado: 'confirmado',
    instrucciones: [],
  },

  // ----- Turnos de hoy de otros pacientes (agenda del Dr. Paz) -----
  {
    id: '10',
    idPaciente: 'p4',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    consultorio: 'Consultorio 5',
    fecha: HOY,
    hora: '15:00',
    sede: NOMBRE_CONSULTORIO,
    estado: 'pendiente',
    instrucciones: [],
  },
  {
    id: '11',
    idPaciente: 'p5',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    consultorio: 'Consultorio 5',
    fecha: HOY,
    hora: '15:40',
    sede: NOMBRE_CONSULTORIO,
    estado: 'confirmado',
    instrucciones: [],
  },
];

// El paciente que usa la app es el primero de la lista (Valentín). Sus datos editables viven en PerfilPacienteContext.
export const ID_PACIENTE_APP = PACIENTES[0].id;
