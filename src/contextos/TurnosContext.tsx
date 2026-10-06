import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { HOY, ID_PACIENTE_APP, type EstadoTurno, type Paciente, type TurnoDeEjemplo } from '@/datos/consultorio';

export type { EstadoTurno };

// Un turno. Lo usan los tres roles: el paciente lo saca, la secretaría lo administra y el médico lo atiende.
export type Turno = TurnoDeEjemplo & {
  cobertura: string; // con qué cobertura se saca el turno
};

type TurnosContextType = {
  turnos: Turno[]; // los turnos de todos los pacientes
  misTurnos: Turno[]; // solo los del paciente que usa la app
  agregarTurno: (turno: Turno) => void;
  reprogramarTurno: (id: string, fecha: string, hora: string, estado?: EstadoTurno) => void;
  cancelarTurno: (id: string) => void;
  cancelarConMotivo: (cancelaciones: { id: string; motivo: string }[]) => void; // cancelaciones del sistema o por riesgo
  enviarAviso: (id: string, maximo: number) => void; // Secretaría le avisó al paciente que confirme: se anota la fecha (hasta el máximo configurado)
  cambiarEstadoTurno: (id: string, estado: EstadoTurno) => void; // lo usa el médico (confirmar, atender)
  activarAdelanto: (id: string, activo: boolean) => void; // anota o saca el turno de la lista de espera para adelantarlo
};

// Cobertura del paciente de un turno de ejemplo, como texto ("Swiss Medical SMG20").
function coberturaDe(pacientes: Paciente[], idPaciente: string) {
  const paciente = pacientes.find((p) => p.id === idPaciente);
  return paciente ? `${paciente.cobertura} ${paciente.plan}`.trim() : '';
}

const TurnosContext = createContext<TurnosContextType | undefined>(undefined);

// Los turnos son los del consultorio activo: cada consultorio tiene su propia agenda.
export function TurnosProvider({ children }: { children: ReactNode }) {
  const { consultorio } = useConsultorio();
  const [turnos, setTurnos] = useState<Turno[]>(
    consultorio.turnos.map((turno) => ({ ...turno, cobertura: coberturaDe(consultorio.pacientes, turno.idPaciente) }))
  );

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    function agregarTurno(turno: Turno) {
      setTurnos((anteriores) => [...anteriores, turno]);
    }
    // Cambia fecha y hora del mismo turno (mismo id). Por defecto queda pendiente hasta que se reconfirme;
    // la secretaría lo puede dejar confirmado.
    function reprogramarTurno(id: string, fecha: string, hora: string, estado: EstadoTurno = 'pendiente') {
      setTurnos((anteriores) =>
        anteriores.map((turno) =>
          turno.id === id ? { ...turno, fecha, hora, estado } : turno
        )
      );
    }
    function activarAdelanto(id: string, activo: boolean) {
      setTurnos((anteriores) =>
        anteriores.map((turno) =>
          turno.id === id ? { ...turno, adelantoDesde: activo ? HOY : undefined } : turno
        )
      );
    }
    // Cancela con un motivo guardado (el médico no atiende ese día, o Secretaría lo cancela por riesgo de
    // inasistencia): así Secretaría sabe por qué y avisa al paciente, y ese horario no se ofrece solo a la lista.
    function cancelarConMotivo(cancelaciones: { id: string; motivo: string }[]) {
      setTurnos((anteriores) =>
        anteriores.map((turno) => {
          const cancelacion = cancelaciones.find((c) => c.id === turno.id);
          return cancelacion ? { ...turno, estado: 'cancelado', motivoCancelacion: cancelacion.motivo } : turno;
        })
      );
    }
    function cancelarTurno(id: string) {
      cambiarEstadoTurno(id, 'cancelado');
    }
    // Al confirmar se deja anotado que el paciente confirmó, aunque después el turno pase a atendido (suma a su historial).
    function cambiarEstadoTurno(id: string, estado: EstadoTurno) {
      setTurnos((anteriores) =>
        anteriores.map((turno) =>
          turno.id === id ? { ...turno, estado, confirmo: estado === 'confirmado' ? true : turno.confirmo } : turno
        )
      );
    }
    // Se pueden mandar como máximo "maximo" avisos por turno (lo configura Secretaría): con eso alcanza para actuar.
    function enviarAviso(id: string, maximo: number) {
      setTurnos((anteriores) =>
        anteriores.map((turno) =>
          turno.id === id && (turno.avisos?.length ?? 0) < maximo
            ? { ...turno, avisos: [...(turno.avisos ?? []), HOY] }
            : turno
        )
      );
    }
    const misTurnos = turnos.filter((turno) => turno.idPaciente === ID_PACIENTE_APP);
    return {
      turnos,
      misTurnos,
      agregarTurno,
      reprogramarTurno,
      cancelarTurno,
      cancelarConMotivo,
      enviarAviso,
      cambiarEstadoTurno,
      activarAdelanto,
    };
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
