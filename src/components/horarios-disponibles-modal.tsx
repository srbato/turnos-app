import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { usePersonal } from '@/contextos/PersonalContext';
import { useTurnos } from '@/contextos/TurnosContext';
import {
  candidatosDisponibles,
  crearHorarioLibre,
  DIAS_MINIMOS_ADELANTO,
  listaDeEspera,
  ofertaDelHorario,
  ofertasVigentes,
} from '@/datos/adelantos';
import { atiendeEseDia, HORAS_BASE } from '@/datos/atencion';
import { fechaDentroDe, PACIENTES } from '@/datos/consultorio';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';

const DIAS_A_MIRAR = 30;

type Props = {
  medico: string | null; // null = cerrado
  onCerrar: () => void;
};

// Agenda del médico desde dentro de 3 días: Secretaría elige un horario libre y se lo ofrece a la lista de espera
// (primero al que hace más tiempo espera).
export function HorariosDisponiblesModal({ medico, onCerrar }: Props) {
  const { turnos } = useTurnos();
  const { medicos } = usePersonal();
  const { ofertas, publicados, ofrecerHorario } = useAdelantos();
  const [dia, setDia] = useState('');
  const [hora, setHora] = useState('');

  const datos = medicos.find((m) => m.nombre === medico);
  const esperando = listaDeEspera(turnos).filter((turno) => turno.medico === medico);
  // Solo tiene sentido ofrecer horarios anteriores al último turno de la lista (si no, nadie lo adelantaría).
  const ultimoMomento = esperando.map((t) => `${t.fecha} ${t.hora}`).sort().pop() ?? '';

  // Hay a quién ofrecérselo: alguien de la lista con un turno más tarde y sin otra oferta pendiente.
  function hayAQuien(fecha: string, h: string) {
    return datos !== undefined && candidatosDisponibles(crearHorarioLibre(datos, fecha, h), turnos, ofertas).length > 0;
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
  const todosOcupados = esperando.length > 0 && esperando.every((t) => conOferta.has(t.id));

  // Días con atención y horarios libres, desde dentro de 3 días.
  const dias: string[] = [];
  if (datos && datos.estado === 'activo') {
    for (let i = DIAS_MINIMOS_ADELANTO; i < DIAS_MINIMOS_ADELANTO + DIAS_A_MIRAR; i++) {
      const fecha = fechaDentroDe(i);
      if (atiendeEseDia(datos.dias, fecha) && HORAS_BASE.some((h) => estaLibre(fecha, h))) {
        dias.push(fecha);
      }
    }
  }

  const diaElegido = dias.includes(dia) ? dia : (dias[0] ?? '');
  const horasLibres = diaElegido ? HORAS_BASE.filter((h) => estaLibre(diaElegido, h)) : [];
  const horaElegida = horasLibres.includes(hora) ? hora : '';

  const horario = datos && diaElegido && horaElegida ? crearHorarioLibre(datos, diaElegido, horaElegida) : null;
  const primero = horario ? candidatosDisponibles(horario, turnos, ofertas)[0] : undefined;

  function cerrar() {
    setDia('');
    setHora('');
    onCerrar();
  }

  function ofrecer() {
    if (!horario) return;
    ofrecerHorario(horario);
    cerrar();
  }

  return (
    <Modal visible={medico !== null} animationType="fade" transparent onRequestClose={cerrar}>
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Horarios disponibles</Text>
          <Text style={styles.medico}>{medico}</Text>
          <Text style={styles.ayuda}>
            Desde dentro de {DIAS_MINIMOS_ADELANTO} días y antes del último turno de la lista. Cada paciente recibe una
            sola oferta a la vez: se le ofrece a quien hace más tiempo espera y no tiene otra pendiente.
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

              {primero && (
                <Text style={styles.destino}>
                  Se le ofrece primero a{' '}
                  <Text style={styles.destinoNegrita}>
                    {PACIENTES.find((p) => p.id === primero.idPaciente)?.nombre}{' '}
                    {PACIENTES.find((p) => p.id === primero.idPaciente)?.apellido}
                  </Text>
                  , en espera desde {formatearFecha(primero.adelantoDesde ?? '').slice(0, 5)} (su turno actual es el{' '}
                  {formatearFecha(primero.fecha).slice(0, 5)} a las {primero.hora} h).
                </Text>
              )}
            </>
          )}

          <View style={styles.filaBotones}>
            <Pressable style={styles.botonSecundario} onPress={cerrar}>
              <Text style={styles.botonSecundarioTexto}>Cerrar</Text>
            </Pressable>
            <Pressable
              disabled={!horario}
              style={[styles.botonPrimario, !horario && styles.botonDeshabilitado]}
              onPress={ofrecer}>
              <Text style={styles.botonPrimarioTexto}>Ofrecer a la lista</Text>
            </Pressable>
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
