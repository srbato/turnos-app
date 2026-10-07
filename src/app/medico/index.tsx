import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvatarPaciente } from '@/components/avatar-paciente';
import { DetalleConsulta } from '@/components/detalle-consulta';
import { MenuMedico } from '@/components/menu-medico';
import { useMedicamentos } from '@/contextos/MedicamentosContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilMedico } from '@/contextos/PerfilMedicoContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePreconsultas } from '@/contextos/PreconsultasContext';
import { useRecetas } from '@/contextos/RecetasContext';
import { useSesion } from '@/contextos/SesionContext';
import { historiaClinica, useTurnos, Turno } from '@/contextos/TurnosContext';
import { EstadoTurno, HOY, Paciente } from '@/datos/consultorio';
import { filasPreconsulta } from '@/datos/preconsulta';
import { datosParaMedico } from '@/utilidades/datos-medico';
import { detalleFecha, fechaComoTexto, fechaHoraComoDate, formatearFecha } from '@/utilidades/turnos';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_CONFIRMADO = '#2F9E52';
const COLOR_PENDIENTE = '#E0A123';
const COLOR_RIESGO_ALTO = '#D64545';
const COLOR_GRIS = '#8A8A8A';
const FONDO_RIESGO_ALTO = '#FBDCDC';

const COLORES_ESTADO: Record<EstadoTurno, string> = {
  confirmado: COLOR_CONFIRMADO,
  pendiente: COLOR_PENDIENTE,
  cancelado: COLOR_GRIS,
  atendido: COLOR_GRIS,
  ausente: COLOR_RIESGO_ALTO,
};

const ETIQUETAS_ESTADO: Record<EstadoTurno, string> = {
  confirmado: 'Confirmado',
  pendiente: 'Pendiente',
  cancelado: 'Cancelado',
  atendido: 'Atendido',
  ausente: 'No asistió',
};

// Filtros de la lista: '' muestra todos.
const FILTROS = [
  { estado: '', etiqueta: 'Todos' },
  { estado: 'pendiente', etiqueta: 'Pendientes' },
  { estado: 'confirmado', etiqueta: 'Confirmados' },
  { estado: 'atendido', etiqueta: 'Atendidos' },
];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Cantidad de días que se pueden ver en la agenda (hoy incluido).
const DIAS_DE_AGENDA = 14;

// Lista de fechas ('AAAA-MM-DD') desde hoy, para el selector de días.
function diasDeLaAgenda() {
  const dias: string[] = [];
  const hoy = new Date();
  for (let i = 0; i < DIAS_DE_AGENDA; i++) {
    dias.push(fechaComoTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i)));
  }
  return dias;
}

// Ej: 'Jueves 1 de octubre'
function fechaLarga(fecha: string) {
  const detalle = detalleFecha(fecha);
  const mes = Number(fecha.split('-')[1]);
  return `${detalle.diaSemana} ${detalle.dia} de ${MESES[mes - 1]}`;
}

