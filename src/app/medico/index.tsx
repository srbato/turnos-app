import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type EstadoTurno = 'confirmado' | 'pendiente' | 'en_espera' | 'bloqueado';

type TurnoAgenda = {
  id: string;
  hora: string;
  duracionMin: number;
  paciente: string;
  subtitulo: string;
  estado: EstadoTurno;
  riesgoAlto: boolean;
};

const TURNOS_HOY: TurnoAgenda[] = [
  {
    id: '1',
    hora: '09:00',
    duracionMin: 20,
    paciente: 'Sofía Gutiérrez',
    subtitulo: 'Control · OSDE 210 · preconsulta lista',
    estado: 'confirmado',
    riesgoAlto: false,
  },
  {
    id: '2',
    hora: '09:20',
    duracionMin: 20,
    paciente: 'Martín Bianchi',
    subtitulo: 'Interacción medicamentosa detectada',
    estado: 'confirmado',
    riesgoAlto: true,
  },
  {
    id: '3',
    hora: '09:40',
    duracionMin: 20,
    paciente: 'Jorge Almirón',
    subtitulo: 'Primera vez · PAMI · sin preconsulta',
    estado: 'pendiente',
    riesgoAlto: false,
  },
  {
    id: '4',
    hora: '10:00',
    duracionMin: 20,
    paciente: 'Camila Rossi',
    subtitulo: 'Resultados de laboratorio · Galeno',
    estado: 'en_espera',
    riesgoAlto: false,
  },
  {
    id: '5',
    hora: '10:20',
    duracionMin: 20,
    paciente: 'Dra. Lucía Fernández',
    subtitulo: 'Bloqueo · ateneo clínico',
    estado: 'bloqueado',
    riesgoAlto: false,
  },
  {
    id: '6',
    hora: '11:00',
    duracionMin: 40,
    paciente: 'Elsa Domínguez',
    subtitulo: 'Sobreturno · 82 años · acompañada',
    estado: 'confirmado',
    riesgoAlto: false,
  },
];

const NOMBRE_MEDICO = 'Dra. Lucía Fernández';
const INICIALES_MEDICO = 'LF';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_CONFIRMADO = '#2F9E52';
const COLOR_PENDIENTE = '#E0A123';
const COLOR_RIESGO_ALTO = '#D64545';
const COLOR_BLOQUEADO = '#8A8A8A';
const FONDO_BLOQUEADO = '#ECECEC';
const FONDO_RIESGO_ALTO = '#FBDCDC';

const COLORES_ESTADO: Record<EstadoTurno, string> = {
  confirmado: COLOR_CONFIRMADO,
  pendiente: COLOR_PENDIENTE,
  en_espera: COLOR_PENDIENTE,
  bloqueado: COLOR_BLOQUEADO,
};

const ETIQUETAS_ESTADO: Record<EstadoTurno, string> = {
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

function fechaDeHoy() {
  const hoy = new Date();
  return `${DIAS_SEMANA[hoy.getDay()]} ${hoy.getDate()} de ${MESES[hoy.getMonth()]}`;
}

export default function AgendaMedico() {
  // Se calcula en cada render: no hace falta useEffect para esto.
  const turnosDelDia = TURNOS_HOY.filter((turno) => turno.estado !== 'bloqueado');
  const confirmados = turnosDelDia.filter((turno) => turno.estado === 'confirmado').length;
  const pendientes = turnosDelDia.filter((turno) => turno.estado === 'pendiente').length;
  const riesgoAlto = turnosDelDia.filter((turno) => turno.riesgoAlto).length;

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <View style={styles.encabezadoFila}>
          <View>
            <Text style={styles.fecha}>{fechaDeHoy()}</Text>
            <Text style={styles.titulo}>Tu agenda de hoy</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{INICIALES_MEDICO}</Text>
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
      </View>

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
      </ScrollView>

      <View style={styles.tabBar}>
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
      </View>
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
    gap: 10,
  },
  resumenCaja: {
    flex: 1,
    backgroundColor: '#2B2F36',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  resumenNumero: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resumenEtiqueta: {
    fontSize: 11,
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
