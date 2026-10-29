// Catálogo que ve el paciente al sacar un turno. Las coberturas son las que existen en la app; las especialidades y los
// médicos NO son una lista aparte: salen del personal del consultorio (altas, bajas y licencias incluidas), así lo que
// ve el paciente coincide siempre con lo que ven Secretaría y los médicos.
import { MiembroMedico } from '@/contextos/PersonalContext';
import { palabrasDeLetras, sinTildes } from '@/utilidades/texto';

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
  id: string; // la matrícula
  nombre: string;
  iniciales: string;
  especialidadId: string;
  sala: string;
  coberturaIds: string[]; // coberturas que acepta
};

export type Plan = {
  id: string; // es lo que se guarda en la base
  nombre: string;
};

export type ObraSocial = {
  id: string; // solo agrupa en pantalla, salvo que no tenga planes (PAMI): ahí es lo que se guarda
  nombre: string;
  planes: Plan[]; // vacía si la obra social no tiene planes
};

// Obras sociales y prepagas con sus planes (dos niveles).
// Los ids de los planes ya existen en la base (los usan los médicos y los pacientes): no se cambian, solo se agregan nuevos.
export const OBRAS_SOCIALES: ObraSocial[] = [
  {
    id: 'swiss',
    nombre: 'Swiss Medical',
    planes: [
      { id: 'swiss-smg02', nombre: 'SMG02' },
      { id: 'swiss-smg20', nombre: 'SMG20' },
      { id: 'swiss-smg30', nombre: 'SMG30' },
      { id: 'swiss-smg40', nombre: 'SMG40' },
      { id: 'swiss-smg50', nombre: 'SMG50' },
    ],
  },
  {
    id: 'osde',
    nombre: 'OSDE',
    planes: [
      { id: 'osde-210', nombre: '210' },
      { id: 'osde-310', nombre: '310' },
      { id: 'osde-410', nombre: '410' },
      { id: 'osde-450', nombre: '450' },
      { id: 'osde-510', nombre: '510' },
    ],
  },
  {
    id: 'galeno',
    nombre: 'Galeno',
    planes: [
      { id: 'galeno-220', nombre: 'Azul 220' },
      { id: 'galeno-plata', nombre: 'Plata 330' },
      { id: 'galeno-oro', nombre: 'Oro 440' },
      { id: 'galeno-550', nombre: '550' },
    ],
  },
  {
    id: 'medife',
    nombre: 'Medifé',
    planes: [
      { id: 'medife-bronce', nombre: 'Bronce' },
      { id: 'medife-plata', nombre: 'Plata' },
      { id: 'medife-oro', nombre: 'Oro' },
      { id: 'medife-platinum', nombre: 'Platinum' },
    ],
  },
  {
    id: 'sancor',
    nombre: 'Sancor Salud',
    planes: [
      { id: 'sancor-1000', nombre: '1000' },
      { id: 'sancor-1500', nombre: '1500' },
      { id: 'sancor-3000', nombre: '3000' },
      { id: 'sancor-3500', nombre: '3500' },
      { id: 'sancor-4000', nombre: '4000' },
      { id: 'sancor-4500', nombre: '4500' },
    ],
  },
  // PAMI no tiene planes (afiliación única): se marca directamente y se guarda 'pami'.
  { id: 'pami', nombre: 'PAMI', planes: [] },
];

// Lista plana de todo lo que se puede guardar, con el nombre completo ("Swiss Medical SMG20"):
// cada plan, y las obras sociales sin planes. La usan las pantallas que no necesitan los dos niveles.
function coberturasPlanas() {
  const lista: Cobertura[] = [];
  OBRAS_SOCIALES.forEach((obra) => {
    if (obra.planes.length === 0) {
      lista.push({ id: obra.id, nombre: obra.nombre });
    }
    obra.planes.forEach((plan) => {
      lista.push({ id: plan.id, nombre: `${obra.nombre} ${plan.nombre}` });
    });
  });
  return lista;
}

export const COBERTURAS: Cobertura[] = coberturasPlanas();

// Busca en los dos niveles (porque la lista plana sale de ellos) y devuelve el nombre completo.
export function nombreCobertura(id: string) {
  return COBERTURAS.find((cobertura) => cobertura.id === id)?.nombre ?? id;
}

// "Clínica médica" -> "clinica-medica"
function idDeEspecialidad(nombre: string) {
  return palabrasDeLetras(sinTildes(nombre).toLowerCase()).join('-');
}

// Las especialidades que tiene el consultorio, en el orden en que aparecen sus médicos.
export function especialidadesDe(medicos: MiembroMedico[]): Especialidad[] {
  const especialidades: Especialidad[] = [];
  medicos.forEach((medico) => {
    const id = idDeEspecialidad(medico.especialidad);
    if (!especialidades.some((especialidad) => especialidad.id === id)) {
      especialidades.push({ id, nombre: medico.especialidad, codigo: sinTildes(medico.especialidad).slice(0, 3).toUpperCase() });
    }
  });
  return especialidades;
}

// Los médicos del personal con la forma que usa el flujo de Sacar turno.
export function medicosDelCatalogo(medicos: MiembroMedico[]): Medico[] {
  return medicos.map((medico) => ({
    id: medico.matricula,
    nombre: medico.nombre,
    iniciales: medico.iniciales,
    especialidadId: idDeEspecialidad(medico.especialidad),
    sala: medico.sala,
    coberturaIds: medico.coberturaIds,
  }));
}

// Médicos de una especialidad que aceptan al menos una de las coberturas del paciente.
export function medicosParaPaciente(medicos: Medico[], especialidadId: string, coberturasPaciente: string[]) {
  return medicos.filter(
    (medico) =>
      medico.especialidadId === especialidadId &&
      medico.coberturaIds.some((id) => coberturasPaciente.includes(id))
  );
}

// Primera cobertura del paciente que el médico acepta (la que se muestra en "Atiende ...").
export function coberturaQueAtiende(medico: Medico, coberturasPaciente: string[]) {
  const id = medico.coberturaIds.find((cobertura) => coberturasPaciente.includes(cobertura));
  return id ? nombreCobertura(id) : '';
}
