import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useSesion } from '@/contextos/SesionContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { atiendeEseDia, FranjaHoraria, FRANJAS_POR_DEFECTO, horasDelDia, ordenarFranjas } from '@/datos/atencion';
import { HOY } from '@/datos/consultorio';
import { palabras } from '@/utilidades/texto';
import { ID_CONSULTORIO, pedir } from '@/servicios/api';

// Personal del consultorio: médicos y secretarias. Vienen de la API. Secretaría da de alta médicos y edita sus fichas.
// Si un médico deja de atender un día en que tenía turnos (licencia, baja, cambio de horario), la API cancela esos
// turnos sola y guarda el motivo: por eso, después de editar un médico, se vuelven a pedir también los turnos.

// 'baja': ya no atiende (se conserva su historial).
export type EstadoMedico = 'activo' | 'licencia' | 'baja';

export type MiembroMedico = {
  id: string;
  nombre: string;
  iniciales: string;
  especialidad: string;
  matricula: string;
  sala: string;
  email: string;
  telefono: string;
  domicilio: string;
  fotoUri: string | null; // foto de perfil (data URI), o null para mostrar las iniciales
  franjas: FranjaHoraria[]; // cuándo atiende: días y horarios (los carga Secretaría en su ficha)
  coberturaIds: string[]; // obras sociales que acepta
  estado: EstadoMedico;
  licenciaHasta?: string; // AAAA-MM-DD del primer día en que vuelve a atender (la licencia siempre es por un plazo)
};

export type MiembroSecretaria = {
  id: string;
  nombre: string;
  iniciales: string;
  dni: string;
  email: string;
  telefono: string;
  domicilio: string;
  fotoUri: string | null;
  horario: string; // días y horario en que trabaja
  estado: 'activo' | 'licencia';
};

// Lo que Secretaría puede cambiar de un médico. El nombre no: figura en los turnos ya cargados.
// Todos los campos son opcionales: se manda solo lo que cambia.
export type CambiosMedico = {
  especialidad?: string;
  matricula?: string;
  sala?: string;
  franjas?: FranjaHoraria[];
  estado?: EstadoMedico;
  licenciaHasta?: string;
};

export type MedicoNuevo = {
  nombre: string;
  matricula: string;
  especialidad: string;
  email: string; // con este email y esta contraseña el médico inicia sesión
  contrasena: string;
  franjas: FranjaHoraria[];
};

// Un médico tal como lo devuelve la API (GET /api/medicos).
type MedicoApi = {
  id: number;
  nombre: string;
  iniciales: string;
  especialidad: string;
  matricula: string;
  sala: string;
  email: string;
  telefono: string;
  domicilio: string;
  fotoUri: string | null;
  estado: EstadoMedico;
  licenciaHasta: string | null;
  franjas: FranjaHoraria[];
  coberturas: { id: string }[];
};

// Una secretaria tal como la devuelve la API (GET /api/secretarias).
type SecretariaApi = {
  id: number;
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  domicilio: string;
  turnoTrabajo: string;
  fotoUri: string | null;
  estado: 'activo' | 'licencia';
};

function medicoDesdeApi(medico: MedicoApi): MiembroMedico {
  return {
    id: String(medico.id),
    nombre: medico.nombre,
    iniciales: medico.iniciales,
    especialidad: medico.especialidad,
    matricula: medico.matricula,
    sala: medico.sala,
    email: medico.email,
    telefono: medico.telefono,
    domicilio: medico.domicilio,
    fotoUri: medico.fotoUri,
    // La API no las devuelve ordenadas: se ordenan por día y por hora.
    franjas: ordenarFranjas(
      medico.franjas.map((franja) => ({ dia: franja.dia, desde: franja.desde, hasta: franja.hasta }))
    ),
    coberturaIds: medico.coberturas.map((cobertura) => cobertura.id),
    estado: medico.estado,
    licenciaHasta: medico.licenciaHasta ?? undefined,
  };
}

