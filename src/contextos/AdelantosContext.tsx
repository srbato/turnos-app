import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { MiembroMedico, usePersonal } from '@/contextos/PersonalContext';
import { useTurnos, Turno } from '@/contextos/TurnosContext';
import { claveHorario, crearHorarioLibre } from '@/datos/adelantos';
import { ID_CONSULTORIO, pedir } from '@/servicios/api';

// Ofertas de adelanto. Cada oferta es un horario libre que se le ofrece a un paciente de la lista de espera. Un
// paciente tiene como máximo una oferta pendiente y un horario se ofrece a un solo paciente a la vez. Las ofertas las
// crea la API: cuando se libera un horario o alguien responde, le ofrece los horarios libres al siguiente de la lista.

// 'retirada': la canceló Secretaría.
export type EstadoOferta = 'enviada' | 'aceptada' | 'rechazada' | 'sin-respuesta' | 'retirada';

export type Oferta = {
  id: string;
  idTurno: string; // el turno del paciente que se adelantaría
  horario: Turno; // el horario libre que se ofrece
  estado: EstadoOferta;
};

// Las funciones devuelven el mensaje de error de la API, o '' si salió bien.
type AdelantosContextType = {
  ofertas: Oferta[];
  retirados: string[]; // horarios que Secretaría sacó de la oferta (ver claveHorario)
  publicados: Turno[]; // horarios libres que Secretaría ofreció a la lista desde la agenda de un médico
  ofrecerHorario: (horario: Turno) => Promise<string>;
  ofrecerA: (horario: Turno, idTurno: string) => Promise<string>; // Secretaría le propone ese horario a un paciente puntual
  aceptarOferta: (oferta: Oferta) => Promise<string>; // el paciente acepta: su turno se mueve al horario ofrecido
  rechazarOferta: (oferta: Oferta) => Promise<string>; // el paciente rechaza
  noContesta: (oferta: Oferta) => Promise<string>; // Secretaría marca que no respondió: el horario pasa al siguiente
  reprogramarOferta: (oferta: Oferta, nuevoHorario: Turno) => Promise<string>; // le cambia el horario ofrecido
  retirarOferta: (oferta: Oferta) => Promise<string>; // Secretaría cancela la oferta y el horario deja de ofrecerse
};

// Valor que se usa solo si una pantalla queda fuera del Provider.
const VALOR_POR_DEFECTO: AdelantosContextType = {
  ofertas: [],
  retirados: [],
  publicados: [],
  ofrecerHorario: async () => '',
  ofrecerA: async () => '',
  aceptarOferta: async () => '',
  rechazarOferta: async () => '',
  noContesta: async () => '',
  reprogramarOferta: async () => '',
  retirarOferta: async () => '',
};

const AdelantosContext = createContext(VALOR_POR_DEFECTO);

// Una oferta tal como la devuelve la API (GET /api/ofertas): trae el turno del paciente con su médico.
type OfertaApi = {
  id: number;
  turnoId: number;
  fecha: string;
  hora: string;
  estado: EstadoOferta;
  turno: { medico: { id: number; nombre: string; especialidad: string; sala: string } };
};

// Un horario publicado o retirado, tal como lo devuelve la API.
type HorarioApi = {
  medicoId: number;
  fecha: string;
  hora: string;
};

