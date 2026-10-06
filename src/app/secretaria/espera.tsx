import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HorariosDisponiblesModal } from '@/components/horarios-disponibles-modal';
import { MenuSecretaria } from '@/components/menu-secretaria';
import {
  COLOR_CANCELADO,
  COLOR_CONFIRMADO,
  COLOR_PENDIENTE,
  COLOR_SECRETARIA,
  FONDO_SECRETARIA,
} from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useAdelantos, type Oferta } from '@/contextos/AdelantosContext';
import { useTurnos, type Turno } from '@/contextos/TurnosContext';
import {
  claveHorario,
  DIAS_MINIMOS_ADELANTO,
  diasDesdeHoy,
  horariosParaOfrecer,
  listaDeEspera,
  ofertasVigentes,
  turnosLiberados,
} from '@/datos/adelantos';
import { PACIENTES } from '@/datos/consultorio';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';

const ETIQUETAS_RESPUESTA: Record<Oferta['estado'], string> = {
  enviada: 'Esperando respuesta',
  aceptada: 'Aceptó',
  rechazada: 'Rechazó',
  'sin-respuesta': 'No contestó',
};
const COLORES_RESPUESTA: Record<Oferta['estado'], string> = {
  enviada: COLOR_PENDIENTE,
  aceptada: COLOR_CONFIRMADO,
  rechazada: COLOR_CANCELADO,
  'sin-respuesta': '#8A8A8A',
};

// "Dr. Ricardo Paz" -> "Dr. Paz"
function medicoCorto(nombre: string) {
  const palabras = nombre.split(' ');
  return `${palabras[0]} ${palabras[palabras.length - 1]}`;
}

function textoCorto(fecha: string, hora: string) {
  return `${detalleFecha(fecha).diaSemana.slice(0, 3)} ${formatearFecha(fecha).slice(0, 5)} · ${hora} h`;
}

function nombreDelPaciente(idPaciente: string) {
  const paciente = PACIENTES.find((p) => p.id === idPaciente);
  return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente';
}