function ordenarPorHora(turnos: Turno[]) {
  return [...turnos].sort(
    (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
  );
}

type PropsTarjetaTurno = {
  turno: Turno;
  paciente: Paciente | undefined;
  riesgo: boolean;
  tienePreconsulta: boolean;
  onPress: () => void;
};

// Tarjeta de un turno en la agenda.
function TarjetaTurno(props: PropsTarjetaTurno) {
  const nombre = props.paciente ? `${props.paciente.nombre} ${props.paciente.apellido}` : 'Paciente';
  const cobertura = props.paciente ? props.paciente.cobertura : '';
  const preconsulta = props.tienePreconsulta ? 'preconsulta lista' : 'sin preconsulta';
  const atendido = props.turno.estado === 'atendido';
  // Un turno ya atendido no se marca como riesgo: se muestra en gris.
  const mostrarRiesgo = props.riesgo && !atendido;

  let subtitulo = `${cobertura} · ${preconsulta}`;
  if (mostrarRiesgo && props.paciente && props.paciente.alerta !== '') {
    subtitulo = props.paciente.alerta;
  } else if (mostrarRiesgo) {
    subtitulo = 'Interacción medicamentosa detectada';
  }

  return (
    <Pressable
      style={[styles.tarjeta, mostrarRiesgo && styles.tarjetaRiesgoAlto, atendido && styles.tarjetaAtendida]}
      onPress={props.onPress}>
      <View style={styles.tarjetaHora}>
        <Text style={styles.horaTexto}>{props.turno.hora}</Text>
        <Text style={styles.duracionTexto}>20 min</Text>
      </View>
      <View style={styles.tarjetaDatos}>
        <Text style={styles.pacienteTexto}>{nombre}</Text>
        <Text style={[styles.subtituloTexto, mostrarRiesgo && styles.subtituloRiesgoAlto]}>
          {subtitulo}
        </Text>
      </View>
      <View
        style={[
          styles.chipEstado,
          { backgroundColor: mostrarRiesgo ? FONDO_RIESGO_ALTO : COLORES_ESTADO[props.turno.estado] },
        ]}>
        <Text style={[styles.chipEstadoTexto, mostrarRiesgo && { color: COLOR_RIESGO_ALTO }]}>
          {mostrarRiesgo ? 'Riesgo alto' : ETIQUETAS_ESTADO[props.turno.estado]}
        </Text>
      </View>
    </Pressable>
  );
}

export default function AgendaMedico() {
  const { turnos, cancelarTurno, cambiarEstadoTurno, registrarConsulta } = useTurnos();
  const perfilMedico = usePerfilMedico();
  const { medicoLogueado } = useSesion();
  const { buscarPorTurno } = usePreconsultas();
  const perfilPaciente = usePerfilPaciente();
  const { medicamentos: medicamentosPropios } = useMedicamentos();
  const { recetas } = useRecetas();
  const { consultorio } = useConsultorio();
  const { pacientes, paciente, medicamentos, interacciones } = datosParaMedico(
    perfilPaciente,
    consultorio.pacientes,
    medicamentosPropios,
    recetas
  );
  const medicamentosRiesgo = medicamentos.filter((medicamento) => medicamento.riesgo);

  const [diaElegido, setDiaElegido] = useState(HOY);
  const [filtro, setFiltro] = useState('');
  // Se guarda el id (y no el turno) para que el Modal muestre siempre el estado actualizado.
  const [idTurnoSeleccionado, setIdTurnoSeleccionado] = useState('');
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);
  // Formulario de la consulta: se abre al marcar el turno como atendido.
  const [registrandoConsulta, setRegistrandoConsulta] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [indicaciones, setIndicaciones] = useState('');
  const [notas, setNotas] = useState('');
  const [errorConsulta, setErrorConsulta] = useState('');

  function buscarPaciente(idPaciente: string) {
    return pacientes.find((pacienteDeLaLista) => pacienteDeLaLista.id === idPaciente);
  }

  // Un paciente es de riesgo si tiene una alerta cargada, o si es el paciente de la app y
  // el verificador detecta una interacción entre sus medicamentos.
  function tieneRiesgo(idPaciente: string) {
    const pacienteDelTurno = buscarPaciente(idPaciente);
    if (pacienteDelTurno && pacienteDelTurno.alerta !== '') {
      return true;
    }
    return idPaciente === paciente.id && interacciones.length > 0;
  }

  function cerrarDetalle() {
    setIdTurnoSeleccionado('');
    setConfirmandoCancelacion(false);
    setRegistrandoConsulta(false);
  }

  // Abre el formulario con lo que ya se había anotado. La primera vez, el motivo sale de la preconsulta (si la hizo).
  function abrirConsulta(turno: Turno) {
    if (turno.consulta) {
      setMotivo(turno.consulta.motivo);
      setDiagnostico(turno.consulta.diagnostico);
      setIndicaciones(turno.consulta.indicaciones);
      setNotas(turno.consulta.notas);
    } else {
      const preconsulta = buscarPorTurno(turno.id);
      setMotivo(preconsulta ? preconsulta.respuestas.motivo : '');
      setDiagnostico('');
      setIndicaciones('');
      setNotas('');
    }
    setErrorConsulta('');
    setRegistrandoConsulta(true);
  }

  // Guarda la consulta y el turno queda como atendido.
  function guardarConsulta(id: string) {
    if (diagnostico.trim() === '') {
      setErrorConsulta('Escribí el diagnóstico.');
      return;
    }
    registrarConsulta(id, {
      motivo: motivo.trim(),
      diagnostico: diagnostico.trim(),
      indicaciones: indicaciones.trim(),
      notas: notas.trim(),
    });
    setRegistrandoConsulta(false);
  }

  function confirmarCancelacion(id: string) {
    cancelarTurno(id);
    cerrarDetalle();
  }

  // Se calcula en cada render: no hace falta useEffect para esto.
  // Turnos de este médico que no están cancelados.
  const turnosDelMedico = turnos.filter(
    (turno) => turno.medico === medicoLogueado.nombre && turno.estado !== 'cancelado'
  );
  const turnosDelDia = ordenarPorHora(turnosDelMedico.filter((turno) => turno.fecha === diaElegido));
  const turnosFiltrados = turnosDelDia.filter((turno) => filtro === '' || turno.estado === filtro);

  const confirmados = turnosDelDia.filter((turno) => turno.estado === 'confirmado').length;
  const pendientes = turnosDelDia.filter((turno) => turno.estado === 'pendiente').length;
  const riesgoAlto = turnosDelDia.filter(
    (turno) => turno.estado !== 'atendido' && tieneRiesgo(turno.idPaciente)
  ).length;

  // Datos del turno que se está mirando en el Modal.
  const turnoSeleccionado = turnos.find((turno) => turno.id === idTurnoSeleccionado);
  const pacienteSeleccionado = turnoSeleccionado ? buscarPaciente(turnoSeleccionado.idPaciente) : undefined;
  const esPacienteDeLaApp = turnoSeleccionado !== undefined && turnoSeleccionado.idPaciente === paciente.id;
  const preconsultaSeleccionada = turnoSeleccionado ? buscarPorTurno(turnoSeleccionado.id) : undefined;
  const sePuedeModificar =
    turnoSeleccionado !== undefined &&
    (turnoSeleccionado.estado === 'pendiente' || turnoSeleccionado.estado === 'confirmado');
  // La consulta anterior más reciente del paciente (con cualquier médico), para tenerla a mano al atenderlo.
  const consultasAnteriores = turnoSeleccionado
    ? historiaClinica(turnos, turnoSeleccionado.idPaciente).filter((turno) => turno.id !== turnoSeleccionado.id)
    : [];
  const ultimaConsulta = consultasAnteriores.length > 0 ? consultasAnteriores[0] : undefined;

  return (
    <View style={styles.pantalla}>
      <SafeAreaView style={styles.encabezado} edges={['top']}>
        <View style={styles.encabezadoFila}>
          <View>
            <Text style={styles.fecha}>{fechaLarga(diaElegido)}</Text>
            <Text style={styles.titulo}>
              {diaElegido === HOY ? 'Tu agenda de hoy' : 'Tu agenda'}
            </Text>
          </View>
          {/* Tocar la foto lleva a Editar perfil, donde el médico puede cambiarla. */}
          <Pressable onPress={() => router.push('/medico/editar-perfil')} hitSlop={8}>
            <AvatarPaciente
              tamano={44}
              colorFondo={COLOR_MEDICO}
              colorTexto="#FFFFFF"
              datos={{
                nombre: medicoLogueado.nombre,
                fotoUri: perfilMedico.fotoUri,
                iniciales: medicoLogueado.iniciales,
              }}
            />
          </Pressable>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filaDias}>
          {diasDeLaAgenda().map((dia) => {
            const elegido = dia === diaElegido;
            const cantidad = turnosDelMedico.filter((turno) => turno.fecha === dia).length;
            return (
              <Pressable
                key={dia}
                style={[styles.diaCaja, elegido && styles.diaCajaElegida]}
                onPress={() => setDiaElegido(dia)}>
                <Text style={[styles.diaNombre, elegido && styles.diaTextoElegido]}>
                  {dia === HOY ? 'HOY' : detalleFecha(dia).diaSemana.slice(0, 3).toUpperCase()}
                </Text>
                <Text style={[styles.diaNumero, elegido && styles.diaTextoElegido]}>
                  {detalleFecha(dia).dia}
                </Text>
                <Text style={[styles.diaCantidad, elegido && styles.diaTextoElegido]}>
                  {cantidad > 0 ? `${cantidad} t.` : '–'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.filaFiltros}>
          {FILTROS.map((opcion) => (
            <Pressable
              key={opcion.etiqueta}
              style={[styles.filtroChip, filtro === opcion.estado && styles.filtroChipElegido]}
              onPress={() => setFiltro(opcion.estado)}>
              <Text style={[styles.filtroTexto, filtro === opcion.estado && styles.filtroTextoElegido]}>
                {opcion.etiqueta}
              </Text>
            </Pressable>
          ))}
        </View>

        {turnosFiltrados.length === 0 && (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>
              {turnosDelDia.length === 0
                ? 'No tenés turnos para este día.'
                : 'No hay turnos con este filtro.'}
            </Text>
          </View>
        )}

        {turnosFiltrados.map((turno) => (
          <TarjetaTurno
            key={turno.id}
            turno={turno}
            paciente={buscarPaciente(turno.idPaciente)}
            riesgo={tieneRiesgo(turno.idPaciente)}
            tienePreconsulta={buscarPorTurno(turno.id) !== undefined}
            onPress={() => setIdTurnoSeleccionado(turno.id)}
          />
        ))}
      </ScrollView>

      <Modal
        visible={turnoSeleccionado !== undefined}
        animationType="slide"
        transparent
        onRequestClose={cerrarDetalle}>
        <KeyboardAvoidingView
          style={styles.fondoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.tarjetaModal} edges={['bottom']}>
            {turnoSeleccionado && pacienteSeleccionado && (
              <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.modalEncabezado}>
                  <Text style={styles.modalPaciente}>
                    {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                  </Text>
                  <View
                    style={[
                      styles.chipEstado,
                      { backgroundColor: COLORES_ESTADO[turnoSeleccionado.estado] },
                    ]}>
                    <Text style={styles.chipEstadoTexto}>
                      {ETIQUETAS_ESTADO[turnoSeleccionado.estado]}
                    </Text>
                  </View>
                  <Pressable style={styles.botonX} onPress={cerrarDetalle}>
                    <Text style={styles.botonXTexto}>✕</Text>
                  </Pressable>
                </View>
                <Text style={styles.modalDato}>
                  {formatearFecha(turnoSeleccionado.fecha)} · {turnoSeleccionado.hora} h ·{' '}
                  {pacienteSeleccionado.cobertura} {pacienteSeleccionado.plan}
                </Text>

                {pacienteSeleccionado.alerta !== '' && (
                  <View style={styles.modalAviso}>
                    <Text style={styles.modalAvisoTexto}>⚠ {pacienteSeleccionado.alerta}</Text>
                  </View>
                )}

                {esPacienteDeLaApp &&
                  interacciones.map((interaccion) => (
                    <View key={interaccion.medicamentos.join('+')} style={styles.modalAviso}>
                      <Text style={styles.modalAvisoTexto}>
                        ⚠ Interacción detectada: {interaccion.medicamentos.join(' + ')}.{' '}
                        {interaccion.descripcion}
                      </Text>
                    </View>
                  ))}

                <Text style={styles.modalSeccion}>Preconsulta</Text>
                {!preconsultaSeleccionada && (
                  <Text style={styles.modalTexto}>Todavía no completó la preconsulta.</Text>
                )}
                {preconsultaSeleccionada &&
                  filasPreconsulta(preconsultaSeleccionada.respuestas).map((fila) => (
                    <View key={fila.titulo} style={styles.modalFila}>
                      <Text style={styles.modalEtiqueta}>{fila.titulo}</Text>
                      <Text style={styles.modalTexto}>{fila.valor}</Text>
                    </View>
                  ))}

                <Text style={styles.modalSeccion}>Historia clínica</Text>
                <View style={styles.modalFila}>
                  <Text style={styles.modalEtiqueta}>Medicación habitual</Text>
                  <Text style={styles.modalTexto}>
                    {esPacienteDeLaApp
                      ? medicamentos.map((medicamento) => medicamento.nombre).join(', ')
                      : 'No cargó su medicación en la app.'}
                  </Text>
                </View>
                <View style={styles.modalFila}>
                  <Text style={styles.modalEtiqueta}>Alergias</Text>
                  <Text style={styles.modalTexto}>{pacienteSeleccionado.alergias}</Text>
                </View>
                {ultimaConsulta && ultimaConsulta.consulta && (
                  <View style={styles.modalFila}>
                    <Text style={styles.modalEtiqueta}>Última consulta</Text>
                    <Text style={styles.modalTexto}>
                      {formatearFecha(ultimaConsulta.fecha)} · {ultimaConsulta.medico}:{' '}
                      {ultimaConsulta.consulta.diagnostico}
                    </Text>
                  </View>
                )}

                {turnoSeleccionado.estado === 'atendido' && !registrandoConsulta && (
                  <View>
                    <Text style={styles.modalSeccion}>Consulta</Text>
                    {turnoSeleccionado.consulta ? (
                      <DetalleConsulta consulta={turnoSeleccionado.consulta} conNotas={true} />
                    ) : (
                      <Text style={styles.modalTexto}>Todavía no anotaste la consulta.</Text>
                    )}
                    <Pressable style={styles.botonEditarConsulta} onPress={() => abrirConsulta(turnoSeleccionado)}>
                      <Text style={styles.botonAtendidoSecundarioTexto}>
                        {turnoSeleccionado.consulta ? 'Editar consulta' : 'Anotar consulta'}
                      </Text>
                    </Pressable>
                  </View>
                )}

                {registrandoConsulta && (
                  <View>
                    <Text style={styles.modalSeccion}>Consulta</Text>
                    <Text style={styles.avisoCorreccion}>
                      Queda en la historia clínica del paciente. Al guardarla, el turno pasa a atendido.
                    </Text>

                    <Text style={styles.modalEtiqueta}>Motivo</Text>
                    <TextInput
                      style={styles.input}
                      value={motivo}
                      onChangeText={setMotivo}
                      placeholder="Por qué vino"
                      placeholderTextColor="#8A8A8A"
                    />

                    <Text style={styles.modalEtiqueta}>Diagnóstico</Text>
                    <TextInput
                      style={[styles.input, errorConsulta !== '' && styles.inputError]}
                      value={diagnostico}
                      onChangeText={setDiagnostico}
                      placeholder="Ej: Faringitis aguda"
                      placeholderTextColor="#8A8A8A"
                    />
                    {errorConsulta !== '' && <Text style={styles.errorTexto}>{errorConsulta}</Text>}

                    <Text style={styles.modalEtiqueta}>Indicaciones</Text>
                    <TextInput
                      style={[styles.input, styles.inputLargo]}
                      value={indicaciones}
                      onChangeText={setIndicaciones}
                      placeholder="Tratamiento, estudios, cuándo volver"
                      placeholderTextColor="#8A8A8A"
                      multiline
                    />

                    <Text style={styles.modalEtiqueta}>Notas privadas</Text>
                    <TextInput
                      style={[styles.input, styles.inputLargo]}
                      value={notas}
                      onChangeText={setNotas}
                      placeholder="Solo las ves vos"
                      placeholderTextColor="#8A8A8A"
                      multiline
                    />

                    <View style={styles.filaConfirmacion}>
                      <Pressable style={styles.botonNo} onPress={() => setRegistrandoConsulta(false)}>
                        <Text style={styles.botonNoTexto}>Volver</Text>
                      </Pressable>
                      <Pressable
                        style={styles.botonGuardarConsulta}
                        onPress={() => guardarConsulta(turnoSeleccionado.id)}>
                        <Text style={styles.botonCerrarTexto}>Guardar consulta</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {sePuedeModificar && !confirmandoCancelacion && !registrandoConsulta && (
                  <View style={styles.acciones}>
                    {turnoSeleccionado.estado === 'pendiente' ? (
                      // Pendiente: confirmar (principal) y atendido, uno al lado del otro.
                      <View style={styles.filaAcciones}>
                        <Pressable
                          style={styles.botonConfirmar}
                          onPress={() => cambiarEstadoTurno(turnoSeleccionado.id, 'confirmado')}>
                          <Text style={styles.botonCerrarTexto}>Confirmar</Text>
                        </Pressable>
                        <Pressable
                          style={styles.botonAtendidoSecundario}
                          onPress={() => abrirConsulta(turnoSeleccionado)}>
                          <Text style={styles.botonAtendidoSecundarioTexto}>Atendido</Text>
                        </Pressable>
                      </View>
                    ) : (
                      // Confirmado: lo único que queda es marcarlo como atendido.
                      <Pressable
                        style={styles.botonAtendido}
                        onPress={() => abrirConsulta(turnoSeleccionado)}>
                        <Text style={styles.botonCerrarTexto}>Marcar como atendido</Text>
                      </Pressable>
                    )}

                    <Pressable
                      style={styles.botonAtendidoSecundario}
                      onPress={() => cambiarEstadoTurno(turnoSeleccionado.id, 'ausente')}>
                      <Text style={styles.botonAtendidoSecundarioTexto}>El paciente no asistió</Text>
                    </Pressable>

                    <Pressable
                      style={styles.linkCancelar}
                      onPress={() => setConfirmandoCancelacion(true)}>
                      <Text style={styles.linkCancelarTexto}>Cancelar turno</Text>
                    </Pressable>
                  </View>
                )}

                {turnoSeleccionado.estado === 'ausente' && !registrandoConsulta && (
                  <View style={styles.acciones}>
                    <Text style={styles.avisoCorreccion}>
                      Si lo marcaste por error, corregilo: la falta deja de sumar puntos de riesgo al paciente.
                    </Text>
                    <Pressable
                      style={styles.botonAtendido}
                      onPress={() => abrirConsulta(turnoSeleccionado)}>
                      <Text style={styles.botonCerrarTexto}>El paciente sí asistió</Text>
                    </Pressable>
                  </View>
                )}

                {confirmandoCancelacion && (
                  <View style={styles.cajaConfirmacion}>
                    <Text style={styles.textoConfirmacion}>¿Seguro que querés cancelar este turno?</Text>
                    <View style={styles.filaConfirmacion}>
                      <Pressable
                        style={styles.botonNo}
                        onPress={() => setConfirmandoCancelacion(false)}>
                        <Text style={styles.botonNoTexto}>No</Text>
                      </Pressable>
                      <Pressable
                        style={styles.botonSiCancelar}
                        onPress={() => confirmarCancelacion(turnoSeleccionado.id)}>
                        <Text style={styles.botonCerrarTexto}>Sí, cancelar</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      <MenuMedico activa="agenda" />
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
  filaDias: {
    marginBottom: 12,
  },
  diaCaja: {
    width: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  diaCajaElegida: {
    backgroundColor: COLOR_MEDICO,
  },
  diaNombre: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
  },
  diaNumero: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 2,
  },
  diaCantidad: {
    fontSize: 10,
    color: '#8A8A8A',
    marginTop: 2,
  },
  diaTextoElegido: {
    color: '#FFFFFF',
  },
  filaFiltros: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filtroChip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5D8DD',
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  filtroChipElegido: {
    backgroundColor: COLOR_MEDICO,
    borderColor: COLOR_MEDICO,
  },
  filtroTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  filtroTextoElegido: {
    color: '#FFFFFF',
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
  tarjetaAtendida: {
    opacity: 0.6,
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
  modalEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  modalPaciente: {
    flex: 1,
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
  botonX: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F1F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonXTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5A5A5A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5D8DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 12,
  },
  inputLargo: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLOR_RIESGO_ALTO,
  },
  errorTexto: {
    fontSize: 12,
    color: COLOR_RIESGO_ALTO,
    marginTop: -8,
    marginBottom: 12,
  },
  // Botón solo (ocupa todo el ancho): no lleva flex.
  botonEditarConsulta: {
    borderWidth: 1,
    borderColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  botonGuardarConsulta: {
    flex: 1,
    backgroundColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  avisoCorreccion: {
    fontSize: 13,
    color: '#5A5A5A',
    marginBottom: 10,
  },
  acciones: {
    marginTop: 24,
  },
  filaAcciones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonConfirmar: {
    flex: 1,
    backgroundColor: COLOR_CONFIRMADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonAtendidoSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonAtendidoSecundarioTexto: {
    color: COLOR_MEDICO,
    fontSize: 14,
    fontWeight: '700',
  },
  // Botón solo (ocupa todo el ancho): no lleva flex, si no se aplasta.
  botonAtendido: {
    backgroundColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkCancelar: {
    alignSelf: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  linkCancelarTexto: {
    color: COLOR_RIESGO_ALTO,
    fontSize: 13,
    fontWeight: '600',
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
  botonNo: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonNoTexto: {
    color: COLOR_MEDICO,
    fontSize: 14,
    fontWeight: '700',
  },
  botonSiCancelar: {
    flex: 1,
    backgroundColor: COLOR_RIESGO_ALTO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCerrarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
