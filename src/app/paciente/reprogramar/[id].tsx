import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ResumenEspecialidad, ResumenMedico } from '@/components/resumen-turno';
import {
  DIAS_OFRECIDOS,
  diasDesde,
  formatearFechaCorta,
  formatearFechaLarga,
  SelectorHorario,
} from '@/components/selector-horario';
import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { useErrores } from '@/contextos/ErroresContext';
import { aceptaTurnos, atiendeEn, fechaDeVuelta, usePersonal } from '@/contextos/PersonalContext';
import { horasOcupadas, useTurnos } from '@/contextos/TurnosContext';
import { horasReservadas } from '@/datos/adelantos';
import { especialidadesDe, medicosDelCatalogo } from '@/datos/catalogo';
import { MARGEN_INFERIOR, MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

export default function Reprogramar() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { turnos, reprogramarTurno } = useTurnos();
  const { mostrarError } = useErrores();
  const { ofertas } = useAdelantos();
  const { medicos: personal } = usePersonal();
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  // La especialidad y el médico no se eligen: vienen del turno que se reprograma.
  const turno = turnos.find((t) => t.id === id);
  const especialidad = especialidadesDe(personal).find((e) => e.nombre === turno?.especialidad);
  const medico = medicosDelCatalogo(personal).find((m) => m.nombre === turno?.medico);

  // Si el id no existe (por ejemplo, URL escrita a mano), se vuelve al home.
  if (!turno || !especialidad || !medico) {
    return <Redirect href="/paciente" />;
  }

  // Si el médico está de baja, no se puede elegir un horario nuevo con él.
  if (!aceptaTurnos(personal, medico.nombre)) {
    return (
      <View style={styles.pantalla}>
        <ScrollView contentContainerStyle={styles.contenido}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/paciente'))}>
            <Text style={styles.volverTexto}>{t.reprogramar.titulo}</Text>
          </Pressable>
          <Text style={styles.avisoMedico}>{t.reprogramar.noAtiende(medico.nombre)}</Text>
        </ScrollView>
      </View>
    );
  }

  // Mientras no elija otro día, se muestra el primero.
  // Si el médico está de licencia, los días disponibles arrancan cuando vuelve.
  const vuelta = fechaDeVuelta(personal, medico.nombre);
  const dias = diasDesde(vuelta, DIAS_OFRECIDOS, idioma);
  // Solo se ofrecen los días en que el médico atiende.
  const atiende = (dia: string) => atiendeEn(personal, medico.nombre, dia);
  const diasConAtencion = dias.filter((dia) => dia.disponible && atiende(dia.fecha));
  const fechaSeleccionada =
    fecha && diasConAtencion.some((dia) => dia.fecha === fecha) ? fecha : (diasConAtencion[0] ?? dias[0]).fecha;

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

  async function confirmar() {
    if (!turno || !hora) return;
    // Por ejemplo, si otro paciente sacó ese horario mientras tanto.
    const error = await reprogramarTurno(turno.id, fechaSeleccionada, hora);
    if (error !== '') {
      mostrarError(error);
      return;
    }
    setConfirmado(true);
  }

  function volverAlInicio() {
    router.dismissTo('/paciente');
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={volver}>
          <Text style={styles.volverTexto}>{t.reprogramar.titulo}</Text>
        </Pressable>

        <View style={styles.turnoActual}>
          <Text style={styles.turnoActualEtiqueta}>{t.reprogramar.turnoActual}</Text>
          <Text style={styles.turnoActualValor}>
            {formatearFechaLarga(turno.fecha, idioma)} · {turno.hora}
          </Text>
        </View>

        <ResumenEspecialidad especialidad={especialidad} />
        <ResumenMedico medico={medico} />

        {vuelta && (
          <View style={styles.avisoLicencia}>
            <Text style={styles.avisoLicenciaTexto}>
              {t.reprogramar.licenciaAviso(medico.nombre, formatearFechaCorta(vuelta, idioma))}
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
            ...horasOcupadas(turnos, medico.nombre, fechaSeleccionada, turno.id),
            ...horasReservadas(ofertas, turnos, medico.nombre, fechaSeleccionada, turno.id),
          ]}
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
            ? t.reprogramar.confirmar(formatearFechaCorta(fechaSeleccionada, idioma), hora)
            : t.reprogramar.elegirNuevo}
        </Text>
      </Pressable>

      <Modal visible={confirmado} animationType="slide" transparent onRequestClose={volverAlInicio}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>{t.reprogramar.reprogramado}</Text>
            <Text style={styles.modalMedico}>{medico.nombre}</Text>
            <Text style={styles.modalDato}>
              {especialidad.nombre} · {medico.sala}
            </Text>
            <Text style={styles.modalDato}>
              {formatearFechaLarga(fechaSeleccionada, idioma)} · {hora}
            </Text>
            <Text style={styles.modalDato}>{t.reprogramar.pendiente}</Text>
            <Pressable style={styles.botonModal} onPress={volverAlInicio}>
              <Text style={styles.botonConfirmarTexto}>{t.comun.volverAlInicio}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
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
  avisoMedico: {
    fontSize: 15,
    color: c.texto,
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: c.fondo,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  volverTexto: {
    fontSize: 20,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
    marginBottom: 16,
  },
  turnoActual: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  turnoActualEtiqueta: {
    fontSize: 11,
    color: c.textoTenue,
  },
  turnoActualValor: {
    fontSize: 14,
    fontWeight: '700',
    color: c.texto,
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
    backgroundColor: c.tarjeta,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  modalMedico: {
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
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
});
