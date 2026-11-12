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
import { useErrores } from '@/contextos/ErroresContext';
import { atiendeEn, usePersonal } from '@/contextos/PersonalContext';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { horasReservadas } from '@/datos/adelantos';
import { horasOcupadas, useTurnos } from '@/contextos/TurnosContext';
import { detalleFecha, formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(RUTA_AGENDA_SECRETARIA);
  }
}

// Reprogramar un turno de cualquier paciente. El médico y el paciente no cambian: solo la fecha y la hora.
export default function ReprogramarSecretaria() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { turnos, reprogramarTurno } = useTurnos();
  const { mostrarError } = useErrores();
  const { ofertas } = useAdelantos();
  const { medicos: personal } = usePersonal();
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  const turno = turnos.find((t) => t.id === id);
  const { consultorio } = useConsultorio();
  const paciente = turno ? consultorio.pacientes.find((p) => p.id === turno.idPaciente) : undefined;

  // Si el id no existe (por ejemplo, URL escrita a mano), se vuelve a la agenda.
  if (!turno || !paciente) {
    return <Redirect href={RUTA_AGENDA_SECRETARIA} />;
  }

  // Solo se ofrecen los días en que el médico atiende. Mientras no elija otro, se muestra el primero con atención.
  const atiende = (dia: string) => atiendeEn(personal, turno.medico, dia);
  const dias = diasDesde(undefined, DIAS_OFRECIDOS, idioma);
  const diasConAtencion = dias.filter((dia) => atiende(dia.fecha));
  const fechaSeleccionada =
    fecha && diasConAtencion.some((dia) => dia.fecha === fecha) ? fecha : (diasConAtencion[0] ?? dias[0]).fecha;

  function elegirFecha(nueva: string) {
    setFecha(nueva);
    setHora(null);
  }

  async function confirmar() {
    if (!turno || !hora) return;
    // Queda pendiente hasta que el paciente confirme.
    const error = await reprogramarTurno(turno.id, fechaSeleccionada, hora, 'pendiente');
    if (error !== '') {
      mostrarError(error);
      return;
    }
    setConfirmado(true);
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={volver}>
          <Text style={styles.volver}>{t.reprogramar.titulo}</Text>
        </Pressable>

        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>{t.comun.paciente}</Text>
          <Text style={styles.valor}>
            {paciente.nombre} {paciente.apellido}
          </Text>
          <Text style={styles.etiqueta}>{t.reprogramar.profesional}</Text>
          <Text style={styles.valor}>
            {turno.medico} · {turno.especialidad}
          </Text>
          <Text style={styles.etiqueta}>{t.reprogramar.turnoActual}</Text>
          <Text style={styles.valor}>
            {detalleFecha(turno.fecha, idioma).diaSemana} {formatearFecha(turno.fecha)} · {t.comun.hora(turno.hora)}
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
            ? t.reprogramar.confirmar(formatearFechaCorta(fechaSeleccionada, idioma), hora)
            : t.reprogramar.elegirNuevo}
        </Text>
      </Pressable>

      <Modal visible={confirmado} animationType="fade" transparent onRequestClose={() => router.replace(RUTA_AGENDA_SECRETARIA)}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>{t.reprogramar.reprogramado}</Text>
            <Text style={styles.modalPaciente}>
              {paciente.nombre} {paciente.apellido}
            </Text>
            <Text style={styles.modalDato}>{turno.medico}</Text>
            <Text style={styles.modalDato}>
              {formatearFechaLarga(fechaSeleccionada, idioma)} · {t.comun.hora(hora ?? '')}
            </Text>
            <Text style={styles.modalDato}>{t.reprogramar.pendiente}</Text>
            <Pressable style={styles.botonModal} onPress={() => router.replace(RUTA_AGENDA_SECRETARIA)}>
              <Text style={styles.botonConfirmarTexto}>{t.reprogramar.volverAgenda}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: c.fondo,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  volver: {
    fontSize: 20,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
    marginBottom: 16,
  },
  tarjeta: {
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 11,
    color: c.textoTenue,
    marginTop: 8,
  },
  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: c.texto,
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
    backgroundColor: c.tarjeta,
    borderRadius: 20,
    padding: 24,
  },
  modalTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: c.acento,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalPaciente: {
    fontSize: 20,
    fontWeight: '700',
    color: c.texto,
    marginBottom: 4,
  },
  modalDato: {
    fontSize: 15,
    color: c.texto,
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
