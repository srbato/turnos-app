import { createContext, ReactNode, useState } from 'react';
import { EstadoTurno, Turno, TURNOS } from './datos';

// Guarda los turnos (de todos los pacientes) mientras la app está abierta, para
// que todas las pantallas vean la misma lista (por ejemplo: el paciente saca un
// turno y el médico lo ve en su agenda). Si se cierra la app, se vuelve a los
// datos de prueba.

export const TurnosContext = createContext({
  turnos: TURNOS,
  agregarTurno: (turnoNuevo: Turno) => {},
  cancelarTurno: (id: string) => {},
  cambiarEstadoTurno: (id: string, estadoNuevo: EstadoTurno) => {},
  reprogramarTurno: (id: string, fecha: string, hora: string) => {},
  guardarPreconsulta: (id: string, respuestas: string[]) => {},
});

type PropsTurnosProvider = {
  children: ReactNode;
};

export function TurnosProvider(props: PropsTurnosProvider) {
  const [turnos, setTurnos] = useState(TURNOS);

  const agregarTurno = (turnoNuevo: Turno) => {
    setTurnos([...turnos, turnoNuevo]);
  };

  const cancelarTurno = (id: string) => {
    const turnosActualizados = turnos.map((turno) => {
      if (turno.id === id) {
        const turnoCancelado: Turno = { ...turno, estado: 'cancelado' };
        return turnoCancelado;
      }
      return turno;
    });
    setTurnos(turnosActualizados);
  };

  // La usa el médico para confirmar un turno o marcarlo como atendido.
  const cambiarEstadoTurno = (id: string, estadoNuevo: EstadoTurno) => {
    const turnosActualizados = turnos.map((turno) => {
      if (turno.id === id) {
        const turnoActualizado: Turno = { ...turno, estado: estadoNuevo };
        return turnoActualizado;
      }
      return turno;
    });
    setTurnos(turnosActualizados);
  };

  const reprogramarTurno = (id: string, fecha: string, hora: string) => {
    const turnosActualizados = turnos.map((turno) => {
      if (turno.id === id) {
        const turnoReprogramado: Turno = { ...turno, fecha: fecha, hora: hora, estado: 'pendiente' };
        return turnoReprogramado;
      }
      return turno;
    });
    setTurnos(turnosActualizados);
  };

  const guardarPreconsulta = (id: string, respuestas: string[]) => {
    const turnosActualizados = turnos.map((turno) => {
      if (turno.id === id) {
        const turnoConPreconsulta: Turno = { ...turno, preconsulta: respuestas };
        return turnoConPreconsulta;
      }
      return turno;
    });
    setTurnos(turnosActualizados);
  };

  return (
    <TurnosContext.Provider
      value={{
        turnos,
        agregarTurno,
        cancelarTurno,
        cambiarEstadoTurno,
        reprogramarTurno,
        guardarPreconsulta,
      }}>
      {props.children}
    </TurnosContext.Provider>
  );
}
