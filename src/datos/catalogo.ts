// Catálogo que ve el paciente al sacar un turno. Las coberturas vienen de la API (ver ConsultorioContext); las especialidades y los
// médicos NO son una lista aparte: salen del personal del consultorio (altas, bajas y licencias incluidas), así lo que
// ve el paciente coincide siempre con lo que ven Secretaría y los médicos.
import { MiembroMedico } from '@/contextos/PersonalContext';
import { palabrasDeLetras, sinTildes } from '@/utilidades/texto';

// Una cobertura es un plan de una obra social ("OSDE 210"), o una obra social sin planes ("PAMI").
export type Cobertura = {
  id: string;
  nombre: string; // nombre completo: "OSDE 210"
  obraSocial: string; // "OSDE"
  plan: string; // "210" ('' si la obra social no tiene planes)
};

export type Especialidad = {
  id: string;
  nombre: string;
  codigo: string; // 3 letras para el ícono de la tarjeta
};

export type Medico = {
  id: string; // el id del médico en la base
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

// Arma las obras sociales con sus planes (dos niveles) a partir de la lista que manda la API, donde cada plan viene con
// el nombre de su obra social. Las que no tienen planes (PAMI) quedan con la lista de planes vacía.
export function obrasSocialesDe(coberturas: Cobertura[]): ObraSocial[] {
  const obras: ObraSocial[] = [];
  coberturas.forEach((cobertura) => {
    if (cobertura.plan === '') {
      obras.push({ id: cobertura.id, nombre: cobertura.obraSocial, planes: [] });
      return;
    }
    let obra = obras.find((o) => o.nombre === cobertura.obraSocial);
    if (!obra) {
      obra = { id: cobertura.obraSocial, nombre: cobertura.obraSocial, planes: [] };
      obras.push(obra);
    }
    obra.planes.push({ id: cobertura.id, nombre: cobertura.plan });
  });
  return obras;
}

// El nombre completo de una cobertura a partir de su id ("osde-210" -> "OSDE 210").
export function nombreCobertura(coberturas: Cobertura[], id: string) {
  return coberturas.find((cobertura) => cobertura.id === id)?.nombre ?? id;
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
    id: medico.id,
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
export function coberturaQueAtiende(medico: Medico, coberturasPaciente: string[], coberturas: Cobertura[]) {
  const id = medico.coberturaIds.find((cobertura) => coberturasPaciente.includes(cobertura));
  return id ? nombreCobertura(coberturas, id) : '';
}