// Va dentro de TurnosProvider y PersonalProvider: usa los turnos y los datos de los médicos.
export function AdelantosProvider({ children }: { children: ReactNode }) {
  const { consultorio } = useConsultorio();
  const { turnos, recargarTurnos } = useTurnos();
  const { medicos } = usePersonal();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [publicados, setPublicados] = useState<Turno[]>([]);
  const [retirados, setRetirados] = useState<string[]>([]); // horarios que Secretaría sacó de la oferta (claves)

  // Los horarios publicados y retirados solo traen el id del médico: el resto se busca en el personal.
  function horarioDesdeApi(horario: HorarioApi) {
    const medico: MiembroMedico | undefined = medicos.find((m) => m.id === String(horario.medicoId));
    if (!medico) {
      return null;
    }
    return crearHorarioLibre(medico, horario.fecha, horario.hora, consultorio.nombre);
  }

  async function recargarAdelantos() {
    const respuestaOfertas = await pedir('GET', `/api/ofertas?consultorioId=${ID_CONSULTORIO}`);
    if (respuestaOfertas.ok) {
      const lista: OfertaApi[] = respuestaOfertas.datos;
      setOfertas(
        lista.map((oferta) => ({
          id: String(oferta.id),
          idTurno: String(oferta.turnoId),
          horario: crearHorarioLibre(
            {
              id: String(oferta.turno.medico.id),
              nombre: oferta.turno.medico.nombre,
              especialidad: oferta.turno.medico.especialidad,
              sala: oferta.turno.medico.sala,
            },
            oferta.fecha,
            oferta.hora,
            consultorio.nombre
          ),
          estado: oferta.estado,
        }))
      );
    }

    const respuestaPublicados = await pedir('GET', `/api/horarios-publicados?consultorioId=${ID_CONSULTORIO}`);
    if (respuestaPublicados.ok) {
      const horarios: Turno[] = [];
      respuestaPublicados.datos.forEach((publicado: HorarioApi) => {
        const horario = horarioDesdeApi(publicado);
        if (horario) {
          horarios.push(horario);
        }
      });
      setPublicados(horarios);
    }

    const respuestaRetirados = await pedir('GET', `/api/horarios-retirados?consultorioId=${ID_CONSULTORIO}`);
    if (respuestaRetirados.ok) {
      const claves: string[] = [];
      respuestaRetirados.datos.forEach((retirado: HorarioApi) => {
        const horario = horarioDesdeApi(retirado);
        if (horario) {
          claves.push(claveHorario(horario));
        }
      });
      setRetirados(claves);
    }
  }

  // Cada vez que cambian los turnos (alguien canceló, sacó o movió uno) la API pudo haber mandado ofertas nuevas.
  useEffect(() => {
    recargarAdelantos();
  }, [turnos, medicos]);

  // Manda el cambio a la API y, si salió bien, recarga los turnos (y con ellos las ofertas, por el useEffect de arriba).
  async function enviar(metodo: string, ruta: string, cuerpo: object) {
    const respuesta = await pedir(metodo, ruta, cuerpo);
    if (respuesta.ok) {
      await recargarTurnos();
    }
    return respuesta.error;
  }

  function ofrecerHorario(horario: Turno) {
    return enviar('POST', '/api/horarios-publicados', {
      medicoId: Number(horario.idMedico),
      fecha: horario.fecha,
      hora: horario.hora,
    });
  }

  // La oferta va directo al paciente elegido. El horario no se publica: si no acepta, queda libre y Secretaría
  // decide a quién proponérselo después (no se ofrece solo al siguiente).
  function ofrecerA(horario: Turno, idTurno: string) {
    return enviar('POST', '/api/ofertas', { turnoId: Number(idTurno), fecha: horario.fecha, hora: horario.hora });
  }

  // Su horario de antes queda libre, así la API se lo puede ofrecer al siguiente de la lista.
  function aceptarOferta(oferta: Oferta) {
    return enviar('PATCH', `/api/ofertas/${oferta.id}`, { estado: 'aceptada' });
  }

  function rechazarOferta(oferta: Oferta) {
    return enviar('PATCH', `/api/ofertas/${oferta.id}`, { estado: 'rechazada' });
  }

  function noContesta(oferta: Oferta) {
    return enviar('PATCH', `/api/ofertas/${oferta.id}`, { estado: 'sin-respuesta' });
  }

  function retirarOferta(oferta: Oferta) {
    return enviar('PATCH', `/api/ofertas/${oferta.id}`, { estado: 'retirada' });
  }

  // La oferta vieja se retira (el horario queda libre) y el mismo paciente recibe una oferta por el horario nuevo.
  function reprogramarOferta(oferta: Oferta, nuevoHorario: Turno) {
    return enviar('POST', `/api/ofertas/${oferta.id}/reprogramar`, {
      fecha: nuevoHorario.fecha,
      hora: nuevoHorario.hora,
    });
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