// Lista de espera = adelantos. Los pacientes sacan un turno y pueden anotarse para adelantarlo. Secretaría ofrece
// horarios libres del médico (desde 3 días en adelante): cada paciente recibe una oferta a la vez y cada horario se
// ofrece a un solo paciente. Si uno no acepta, el horario pasa al siguiente que esté libre de ofertas.
export default function EsperaSecretaria() {
  const { turnos } = useTurnos();
  const { ofertas, publicados, noContesta } = useAdelantos();
  // Médico cuya agenda se está mirando para ofrecer un horario (null = cerrado).
  const [medicoAbierto, setMedicoAbierto] = useState<string | null>(null);

  const vigentes = ofertasVigentes(ofertas, turnos).sort((a, b) =>
    `${a.horario.fecha} ${a.horario.hora}` < `${b.horario.fecha} ${b.horario.hora}` ? -1 : 1
  );
  const enLista = listaDeEspera(turnos);
  const medicosEnLista = [...new Set(enLista.map((turno) => turno.medico))];
  const respuestas = ofertas.filter((oferta) => oferta.estado !== 'enviada');

  // Por qué un horario libre no se le ofrece a nadie.
  function motivoSinOferta(horario: Turno) {
    const delMedico = enLista.filter((turno) => turno.medico === horario.medico);
    if (delMedico.length === 0) {
      return 'Nadie en la lista de espera de este médico';
    }
    const posteriores = delMedico.filter(
      (turno) => `${turno.fecha} ${turno.hora}` > `${horario.fecha} ${horario.hora}`
    );
    if (posteriores.length === 0) {
      return 'Nadie en la lista tiene un turno posterior a este horario (no sería un adelanto)';
    }
    const libres = posteriores.filter((turno) => !vigentes.some((oferta) => oferta.idTurno === turno.id));
    if (libres.length === 0) {
      return 'Los que podían adelantar ya tienen otra oferta esperando respuesta';
    }
    return 'Los que podían adelantar ya respondieron por este horario';
  }

  // Horarios libres sin oferta: los de menos de 3 días (no se ofrecen por lista de espera) y los que no tienen a quién.
  const sinOferta = [
    ...turnosLiberados(turnos)
      .filter((horario) => diasDesdeHoy(horario.fecha) < DIAS_MINIMOS_ADELANTO)
      .map((horario) => ({
        horario,
        motivo: `Faltan menos de ${DIAS_MINIMOS_ADELANTO} días: no se ofrece por lista de espera`,
      })),
    ...horariosParaOfrecer(turnos, publicados)
      .filter((horario) => !vigentes.some((oferta) => claveHorario(oferta.horario) === claveHorario(horario)))
      .map((horario) => ({ horario, motivo: motivoSinOferta(horario) })),
  ];

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Lista de espera</Text>
        <Text style={styles.subtitulo}>
          Pacientes que quieren adelantar su turno. Ofrecé horarios libres del médico desde dentro de{' '}
          {DIAS_MINIMOS_ADELANTO} días: cada paciente recibe una oferta a la vez, empezando por el que hace más tiempo
          espera. Si no acepta, el horario pasa al siguiente.
        </Text>

        <Text style={styles.seccion}>OFERTAS EN CURSO ({vigentes.length})</Text>
        {vigentes.length === 0 && (
          <View style={styles.panel}>
            <Text style={styles.detalle}>No hay ofertas ahora. Elegí un médico de la lista y ofrecé un horario.</Text>
          </View>
        )}
        {vigentes.map((oferta) => {
          const turno = turnos.find((t) => t.id === oferta.idTurno);
          if (!turno) return null;
          return (
            <View key={oferta.id} style={styles.panelOferta}>
              <View style={styles.encabezadoOferta}>
                <Text style={styles.etiquetaLiberado}>HORARIO OFRECIDO</Text>
                <View style={styles.chip}>
                  <Text style={styles.chipTexto}>en {diasDesdeHoy(oferta.horario.fecha)} días</Text>
                </View>
              </View>
              <Text style={styles.liberadoTitulo}>
                {textoCorto(oferta.horario.fecha, oferta.horario.hora)} · {medicoCorto(oferta.horario.medico)}
              </Text>

              <View style={styles.ofrecido}>
                <View style={styles.ofrecidoTextos}>
                  <Text style={styles.ofrecidoEtiqueta}>Se le ofreció a</Text>
                  <Text style={styles.candidatoNombre}>{nombreDelPaciente(turno.idPaciente)}</Text>
                  <Text style={styles.detalle}>
                    Espera desde {formatearFecha(turno.adelantoDesde ?? '').slice(0, 5)} · tiene{' '}
                    {textoCorto(turno.fecha, turno.hora)}
                  </Text>
                  <Text style={styles.esperando}>Esperando su respuesta</Text>
                </View>
                <Pressable onPress={() => noContesta(oferta)}>
                  <Text style={styles.noContesta}>No contesta</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {sinOferta.length > 0 && (
          <>
            <Text style={styles.seccion}>HORARIOS LIBRES SIN OFERTA</Text>
            <View style={styles.panel}>
              {sinOferta.map(({ horario, motivo }, indice) => (
                <View key={claveHorario(horario)} style={[styles.filaSimple, indice > 0 && styles.filaBorde]}>
                  <Text style={styles.filaTitulo}>
                    {textoCorto(horario.fecha, horario.hora)} · {medicoCorto(horario.medico)}
                  </Text>
                  <Text style={styles.detalle}>{motivo}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.seccion}>EN ESPERA ({enLista.length})</Text>
        {enLista.length === 0 && (
          <View style={styles.panel}>
            <Text style={styles.detalle}>Nadie está en la lista. Los pacientes se anotan al sacar su turno.</Text>
          </View>
        )}
        {medicosEnLista.map((medico) => {
          const delMedico = enLista.filter((turno) => turno.medico === medico);
          return (
            <View key={medico} style={styles.panel}>
              <View style={styles.encabezadoOferta}>
                <Text style={styles.panelTitulo}>{medico}</Text>
                <View style={styles.chip}>
                  <Text style={styles.chipTexto}>{delMedico.length} en espera</Text>
                </View>
              </View>
              <Pressable style={styles.botonHorarios} onPress={() => setMedicoAbierto(medico)}>
                <Text style={styles.botonHorariosTexto}>Ver horarios disponibles para ofrecer</Text>
              </Pressable>
              {delMedico.map((turno, indice) => {
                const oferta = vigentes.find((o) => o.idTurno === turno.id);
                return (
                  <View key={turno.id} style={[styles.candidato, oferta && styles.candidatoConOferta]}>
                    <View style={styles.posicion}>
                      <Text style={styles.posicionTexto}>{indice + 1}</Text>
                    </View>
                    <View style={styles.candidatoTextos}>
                      <Text style={styles.candidatoNombre}>{nombreDelPaciente(turno.idPaciente)}</Text>
                      <Text style={styles.detalle}>
                        Desde {formatearFecha(turno.adelantoDesde ?? '').slice(0, 5)} · turno{' '}
                        {textoCorto(turno.fecha, turno.hora)}
                      </Text>
                      {oferta && (
                        <Text style={styles.tagOferta}>
                          Oferta pendiente: {textoCorto(oferta.horario.fecha, oferta.horario.hora)}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}

        {respuestas.length > 0 && (
          <>
            <Text style={styles.seccion}>RESPUESTAS</Text>
            <View style={styles.panel}>
              {[...respuestas].reverse().map((respuesta, indice) => {
                const turno = turnos.find((t) => t.id === respuesta.idTurno);
                return (
                  <View key={respuesta.id} style={[styles.filaSimple, indice > 0 && styles.filaBorde]}>
                    <Text style={styles.filaTitulo}>
                      {turno ? nombreDelPaciente(turno.idPaciente) : 'Paciente'} ·{' '}
                      {textoCorto(respuesta.horario.fecha, respuesta.horario.hora)}
                    </Text>
                    <Text style={[styles.estadoRespuesta, { color: COLORES_RESPUESTA[respuesta.estado] }]}>
                      {ETIQUETAS_RESPUESTA[respuesta.estado]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <MenuSecretaria activa="espera" />

      <HorariosDisponiblesModal medico={medicoAbierto} onCerrar={() => setMedicoAbierto(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_SECRETARIA,
  },
  contenido: {
    padding: 18,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  subtitulo: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 4,
  },
  seccion: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  panelOferta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLOR_PENDIENTE,
    padding: 14,
    marginBottom: 10,
  },
  encabezadoOferta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  etiquetaLiberado: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A66F00',
    letterSpacing: 0.5,
  },
  chip: {
    backgroundColor: FONDO_SECRETARIA,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  liberadoTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  ofrecido: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF4DE',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  ofrecidoTextos: {
    flex: 1,
  },
  ofrecidoEtiqueta: {
    fontSize: 11,
    color: '#A66F00',
    fontWeight: '700',
  },
  esperando: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A66F00',
    marginTop: 4,
  },
  noContesta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginLeft: 8,
  },
  panelTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  botonHorarios: {
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  botonHorariosTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  candidato: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  candidatoConOferta: {
    borderColor: COLOR_PENDIENTE,
    backgroundColor: '#FFFBF1',
  },
  posicion: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B9DAD6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  posicionTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  candidatoTextos: {
    flex: 1,
  },
  candidatoNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 1,
  },
  tagOferta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A66F00',
    marginTop: 3,
  },
  filaSimple: {
    paddingVertical: 8,
  },
  filaBorde: {
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
  },
  filaTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  estadoRespuesta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
});
