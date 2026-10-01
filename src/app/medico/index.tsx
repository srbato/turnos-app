import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EstadoTurnoAgenda, Turno, TURNOS_HOY } from '../../datos';
import { fechaHoraComoDate, formatearFecha } from '../../fechas';
import { PacienteContext } from '../../PacienteContext';
import { SesionContext } from '../../SesionContext';
import { TurnosContext } from '../../TurnosContext';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_CONFIRMADO = '#2F9E52';
const COLOR_PENDIENTE = '#E0A123';
const COLOR_RIESGO_ALTO = '#D64545';
const COLOR_BLOQUEADO = '#8A8A8A';
const FONDO_BLOQUEADO = '#ECECEC';
const FONDO_RIESGO_ALTO = '#FBDCDC';

const COLORES_ESTADO: Record<EstadoTurnoAgenda, string> = {
  confirmado: COLOR_CONFIRMADO,
  pendiente: COLOR_PENDIENTE,
  en_espera: COLOR_PENDIENTE,
  bloqueado: COLOR_BLOQUEADO,
};

const ETIQUETAS_ESTADO: Record<EstadoTurnoAgenda, string> = {
  confirmado: 'Confirmado',
  pendiente: 'Pendiente',
  en_espera: 'En espera',
  bloqueado: 'Bloqueado',
};

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Títulos de cada respuesta de la preconsulta.
// Tienen que estar en el mismo orden que las preguntas de paciente/preconsulta.tsx.
const TEMAS_PRECONSULTA = ['Motivo', 'Desde cuándo', 'Síntomas', 'Otra medicación', 'Comentarios'];

function fechaDeHoy() {
  const hoy = new Date();
  return `${DIAS_SEMANA[hoy.getDay()]} ${hoy.getDate()} de ${MESES[hoy.getMonth()]}`;
}

