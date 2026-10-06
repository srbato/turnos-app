import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { useTurnos, type Turno } from '@/contextos/TurnosContext';
import { claveHorario, proximasOfertas } from '@/datos/adelantos';

// Ofertas de adelanto. Cada oferta es un horario libre que se le ofrece a un paciente de la lista de espera. Un
// paciente tiene como máximo una oferta pendiente y un horario se ofrece a un solo paciente a la vez; cuando alguien
// responde, el sistema crea solo las ofertas que quedaron pendientes (ver datos/adelantos.ts).

export type Oferta = {
  id: string;
  idTurno: string; // el turno del paciente que se adelantaría
  horario: Turno; // el horario libre que se ofrece
  estado: 'enviada' | 'aceptada' | 'rechazada' | 'sin-respuesta' | 'retirada'; // 'retirada': la canceló Secretaría
};

type AdelantosContextType = {
  ofertas: Oferta[];
  retirados: string[]; // horarios que Secretaría sacó de la oferta (ver claveHorario)
  publicados: Turno[]; // horarios libres que Secretaría ofreció a la lista desde la agenda de un médico
  ofrecerHorario: (horario: Turno) => void;
  aceptarOferta: (oferta: Oferta) => void; // el paciente acepta: su turno se mueve al horario ofrecido
  rechazarOferta: (oferta: Oferta) => void; // el paciente rechaza
  noContesta: (oferta: Oferta) => void; // Secretaría marca que no respondió: el horario pasa al siguiente
  reprogramarOferta: (oferta: Oferta, nuevoHorario: Turno) => void; // Secretaría cambia el horario ofrecido al mismo paciente
  retirarOferta: (oferta: Oferta) => void; // Secretaría cancela la oferta y el horario deja de ofrecerse
};

const AdelantosContext = createContext<AdelantosContextType | undefined>(undefined);

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

  // Sin useMemo, este objeto sería nuevo en cada render y re-renderizaría a todos los consumidores.
  const value = useMemo(() => {
    function ofrecerHorario(horario: Turno) {
      setRetirados((anteriores) => anteriores.filter((clave) => clave !== claveHorario(horario)));
      setPublicados((anteriores) =>
        anteriores.some((h) => h.id === horario.id) ? anteriores : [...anteriores, horario]
      );
    }
    function responder(oferta: Oferta, estado: Oferta['estado']) {
      setOfertas((anteriores) => anteriores.map((o) => (o.id === oferta.id ? { ...o, estado } : o)));
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
      setOfertas((anteriores) => [
        ...anteriores.map((o) => (o.id === oferta.id ? { ...o, estado: 'retirada' as const } : o)),
        { id: `${oferta.idTurno}|${nueva}`, idTurno: oferta.idTurno, horario: nuevoHorario, estado: 'enviada' },
      ]);
      setPublicados((anteriores) => [
        ...anteriores.filter((h) => claveHorario(h) !== vieja && claveHorario(h) !== nueva),
        nuevoHorario,
      ]);
      setRetirados((anteriores) => [...anteriores.filter((c) => c !== nueva), vieja]);
    }
    return {
      ofertas,
      publicados,
      retirados,
      ofrecerHorario,
      aceptarOferta,
      rechazarOferta,
      noContesta,
      reprogramarOferta,
      retirarOferta,
    };
  }, [ofertas, publicados, retirados, turnos, reprogramarTurno, agregarTurno]);

  return <AdelantosContext.Provider value={value}>{children}</AdelantosContext.Provider>;
}

export function useAdelantos() {
  const contexto = useContext(AdelantosContext);
  if (contexto === undefined) {
    throw new Error('useAdelantos tiene que usarse dentro de un AdelantosProvider');
  }
  return contexto;
}
