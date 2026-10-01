import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EstadoTurno, Turno } from '../../datos';
import { detalleFecha, fechaHoraComoDate } from '../../fechas';
import { PacienteContext } from '../../PacienteContext';
import { TurnosContext } from '../../TurnosContext';

const COLOR_PACIENTE = '#2D6FE0';
const FONDO_PACIENTE = '#EAF2FE';
const COLOR_CONFIRMADO = '#2F9E52';
const COLOR_PENDIENTE = '#E0A123';
const COLOR_CANCELADO = '#D64545';
const COLOR_REALIZADO = '#8A8A8A';

const COLORES_ESTADO: Record<EstadoTurno, string> = {
  confirmado: COLOR_CONFIRMADO,
  pendiente: COLOR_PENDIENTE,
  cancelado: COLOR_CANCELADO,
  atendido: COLOR_REALIZADO,
};

const ETIQUETAS_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'Confirmado',
  pendiente: 'Pendiente',
  cancelado: 'Cancelado',
  atendido: 'Realizado',
};

type PropsFilaTurno = {
  turno: Turno;
};

// Fecha, médico y estado de un turno. Se usa en las dos listas.
function FilaTurno(props: PropsFilaTurno) {
  const fecha = detalleFecha(props.turno.fecha);

  // Si el turno ya pasó y no se canceló, se muestra como "Realizado".
  let etiqueta = ETIQUETAS_ESTADO[props.turno.estado];
  let color = COLORES_ESTADO[props.turno.estado];
  const yaPaso = fechaHoraComoDate(props.turno.fecha, props.turno.hora) < new Date();
  if (props.turno.estado !== 'cancelado' && yaPaso) {
    etiqueta = 'Realizado';
    color = COLOR_REALIZADO;
  }

  return (
    <View style={styles.filaTurno}>
      <View style={styles.fechaCaja}>
        <Text style={styles.fechaDia}>{fecha.dia}</Text>
        <Text style={styles.fechaMes}>{fecha.mes}</Text>
      </View>
      <View style={styles.datosTurno}>
        <Text style={styles.medico}>{props.turno.medico}</Text>
        <Text style={styles.especialidad}>
          {props.turno.especialidad} · {props.turno.consultorio}
        </Text>
        <Text style={styles.hora}>
          {fecha.diaSemana} {props.turno.hora} h
        </Text>
      </View>
      <View style={[styles.chipEstado, { backgroundColor: color }]}>
        <Text style={styles.chipEstadoTexto}>{etiqueta}</Text>
      </View>
    </View>
  );
}

