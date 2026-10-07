import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useTurnos } from '@/contextos/TurnosContext';
import {
  atiendeEnEseHorario,
  atiendeEseDia,
  FranjaHoraria,
  franjasDe,
  FRANJAS_POR_DEFECTO,
  horasDelDia,
} from '@/datos/atencion';
import { COBERTURAS } from '@/datos/catalogo';
import { fechaDentroDe, HOY, Medico } from '@/datos/consultorio';
import { palabras } from '@/utilidades/texto';

// Personal del consultorio activo: médicos y secretarias. Secretaría da de alta médicos.
// Todavía no hay backend: un médico nuevo aparece en la agenda, pero no tiene usuario para iniciar sesión.

// 'baja': ya no atiende (se conserva su historial).
export type EstadoMedico = 'activo' | 'licencia' | 'baja';

export type MiembroMedico = {
  nombre: string;
  iniciales: string;
  especialidad: string;
  matricula: string;
  sala: string;
  franjas: FranjaHoraria[]; // cuándo atiende: días y horarios (los carga Secretaría en su ficha)
  coberturaIds: string[]; // obras sociales que acepta
  estado: EstadoMedico;
  licenciaHasta?: string; // AAAA-MM-DD del primer día en que vuelve a atender (la licencia siempre es por un plazo)
};

export type MiembroSecretaria = {
  nombre: string;
  iniciales: string;
  horario: string;
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
  franjas: FranjaHoraria[];
};

type DatosDeEjemplo = { franjas: FranjaHoraria[]; estado: 'activo' | 'licencia'; licenciaHasta?: string };

// Horarios de atención de los médicos de ejemplo (1 = lunes … 5 = viernes).
const DATOS_DE_EJEMPLO: Record<string, DatosDeEjemplo> = {
  // Paz y Fernández atienden toda la semana porque tienen turnos de ejemplo para cualquier día en que se abra la app.
  'Dr. Ricardo Paz': { franjas: FRANJAS_POR_DEFECTO, estado: 'activo' },
  'Dra. Ana Torres': {
    franjas: [...franjasDe([3], '14:00', '20:00'), ...franjasDe([5], '09:00', '13:00')], // mié a la tarde, vie a la mañana
    estado: 'activo',
  },
  'Dra. Lucía Fernández': { franjas: FRANJAS_POR_DEFECTO, estado: 'activo' },
  'Dra. Mariela Sosa': {
    franjas: franjasDe([1, 3, 5], '08:00', '12:00'),
    estado: 'licencia',
    licenciaHasta: fechaDentroDe(14),
  },
  'Dr. Gustavo Ibáñez': { franjas: franjasDe([1, 2, 3, 4, 5], '10:00', '14:00'), estado: 'activo' },
};

function miembrosMedicos(medicos: Medico[]): MiembroMedico[] {
  return medicos.map((medico) => ({
    nombre: medico.nombre,
    iniciales: medico.iniciales,
    especialidad: medico.especialidad,
    matricula: medico.matricula,
    sala: medico.sala,
    coberturaIds: medico.coberturaIds,
    franjas: DATOS_DE_EJEMPLO[medico.nombre]?.franjas ?? FRANJAS_POR_DEFECTO,
    estado: DATOS_DE_EJEMPLO[medico.nombre]?.estado ?? 'activo',
    licenciaHasta: DATOS_DE_EJEMPLO[medico.nombre]?.licenciaHasta,
  }));
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
  altaMedico: (nuevo: MedicoNuevo) => void;
  editarMedico: (matricula: string, cambios: CambiosMedico) => void; // matricula = la actual, para encontrarlo
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: PersonalContextType = {
  medicos: [],
  secretarias: [],
  altaMedico: () => {},
  editarMedico: () => {},
};

const PersonalContext = createContext(VALOR_POR_DEFECTO);

export function PersonalProvider({ children }: { children: ReactNode }) {
  const { consultorio } = useConsultorio();
  const [medicos, setMedicos] = useState<MiembroMedico[]>(miembrosMedicos(consultorio.medicos));
  const secretarias: MiembroSecretaria[] = consultorio.secretarias.map((secretaria) => ({
    nombre: secretaria.nombre,
    iniciales: secretaria.iniciales,
    horario: secretaria.horario,
    estado: 'activo',
  }));
  const { turnos, cancelarConMotivo } = useTurnos();

  // Si un turno futuro quedó en un día u horario en que el médico no atiende (cambiaron sus horarios, se tomó licencia o
  // lo dieron de baja, o se cargó mal), el sistema lo cancela solo y guarda el motivo para que Secretaría avise al paciente.
  // Una vez cancelado ya no cumple la condición, así que el efecto no se repite.
  useEffect(() => {
    const cancelaciones: { id: string; motivo: string }[] = [];
    turnos.forEach((turno) => {
      if (turno.fecha < HOY || (turno.estado !== 'pendiente' && turno.estado !== 'confirmado')) return;
      const medico = medicos.find((m) => m.nombre === turno.medico);
      if (!medico) return;
      const motivo = motivoSinAtencion(medico, turno.fecha);
      if (motivo) {
        cancelaciones.push({ id: turno.id, motivo: motivo });
      } else if (!atiendeEnEseHorario(medico.franjas, turno.fecha, turno.hora)) {
        cancelaciones.push({ id: turno.id, motivo: 'El médico no atiende en ese horario.' });
      }
    });
    if (cancelaciones.length > 0) {
      cancelarConMotivo(cancelaciones);
    }
  }, [turnos, medicos]);

  function altaMedico(nuevo: MedicoNuevo) {
    const miembro: MiembroMedico = {
      nombre: nuevo.nombre.trim(),
      iniciales: palabras(nuevo.nombre)
        .slice(-2)
        .map((palabra) => palabra[0].toUpperCase())
        .join(''),
      especialidad: nuevo.especialidad.trim(),
      matricula: nuevo.matricula.trim(),
      sala: `Consultorio ${medicos.length + 1}`,
      franjas: nuevo.franjas,
      coberturaIds: COBERTURAS.map((cobertura) => cobertura.id), // un médico nuevo acepta todas hasta que se cargue lo contrario
      estado: 'activo',
    };
    setMedicos((anteriores) => [...anteriores, miembro]);
  }

  function editarMedico(matricula: string, cambios: CambiosMedico) {
    setMedicos((anteriores) =>
      anteriores.map((medico) => {
        if (medico.matricula === matricula) {
          return { ...medico, ...cambios };
        }
        return medico;
      })
    );
  }

  return (
    <PersonalContext.Provider value={{ medicos, secretarias, altaMedico, editarMedico }}>
      {children}
    </PersonalContext.Provider>
  );
}

export function usePersonal() {
  return useContext(PersonalContext);
}
