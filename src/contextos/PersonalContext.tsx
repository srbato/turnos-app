import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { fechaDentroDe, HOY, MEDICOS, SECRETARIA } from '@/datos/consultorio';

// Personal del consultorio: médicos y secretarias. Secretaría da de alta médicos.
// Todavía no hay backend: un médico nuevo aparece en la agenda, pero no tiene usuario para iniciar sesión.

export type MiembroMedico = {
  nombre: string;
  iniciales: string;
  especialidad: string;
  matricula: string;
  consultorio: string;
  dias: string; // días de atención ("lun y jue")
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
  Pick<MiembroMedico, 'especialidad' | 'matricula' | 'consultorio' | 'dias' | 'estado' | 'licenciaHasta'>
>;

export type MedicoNuevo = {
  nombre: string;
  matricula: string;
  especialidad: string;
  dias: string;
};

// Días de atención de los médicos de ejemplo.
const DATOS_DE_EJEMPLO: Record<string, { dias: string; estado: 'activo' | 'licencia'; licenciaHasta?: string }> = {
  'Dr. Ricardo Paz': { dias: 'mar y jue', estado: 'activo' },
  'Dra. Ana Torres': { dias: 'mié y vie', estado: 'activo' },
  'Dra. Lucía Fernández': { dias: 'lun y jue', estado: 'activo' },
  'Dra. Mariela Sosa': { dias: 'lun, mié, vie', estado: 'licencia', licenciaHasta: fechaDentroDe(14) },
  'Dr. Gustavo Ibáñez': { dias: 'lun a vie', estado: 'activo' },
};

const MEDICOS_INICIALES: MiembroMedico[] = MEDICOS.map((medico) => ({
  nombre: medico.nombre,
  iniciales: medico.iniciales,
  especialidad: medico.especialidad,
  matricula: medico.matricula,
  consultorio: medico.consultorio,
  dias: DATOS_DE_EJEMPLO[medico.nombre]?.dias ?? 'lun a vie',
  estado: DATOS_DE_EJEMPLO[medico.nombre]?.estado ?? 'activo',
  licenciaHasta: DATOS_DE_EJEMPLO[medico.nombre]?.licenciaHasta,
}));

const SECRETARIAS_INICIALES: MiembroSecretaria[] = [
  { nombre: SECRETARIA.nombre, iniciales: SECRETARIA.iniciales, horario: SECRETARIA.horario, estado: 'activo' },
  { nombre: 'Carolina Ríos', iniciales: 'CR', horario: 'Lunes a viernes · 13:00 a 20:00', estado: 'activo' },
];

// ¿El médico está de licencia en esa fecha? La licencia dura hasta el día anterior a "licenciaHasta" (ese día ya vuelve).
// Sin fecha de vuelta, la licencia es por tiempo indeterminado.
export function enLicencia(medico: MiembroMedico | undefined, fecha: string) {
  if (!medico || medico.estado !== 'licencia') return false;
  return medico.licenciaHasta === undefined || fecha < medico.licenciaHasta;
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
  const [medicos, setMedicos] = useState<MiembroMedico[]>(MEDICOS_INICIALES);

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
        consultorio: `Consultorio ${medicos.length + 1}`,
        dias: nuevo.dias.trim(),
        estado: 'activo',
      };
      setMedicos((anteriores) => [...anteriores, miembro]);
    }
    function editarMedico(matricula: string, cambios: CambiosMedico) {
      setMedicos((anteriores) =>
        anteriores.map((medico) => (medico.matricula === matricula ? { ...medico, ...cambios } : medico))
      );
    }
    return { medicos, secretarias: SECRETARIAS_INICIALES, altaMedico, editarMedico };
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