export default function AgendaMedico() {
  const { turnos } = useContext(TurnosContext);
  const { medicoLogueado } = useContext(SesionContext);
  const { paciente, medicamentos, avisoEnviado } = useContext(PacienteContext);
  const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;
  const medicamentosRiesgo = medicamentos.filter((medicamento) => medicamento.riesgo);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);

  // Turnos que los pacientes sacaron desde la app con este médico
  // (no cancelados y que todavía no pasaron), del más cercano al más lejano.
  const ahora = new Date();
  const turnosDeLaApp = turnos
    .filter(
      (turno) =>
        turno.medico === medicoLogueado.nombre &&
        turno.estado !== 'cancelado' &&
        fechaHoraComoDate(turno.fecha, turno.hora) >= ahora
    )
    .sort(
      (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
    );

  // Se calcula en cada render: no hace falta useEffect para esto.
  const turnosDelDia = TURNOS_HOY.filter((turno) => turno.estado !== 'bloqueado');
  const confirmados = turnosDelDia.filter((turno) => turno.estado === 'confirmado').length;
  const pendientes = turnosDelDia.filter((turno) => turno.estado === 'pendiente').length;
  const riesgoAlto = turnosDelDia.filter((turno) => turno.riesgoAlto).length;

  return (
    <View style={styles.pantalla}>
      <SafeAreaView style={styles.encabezado} edges={['top']}>
        <View style={styles.encabezadoFila}>
          <View>
            <Text style={styles.fecha}>{fechaDeHoy()}</Text>
            <Text style={styles.titulo}>Tu agenda de hoy</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{medicoLogueado.iniciales}</Text>
          </View>
        </View>

        <View style={styles.resumen}>
          <View style={styles.resumenCaja}>
            <Text style={styles.resumenNumero}>{turnosDelDia.length}</Text>
            <Text style={styles.resumenEtiqueta}>turnos</Text>
          </View>
          <View style={styles.resumenCaja}>
            <Text style={[styles.resumenNumero, { color: COLOR_CONFIRMADO }]}>{confirmados}</Text>
            <Text style={styles.resumenEtiqueta}>confirmados</Text>
          </View>
          <View style={styles.resumenCaja}>
            <Text style={[styles.resumenNumero, { color: COLOR_PENDIENTE }]}>{pendientes}</Text>
            <Text style={styles.resumenEtiqueta}>pendientes</Text>
          </View>
          <View style={styles.resumenCaja}>
            <Text style={[styles.resumenNumero, { color: COLOR_RIESGO_ALTO }]}>{riesgoAlto}</Text>
            <Text style={styles.resumenEtiqueta}>riesgo alto</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido}>
        <View style={styles.listaEncabezado}>
          <Text style={styles.listaTitulo}>Mañana · 08:00 a 13:00</Text>
          <Text style={styles.filtrar}>Filtrar</Text>
        </View>

        {TURNOS_HOY.length === 0 ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>No tenés turnos cargados para hoy.</Text>
          </View>
        ) : (
          TURNOS_HOY.map((turno) => (
            <Pressable
              key={turno.id}
              style={[styles.tarjeta, turno.riesgoAlto && styles.tarjetaRiesgoAlto]}>
              <View style={styles.tarjetaHora}>
                <Text style={styles.horaTexto}>{turno.hora}</Text>
                <Text style={styles.duracionTexto}>{turno.duracionMin} min</Text>
              </View>
              <View style={styles.tarjetaDatos}>
                <Text style={styles.pacienteTexto}>{turno.paciente}</Text>
                <Text style={[styles.subtituloTexto, turno.riesgoAlto && styles.subtituloRiesgoAlto]}>
                  {turno.subtitulo}
                </Text>
              </View>
              <View
                style={[
                  styles.chipEstado,
                  {
                    backgroundColor: turno.riesgoAlto
                      ? FONDO_RIESGO_ALTO
                      : turno.estado === 'bloqueado'
                        ? FONDO_BLOQUEADO
                        : COLORES_ESTADO[turno.estado],
                  },
                ]}>
                <Text
                  style={[
                    styles.chipEstadoTexto,
                    (turno.riesgoAlto || turno.estado === 'bloqueado') && {
                      color: turno.riesgoAlto ? COLOR_RIESGO_ALTO : COLOR_BLOQUEADO,
                    },
                  ]}>
                  {turno.riesgoAlto ? 'Riesgo alto' : ETIQUETAS_ESTADO[turno.estado]}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        <View style={[styles.listaEncabezado, styles.listaEncabezadoSeparado]}>
          <Text style={styles.listaTitulo}>Próximos días</Text>
        </View>

        {turnosDeLaApp.length === 0 && (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>No tenés turnos sacados desde la app.</Text>
          </View>
        )}

        {turnosDeLaApp.map((turno) => {
          const preconsultaLista = turno.preconsulta.length > 0;
          return (
            <Pressable
              key={turno.id}
              style={styles.tarjeta}
              onPress={() => setTurnoSeleccionado(turno)}>
              <View style={styles.tarjetaHora}>
                <Text style={styles.horaTexto}>{turno.hora}</Text>
                <Text style={styles.duracionTexto}>{formatearFecha(turno.fecha).slice(0, 5)}</Text>
              </View>
              <View style={styles.tarjetaDatos}>
                <Text style={styles.pacienteTexto}>{nombreCompleto}</Text>
                <Text style={styles.subtituloTexto}>
                  {paciente.cobertura} · {preconsultaLista ? 'tocá para ver la preconsulta' : 'sin preconsulta'}
                </Text>
              </View>
              <View
                style={[
                  styles.chipEstado,
                  { backgroundColor: preconsultaLista ? COLOR_CONFIRMADO : FONDO_BLOQUEADO },
                ]}>
                <Text style={[styles.chipEstadoTexto, !preconsultaLista && { color: COLOR_BLOQUEADO }]}>
                  {preconsultaLista ? 'Preconsulta lista' : 'Sin preconsulta'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal
        visible={turnoSeleccionado !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setTurnoSeleccionado(null)}>
        <View style={styles.fondoModal}>
          <SafeAreaView style={styles.tarjetaModal} edges={['bottom']}>
            {turnoSeleccionado && (
              <ScrollView>
                <Text style={styles.modalPaciente}>{nombreCompleto}</Text>
                <Text style={styles.modalDato}>
                  {formatearFecha(turnoSeleccionado.fecha)} · {turnoSeleccionado.hora} h ·{' '}
                  {paciente.cobertura} {paciente.plan}
                </Text>

                {avisoEnviado && medicamentosRiesgo.length > 0 && (
                  <View style={styles.modalAviso}>
                    <Text style={styles.modalAvisoTexto}>
                      ⚠ El paciente avisó una combinación riesgosa:{' '}
                      {medicamentosRiesgo.map((medicamento) => medicamento.nombre).join(' + ')}
                    </Text>
                  </View>
                )}

                <Text style={styles.modalSeccion}>Preconsulta</Text>
                {turnoSeleccionado.preconsulta.length === 0 && (
                  <Text style={styles.modalTexto}>Todavía no completó la preconsulta.</Text>
                )}
                {turnoSeleccionado.preconsulta.map((respuesta, indice) => (
                  <View key={TEMAS_PRECONSULTA[indice]} style={styles.modalFila}>
                    <Text style={styles.modalEtiqueta}>{TEMAS_PRECONSULTA[indice]}</Text>
                    <Text style={styles.modalTexto}>{respuesta}</Text>
                  </View>
                ))}

                <Text style={styles.modalSeccion}>Historia clínica</Text>
                <View style={styles.modalFila}>
                  <Text style={styles.modalEtiqueta}>Medicación habitual</Text>
                  <Text style={styles.modalTexto}>
                    {medicamentos.map((medicamento) => medicamento.nombre).join(', ')}
                  </Text>
                </View>
                <View style={styles.modalFila}>
                  <Text style={styles.modalEtiqueta}>Alergias</Text>
                  <Text style={styles.modalTexto}>{paciente.alergias}</Text>
                </View>

                <Pressable style={styles.botonCerrar} onPress={() => setTurnoSeleccionado(null)}>
                  <Text style={styles.botonCerrarTexto}>Cerrar</Text>
                </Pressable>
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      <SafeAreaView style={styles.tabBar} edges={['bottom']}>
        <View style={styles.tabItem}>
          <Text style={[styles.tabIcono, styles.tabIconoActivo]}>▤</Text>
          <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Agenda</Text>
        </View>
        <View style={styles.tabItem}>
          <Text style={styles.tabIcono}>◍</Text>
          <Text style={styles.tabTexto}>Pacientes</Text>
        </View>
        <View style={styles.tabItem}>
          <Text style={styles.tabIcono}>℞</Text>
          <Text style={styles.tabTexto}>Recetas</Text>
        </View>
        <Pressable style={styles.tabItem} onPress={() => router.push('/perfil?rol=medico')}>
          <Text style={styles.tabIcono}>⚙</Text>
          <Text style={styles.tabTexto}>Perfil</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  encabezado: {
    backgroundColor: FONDO_GRAFITO,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  encabezadoFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  fecha: {
    fontSize: 13,
    color: '#A9ADB4',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLOR_MEDICO,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resumen: {
    flexDirection: 'row',
    gap: 8,
  },
  resumenCaja: {
    flex: 1,
    backgroundColor: '#2B2F36',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  resumenNumero: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resumenEtiqueta: {
    fontSize: 10,
    color: '#A9ADB4',
    marginTop: 2,
  },
  lista: {
    flex: 1,
  },
  listaContenido: {
    padding: 20,
    paddingBottom: 24,
  },
  listaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listaEncabezadoSeparado: {
    marginTop: 14,
  },
  listaTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  filtrar: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_MEDICO,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 14,
    marginBottom: 10,
  },
  tarjetaRiesgoAlto: {
    borderColor: COLOR_RIESGO_ALTO,
  },
  tarjetaHora: {
    width: 56,
    marginRight: 12,
  },
  horaTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  duracionTexto: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 2,
  },
  tarjetaDatos: {
    flex: 1,
    marginRight: 10,
  },
  pacienteTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtituloTexto: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  subtituloRiesgoAlto: {
    color: COLOR_RIESGO_ALTO,
    fontWeight: '600',
  },
  chipEstado: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  estadoVacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
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
    maxHeight: '85%',
  },
  modalPaciente: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalDato: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 4,
  },
  modalAviso: {
    backgroundColor: FONDO_RIESGO_ALTO,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  modalAvisoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_RIESGO_ALTO,
  },
  modalSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },
  modalFila: {
    marginBottom: 10,
  },
  modalEtiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_MEDICO,
  },
  modalTexto: {
    fontSize: 14,
    color: '#1A1A1A',
    marginTop: 2,
  },
  botonCerrar: {
    marginTop: 20,
    backgroundColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCerrarTexto: {
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
    color: COLOR_MEDICO,
  },
  tabTexto: {
    fontSize: 11,
    color: '#9A9A9A',
    marginTop: 2,
  },
  tabTextoActivo: {
    color: COLOR_MEDICO,
    fontWeight: '700',
  },
});