export default function MisTurnos() {
  const { turnos, cancelarTurno } = useContext(TurnosContext);
  const { paciente } = useContext(PacienteContext);
  // id del turno que está pidiendo confirmación para cancelarse ('' si ninguno).
  const [idConfirmandoCancelacion, setIdConfirmandoCancelacion] = useState('');

  // Se calcula en cada render: no hace falta useEffect para esto.
  const ahora = new Date();
  const misTurnos = turnos.filter((turno) => turno.idPaciente === paciente.id);
  const turnosOrdenados = [...misTurnos].sort(
    (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
  );
  const proximos = turnosOrdenados.filter(
    (turno) =>
      turno.estado !== 'cancelado' &&
      turno.estado !== 'atendido' &&
      fechaHoraComoDate(turno.fecha, turno.hora) >= ahora
  );
  // Los que no son próximos: ya pasaron, se atendieron o están cancelados.
  // Del más reciente al más viejo.
  const anteriores = turnosOrdenados.filter((turno) => !proximos.includes(turno)).reverse();

  function confirmarCancelacion(id: string) {
    cancelarTurno(id);
    setIdConfirmandoCancelacion('');
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.volver}>‹ Mis turnos</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/paciente/sacar-turno')}>
            <Text style={styles.sacarTurno}>+ Sacar turno</Text>
          </Pressable>
        </View>

        <Text style={styles.seccionTitulo}>Próximos</Text>

        {proximos.length === 0 && (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>No tenés turnos próximos.</Text>
          </View>
        )}

        {proximos.map((turno) => (
          <View key={turno.id} style={styles.tarjeta}>
            <FilaTurno turno={turno} />

            {idConfirmandoCancelacion === turno.id ? (
              <View>
                <Text style={styles.textoConfirmacion}>¿Seguro que querés cancelar este turno?</Text>
                <View style={styles.filaBotones}>
                  <Pressable
                    style={styles.botonSecundario}
                    onPress={() => setIdConfirmandoCancelacion('')}>
                    <Text style={styles.botonSecundarioTexto}>No</Text>
                  </Pressable>
                  <Pressable
                    style={styles.botonSiCancelar}
                    onPress={() => confirmarCancelacion(turno.id)}>
                    <Text style={styles.botonSiCancelarTexto}>Sí, cancelar</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.filaBotones}>
                <Pressable
                  style={styles.botonSecundario}
                  onPress={() => router.push(`/paciente/sacar-turno?reprogramar=${turno.id}`)}>
                  <Text style={styles.botonSecundarioTexto}>Reprogramar</Text>
                </Pressable>
                <Pressable
                  style={styles.botonCancelar}
                  onPress={() => setIdConfirmandoCancelacion(turno.id)}>
                  <Text style={styles.botonCancelarTexto}>Cancelar</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))}

        {anteriores.length > 0 && (
          <>
            <Text style={[styles.seccionTitulo, styles.seccionTituloSeparada]}>
              Anteriores y cancelados
            </Text>
            {anteriores.map((turno) => (
              <View key={turno.id} style={[styles.tarjeta, styles.tarjetaAnterior]}>
                <FilaTurno turno={turno} />
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <SafeAreaView style={styles.tabBar} edges={['bottom']}>
        <Pressable style={styles.tabItem} onPress={() => router.push('/paciente')}>
          <Text style={styles.tabIcono}>⌂</Text>
          <Text style={styles.tabTexto}>Inicio</Text>
        </Pressable>
        <View style={styles.tabItem}>
          <Text style={[styles.tabIcono, styles.tabIconoActivo]}>+</Text>
          <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Turnos</Text>
        </View>
        <Pressable style={styles.tabItem} onPress={() => router.push('/paciente/medicamentos')}>
          <Text style={styles.tabIcono}>℞</Text>
          <Text style={styles.tabTexto}>Salud</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => router.push('/perfil?rol=paciente')}>
          <Text style={styles.tabIcono}>◐</Text>
          <Text style={styles.tabTexto}>Perfil</Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  volver: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sacarTurno: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  seccionTituloSeparada: {
    marginTop: 12,
  },
  estadoVacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  estadoVacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  tarjetaAnterior: {
    opacity: 0.6,
  },
  filaTurno: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fechaCaja: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fechaDia: {
    fontSize: 17,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  fechaMes: {
    fontSize: 11,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  datosTurno: {
    flex: 1,
  },
  medico: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  especialidad: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
  },
  hora: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PACIENTE,
    marginTop: 2,
  },
  chipEstado: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: COLOR_PACIENTE,
    fontSize: 14,
    fontWeight: '700',
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: COLOR_CANCELADO,
    fontSize: 14,
    fontWeight: '700',
  },
  textoConfirmacion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 14,
  },
  botonSiCancelar: {
    flex: 1,
    backgroundColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonSiCancelarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcono: {
    fontSize: 20,
    color: '#9A9A9A',
  },
  tabIconoActivo: {
    color: COLOR_PACIENTE,
  },
  tabTexto: {
    fontSize: 11,
    color: '#9A9A9A',
    marginTop: 2,
  },
  tabTextoActivo: {
    color: COLOR_PACIENTE,
    fontWeight: '700',
  },
});
