import { useState } from 'react';
import {
  Button,
  FlatList,
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
  fecha: string; // formato AAAA-MM-DD
  hora: string; // formato HH:MM
  sede: string;
  estado: EstadoTurno;
};

const TURNOS: Turno[] = [
  {
    id: '1',
    medico: 'Dra. Lucía Fernández',
    especialidad: 'Clínica médica',
    fecha: '2026-09-18',
    hora: '10:30',
    sede: 'Consultorios Rivadavia',
    estado: 'confirmado',
  },
  {
    id: '2',
    medico: 'Dr. Ricardo Paz',
    especialidad: 'Cardiología',
    fecha: '2026-09-22',
    hora: '09:00',
    sede: 'Consultorios Rivadavia',
    estado: 'pendiente',
  },
  {
    id: '3',
    medico: 'Dra. Mariela Sosa',
    especialidad: 'Pediatría',
    fecha: '2026-09-10',
    hora: '16:00',
    sede: 'Consultorios Rivadavia',
    estado: 'cancelado',
  },
  {
    id: '4',
    medico: 'Dr. Gustavo Ibáñez',
    especialidad: 'Traumatología',
    fecha: '2026-10-02',
    hora: '11:15',
    sede: 'Consultorios Rivadavia',
    estado: 'confirmado',
  },
];

const NOMBRE_PACIENTE = 'Valentín';

const COLOR_PACIENTE = '#2D6FE0';
const FONDO_PACIENTE = '#EAF2FE';
const COLOR_CONFIRMADO = '#2F9E52';
const COLOR_PENDIENTE = '#E0A123';
const COLOR_CANCELADO = '#D64545';

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

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

export default function HubPaciente() {
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);

  // Se calcula en cada render: no hace falta useEffect para esto.
  const proximoTurno = [...TURNOS]
    .filter((turno) => turno.estado !== 'cancelado')
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))[0];

  const restoTurnos = TURNOS.filter((turno) => turno.id !== proximoTurno?.id);

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.saludo}>Hola, {NOMBRE_PACIENTE}</Text>

        {TURNOS.length === 0 ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>
              Todavía no tenés turnos. Cuando saques uno, lo vas a ver acá.
            </Text>
          </View>
        ) : (
          <>
            {proximoTurno && (
              <View style={styles.tarjetaProximo}>
                <Text style={styles.tarjetaProximoEtiqueta}>Tu próximo turno</Text>
                <Text style={styles.tarjetaProximoMedico}>{proximoTurno.medico}</Text>
                <Text style={styles.tarjetaProximoEspecialidad}>
                  {proximoTurno.especialidad}
                </Text>
                <Text style={styles.tarjetaProximoDato}>
                  {formatearFecha(proximoTurno.fecha)} · {proximoTurno.hora} h
                </Text>
                <Text style={styles.tarjetaProximoDato}>{proximoTurno.sede}</Text>
                <View
                  style={[
                    styles.chipEstado,
                    { backgroundColor: COLORES_ESTADO[proximoTurno.estado] },
                  ]}>
                  <Text style={styles.chipEstadoTexto}>
                    {ETIQUETAS_ESTADO[proximoTurno.estado]}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.subtitulo}>Resto de tus turnos</Text>
            {restoTurnos.length === 0 ? (
              <View style={styles.estadoVacio}>
                <Text style={styles.estadoVacioTexto}>No tenés más turnos agendados.</Text>
              </View>
            ) : (
              <FlatList
                data={restoTurnos}
                keyExtractor={(turno) => turno.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.tarjetaChica}
                    onPress={() => setTurnoSeleccionado(item)}>
                    <View style={styles.tarjetaChicaInfo}>
                      <Text style={styles.tarjetaChicaMedico}>{item.medico}</Text>
                      <Text style={styles.tarjetaChicaDato}>
                        {formatearFecha(item.fecha)} · {item.hora} h
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.chipEstadoChico,
                        { backgroundColor: COLORES_ESTADO[item.estado] },
                      ]}>
                      <Text style={styles.chipEstadoChicoTexto}>
                        {ETIQUETAS_ESTADO[item.estado]}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </>
        )}
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
                <Text style={styles.modalDato}>{turnoSeleccionado.especialidad}</Text>
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
                <View style={styles.botonCerrar}>
                  <Button title="Cerrar" onPress={() => setTurnoSeleccionado(null)} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  saludo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  tarjetaProximo: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  tarjetaProximoEtiqueta: {
    color: '#D7E6FE',
    fontSize: 13,
    marginBottom: 8,
  },
  tarjetaProximoMedico: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  tarjetaProximoEspecialidad: {
    color: '#D7E6FE',
    fontSize: 15,
    marginTop: 2,
    marginBottom: 10,
  },
  tarjetaProximoDato: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 2,
  },
  chipEstado: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 12,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  tarjetaChica: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tarjetaChicaInfo: {
    flex: 1,
    marginRight: 10,
  },
  tarjetaChicaMedico: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  tarjetaChicaDato: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
  },
  chipEstadoChico: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipEstadoChicoTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  botonCerrar: {
    marginTop: 20,
  },
});