function secretariaDesdeApi(secretaria: SecretariaApi): MiembroSecretaria {
  const partes = palabras(secretaria.nombre);
  return {
    id: String(secretaria.id),
    nombre: secretaria.nombre,
    iniciales: partes
      .slice(0, 2)
      .map((palabra) => palabra[0].toUpperCase())
      .join(''),
    dni: secretaria.dni,
    email: secretaria.email,
    telefono: secretaria.telefono,
    domicilio: secretaria.domicilio,
    fotoUri: secretaria.fotoUri,
    horario: secretaria.turnoTrabajo,
    estado: secretaria.estado,
  };
}

// ¿El médico está de licencia en esa fecha? La licencia dura hasta el día anterior a "licenciaHasta" (ese día ya vuelve).
// Sin fecha de vuelta, la licencia es por tiempo indeterminado.
export function enLicencia(medico: MiembroMedico | undefined, fecha: string) {
  if (!medico || medico.estado !== 'licencia') return false;
  return medico.licenciaHasta === undefined || fecha < medico.licenciaHasta;
}

// ¿El médico atiende en esa fecha? Es lo que usan los pacientes y Secretaría para ofrecer solo días válidos al sacar
// o reprogramar un turno. Si no figura en el personal (médicos del catálogo sin ficha), se asume que atiende.
export function atiendeEn(medicos: MiembroMedico[], nombre: string, fecha: string) {
  const miembro = medicos.find((medico) => medico.nombre === nombre);
  return miembro === undefined || motivoSinAtencion(miembro, fecha) === undefined;
}

// Por qué el médico no atiende en esa fecha, o undefined si atiende. Con esto el sistema detecta los turnos que
// quedaron en un día en que el médico no viene.
export function motivoSinAtencion(medico: MiembroMedico, fecha: string) {
  if (medico.estado === 'baja') return 'El médico ya no atiende en el consultorio.';
  if (enLicencia(medico, fecha)) return 'El médico está de licencia ese día.';
  if (!atiendeEseDia(medico.franjas, fecha)) return 'El médico no atiende ese día.';
  return undefined;
}

// Horarios de turno de un médico en una fecha, según sus franjas. Si no figura en el personal (médicos del catálogo
// sin ficha), se usa el horario por defecto.
export function horariosDelMedico(medicos: MiembroMedico[], nombre: string, fecha: string, duracionMinutos: number) {
  const miembro = medicos.find((medico) => medico.nombre === nombre);
  const franjas = miembro ? miembro.franjas : FRANJAS_POR_DEFECTO;
  return horasDelDia(franjas, fecha, duracionMinutos);
}

// Estado de hoy: una licencia que ya terminó cuenta como activo.
export function estadoEfectivo(medico: MiembroMedico): EstadoMedico {
  if (medico.estado === 'licencia' && !enLicencia(medico, HOY)) return 'activo';
  return medico.estado;
}

// ¿Se le pueden dar turnos? Un médico de baja no. Uno de licencia sí, pero solo para después de que vuelva
// (ver fechaDeVuelta). Si no figura en el personal (médicos del catálogo sin ficha), se asume que atiende.
export function aceptaTurnos(medicos: MiembroMedico[], nombre: string) {
  const miembro = medicos.find((medico) => medico.nombre === nombre);
  if (!miembro) return true;
  if (miembro.estado === 'baja') return false;
  return !(miembro.estado === 'licencia' && miembro.licenciaHasta === undefined);
}

// Si el médico está de licencia hoy: el primer día en que vuelve a atender ('AAAA-MM-DD'). Si no, undefined.
export function fechaDeVuelta(medicos: MiembroMedico[], nombre: string) {
  const miembro = medicos.find((medico) => medico.nombre === nombre);
  return miembro && enLicencia(miembro, HOY) ? miembro.licenciaHasta : undefined;
}

