import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  DIAS_OFRECIDOS,
  diasDesde,
  formatearFechaCorta,
  formatearFechaLarga,
  SelectorHorario,
} from '@/components/selector-horario';
import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { RUTA_AGENDA_SECRETARIA } from '@/constantes/rutas';
import { MARGEN_INFERIOR, MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { atiendeEn, usePersonal } from '@/contextos/PersonalContext';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { horasReservadas } from '@/datos/adelantos';
import { horasOcupadas, useTurnos } from '@/contextos/TurnosContext';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(RUTA_AGENDA_SECRETARIA);
  }
}

// Reprogramar un turno de cualquier paciente. El médico y el paciente no cambian: solo la fecha y la hora.
export default function ReprogramarSecretaria() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { turnos, reprogramarTurno } = useTurnos();
  const { ofertas } = useAdelantos();
  const perfilPaciente = usePerfilPaciente();
  const { medicos: personal } = usePersonal();
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const turno = turnos.find((t) => t.id === id);
  const { consultorio } = useConsultorio();
  const paciente = turno ? pacientesConPerfil(perfilPaciente, consultorio.pacientes).find((p) => p.id === turno.idPaciente) : undefined;

  // Si el id no existe (por ejemplo, URL escrita a mano), se vuelve a la agenda.
  if (!turno || !paciente) {
    return <Redirect href={RUTA_AGENDA_SECRETARIA} />;
  }

  // Solo se ofrecen los días en que el médico atiende. Mientras no elija otro, se muestra el primero con atención.
  const atiende = (dia: string) => atiendeEn(personal, turno.medico, dia);
  const dias = diasDesde(undefined, DIAS_OFRECIDOS);
  const diasConAtencion = dias.filter((dia) => atiende(dia.fecha));
  const fechaSeleccionada =
    fecha && diasConAtencion.some((dia) => dia.fecha === fecha) ? fecha : (diasConAtencion[0] ?? dias[0]).fecha;

  function elegirFecha(nueva: string) {
    setFecha(nueva);
    setHora(null);
  }

  function confirmar() {
    if (!turno || !hora) return;
    // La secretaría confirma el turno al reprogramarlo.
    reprogramarTurno(turno.id, fechaSeleccionada, hora, 'pendiente'); // queda pendiente hasta que el paciente confirme
    setConfirmado(true);
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={volver}>
          <Text style={styles.volver}>‹ Reprogramar turno</Text>
        </Pressable>

        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Paciente</Text>
          <Text style={styles.valor}>
            {paciente.nombre} {paciente.apellido}
          </Text>
          <Text style={styles.etiqueta}>Profesional</Text>
          <Text style={styles.valor}>
            {turno.medico} · {turno.especialidad}
          </Text>
          <Text style={styles.etiqueta}>Turno actual</Text>
          <Text style={styles.valor}>
            {detalleFecha(turno.fecha).diaSemana} {formatearFecha(turno.fecha)} · {turno.hora} h
          </Text>
        </View>

        <SelectorHorario
          medico={turno.medico}
          fecha={fechaSeleccionada}
          hora={hora}
          ocupadas={[
            ...horasOcupadas(turnos, turno.medico, fechaSeleccionada, turno.id),
            ...horasReservadas(ofertas, turnos, turno.medico, fechaSeleccionada, turno.id),
          ]}
          onElegirFecha={elegirFecha}
          onElegirHora={setHora}
          color={COLOR_SECRETARIA}
          cantidadDias={DIAS_OFRECIDOS}
          atiende={atiende}
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

      <Modal visible={confirmado} animationType="fade" transparent onRequestClose={() => router.replace(RUTA_AGENDA_SECRETARIA)}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>Turno reprogramado</Text>
            <Text style={styles.modalPaciente}>
              {paciente.nombre} {paciente.apellido}
            </Text>
            <Text style={styles.modalDato}>{turno.medico}</Text>
            <Text style={styles.modalDato}>
              {formatearFechaLarga(fechaSeleccionada)} · {hora} h
            </Text>
            <Text style={styles.modalDato}>Queda pendiente de confirmación del paciente.</Text>
            <Pressable style={styles.botonModal} onPress={() => router.replace(RUTA_AGENDA_SECRETARIA)}>
              <Text style={styles.botonConfirmarTexto}>Volver a la agenda</Text>
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
    backgroundColor: FONDO_SECRETARIA,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  volver: {
    fontSize: 20,
    fontFamily: FUENTE_TITULOS,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 8,
  },
  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 2,
  },
  botonConfirmar: {
    backgroundColor: COLOR_SECRETARIA,
    paddingVertical: 16,
    paddingBottom: 16 + MARGEN_INFERIOR,
    alignItems: 'center',
  },
  botonConfirmarDeshabilitado: {
    backgroundColor: '#8FC4BF',
  },
  botonConfirmarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },
  modalTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalPaciente: {
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
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
});
