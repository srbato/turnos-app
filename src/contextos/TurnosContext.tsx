import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type EstadoTurno = 'confirmado' | 'pendiente' | 'cancelado';

export type Turno = {
  id: string;
  medico: string;
  especialidad: string;
  consultorio: string;
  fecha: string; // formato AAAA-MM-DD
  hora: string; // formato HH:MM
  sede: string;
  cobertura: string;
  estado: EstadoTurno;
  instrucciones: string[];
};

type TurnosContextType = {
  turnos: Turno[];
  agregarTurno: (turno: Turno) => void;
  reprogramarTurno: (id: string, fecha: string, hora: string) => void;
  cancelarTurno: (id: string) => void;
};

const TURNOS_INICIALES: Turno[] = [
  {
    id: '1',
    medico: 'Dra. Lucía Fernández',
    especialidad: 'Clínica médica',
    consultorio: 'Consultorio 3',
    fecha: '2026-09-29',
    hora: '10:30',
    sede: 'Consultorios Rivadavia',
    cobertura: 'Swiss Medical SMG20',
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
    sede: 'Consultorios Rivadavia',
    cobertura: 'Swiss Medical SMG20',
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
    sede: 'Consultorios Rivadavia',
    cobertura: 'OSDE 210',
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
    sede: 'Consultorios Rivadavia',
    cobertura: 'Swiss Medical SMG20',
    estado: 'confirmado',
    instrucciones: [],
  },
];

const TurnosContext = createContext<TurnosContextType | undefined>(undefined);

export function TurnosProvider({ children }: { children: ReactNode }) {
  const [turnos, setTurnos] = useState<Turno[]>(TURNOS_INICIALES);

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    function agregarTurno(turno: Turno) {
      setTurnos((anteriores) => [...anteriores, turno]);
    }
    // Cambia fecha y hora del mismo turno (mismo id). Queda pendiente hasta que la secretaría lo reconfirme.
    function reprogramarTurno(id: string, fecha: string, hora: string) {
      setTurnos((anteriores) =>
        anteriores.map((turno) =>
          turno.id === id ? { ...turno, fecha, hora, estado: 'pendiente' } : turno
        )
      );
    }
    function cancelarTurno(id: string) {
      setTurnos((anteriores) =>
        anteriores.map((turno) => (turno.id === id ? { ...turno, estado: 'cancelado' } : turno))
      );
    }
    return { turnos, agregarTurno, reprogramarTurno, cancelarTurno };
  }, [turnos]);

  return <TurnosContext.Provider value={value}>{children}</TurnosContext.Provider>;
}

// Horas ya tomadas de un médico en una fecha. Los turnos cancelados liberan el horario.
// idIgnorado sirve al reprogramar: el horario del propio turno no cuenta como ocupado.
export function horasOcupadas(turnos: Turno[], medico: string, fecha: string, idIgnorado?: string) {
  return turnos
    .filter(
      (turno) =>
        turno.medico === medico &&
        turno.fecha === fecha &&
        turno.estado !== 'cancelado' &&
        turno.id !== idIgnorado
    )
    .map((turno) => turno.hora);
}

export function useTurnos() {
  const contexto = useContext(TurnosContext);
  if (contexto === undefined) {
    throw new Error('useTurnos tiene que usarse dentro de un TurnosProvider');
  }
  return contexto;
}
