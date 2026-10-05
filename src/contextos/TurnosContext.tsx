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
  estado: EstadoTurno;
  instrucciones: string[];
};

type TurnosContextType = {
  turnos: Turno[];
  agregarTurno: (turno: Turno) => void;
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
    return { turnos, agregarTurno };
  }, [turnos]);

  return <TurnosContext.Provider value={value}>{children}</TurnosContext.Provider>;
}

export function useTurnos() {
  const contexto = useContext(TurnosContext);
  if (contexto === undefined) {
    throw new Error('useTurnos tiene que usarse dentro de un TurnosProvider');
  }
  return contexto;
}
