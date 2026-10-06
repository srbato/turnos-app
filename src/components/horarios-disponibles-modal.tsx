import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { useAdelantos, type Oferta } from '@/contextos/AdelantosContext';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { enLicencia, usePersonal } from '@/contextos/PersonalContext';
import { useTurnos, type Turno } from '@/contextos/TurnosContext';
import {
  candidatosDisponibles,
  crearHorarioLibre,
  DIAS_MINIMOS_ADELANTO,
  listaDeEspera,
  ofertaDelHorario,
  ofertasVigentes,
} from '@/datos/adelantos';
import { atiendeEseDia } from '@/datos/atencion';
import { evaluarRiesgo, textoPuntaje } from '@/datos/ausentismo';
import { fechaDentroDe } from '@/datos/consultorio';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';

const DIAS_A_MIRAR = 30;

type Props = {
  medico: string | null; // null = cerrado
  oferta?: Oferta | null; // si viene, se está reprogramando esa oferta (el horario ofrecido) para el mismo paciente
  turnoDestino?: Turno | null; // si viene, Secretaría eligió a este paciente de la lista: se le propone un horario a él
  onCerrar: () => void;
};

// Agenda del médico desde dentro de 3 días. Hay tres usos:
//  - Sin nada más: Secretaría mira los horarios libres, elige uno y toca a quién de la lista se lo propone.
//  - Con turnoDestino: eligió primero al paciente y ahora elige el horario que le propone.
//  - Con oferta: cambia el horario de una oferta ya enviada.
export function HorariosDisponiblesModal({ medico, oferta = null, turnoDestino = null, onCerrar }: Props) {
  const { turnos } = useTurnos();
  const { medicos } = usePersonal();
  const { consultorio } = useConsultorio();
  const { reglasRiesgo, horarios, nombre: nombreConsultorio } = useConfiguracion();
  const { ofertas, publicados, ofrecerA, reprogramarOferta } = useAdelantos();
  const [dia, setDia] = useState('');
  const [hora, setHora] = useState('');

  const datos = medicos.find((m) => m.nombre === medico);
  const esperando = listaDeEspera(turnos).filter((turno) => turno.medico === medico);
  // Solo tiene sentido ofrecer horarios anteriores al último turno de la lista (si no, nadie lo adelantaría).
  // Al reprogramar una oferta, el tope es el turno del paciente que la tiene.
  const turnoDeLaOferta = oferta ? turnos.find((t) => t.id === oferta.idTurno) : undefined;
  const turnoFijo = turnoDeLaOferta ?? turnoDestino ?? undefined; // el paciente ya está elegido
  const ultimoMomento = turnoFijo
    ? `${turnoFijo.fecha} ${turnoFijo.hora}`
    : (esperando.map((t) => `${t.fecha} ${t.hora}`).sort().pop() ?? '');

  // Hay a quién proponérselo: alguien de la lista con un turno más tarde y sin otra oferta pendiente
  // (o, si ya se eligió al paciente, que él pueda recibirlo).
  function hayAQuien(fecha: string, h: string) {
    if (oferta) return true; // el destinatario ya está elegido
    if (datos === undefined) return false;
    const candidatos = candidatosDisponibles(crearHorarioLibre(datos, fecha, h, nombreConsultorio), turnos, ofertas);
    return turnoDestino ? candidatos.some((t) => t.id === turnoDestino.id) : candidatos.length > 0;
  }

  function estaLibre(fecha: string, h: string) {
    return (
      `${fecha} ${h}` < ultimoMomento &&
      !ofertaDelHorario(ofertas, turnos, medico ?? '', fecha, h) &&
      hayAQuien(fecha, h) &&
      !turnos.some((t) => t.estado !== 'cancelado' && t.medico === medico && t.fecha === fecha && t.hora === h) &&
      !publicados.some((p) => p.medico === medico && p.fecha === fecha && p.hora === h)
    );
  }

  // Si todos los que esperan ya tienen una oferta pendiente, no se puede ofrecer nada hasta que respondan.
  const conOferta = new Set(ofertasVigentes(ofertas, turnos).map((o) => o.idTurno));
  const todosOcupados = !oferta && !turnoDestino && esperando.length > 0 && esperando.every((t) => conOferta.has(t.id));

  // Días con atención y horarios libres, desde dentro de 3 días.
  const dias: string[] = [];
  if (datos && datos.estado !== 'baja') {
    for (let i = DIAS_MINIMOS_ADELANTO; i < DIAS_MINIMOS_ADELANTO + DIAS_A_MIRAR; i++) {
      const fecha = fechaDentroDe(i);
      if (!enLicencia(datos, fecha) && atiendeEseDia(datos.dias, fecha) && horarios.some((h) => estaLibre(fecha, h))) {
        dias.push(fecha);
      }
    }
  }

  const diaElegido = dias.includes(dia) ? dia : (dias[0] ?? '');
  const horasLibres = diaElegido ? horarios.filter((h) => estaLibre(diaElegido, h)) : [];
  const horaElegida = horasLibres.includes(hora) ? hora : '';

  const horario = datos && diaElegido && horaElegida ? crearHorarioLibre(datos, diaElegido, horaElegida, nombreConsultorio) : null;
  // Con el paciente ya elegido, el destinatario es él; si no, se listan los pacientes a quienes se puede proponer.
  const destinatario = horario ? turnoFijo : undefined;
  // Se ordenan por mejor historial (menos puntos de riesgo primero); a igual puntaje, el que hace más tiempo espera.
  function riesgoDe(idPaciente: string) {
    const paciente = consultorio.pacientes.find((p) => p.id === idPaciente);
    return paciente ? evaluarRiesgo(paciente, turnos, reglasRiesgo) : undefined;
  }
  const candidatos =
    horario && !turnoFijo
      ? [...candidatosDisponibles(horario, turnos, ofertas)].sort(
          (a, b) => (riesgoDe(a.idPaciente)?.puntaje ?? 0) - (riesgoDe(b.idPaciente)?.puntaje ?? 0)
        )
      : [];

  function nombreDelPaciente(idPaciente: string) {
    const paciente = consultorio.pacientes.find((p) => p.id === idPaciente);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente';
  }

  function cerrar() {
    setDia('');
    setHora('');
    onCerrar();
  }

  // Cambia el horario de una oferta o se lo propone al paciente que Secretaría eligió.
  function ofrecer() {
    if (!horario) return;
    if (oferta) {
      reprogramarOferta(oferta, horario);
    } else if (turnoDestino) {
      ofrecerA(horario, turnoDestino.id);
    }
    cerrar();
  }

  // Desde la lista de candidatos: se toca al paciente y se le propone el horario elegido.
  function proponerA(idTurno: string) {
    if (!horario) return;
    ofrecerA(horario, idTurno);
    cerrar();
  }

  return (
    <Modal visible={medico !== null} animationType="fade" transparent onRequestClose={cerrar}>
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>
            {oferta ? 'Reprogramar oferta' : turnoDestino ? 'Proponer un horario' : 'Horarios disponibles'}
          </Text>
          <Text style={styles.medico}>{medico}</Text>
          <Text style={styles.ayuda}>
            {oferta
              ? `Elegí otro horario libre, desde dentro de ${DIAS_MINIMOS_ADELANTO} días y antes del turno actual del paciente. La oferta pasa al nuevo horario.`
              : turnoDestino
                ? `Horarios libres de ${medico}, desde dentro de ${DIAS_MINIMOS_ADELANTO} días y antes del turno actual de ${nombreDelPaciente(turnoDestino.idPaciente)}.`
                : `Horarios libres desde dentro de ${DIAS_MINIMOS_ADELANTO} días y antes del último turno de la lista. Elegí uno y tocá al paciente a quien se lo querés proponer. Cada paciente recibe una sola oferta a la vez.`}
          </Text>

          {dias.length === 0 ? (
            <Text style={styles.vacio}>
              {todosOcupados
                ? 'Todos los pacientes en espera ya tienen una oferta pendiente. Cuando respondan, vas a poder ofrecer otro horario.'
                : 'No hay horarios libres para ofrecer: el médico no atiende, está de licencia o su agenda está completa.'}
            </Text>
          ) : (
            <>
              <Text style={styles.etiqueta}>Día</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fila}>
                {dias.map((fecha) => (
                  <Pressable
                    key={fecha}
                    style={[styles.diaCaja, fecha === diaElegido && styles.activo]}
                    onPress={() => {
                      setDia(fecha);
                      setHora('');
                    }}>
                    <Text style={[styles.diaEtiqueta, fecha === diaElegido && styles.textoActivo]}>
                      {detalleFecha(fecha).diaSemana.slice(0, 3).toUpperCase()}
                    </Text>
                    <Text style={[styles.diaNumero, fecha === diaElegido && styles.textoActivo]}>
                      {formatearFecha(fecha).slice(0, 5)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.etiqueta}>Horario libre</Text>
              <View style={styles.horas}>
                {horasLibres.map((h) => (
                  <Pressable key={h} style={[styles.chip, h === horaElegida && styles.activo]} onPress={() => setHora(h)}>
                    <Text style={[styles.chipTexto, h === horaElegida && styles.textoActivo]}>{h}</Text>
                  </Pressable>
                ))}
              </View>

              {destinatario && (
                <Text style={styles.destino}>
                  {oferta ? 'La oferta sigue siendo para' : 'Se le propone a'}{' '}
                  <Text style={styles.destinoNegrita}>{nombreDelPaciente(destinatario.idPaciente)}</Text>, en espera
                  desde {formatearFecha(destinatario.adelantoDesde ?? '').slice(0, 5)} (su turno actual es el{' '}
                  {formatearFecha(destinatario.fecha).slice(0, 5)} a las {destinatario.hora} h).
                </Text>
              )}

              {horario && !turnoFijo && (
                <>
                  <Text style={styles.etiqueta}>¿A quién se lo proponés?</Text>
                  {candidatos.map((candidato) => (
                    <Pressable key={candidato.id} style={styles.candidato} onPress={() => proponerA(candidato.id)}>
                      <View style={styles.candidatoTextos}>
                        <Text style={styles.candidatoNombre}>{nombreDelPaciente(candidato.idPaciente)}</Text>
                        <Text style={styles.candidatoDetalle}>
                          En espera desde {formatearFecha(candidato.adelantoDesde ?? '').slice(0, 5)} · tiene{' '}
                          {formatearFecha(candidato.fecha).slice(0, 5)} a las {candidato.hora} h
                        </Text>
                        <Text style={styles.candidatoRiesgo}>
                          Historial: riesgo{' '}
                          {riesgoDe(candidato.idPaciente)?.nivel === 'alto'
                            ? 'alto'
                            : riesgoDe(candidato.idPaciente)?.nivel === 'en-riesgo'
                              ? 'medio'
                              : 'bajo'}{' '}
                          · {textoPuntaje(riesgoDe(candidato.idPaciente)?.puntaje ?? 0)} pts
                        </Text>
                      </View>
                      <Text style={styles.proponer}>Proponer ›</Text>
                    </Pressable>
                  ))}
                </>
              )}
            </>
          )}

          <View style={styles.filaBotones}>
            <Pressable style={styles.botonSecundario} onPress={cerrar}>
              <Text style={styles.botonSecundarioTexto}>Cerrar</Text>
            </Pressable>
            {(oferta || turnoDestino) && (
              <Pressable
                disabled={!horario}
                style={[styles.botonPrimario, !horario && styles.botonDeshabilitado]}
                onPress={ofrecer}>
                <Text style={styles.botonPrimarioTexto}>{oferta ? 'Cambiar horario' : 'Proponer horario'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  titulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  medico: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  ayuda: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 4,
  },
  vacio: {
    fontSize: 14,
    color: '#5A5A5A',
    marginTop: 16,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginTop: 14,
    marginBottom: 6,
  },
  fila: {
    gap: 8,
  },
  horas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diaCaja: {
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: 'center',
  },
  diaEtiqueta: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  diaNumero: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  chip: {
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  activo: {
    backgroundColor: COLOR_SECRETARIA,
    borderColor: COLOR_SECRETARIA,
  },
  textoActivo: {
    color: '#FFFFFF',
  },
  candidato: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FONDO_SECRETARIA,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  candidatoTextos: {
    flex: 1,
  },
  candidatoNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  candidatoRiesgo: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
    marginTop: 2,
  },
  candidatoDetalle: {
    fontSize: 11,
    color: '#5A5A5A',
    marginTop: 2,
  },
  proponer: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  destino: {
    fontSize: 12,
    color: '#5A5A5A',
    backgroundColor: FONDO_SECRETARIA,
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
  },
  destinoNegrita: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: COLOR_SECRETARIA,
    fontSize: 14,
    fontWeight: '700',
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  botonDeshabilitado: {
    backgroundColor: '#8FC4BF',
  },
});
