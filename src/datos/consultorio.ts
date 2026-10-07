// Datos de prueba de las personas del consultorio (pacientes, médicos con su usuario) y turnos de ejemplo.
// Todavía no hay backend: cuando lo haya, estos datos van a venir de la API.

// ============================================================
// PERSONAS
// ============================================================

export type Paciente = {
  id: string;
  dni: string; // identifica a la persona: el mismo DNI en dos consultorios es la misma persona, con una ficha distinta en cada uno
  nombre: string;
  apellido: string;
  iniciales: string;
  email: string;
  cobertura: string;
  plan: string;
  numeroAfiliado: string;
  alergias: string;
  alerta: string; // aviso importante para el médico ('' si no hay ninguno)
  faltas: number; // turnos anteriores a los que no se presentó (lo usa el puntaje de ausentismo)
  asistencias: number; // turnos anteriores a los que asistió (restan puntos de riesgo, ver datos/ausentismo.ts)
};

// El primero de la lista (Valentín) es el paciente que usa la app.
// Los demás son pacientes de ejemplo que aparecen en las agendas de los médicos.
const PACIENTES_RIVADAVIA: Paciente[] = [
  {
    id: 'p1',
    dni: '40.123.456',
    nombre: 'Valentín',
    apellido: 'Martínez',
    iniciales: 'VM',
    email: 'valentin@test.com',
    cobertura: 'Swiss Medical',
    plan: 'SMG20',
    numeroAfiliado: '62-4418902/01',
    alergias: 'penicilina',
    alerta: '',
    faltas: 0,
    asistencias: 4,
  },
  {
    id: 'p2',
    dni: '41.220.118',
    nombre: 'Sofía',
    apellido: 'Gutiérrez',
    iniciales: 'SG',
    email: 'sofia@test.com',
    cobertura: 'OSDE',
    plan: '210',
    numeroAfiliado: '31-5566778/02',
    alergias: 'ninguna',
    alerta: '',
    faltas: 0,
    asistencias: 6,
  },
  {
    id: 'p3',
    dni: '33.907.554',
    nombre: 'Martín',
    apellido: 'Bianchi',
    iniciales: 'MB',
    email: 'martin@test.com',
    cobertura: 'Medifé',
    plan: 'Bronce',
    numeroAfiliado: '44-1122334/01',
    alergias: 'aspirina',
    alerta: 'Interacción medicamentosa detectada',
    faltas: 2,
    asistencias: 1,
  },
  {
    id: 'p4',
    dni: '12.554.903',
    nombre: 'Jorge',
    apellido: 'Almirón',
    iniciales: 'JA',
    email: 'jorge@test.com',
    cobertura: 'PAMI',
    plan: '',
    numeroAfiliado: '15-9988776/00',
    alergias: 'ninguna',
    alerta: '',
    faltas: 0,
    asistencias: 2,
  },
  {
    id: 'p5',
    dni: '38.671.240',
    nombre: 'Camila',
    apellido: 'Rossi',
    iniciales: 'CR',
    email: 'camila@test.com',
    cobertura: 'Galeno',
    plan: 'Oro',
    numeroAfiliado: '27-3344556/01',
    alergias: 'látex',
    alerta: '',
    faltas: 3,
    asistencias: 0,
  },
  {
    id: 'p6',
    dni: '10.348.771',
    nombre: 'Elsa',
    apellido: 'Domínguez',
    iniciales: 'ED',
    email: 'elsa@test.com',
    cobertura: 'PAMI',
    plan: '',
    numeroAfiliado: '15-1234567/00',
    alergias: 'ninguna',
    alerta: '',
    faltas: 0,
    asistencias: 9,
  },
];

export const MEDICA = {
  nombre: 'Dra. Lucía Fernández',
  iniciales: 'LF',
  email: 'lucia.fernandez@consultoriosrivadavia.com',
  especialidad: 'Clínica médica',
  matricula: 'MN 118.402',
};

export type Secretaria = {
  nombre: string;
  iniciales: string;
  email: string;
  horario: string;
};

