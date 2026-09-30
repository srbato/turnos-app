import { router } from 'expo-router';
import { useState } from 'react';
import {
  Button,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type EstadoTurno = 'confirmado' | 'pendiente' | 'cancelado';

type Turno = {
  id: string;
  medico: string;
  especialidad: string;
  consultorio: string;
  fecha: string; // formato AAAA-MM-DD
  hora: string; // formato HH:MM
  sede: string;
  estado: EstadoTurno;
  instrucciones: string[];
};

type EstudioPendiente = {
  id: string;
  tipo: string;
  titulo: string;
  detalle: string;
};

type ListaEspera = {
  posicion: number;
  especialidad: string;
};

const TURNOS: Turno[] = [
  {
    id: '1',
    medico: 'Dra. Lucía Fernández',
    especialidad: 'Clínica médica',
    consultorio: 'Consultorio 3',
    fecha: '2026-09-29',
    hora: '10:30',
    sede: 'Consultorios Rivadavia',
    estado: 'confirmado',
    instrucciones: ['Ayuno de 8 horas antes del turno', 'Llevá la orden de Swiss Medical'],
  },
  {
    id: '2',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    consultorio: 'Consultorio 5',
    fecha: '2026-10-03',
    hora: '09:00',
    sede: 'Consultorios Rivadavia',
    estado: 'pendiente',
    instrucciones: [],
  },
  {
    id: '3',
    medico: 'Dra. Mariela Sosa',
    especialidad: 'Pediatría',
    consultorio: 'Consultorio 1',
    fecha: '2026-09-20',
    hora: '16:00',
    sede: 'Consultorios Rivadavia',
    estado: 'cancelado',
    instrucciones: [],
  },
  {
    id: '4',
    medico: 'Dr. Gustavo Ibáñez',
    especialidad: 'Traumatología',
    consultorio: 'Consultorio 2',
    fecha: '2026-10-10',
    hora: '11:15',
    sede: 'Consultorios Rivadavia',
    estado: 'confirmado',
    instrucciones: [],
  },
];

const ESTUDIOS_PENDIENTES: EstudioPendiente[] = [
  { id: '1', tipo: 'LAB', titulo: 'Laboratorio completo', detalle: 'Orden vence el 30/09' },
  { id: '2', tipo: 'ECO', titulo: 'Ecografía abdominal', detalle: 'Turno a coordinar' },
];

const LISTA_ESPERA: ListaEspera | null = { posicion: 3, especialidad: 'Cardiología' };

const ALERTAS_MEDICACION = 1;

const NOMBRE_PACIENTE = 'Valentín';
const INICIALES_PACIENTE = 'VM';

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

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_ABREV = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function parsearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return { anio, mes, dia };
}

function fechaHoraComoDate(fecha: string, hora: string) {
  const { anio, mes, dia } = parsearFecha(fecha);
  const [horas, minutos] = hora.split(':').map(Number);
  return new Date(anio, mes - 1, dia, horas, minutos);
}

function detalleFecha(fecha: string) {
  const { anio, mes, dia } = parsearFecha(fecha);
  const fechaLocal = new Date(anio, mes - 1, dia);
  return {
    dia: fechaLocal.getDate(),
    mes: MESES_ABREV[fechaLocal.getMonth()],
    diaSemana: DIAS_SEMANA[fechaLocal.getDay()],
  };
}

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

function saludoSegunHora() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buen día';
  if (hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HubPaciente() {
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);

  // Se calcula en cada render: no hace falta useEffect para esto.
  const ahora = new Date();
  const proximoTurno = [...TURNOS]
    .filter((turno) => turno.estado !== 'cancelado' && fechaHoraComoDate(turno.fecha, turno.hora) >= ahora)
    .sort(
      (a, b) => fechaHoraComoDate(a.fecha, a.hora).getTime() - fechaHoraComoDate(b.fecha, b.hora).getTime()
    )[0];

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.saludo}>{saludoSegunHora()},</Text>
            <Text style={styles.nombre}>{NOMBRE_PACIENTE}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{INICIALES_PACIENTE}</Text>
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
              <Pressable style={styles.botonSecundario}>
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
            {ALERTAS_MEDICACION > 0 && (
              <Text style={styles.accesoMedicacionAlerta}>
                {ALERTAS_MEDICACION} alerta{ALERTAS_MEDICACION === 1 ? '' : 's'} activa
                {ALERTAS_MEDICACION === 1 ? '' : 's'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={turnoSeleccionado !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setTurnoSeleccionado(null)}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
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
                <View style={styles.botonCerrar}>
                  <Button title="Cerrar" onPress={() => setTurnoSeleccionado(null)} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.tabBar}>
        <View style={styles.tabItem}>
          <Text style={[styles.tabIcono, styles.tabIconoActivo]}>⌂</Text>
          <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Inicio</Text>
        </View>
        <Pressable style={styles.tabItem} onPress={() => router.push('/paciente/sacar-turno')}>
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
      </View>
    </View>
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
  botonCerrar: {
    marginTop: 20,
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
