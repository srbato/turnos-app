import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ResumenEspecialidad, ResumenMedico } from '@/components/resumen-turno';
import {
  DIAS,
  formatearFechaCorta,
  formatearFechaLarga,
  SelectorHorario,
} from '@/components/selector-horario';
import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { horasOcupadas, useTurnos } from '@/contextos/TurnosContext';
import { ESPECIALIDADES, MEDICOS } from '@/datos/catalogo';
import { MARGEN_INFERIOR, MARGEN_SUPERIOR } from '@/constantes/pantalla';

export default function Reprogramar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { turnos, reprogramarTurno } = useTurnos();
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  // La especialidad y el médico no se eligen: vienen del turno que se reprograma.
  const turno = turnos.find((t) => t.id === id);
  const especialidad = ESPECIALIDADES.find((e) => e.nombre === turno?.especialidad);
  const medico = MEDICOS.find((m) => m.nombre === turno?.medico);

  // Si el id no existe (por ejemplo, URL escrita a mano), se vuelve al home.
  if (!turno || !especialidad || !medico) {
    return <Redirect href="/paciente" />;
  }

  // Mientras no elija otro día, se muestra el primero.
  const fechaSeleccionada = fecha ?? DIAS[0].fecha;

  function elegirFecha(nueva: string) {
    setFecha(nueva);
    setHora(null);
  }

  function volver() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/paciente');
    }
  }

  function confirmar() {
    if (!turno || !hora) return;
    reprogramarTurno(turno.id, fechaSeleccionada, hora);
    setConfirmado(true);
  }

  function volverAlInicio() {
    router.dismissTo('/paciente');
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={volver}>
          <Text style={styles.volverTexto}>‹ Reprogramar turno</Text>
        </Pressable>

        <View style={styles.turnoActual}>
          <Text style={styles.turnoActualEtiqueta}>Turno actual</Text>
          <Text style={styles.turnoActualValor}>
            {formatearFechaLarga(turno.fecha)} · {turno.hora} h
          </Text>
        </View>

        <ResumenEspecialidad especialidad={especialidad} />
        <ResumenMedico medico={medico} />

        <SelectorHorario
          fecha={fechaSeleccionada}
          hora={hora}
          ocupadas={horasOcupadas(turnos, medico.nombre, fechaSeleccionada, turno.id)}
          onElegirFecha={elegirFecha}
          onElegirHora={setHora}
        />
      </ScrollView>

      <Pressable
        disabled={!hora}
        style={[styles.botonConfirmar, !hora && styles.botonConfirmarDeshabilitado]}
        onPress={confirmar}>
        <Text style={styles.botonConfirmarTexto}>
          {hora
            ? `Reprogramar para ${formatearFechaCorta(fechaSeleccionada)} · ${hora} h`
            : 'Seleccioná un nuevo horario'}
        </Text>
      </Pressable>

      <Modal visible={confirmado} animationType="slide" transparent onRequestClose={volverAlInicio}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>¡Turno reprogramado!</Text>
            <Text style={styles.modalMedico}>{medico.nombre}</Text>
            <Text style={styles.modalDato}>
              {especialidad.nombre} · {medico.consultorio}
            </Text>
            <Text style={styles.modalDato}>
              {formatearFechaLarga(fechaSeleccionada)} · {hora} h
            </Text>
            <Text style={styles.modalDato}>Queda pendiente de confirmación.</Text>
            <Pressable style={styles.botonModal} onPress={volverAlInicio}>
              <Text style={styles.botonConfirmarTexto}>Volver al inicio</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  volverTexto: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  turnoActual: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  turnoActualEtiqueta: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  turnoActualValor: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  botonConfirmar: {
    backgroundColor: COLOR_PACIENTE,
    paddingVertical: 16,
    paddingBottom: 16 + MARGEN_INFERIOR,
    alignItems: 'center',
  },
  botonConfirmarDeshabilitado: {
    backgroundColor: '#A9BEE8',
  },
  botonConfirmarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  modalTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_PACIENTE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
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
  botonModal: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
});
