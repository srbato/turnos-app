// Datos mock del catálogo. Cuando exista el backend (Express + Prisma) esto pasa a ser un fetch.

export type Cobertura = {
  id: string;
  nombre: string;
};

export type Especialidad = {
  id: string;
  nombre: string;
  codigo: string; // 3 letras para el ícono de la tarjeta
};

export type Medico = {
  id: string;
  nombre: string;
  iniciales: string;
  especialidadId: string;
  consultorio: string;
  coberturaIds: string[]; // coberturas que acepta (MEDICO_COBERTURA)
};

export const SEDE = 'Consultorios Rivadavia';

export const COBERTURAS: Cobertura[] = [
  { id: 'swiss-smg20', nombre: 'Swiss Medical SMG20' },
  { id: 'osde-210', nombre: 'OSDE 210' },
  { id: 'galeno-220', nombre: 'Galeno 220' },
];

// Coberturas del paciente logueado: puede tener más de una.
export const COBERTURAS_PACIENTE: string[] = ['swiss-smg20', 'osde-210'];

export const ESPECIALIDADES: Especialidad[] = [
  { id: 'cardiologia', nombre: 'Cardiología', codigo: 'CAR' },
  { id: 'clinica', nombre: 'Clínica médica', codigo: 'CLI' },
  { id: 'pediatria', nombre: 'Pediatría', codigo: 'PED' },
  { id: 'traumatologia', nombre: 'Traumatología', codigo: 'TRA' },
];

export const MEDICOS: Medico[] = [
  {
    id: 'paz',
    nombre: 'Dr. Ricardo Paz',
    iniciales: 'RP',
    especialidadId: 'cardiologia',
    consultorio: 'Consultorio 5',
    coberturaIds: ['swiss-smg20', 'galeno-220'],
  },
  {
    id: 'beltran',
    nombre: 'Dra. Ana Beltrán',
    iniciales: 'AB',
    especialidadId: 'cardiologia',
    consultorio: 'Consultorio 4',
    coberturaIds: ['osde-210'],
  },
  {
    id: 'duarte',
    nombre: 'Dr. Héctor Duarte',
    iniciales: 'HD',
    especialidadId: 'cardiologia',
    consultorio: 'Consultorio 6',
    coberturaIds: ['galeno-220'], // no atiende ninguna cobertura del paciente: queda filtrado
  },
  {
    id: 'fernandez',
    nombre: 'Dra. Lucía Fernández',
    iniciales: 'LF',
    especialidadId: 'clinica',
    consultorio: 'Consultorio 3',
    coberturaIds: ['swiss-smg20', 'osde-210'],
  },
  {
    id: 'sosa',
    nombre: 'Dra. Mariela Sosa',
    iniciales: 'MS',
    especialidadId: 'pediatria',
    consultorio: 'Consultorio 1',
    coberturaIds: ['osde-210'],
  },
  {
    id: 'ibanez',
    nombre: 'Dr. Gustavo Ibáñez',
    iniciales: 'GI',
    especialidadId: 'traumatologia',
    consultorio: 'Consultorio 2',
    coberturaIds: ['swiss-smg20'],
  },
];

export function nombreCobertura(id: string) {
  return COBERTURAS.find((cobertura) => cobertura.id === id)?.nombre ?? id;
}

// Médicos de una especialidad que aceptan al menos una cobertura del paciente.
export function medicosParaPaciente(especialidadId: string) {
  return MEDICOS.filter(
    (medico) =>
      medico.especialidadId === especialidadId &&
      medico.coberturaIds.some((id) => COBERTURAS_PACIENTE.includes(id))
  );
}

// Primera cobertura del paciente que el médico acepta (la que se muestra en "Atiende ...").
export function coberturaQueAtiende(medico: Medico) {
  const id = medico.coberturaIds.find((cobertura) => COBERTURAS_PACIENTE.includes(cobertura));
  return id ? nombreCobertura(id) : '';
}
