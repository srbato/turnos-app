import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { atiendeEseDia } from '@/datos/atencion';
import { COBERTURAS } from '@/datos/catalogo';
import { fechaDentroDe, HOY, type Medico } from '@/datos/consultorio';

// Personal del consultorio activo: médicos y secretarias. Secretaría da de alta médicos.
// Todavía no hay backend: un médico nuevo aparece en la agenda, pero no tiene usuario para iniciar sesión.

export type MiembroMedico = {
  nombre: string;
  iniciales: string;
  especialidad: string;
  matricula: string;
  sala: string;
  dias: string; // días de atención ("lun y jue")
  coberturaIds: string[]; // obras sociales que acepta
  estado: 'activo' | 'licencia' | 'baja'; // 'baja': ya no atiende (se conserva su historial)
  licenciaHasta?: string; // AAAA-MM-DD del primer día en que vuelve a atender (la licencia siempre es por un plazo)
};

export type MiembroSecretaria = {
  nombre: string;
  iniciales: string;
  horario: string;
  estado: 'activo' | 'licencia';
};

// Lo que Secretaría puede cambiar de un médico. El nombre no: figura en los turnos ya cargados.
export type CambiosMedico = Partial<
  Pick<MiembroMedico, 'especialidad' | 'matricula' | 'sala' | 'dias' | 'estado' | 'licenciaHasta'>
>;

export type MedicoNuevo = {
  nombre: string;
  matricula: string;
  especialidad: string;
  dias: string;
};

// Días de atención de los médicos de ejemplo.
const DATOS_DE_EJEMPLO: Record<string, { dias: string; estado: 'activo' | 'licencia'; licenciaHasta?: string }> = {
  // Paz y Fernández atienden toda la semana porque tienen turnos de ejemplo para cualquier día en que se abra la app.
  'Dr. Ricardo Paz': { dias: 'lun a vie', estado: 'activo' },
  'Dra. Ana Torres': { dias: 'mié y vie', estado: 'activo' },
  'Dra. Lucía Fernández': { dias: 'lun a vie', estado: 'activo' },
  'Dra. Mariela Sosa': { dias: 'lun, mié, vie', estado: 'licencia', licenciaHasta: fechaDentroDe(14) },
  'Dr. Gustavo Ibáñez': { dias: 'lun a vie', estado: 'activo' },
};

function miembrosMedicos(medicos: Medico[]): MiembroMedico[] {
  return medicos.map((medico) => ({
    nombre: medico.nombre,
    iniciales: medico.iniciales,
    especialidad: medico.especialidad,
    matricula: medico.matricula,
    sala: medico.sala,
    coberturaIds: medico.coberturaIds,
    dias: DATOS_DE_EJEMPLO[medico.nombre]?.dias ?? 'lun a vie',
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
  if (!atiendeEseDia(medico.dias, fecha)) return 'El médico no atiende ese día.';
  return undefined;
}

// Estado de hoy: una licencia que ya terminó cuenta como activo.
export function estadoEfectivo(medico: MiembroMedico): MiembroMedico['estado'] {
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

const PersonalContext = createContext<PersonalContextType | undefined>(undefined);

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

  // Si un turno futuro quedó en un día en que el médico no atiende (cambió sus días, se tomó licencia o lo dieron de
  // baja, o se cargó mal), el sistema lo cancela solo y guarda el motivo para que Secretaría avise al paciente.
  // Una vez cancelado ya no cumple la condición, así que el efecto no se repite.
  useEffect(() => {
    const cancelaciones = turnos.flatMap((turno) => {
      if (turno.fecha < HOY || (turno.estado !== 'pendiente' && turno.estado !== 'confirmado')) return [];
      const medico = medicos.find((m) => m.nombre === turno.medico);
      const motivo = medico ? motivoSinAtencion(medico, turno.fecha) : undefined;
      return motivo ? [{ id: turno.id, motivo }] : [];
    });
    if (cancelaciones.length > 0) {
      cancelarConMotivo(cancelaciones);
    }
  }, [turnos, medicos]);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    function altaMedico(nuevo: MedicoNuevo) {
      const palabras = nuevo.nombre.trim().split(/\s+/);
      const miembro: MiembroMedico = {
        nombre: nuevo.nombre.trim(),
        iniciales: palabras
          .slice(-2)
          .map((palabra) => palabra[0].toUpperCase())
          .join(''),
        especialidad: nuevo.especialidad.trim(),
        matricula: nuevo.matricula.trim(),
        sala: `Consultorio ${medicos.length + 1}`,
        dias: nuevo.dias.trim(),
        coberturaIds: COBERTURAS.map((cobertura) => cobertura.id), // un médico nuevo acepta todas hasta que se cargue lo contrario
        estado: 'activo',
      };
      setMedicos((anteriores) => [...anteriores, miembro]);
    }
    function editarMedico(matricula: string, cambios: CambiosMedico) {
      setMedicos((anteriores) =>
        anteriores.map((medico) => (medico.matricula === matricula ? { ...medico, ...cambios } : medico))
      );
    }
    return { medicos, secretarias, altaMedico, editarMedico };
  }, [medicos]);

  return <PersonalContext.Provider value={value}>{children}</PersonalContext.Provider>;
}

export function usePersonal() {
  const contexto = useContext(PersonalContext);
  if (contexto === undefined) {
    throw new Error('usePersonal tiene que usarse dentro de un PersonalProvider');
  }
  return contexto;
}
