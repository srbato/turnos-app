import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { OpcionAdelanto } from '@/components/opcion-adelanto';
import { ResumenEspecialidad, ResumenMedico } from '@/components/resumen-turno';
import {
  DIAS_OFRECIDOS,
  diasDesde,
  formatearFechaCorta,
  formatearFechaLarga,
  SelectorHorario,
} from '@/components/selector-horario';
import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { aceptaTurnos, atiendeEn, fechaDeVuelta, usePersonal } from '@/contextos/PersonalContext';
import { useSacarTurno } from '@/contextos/SacarTurnoContext';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { horasOcupadas, useTurnos } from '@/contextos/TurnosContext';
import { coberturaQueAtiende } from '@/datos/catalogo';
import { horasReservadas } from '@/datos/adelantos';
import { HOY, ID_PACIENTE_APP } from '@/datos/consultorio';
import { MARGEN_INFERIOR } from '@/constantes/pantalla';

export default function ElegirHorario() {
  const { especialidad, medico, fecha, hora, elegirFecha, elegirHora } = useSacarTurno();
  const { turnos, agregarTurno } = useTurnos();
  const { ofertas } = useAdelantos();
  const { medicos: personal } = usePersonal();
  const { nombre: nombreConsultorio } = useConfiguracion();
  const { coberturaIds } = usePerfilPaciente();
  const [confirmado, setConfirmado] = useState(false);
  // Si quiere que le ofrezcan adelantar el turno cuando se libere un horario (lista de espera).
  const [quiereAdelanto, setQuiereAdelanto] = useState(false);

  // Si se entra a esta URL directo, se vuelve al primer paso que falte.
  if (!especialidad) {
    return <Redirect href="/paciente/sacar-turno" />;
  }
  if (!medico || !aceptaTurnos(personal, medico.nombre)) {
    return <Redirect href="/paciente/sacar-turno/medico" />;
  }

  // Si el médico está de licencia, los días disponibles arrancan cuando vuelve.
  const vuelta = fechaDeVuelta(personal, medico.nombre);
  const dias = diasDesde(vuelta, DIAS_OFRECIDOS);
  // Solo se ofrecen los días en que el médico atiende (sus días de atención y sin licencia).
  const atiende = (dia: string) => atiendeEn(personal, medico.nombre, dia);
  const diasConAtencion = dias.filter((dia) => dia.disponible && atiende(dia.fecha));
  // Mientras no elija otro día (o si el que había elegido ya no se ofrece), se muestra el primero con atención.
  const fechaSeleccionada =
    fecha && diasConAtencion.some((dia) => dia.fecha === fecha) ? fecha : (diasConAtencion[0] ?? dias[0]).fecha;

  function confirmar() {
    if (!especialidad || !medico || !hora) return;
    agregarTurno({
      id: String(Date.now()),
      idPaciente: ID_PACIENTE_APP,
      medico: medico.nombre,
      especialidad: especialidad.nombre,
      sala: medico.sala,
      fecha: fechaSeleccionada,
      hora,
      sede: nombreConsultorio,
      cobertura: coberturaQueAtiende(medico, coberturaIds),
      estado: 'pendiente',
      instrucciones: [],
      adelantoDesde: quiereAdelanto ? HOY : undefined,
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

        {vuelta && (
          <View style={styles.avisoLicencia}>
            <Text style={styles.avisoLicenciaTexto}>
              {medico.nombre} está de licencia y vuelve el {formatearFechaCorta(vuelta)}. Podés sacar turno desde ese día.
            </Text>
          </View>
        )}

        <SelectorHorario
          medico={medico.nombre}
          primerDia={vuelta}
          cantidadDias={DIAS_OFRECIDOS}
          atiende={atiende}
          fecha={fechaSeleccionada}
          hora={hora}
          ocupadas={[
            ...horasOcupadas(turnos, medico.nombre, fechaSeleccionada),
            // Un horario ofrecido a la lista de espera queda reservado hasta que el paciente responda.
            ...horasReservadas(ofertas, turnos, medico.nombre, fechaSeleccionada),
          ]}
          onElegirFecha={elegirFecha}
          onElegirHora={elegirHora}
        />

        <OpcionAdelanto activo={quiereAdelanto} onCambiar={setQuiereAdelanto} />
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
              {especialidad.nombre} · {medico.sala}
            </Text>
            <Text style={styles.modalDato}>
              {formatearFechaLarga(fechaSeleccionada)} · {hora} h
            </Text>
            <Text style={styles.modalDato}>{nombreConsultorio}</Text>
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
  avisoLicencia: {
    backgroundColor: '#FCF1DC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avisoLicenciaTexto: {
    fontSize: 13,
    color: '#7A5200',
    fontWeight: '600',
  },
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
