import { router } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ESTUDIOS_PENDIENTES,
  EstadoTurno,
  LISTA_ESPERA,
  MEDICAMENTOS,
  PACIENTE,
  Turno,
} from '../../datos';
import { detalleFecha, fechaHoraComoDate, formatearFecha } from '../../fechas';
import { TurnosContext } from '../../TurnosContext';

const COLOR_PACIENTE = '#2D6FE0';
const FONDO_PACIENTE = '#EAF2FE';
const COLOR_CONFIRMADO = '#2F9E52';
const COLOR_PENDIENTE = '#E0A123';
const COLOR_CANCELADO = '#D64545';
const FONDO_PENDIENTE = '#FCF1DC'; // tinte claro del ámbar, para chips y fondos suaves

const COLORES_ESTADO: Record<EstadoTurno, string> = {
  confirmado: COLOR_CONFIRMADO,
  pendiente: COLOR_PENDIENTE,
  cancelado: COLOR_CANCELADO,
};

const ETIQUETAS_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'Confirmado',
  pendiente: 'Pendiente',
  cancelado: 'Cancelado',
};

function saludoSegunHora() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buen día';
  if (hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HubPaciente() {
  const { turnos, cancelarTurno } = useContext(TurnosContext);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);

  const cerrarDetalle = () => {
    setTurnoSeleccionado(null);
    setConfirmandoCancelacion(false);
  };

  const confirmarCancelacion = () => {
    if (turnoSeleccionado) {
      cancelarTurno(turnoSeleccionado.id);
    }
    cerrarDetalle();
  };

  // Hay una alerta si el paciente toma algún medicamento marcado como riesgoso
  // (es la misma cuenta que hace la pantalla de medicamentos).
  const hayAlertaMedicacion = MEDICAMENTOS.some((medicamento) => medicamento.riesgo);

  // Se calcula en cada render: no hace falta useEffect para esto.
  const ahora = new Date();
  const proximoTurno = [...turnos]
    .filter((turno) => turno.estado !== 'cancelado' && fechaHoraComoDate(turno.fecha, turno.hora) >= ahora)
    .sort(
      (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
    )[0];

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.saludo}>{saludoSegunHora()},</Text>
            <Text style={styles.nombre}>{PACIENTE.nombre}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{PACIENTE.iniciales}</Text>
          </View>
        </View>

        {!proximoTurno ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>
              Todavía no tenés turnos. Cuando saques uno, lo vas a ver acá.
            </Text>
          </View>
        ) : (
          <View style={styles.tarjetaProximo}>
            <View style={styles.proximoEncabezado}>
              <Text style={styles.proximoEtiqueta}>Próximo turno</Text>
              <View
                style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[proximoTurno.estado] }]}>
                <Text style={styles.chipEstadoTexto}>{ETIQUETAS_ESTADO[proximoTurno.estado]}</Text>
              </View>
            </View>

            <View style={styles.proximoCuerpo}>
              <View style={styles.fechaCaja}>
                <Text style={styles.fechaDia}>{detalleFecha(proximoTurno.fecha).dia}</Text>
                <Text style={styles.fechaMes}>{detalleFecha(proximoTurno.fecha).mes}</Text>
              </View>
              <View style={styles.proximoDatos}>
                <Text style={styles.proximoMedico}>{proximoTurno.medico}</Text>
                <Text style={styles.proximoEspecialidad}>
                  {proximoTurno.especialidad} · {proximoTurno.consultorio}
                </Text>
                <Text style={styles.proximoHora}>
                  {detalleFecha(proximoTurno.fecha).diaSemana} {proximoTurno.hora} h
                </Text>
              </View>
            </View>

            {proximoTurno.instrucciones.length > 0 && (
              <View style={styles.avisoCaja}>
                {proximoTurno.instrucciones.map((instruccion) => (
                  <Text key={instruccion} style={styles.avisoTexto}>
                    • {instruccion}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.proximoBotones}>
              <Pressable
                style={styles.botonPrimario}
                onPress={() => setTurnoSeleccionado(proximoTurno)}>
                <Text style={styles.botonPrimarioTexto}>Ver detalle</Text>
              </Pressable>
              <Pressable
                style={styles.botonSecundario}
                onPress={() => router.push(`/paciente/sacar-turno?reprogramar=${proximoTurno.id}`)}>
                <Text style={styles.botonSecundarioTexto}>Reprogramar</Text>
              </Pressable>
            </View>
          </View>
        )}

        {ESTUDIOS_PENDIENTES.length > 0 && (
          <View style={styles.tarjeta}>
            <View style={styles.tarjetaEncabezado}>
              <Text style={styles.tarjetaTitulo}>Estudios pendientes</Text>
              <Text style={styles.verTodos}>Ver todos</Text>
            </View>
            {ESTUDIOS_PENDIENTES.map((estudio, indice) => (
              <View
                key={estudio.id}
                style={[
                  styles.filaEstudio,
                  indice < ESTUDIOS_PENDIENTES.length - 1 && styles.filaEstudioConBorde,
                ]}>
                <View style={styles.tipoEstudio}>
                  <Text style={styles.tipoEstudioTexto}>{estudio.tipo}</Text>
                </View>
                <View style={styles.estudioDatos}>
                  <Text style={styles.estudioTitulo}>{estudio.titulo}</Text>
                  <Text style={styles.estudioDetalle}>{estudio.detalle}</Text>
                </View>
                <View style={styles.chipPendiente}>
                  <Text style={styles.chipPendienteTexto}>Pendiente</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {LISTA_ESPERA && (
          <View style={styles.tarjetaEspera}>
            <View style={styles.esperaNumero}>
              <Text style={styles.esperaNumeroTexto}>{LISTA_ESPERA.posicion}°</Text>
            </View>
            <View style={styles.esperaDatos}>
              <Text style={styles.esperaTitulo}>
                Estás {LISTA_ESPERA.posicion}° en la lista de espera
              </Text>
              <Text style={styles.esperaSubtitulo}>
                {LISTA_ESPERA.especialidad} · te avisamos si se libera un turno
              </Text>
            </View>
          </View>
        )}

        <View style={styles.accesos}>
          <Pressable
            style={styles.accesoPreconsulta}
            onPress={() => router.push('/paciente/preconsulta')}>
            <Text style={styles.accesoPreconsultaTitulo}>Preconsulta</Text>
            <Text style={styles.accesoPreconsultaSubtitulo}>5 min antes del turno</Text>
          </Pressable>
          <Pressable
            style={styles.accesoMedicacion}
            onPress={() => router.push('/paciente/medicamentos')}>
            <Text style={styles.accesoMedicacionTitulo}>Mi medicación</Text>
            {hayAlertaMedicacion && (
              <Text style={styles.accesoMedicacionAlerta}>1 alerta activa</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={turnoSeleccionado !== null}
        animationType="slide"
        transparent
        onRequestClose={cerrarDetalle}>
        <View style={styles.fondoModal}>
          <SafeAreaView style={styles.tarjetaModal} edges={['bottom']}>
            {turnoSeleccionado && (
              <>
                <Text style={styles.modalMedico}>{turnoSeleccionado.medico}</Text>
                <Text style={styles.modalDato}>
                  {turnoSeleccionado.especialidad} · {turnoSeleccionado.consultorio}
                </Text>
                <Text style={styles.modalDato}>
                  {formatearFecha(turnoSeleccionado.fecha)} · {turnoSeleccionado.hora} h
                </Text>
                <Text style={styles.modalDato}>{turnoSeleccionado.sede}</Text>
                <View
                  style={[
                    styles.chipEstado,
                    { backgroundColor: COLORES_ESTADO[turnoSeleccionado.estado] },
                  ]}>
                  <Text style={styles.chipEstadoTexto}>
                    {ETIQUETAS_ESTADO[turnoSeleccionado.estado]}
                  </Text>
                </View>
                {turnoSeleccionado.instrucciones.length > 0 && (
                  <View style={styles.modalAvisoCaja}>
                    {turnoSeleccionado.instrucciones.map((instruccion) => (
                      <Text key={instruccion} style={styles.avisoTexto}>
                        • {instruccion}
                      </Text>
                    ))}
                  </View>
                )}

                {turnoSeleccionado.estado !== 'cancelado' && !confirmandoCancelacion && (
                  <Pressable
                    style={styles.botonCancelarTurno}
                    onPress={() => setConfirmandoCancelacion(true)}>
                    <Text style={styles.botonCancelarTurnoTexto}>Cancelar turno</Text>
                  </Pressable>
                )}

                {confirmandoCancelacion && (
                  <View style={styles.cajaConfirmacion}>
                    <Text style={styles.textoConfirmacion}>
                      ¿Seguro que querés cancelar este turno?
                    </Text>
                    <View style={styles.filaConfirmacion}>
                      <Pressable
                        style={styles.botonSecundario}
                        onPress={() => setConfirmandoCancelacion(false)}>
                        <Text style={styles.botonSecundarioTexto}>No</Text>
                      </Pressable>
                      <Pressable style={styles.botonSiCancelar} onPress={confirmarCancelacion}>
                        <Text style={styles.botonPrimarioTexto}>Sí, cancelar</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                <Pressable style={styles.botonCerrar} onPress={cerrarDetalle}>
                  <Text style={styles.botonPrimarioTexto}>Cerrar</Text>
                </Pressable>
              </>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      <SafeAreaView style={styles.tabBar} edges={['bottom']}>
        <View style={styles.tabItem}>
          <Text style={[styles.tabIcono, styles.tabIconoActivo]}>⌂</Text>
          <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Inicio</Text>
        </View>
        <Pressable style={styles.tabItem} onPress={() => router.push('/paciente/turnos')}>
          <Text style={styles.tabIcono}>+</Text>
          <Text style={styles.tabTexto}>Turnos</Text>
        </Pressable>
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
  saludo: {
    fontSize: 14,
    color: '#5A5A5A',
  },
  nombre: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLOR_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  tarjetaProximo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  proximoEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  proximoEtiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proximoCuerpo: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  fechaCaja: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fechaDia: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  fechaMes: {
    fontSize: 11,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  proximoDatos: {
    flex: 1,
    justifyContent: 'center',
  },
  proximoMedico: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  proximoEspecialidad: {
    fontSize: 14,
    color: '#5A5A5A',
    marginTop: 2,
  },
  proximoHora: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_PACIENTE,
    marginTop: 4,
  },
  avisoCaja: {
    backgroundColor: FONDO_PENDIENTE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  avisoTexto: {
    fontSize: 13,
    color: '#7A5A12',
    lineHeight: 19,
  },
  proximoBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: COLOR_PACIENTE,
    fontSize: 14,
    fontWeight: '700',
  },
  chipEstado: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  tarjetaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tarjetaTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  verTodos: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  filaEstudio: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  filaEstudioConBorde: {
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  tipoEstudio: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipoEstudioTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  estudioDatos: {
    flex: 1,
  },
  estudioTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  estudioDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  chipPendiente: {
    backgroundColor: COLOR_PENDIENTE,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipPendienteTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tarjetaEspera: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  esperaNumero: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FONDO_PENDIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  esperaNumeroTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR_PENDIENTE,
  },
  esperaDatos: {
    flex: 1,
  },
  esperaTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  esperaSubtitulo: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  accesos: {
    flexDirection: 'row',
    gap: 12,
  },
  accesoPreconsulta: {
    flex: 1,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 14,
    padding: 16,
    minHeight: 88,
    justifyContent: 'flex-end',
  },
  accesoPreconsultaTitulo: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  accesoPreconsultaSubtitulo: {
    color: '#D7E6FE',
    fontSize: 12,
    marginTop: 2,
  },
  accesoMedicacion: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    minHeight: 88,
    justifyContent: 'flex-end',
  },
  accesoMedicacionTitulo: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '700',
  },
  accesoMedicacionAlerta: {
    color: COLOR_CANCELADO,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  estadoVacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  estadoVacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'flex-end',
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalMedico: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  modalDato: {
    fontSize: 15,
    color: '#3A3A3A',
    marginBottom: 4,
  },
  modalAvisoCaja: {
    backgroundColor: FONDO_PENDIENTE,
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  botonCancelarTurno: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCancelarTurnoTexto: {
    color: COLOR_CANCELADO,
    fontSize: 14,
    fontWeight: '700',
  },
  cajaConfirmacion: {
    marginTop: 20,
  },
  textoConfirmacion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  filaConfirmacion: {
    flexDirection: 'row',
    gap: 10,
  },
  botonSiCancelar: {
    flex: 1,
    backgroundColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCerrar: {
    marginTop: 12,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
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