const SECRETARIAS_RIVADAVIA: Secretaria[] = [
  {
    nombre: 'Norma Aguilar',
    iniciales: 'NA',
    email: 'norma.aguilar@consultoriosrivadavia.com',
    horario: 'Lunes a viernes · 8:00 a 16:00',
  },
  {
    nombre: 'Carolina Ríos',
    iniciales: 'CR',
    email: 'carolina.rios@consultoriosrivadavia.com',
    horario: 'Lunes a viernes · 13:00 a 20:00',
  },
];

const NOMBRE_RIVADAVIA = 'Consultorios Rivadavia';

// ============================================================
// MÉDICOS (para sacar turno y para iniciar sesión como médico)
// ============================================================

export type Medico = {
  nombre: string;
  iniciales: string;
  especialidad: string;
  sala: string;
  matricula: string;
  // Usuario de prueba para entrar como este médico (todavía no hay backend).
  email: string;
  password: string;
  // Coberturas (obras sociales) que acepta: el paciente solo ve a los médicos que aceptan alguna de las suyas.
  coberturaIds: string[];
};

const MEDICOS_RIVADAVIA: Medico[] = [
  {
    nombre: 'Dr. Ricardo Paz',
    iniciales: 'RP',
    especialidad: 'Cardiología',
    sala: 'Consultorio 5',
    matricula: 'MN 104.233',
    email: 'paz@t.com',
    password: 'm',
    coberturaIds: ['swiss-smg20', 'galeno-220'],
  },
  {
    nombre: 'Dra. Ana Torres',
    iniciales: 'AT',
    especialidad: 'Cardiología',
    sala: 'Consultorio 4',
    matricula: 'MN 121.876',
    email: 'torres@t.com',
    password: 'm',
    coberturaIds: ['osde-210'],
  },
  {
    nombre: MEDICA.nombre,
    iniciales: MEDICA.iniciales,
    especialidad: MEDICA.especialidad,
    sala: 'Consultorio 3',
    matricula: MEDICA.matricula,
    email: 'm@t.com',
    password: 'm',
    coberturaIds: ['swiss-smg20', 'osde-210'],
  },
  {
    nombre: 'Dra. Mariela Sosa',
    iniciales: 'MS',
    especialidad: 'Pediatría',
    sala: 'Consultorio 1',
    matricula: 'MN 098.551',
    email: 'sosa@t.com',
    password: 'm',
    coberturaIds: ['osde-210'],
  },
  {
    nombre: 'Dr. Gustavo Ibáñez',
    iniciales: 'GI',
    especialidad: 'Traumatología',
    sala: 'Consultorio 2',
    matricula: 'MN 112.640',
    email: 'ibanez@t.com',
    password: 'm',
    coberturaIds: ['swiss-smg20'],
  },
  {
    nombre: 'Dr. Héctor Duarte',
    iniciales: 'HD',
    especialidad: 'Cardiología',
    sala: 'Consultorio 6',
    matricula: 'MN 109.775',
    email: 'duarte@t.com',
    password: 'm',
    coberturaIds: ['galeno-220'], // no atiende ninguna cobertura de Valentín: no se le ofrece
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

// Fecha dentro de N días como texto 'AAAA-MM-DD' (para los turnos de ejemplo que dependen de hoy).
export function fechaDentroDe(dias: number) {
  const f = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), fechaHoy.getDate() + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

// Primera fecha a partir de dentro de "minimoDias" días que cae en uno de esos días de la semana (0 = domingo).
// Sirve para los turnos de ejemplo que dependen de hoy pero tienen que caer en un día en que el médico atiende.
export function fechaDeAtencion(minimoDias: number, diasSemana: number[]) {
  let dias = minimoDias;
  while (!diasSemana.includes(new Date(fechaHoy.getFullYear(), fechaHoy.getMonth(), fechaHoy.getDate() + dias).getDay())) {
    dias++;
  }
  return fechaDentroDe(dias);
}

export type EstadoTurno = 'confirmado' | 'pendiente' | 'cancelado' | 'atendido' | 'ausente';

// Lo que el médico anota al atender un turno. Todas las consultas de un paciente forman su historia clínica.
export type Consulta = {
  motivo: string;
  diagnostico: string;
  indicaciones: string; // tratamiento, estudios, cuándo volver
  notas: string; // notas privadas del médico ('' si no hay)
};

// Turno de ejemplo (sin cobertura): TurnosContext lo completa y lo usa como dato inicial.
export type TurnoDeEjemplo = {
  id: string;
  idPaciente: string; // id del paciente (ver PACIENTES)
  medico: string;
  especialidad: string;
  sala: string;
  fecha: string; // formato AAAA-MM-DD
  hora: string; // formato HH:MM
  sede: string;
  estado: EstadoTurno;
  instrucciones: string[];
  avisos?: string[]; // fechas (AAAA-MM-DD) en que Secretaría le avisó al paciente que confirme (se necesitan 3 para actuar)
  confirmo?: boolean; // el paciente confirmó este turno alguna vez (aunque después lo hayan atendido)
  motivoCancelacion?: string; // si el sistema lo canceló solo (ej. el médico no atiende ese día); si falta, lo canceló una persona
  adelantoDesde?: string; // AAAA-MM-DD desde que está en lista de espera para adelantar este turno (si falta, no está)
  reservadoEl?: string; // AAAA-MM-DD en que se reservó (si falta, se asume que se reservó hoy)
  consulta?: Consulta; // lo que anotó el médico al atenderlo (solo en turnos atendidos)
};

const TURNOS_RIVADAVIA: TurnoDeEjemplo[] = [
  // ----- Turnos de Valentín (el paciente que usa la app) -----
  {
    id: '1',
    idPaciente: 'p1',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    sala: 'Consultorio 3',
    fecha: '2026-09-29',
    hora: '10:30',
    sede: NOMBRE_RIVADAVIA,
    estado: 'confirmado',
    instrucciones: ['Ayuno de 8 horas antes del turno', 'Llevá la orden de Swiss Medical'],
  },
  {
    id: '2',
    idPaciente: 'p1',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    sala: 'Consultorio 5',
    fecha: '2026-10-03',
    hora: '09:00',
    sede: NOMBRE_RIVADAVIA,
    estado: 'pendiente',
    instrucciones: [],
  },
  {
    id: '3',
    idPaciente: 'p1',
    medico: 'Dra. Mariela Sosa',
    especialidad: 'Pediatría',
    sala: 'Consultorio 1',
    fecha: '2026-09-20',
    hora: '16:00',
    sede: NOMBRE_RIVADAVIA,
    estado: 'cancelado',
    instrucciones: [],
  },
  {
    id: '4',
    idPaciente: 'p1',
    medico: 'Dr. Gustavo Ibáñez',
    especialidad: 'Traumatología',
    sala: 'Consultorio 2',
    fecha: fechaDeAtencion(4, [1, 2, 3, 4, 5]), // Ibáñez atiende de lunes a viernes
    hora: '11:15',
    sede: NOMBRE_RIVADAVIA,
    estado: 'confirmado',
    instrucciones: [],
  },

  // ----- Turnos de hoy de otros pacientes (agenda de la Dra. Fernández) -----
  {
    id: '5',
    idPaciente: 'p2',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    sala: 'Consultorio 3',
    fecha: HOY,
    hora: '09:00',
    sede: NOMBRE_RIVADAVIA,
    estado: 'confirmado',
    instrucciones: [],
  },
  {
    id: '6',
    idPaciente: 'p3',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    sala: 'Consultorio 3',
    fecha: HOY,
    hora: '09:20',
    sede: NOMBRE_RIVADAVIA,
    estado: 'ausente',
    instrucciones: [],
  },
  {
    id: '7',
    idPaciente: 'p4',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    sala: 'Consultorio 3',
    fecha: HOY,
    hora: '09:40',
    sede: NOMBRE_RIVADAVIA,
    estado: 'ausente',
    instrucciones: [],
  },
  {
    id: '8',
    idPaciente: 'p5',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    sala: 'Consultorio 3',
    fecha: HOY,
    hora: '10:00',
    sede: NOMBRE_RIVADAVIA,
    estado: 'pendiente',
    instrucciones: [],
  },
  {
    id: '9',
    idPaciente: 'p6',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    sala: 'Consultorio 3',
    fecha: HOY,
    hora: '11:00',
    sede: NOMBRE_RIVADAVIA,
    estado: 'confirmado',
    reservadoEl: '2026-06-20',
    instrucciones: [],
  },

  // ----- Turnos de hoy de otros pacientes (agenda del Dr. Paz) -----
  {
    id: '10',
    idPaciente: 'p4',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    sala: 'Consultorio 5',
    fecha: HOY,
    hora: '15:00',
    sede: NOMBRE_RIVADAVIA,
    estado: 'pendiente',
    instrucciones: [],
  },
  {
    id: '11',
    idPaciente: 'p5',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    sala: 'Consultorio 5',
    fecha: HOY,
    hora: '15:40',
    sede: NOMBRE_RIVADAVIA,
    estado: 'confirmado',
    instrucciones: [],
  },
  // Turno cancelado hoy: queda liberado para ofrecérselo a la lista de espera de Cardiología.
  {
    id: '12',
    idPaciente: 'p3',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    sala: 'Consultorio 5',
    fecha: HOY,
    hora: '16:20',
    sede: NOMBRE_RIVADAVIA,
    estado: 'cancelado',
    instrucciones: [],
  },
  // Adelantos: un turno liberado dentro de 4 días con Paz, y dos pacientes con turno más tarde que están en la
  // lista de espera para adelantarlo (Valentín espera hace más tiempo, así que es el primero).
  {
    id: '13',
    idPaciente: 'p6',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    sala: 'Consultorio 5',
    fecha: fechaDeAtencion(4, [1, 2, 3, 4, 5]),
    hora: '09:20',
    sede: NOMBRE_RIVADAVIA,
    estado: 'cancelado',
    instrucciones: [],
  },
  {
    id: '14',
    idPaciente: 'p1',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    sala: 'Consultorio 5',
    fecha: fechaDeAtencion(12, [1, 2, 3, 4, 5]),
    hora: '10:00',
    sede: NOMBRE_RIVADAVIA,
    estado: 'confirmado',
    instrucciones: [],
    adelantoDesde: '2026-09-20',
  },
  {
    id: '15',
    idPaciente: 'p4',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    sala: 'Consultorio 5',
    fecha: fechaDeAtencion(9, [1, 2, 3, 4, 5]),
    hora: '15:00',
    sede: NOMBRE_RIVADAVIA,
    estado: 'pendiente',
    instrucciones: [],
    adelantoDesde: '2026-09-28',
  },
  // ----- Consultas anteriores (la historia clínica de ejemplo) -----
  {
    id: '16',
    idPaciente: 'p2',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    sala: 'Consultorio 3',
    fecha: fechaDeAtencion(-40, [1, 2, 3, 4, 5]),
    hora: '10:00',
    sede: NOMBRE_RIVADAVIA,
    estado: 'atendido',
    instrucciones: [],
    consulta: {
      motivo: 'Dolor de garganta y fiebre desde hace 3 días',
      diagnostico: 'Faringitis aguda',
      indicaciones: 'Ibuprofeno 400 mg cada 8 horas por 5 días. Tomar mucho líquido. Volver si la fiebre sigue en 3 días.',
      notas: 'Sin placas. Si se repite, pedir hisopado.',
    },
  },
  {
    id: '17',
    idPaciente: 'p2',
    medico: MEDICA.nombre,
    especialidad: MEDICA.especialidad,
    sala: 'Consultorio 3',
    fecha: fechaDeAtencion(-12, [1, 2, 3, 4, 5]),
    hora: '09:40',
    sede: NOMBRE_RIVADAVIA,
    estado: 'atendido',
    instrucciones: [],
    consulta: {
      motivo: 'Control después de la faringitis',
      diagnostico: 'Faringitis resuelta',
      indicaciones: 'Alta. No hace falta medicación.',
      notas: '',
    },
  },
  {
    id: '18',
    idPaciente: 'p1',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    sala: 'Consultorio 5',
    fecha: fechaDeAtencion(-25, [1, 2, 3, 4, 5]),
    hora: '15:20',
    sede: NOMBRE_RIVADAVIA,
    estado: 'atendido',
    instrucciones: [],
    consulta: {
      motivo: 'Control de presión',
      diagnostico: 'Hipertensión arterial controlada',
      indicaciones: 'Seguir con enalapril 10 mg a la mañana. Control en 3 meses con electrocardiograma.',
      notas: '',
    },
  },
];

// ============================================================
// CONSULTORIOS (el "super objeto")
// ============================================================

// Un consultorio encapsula a las personas de los tres roles (pacientes, médicos y secretarias) y sus turnos.
// La app administra varios consultorios, pero cada uno solo conoce lo suyo: una misma persona (mismo DNI) puede
// figurar en dos consultorios, y cada uno guarda su propia ficha, que el otro no ve. Por eso el resto de la app
// nunca lee listas sueltas de pacientes o médicos: siempre le pregunta al consultorio activo (ConsultorioContext).
export type Consultorio = {
  id: string;
  nombre: string;
  direccion: string;
  pacientes: Paciente[];
  medicos: Medico[];
  secretarias: Secretaria[];
  turnos: TurnoDeEjemplo[];
};

const RIVADAVIA: Consultorio = {
  id: 'rivadavia',
  nombre: NOMBRE_RIVADAVIA,
  direccion: 'Av. Rivadavia 4120, CABA',
  pacientes: PACIENTES_RIVADAVIA,
  medicos: MEDICOS_RIVADAVIA,
  secretarias: SECRETARIAS_RIVADAVIA,
  turnos: TURNOS_RIVADAVIA,
};

// Segundo consultorio de ejemplo. Valentín (mismo DNI) también se atiende acá, pero con otra cobertura y su propio
// historial de faltas: lo que Rivadavia sabe de él no se ve desde acá, ni al revés.
const BELGRANO: Consultorio = {
  id: 'belgrano',
  nombre: 'Centro Médico Belgrano',
  direccion: 'Av. Cabildo 2350, CABA',
  pacientes: [
    {
      id: 'b1',
      dni: '40.123.456',
      nombre: 'Valentín',
      apellido: 'Martínez',
      iniciales: 'VM',
      email: 'valentin@test.com',
      cobertura: 'OSDE',
      plan: '310',
      numeroAfiliado: '31-7788990/03',
      alergias: 'ninguna',
      alerta: '',
      faltas: 1,
      asistencias: 0,
    },
    {
      id: 'b2',
      dni: '36.418.092',
      nombre: 'Lucas',
      apellido: 'Herrera',
      iniciales: 'LH',
      email: 'lucas@test.com',
      cobertura: 'Galeno',
      plan: 'Plata',
      numeroAfiliado: '27-1100223/01',
      alergias: 'ninguna',
      alerta: '',
      faltas: 0,
      asistencias: 3,
    },
  ],
  medicos: [
    {
      nombre: 'Dr. Tomás Quiroga',
      iniciales: 'TQ',
      especialidad: 'Dermatología',
      sala: 'Consultorio 1',
      matricula: 'MN 130.912',
      email: 'quiroga@t.com',
      password: 'm',
    coberturaIds: ['osde-210', 'galeno-220'],
    },
  ],
  secretarias: [
    {
      nombre: 'Julieta Ponce',
      iniciales: 'JP',
      email: 'julieta.ponce@centrobelgrano.com',
      horario: 'Lunes a viernes · 9:00 a 17:00',
    },
  ],
  turnos: [
    {
      id: '1',
      idPaciente: 'b2',
      medico: 'Dr. Tomás Quiroga',
      especialidad: 'Dermatología',
      sala: 'Consultorio 1',
      fecha: fechaDentroDe(2),
      hora: '10:00',
      sede: 'Centro Médico Belgrano',
      estado: 'confirmado',
      instrucciones: [],
    },
  ],
};

export const CONSULTORIOS: Consultorio[] = [RIVADAVIA, BELGRANO];

// Consultorio con el que arranca la app (todavía no hay selector: se define acá).
export const ID_CONSULTORIO_ACTIVO = 'rivadavia';

// El paciente que usa la app es el primero de la lista de Rivadavia (Valentín). Sus datos editables viven en
// PerfilPacienteContext.
export const ID_PACIENTE_APP = PACIENTES_RIVADAVIA[0].id;