type PersonalContextType = {
  medicos: MiembroMedico[];
  secretarias: MiembroSecretaria[];
  recargarPersonal: () => Promise<void>; // después de que un médico o una secretaria cambian su perfil
  altaMedico: (nuevo: MedicoNuevo) => Promise<string>; // devuelve el error, o '' si salió bien
  editarMedico: (id: string, cambios: CambiosMedico) => Promise<string>;
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PersonalContextType = {
  medicos: [],
  secretarias: [],
  recargarPersonal: async () => {},
  altaMedico: async () => '',
  editarMedico: async () => '',
};

const PersonalContext = createContext(VALOR_POR_DEFECTO);

export function PersonalProvider({ children }: { children: ReactNode }) {
  const { recargarTurnos } = useTurnos();
  const [medicos, setMedicos] = useState<MiembroMedico[]>([]);
  const [secretarias, setSecretarias] = useState<MiembroSecretaria[]>([]);

  async function recargarPersonal() {
    const respuestaMedicos = await pedir('GET', `/api/medicos?consultorioId=${ID_CONSULTORIO}`);
    if (respuestaMedicos.ok) {
      setMedicos(respuestaMedicos.datos.map(medicoDesdeApi));
    }
    const respuestaSecretarias = await pedir('GET', `/api/secretarias?consultorioId=${ID_CONSULTORIO}`);
    if (respuestaSecretarias.ok) {
      setSecretarias(respuestaSecretarias.datos.map(secretariaDesdeApi));
    }
  }

  useEffect(() => {
    recargarPersonal();
  }, []);

  async function altaMedico(nuevo: MedicoNuevo) {
    const respuesta = await pedir('POST', '/api/medicos', { ...nuevo, consultorioId: ID_CONSULTORIO });
    if (respuesta.ok) {
      await recargarPersonal();
    }
    return respuesta.error;
  }

  // Los horarios se mandan aparte (PUT, porque se reemplazan todos); el resto de los cambios, con PATCH.
  async function editarMedico(id: string, cambios: CambiosMedico) {
    if (cambios.franjas !== undefined) {
      const respuesta = await pedir('PUT', `/api/medicos/${id}/franjas`, { franjas: cambios.franjas });
      if (!respuesta.ok) {
        return respuesta.error;
      }
    }
    const resto = {
      especialidad: cambios.especialidad,
      matricula: cambios.matricula,
      sala: cambios.sala,
      estado: cambios.estado,
      licenciaHasta: cambios.licenciaHasta,
    };
    const hayOtrosCambios =
      resto.especialidad !== undefined ||
      resto.matricula !== undefined ||
      resto.sala !== undefined ||
      resto.estado !== undefined;
    if (hayOtrosCambios) {
      const respuesta = await pedir('PATCH', `/api/medicos/${id}`, resto);
      if (!respuesta.ok) {
        return respuesta.error;
      }
    }
    // La API pudo haber cancelado turnos que quedaron fuera de su horario: se recargan los dos.
    await recargarPersonal();
    await recargarTurnos();
    return '';
  }

  return (
    <PersonalContext.Provider value={{ medicos, secretarias, recargarPersonal, altaMedico, editarMedico }}>
      {children}
    </PersonalContext.Provider>
  );
}

export function usePersonal() {
  return useContext(PersonalContext);
}

// Médico vacío: se usa mientras se cargan los datos o si quien inició sesión no es un médico.
const MEDICO_VACIO: MiembroMedico = {
  id: '',
  nombre: '',
  iniciales: '',
  especialidad: '',
  matricula: '',
  sala: '',
  email: '',
  telefono: '',
  domicilio: '',
  fotoUri: null,
  franjas: [],
  coberturaIds: [],
  estado: 'activo',
};

// El médico que inició sesión, con todos sus datos.
export function useMedicoLogueado() {
  const { usuario } = useSesion();
  const { medicos } = usePersonal();
  const medico = medicos.find((m) => usuario !== null && usuario.rol === 'medico' && m.id === usuario.id);
  return medico ?? MEDICO_VACIO;
}

// La secretaria que inició sesión, o undefined si quien inició sesión no es una secretaria.
export function useSecretariaLogueada() {
  const { usuario } = useSesion();
  const { secretarias } = usePersonal();
  return secretarias.find((s) => usuario !== null && usuario.rol === 'secretaria' && s.id === usuario.id);
}
