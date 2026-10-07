import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useTurnos, Turno } from '@/contextos/TurnosContext';
import { claveHorario, proximasOfertas } from '@/datos/adelantos';

// Ofertas de adelanto. Cada oferta es un horario libre que se le ofrece a un paciente de la lista de espera. Un
// paciente tiene como máximo una oferta pendiente y un horario se ofrece a un solo paciente a la vez; cuando alguien
// responde, el sistema crea solo las ofertas que quedaron pendientes (ver datos/adelantos.ts).

// 'retirada': la canceló Secretaría.
export type EstadoOferta = 'enviada' | 'aceptada' | 'rechazada' | 'sin-respuesta' | 'retirada';

export type Oferta = {
  id: string;
  idTurno: string; // el turno del paciente que se adelantaría
  horario: Turno; // el horario libre que se ofrece
  estado: EstadoOferta;
};

type AdelantosContextType = {
  ofertas: Oferta[];
  retirados: string[]; // horarios que Secretaría sacó de la oferta (ver claveHorario)
  publicados: Turno[]; // horarios libres que Secretaría ofreció a la lista desde la agenda de un médico
  ofrecerHorario: (horario: Turno) => void;
  ofrecerA: (horario: Turno, idTurno: string) => void; // Secretaría le propone ese horario a un paciente puntual de la lista
  aceptarOferta: (oferta: Oferta) => void; // el paciente acepta: su turno se mueve al horario ofrecido
  rechazarOferta: (oferta: Oferta) => void; // el paciente rechaza
  noContesta: (oferta: Oferta) => void; // Secretaría marca que no respondió: el horario pasa al siguiente
  reprogramarOferta: (oferta: Oferta, nuevoHorario: Turno) => void; // Secretaría cambia el horario ofrecido al mismo paciente
  retirarOferta: (oferta: Oferta) => void; // Secretaría cancela la oferta y el horario deja de ofrecerse
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: AdelantosContextType = {
  ofertas: [],
  retirados: [],
  publicados: [],
  ofrecerHorario: () => {},
  ofrecerA: () => {},
  aceptarOferta: () => {},
  rechazarOferta: () => {},
  noContesta: () => {},
  reprogramarOferta: () => {},
  retirarOferta: () => {},
};

const AdelantosContext = createContext(VALOR_POR_DEFECTO);

// Va dentro de TurnosProvider: al aceptar, mueve el turno del paciente.
export function AdelantosProvider({ children }: { children: ReactNode }) {
  const { turnos, reprogramarTurno, agregarTurno } = useTurnos();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [publicados, setPublicados] = useState<Turno[]>([]);
  const [retirados, setRetirados] = useState<string[]>([]); // horarios que Secretaría sacó de la oferta (claves)

  // Cada vez que cambian los turnos, los horarios publicados o las respuestas, se envían las ofertas que faltan.
  useEffect(() => {
    const nuevas = proximasOfertas(turnos, publicados, ofertas, retirados);
    if (nuevas.length > 0) {
      setOfertas((anteriores) => [...anteriores, ...nuevas]);
    }
  }, [turnos, publicados, ofertas, retirados]);

  function ofrecerHorario(horario: Turno) {
    setRetirados((anteriores) => anteriores.filter((clave) => clave !== claveHorario(horario)));
    setPublicados((anteriores) => {
      if (anteriores.some((h) => h.id === horario.id)) {
        return anteriores;
      }
      return [...anteriores, horario];
    });
  }

  // La oferta va directo al paciente elegido. El horario no se publica: si no acepta, queda libre y Secretaría
  // decide a quién proponérselo después (no se ofrece solo al siguiente).
  function ofrecerA(horario: Turno, idTurno: string) {
    const clave = claveHorario(horario);
    setRetirados((anteriores) => anteriores.filter((c) => c !== clave));
    const nueva: Oferta = { id: `${idTurno}|${clave}`, idTurno: idTurno, horario: horario, estado: 'enviada' };
    setOfertas((anteriores) => [...anteriores, nueva]);
  }

  // Le cambia el estado a una oferta.
  function responder(oferta: Oferta, estado: EstadoOferta) {
    setOfertas((anteriores) =>
      anteriores.map((o) => {
        if (o.id === oferta.id) {
          return { ...o, estado: estado };
        }
        return o;
      })
    );
  }

  function aceptarOferta(oferta: Oferta) {
    const turno = turnos.find((t) => t.id === oferta.idTurno);
    if (!turno) return;
    // Su horario de antes queda libre (sin paciente), así se le puede ofrecer al siguiente de la lista.
    agregarTurno({
      ...turno,
      id: `libre-${turno.id}-${Date.now()}`,
      idPaciente: '',
      estado: 'cancelado',
      adelantoDesde: undefined,
    });
    reprogramarTurno(turno.id, oferta.horario.fecha, oferta.horario.hora, 'confirmado');
    responder(oferta, 'aceptada');
  }

  function rechazarOferta(oferta: Oferta) {
    responder(oferta, 'rechazada');
  }

  function noContesta(oferta: Oferta) {
    responder(oferta, 'sin-respuesta');
  }

  function retirarOferta(oferta: Oferta) {
    const clave = claveHorario(oferta.horario);
    responder(oferta, 'retirada');
    setPublicados((anteriores) => anteriores.filter((h) => claveHorario(h) !== clave));
    setRetirados((anteriores) => [...anteriores, clave]);
  }

  function reprogramarOferta(oferta: Oferta, nuevoHorario: Turno) {
    const vieja = claveHorario(oferta.horario);
    const nueva = claveHorario(nuevoHorario);
    // La oferta vieja se retira (el horario queda libre) y el mismo paciente recibe una oferta por el horario nuevo.
    const ofertaNueva: Oferta = {
      id: `${oferta.idTurno}|${nueva}`,
      idTurno: oferta.idTurno,
      horario: nuevoHorario,
      estado: 'enviada',
    };
    setOfertas((anteriores) => {
      const actualizadas = anteriores.map((o) => {
        if (o.id === oferta.id) {
          const retirada: Oferta = { ...o, estado: 'retirada' };
          return retirada;
        }
        return o;
      });
      return [...actualizadas, ofertaNueva];
    });
    setPublicados((anteriores) => [
      ...anteriores.filter((h) => claveHorario(h) !== vieja && claveHorario(h) !== nueva),
      nuevoHorario,
    ]);
    setRetirados((anteriores) => [...anteriores.filter((c) => c !== nueva), vieja]);
  }

  return (
    <AdelantosContext.Provider
      value={{
        ofertas,
        publicados,
        retirados,
        ofrecerHorario,
        ofrecerA,
        aceptarOferta,
        rechazarOferta,
        noContesta,
        reprogramarOferta,
        retirarOferta,
      }}>
      {children}
    </AdelantosContext.Provider>
  );
}

export function useAdelantos() {
  return useContext(AdelantosContext);
}
