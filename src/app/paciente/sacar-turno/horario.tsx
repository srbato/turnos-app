import { Redirect, router } from 'expo-router';
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
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useSacarTurno } from '@/contextos/SacarTurnoContext';
import { horasOcupadas, useTurnos } from '@/contextos/TurnosContext';
import { coberturaQueAtiende, SEDE } from '@/datos/catalogo';
import { ID_PACIENTE_APP } from '@/datos/consultorio';
import { MARGEN_INFERIOR } from '@/constantes/pantalla';

export default function ElegirHorario() {
  const { especialidad, medico, fecha, hora, elegirFecha, elegirHora } = useSacarTurno();
  const { turnos, agregarTurno } = useTurnos();
  const { coberturaIds } = usePerfilPaciente();
  const [confirmado, setConfirmado] = useState(false);

  // Si se entra a esta URL directo, se vuelve al primer paso que falte.
  if (!especialidad) {
    return <Redirect href="/paciente/sacar-turno" />;
  }
  if (!medico) {
    return <Redirect href="/paciente/sacar-turno/medico" />;
  }

  // Mientras no elija otro día, se muestra el primero.
  const fechaSeleccionada = fecha ?? DIAS[0].fecha;

  function confirmar() {
    if (!especialidad || !medico || !hora) return;
    agregarTurno({
      id: String(Date.now()),
      idPaciente: ID_PACIENTE_APP,
      medico: medico.nombre,
      especialidad: especialidad.nombre,
      consultorio: medico.consultorio,
      fecha: fechaSeleccionada,
      hora,
      sede: SEDE,
      cobertura: coberturaQueAtiende(medico, coberturaIds),
      estado: 'pendiente',
      instrucciones: [],
    });
    setConfirmado(true);
  }

  function volverAlInicio() {
    // dismissTo saca el flujo del historial: el botón atrás no vuelve a un turno ya confirmado.
    router.dismissTo('/paciente');
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <ResumenEspecialidad
          especialidad={especialidad}
          onCambiar={() => router.dismissTo('/paciente/sacar-turno')}
        />
        <ResumenMedico
          medico={medico}
          onCambiar={() => router.dismissTo('/paciente/sacar-turno/medico')}
        />

        <SelectorHorario
          fecha={fechaSeleccionada}
          hora={hora}
          ocupadas={horasOcupadas(turnos, medico.nombre, fechaSeleccionada)}
          onElegirFecha={elegirFecha}
          onElegirHora={elegirHora}
        />
      </ScrollView>

      <Pressable
        disabled={!hora}
        style={[styles.botonConfirmar, !hora && styles.botonConfirmarDeshabilitado]}
        onPress={confirmar}>
        <Text style={styles.botonConfirmarTexto}>
          {hora
            ? `Confirmar ${formatearFechaCorta(fechaSeleccionada)} · ${hora} h`
            : 'Seleccioná un horario'}
        </Text>
      </Pressable>

      <Modal visible={confirmado} animationType="slide" transparent onRequestClose={volverAlInicio}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>¡Turno solicitado!</Text>
            <Text style={styles.modalMedico}>{medico.nombre}</Text>
            <Text style={styles.modalDato}>
              {especialidad.nombre} · {medico.consultorio}
            </Text>
            <Text style={styles.modalDato}>
              {formatearFechaLarga(fechaSeleccionada)} · {hora} h
            </Text>
            <Text style={styles.modalDato}>{SEDE}</Text>
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
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
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
