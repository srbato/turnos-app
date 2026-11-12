import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { HorariosDisponiblesModal } from "@/components/horarios-disponibles-modal";
import {
  COLOR_CANCELADO,
  COLOR_PENDIENTE,
  COLOR_SECRETARIA,
} from "@/constantes/colores";
import { useAdelantos } from "@/contextos/AdelantosContext";
import { useConsultorio } from "@/contextos/ConsultorioContext";
import { useErrores } from "@/contextos/ErroresContext";
import { useTurnos } from "@/contextos/TurnosContext";
import { ofertasVigentes } from "@/datos/adelantos";
import { detalleFecha, formatearFecha } from "@/utilidades/turnos";
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { Idioma, usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';

type Props = {
  idOferta: string; // '' = cerrado
  onCerrar: () => void;
};

function textoFecha(fecha: string, hora: string, idioma: Idioma) {
  return TEXTOS_PACIENTE[idioma].detalleTurno.hora(detalleFecha(fecha, idioma).diaSemana, formatearFecha(fecha), hora);
}

// Detalle de un horario ofrecido a la lista de espera: se puede reprogramar el turno del paciente, cancelar la oferta
// o ver su ficha, igual que con un turno común.
export function DetalleOfertaSecretaria({ idOferta, onCerrar }: Props) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  const { turnos } = useTurnos();
  const { ofertas, retirarOferta } = useAdelantos();
  const { mostrarError } = useErrores();
  const { consultorio } = useConsultorio();
  const pacientes = consultorio.pacientes;
  const [confirmando, setConfirmando] = useState(false);
  // Eligiendo otro horario para esta misma oferta.
  const [reprogramando, setReprogramando] = useState(false);

  const oferta = ofertasVigentes(ofertas, turnos).find(
    (o) => o.id === idOferta,
  );
  const turno = oferta
    ? turnos.find((t) => t.id === oferta.idTurno)
    : undefined;
  const paciente = turno
    ? pacientes.find((p) => p.id === turno.idPaciente)
    : undefined;

  function cerrar() {
    setReprogramando(false);
    setConfirmando(false);
    onCerrar();
  }

  return (
    <>
      <Modal
        visible={oferta !== undefined && !reprogramando}
        animationType="fade"
        transparent
        onRequestClose={cerrar}
      >
        <View style={styles.fondo}>
          <View style={styles.tarjeta}>
            {oferta && turno && paciente && (
              <>
                <View style={styles.encabezado}>
                  <Text style={styles.titulo}>{t.detalleOferta.titulo}</Text>
                  <View style={styles.chip}>
                    <Text style={styles.chipTexto}>{t.detalleOferta.esperando}</Text>
                  </View>
                </View>

                <Text style={styles.paciente}>
                  {paciente.nombre} {paciente.apellido}
                </Text>
                <Text style={styles.subtitulo}>
                  {textoFecha(oferta.horario.fecha, oferta.horario.hora, idioma)}
                </Text>

                <View style={styles.filas}>
                  <View style={styles.fila}>
                    <Text style={styles.etiqueta}>{t.comun.medico}</Text>
                    <Text style={styles.valor}>{oferta.horario.medico}</Text>
                  </View>
                  <View style={styles.fila}>
                    <Text style={styles.etiqueta}>{t.detalleOferta.suTurno}</Text>
                    <Text style={styles.valor}>
                      {textoFecha(turno.fecha, turno.hora, idioma)}
                    </Text>
                  </View>
                  <View style={[styles.fila, styles.filaUltima]}>
                    <Text style={styles.etiqueta}>{t.detalleOferta.enEsperaDesde}</Text>
                    <Text style={styles.valor}>
                      {formatearFecha(turno.adelantoDesde ?? "")}
                    </Text>
                  </View>
                </View>

                {!confirmando && (
                  <>
                    <Pressable
                      style={styles.botonSecundario}
                      onPress={() => setReprogramando(true)}
                    >
                      <Text style={styles.botonSecundarioTexto}>{t.comun.reprogramar}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.botonCancelar}
                      onPress={() => setConfirmando(true)}
                    >
                      <Text style={styles.botonCancelarTexto}>{t.detalleOferta.cancelarOferta}</Text>
                    </Pressable>
                  </>
                )}

                {confirmando && (
                  <>
                    <Text style={styles.confirmarTexto}>{t.detalleOferta.confirmar}</Text>
                    <View style={styles.filaBotones}>
                      <Pressable
                        style={styles.botonSecundarioMitad}
                        onPress={() => setConfirmando(false)}
                      >
                        <Text style={styles.botonSecundarioTexto}>{t.comun.volver}</Text>
                      </Pressable>
                      <Pressable
                        style={styles.botonConfirmar}
                        onPress={async () => {
                          cerrar();
                          mostrarError(await retirarOferta(oferta));
                        }}
                      >
                        <Text style={styles.botonConfirmarTexto}>{t.detalleOferta.siCancelar}</Text>
                      </Pressable>
                    </View>
                  </>
                )}

                <Pressable
                  style={styles.enlace}
                  onPress={() => {
                    const id = turno.idPaciente;
                    cerrar();
                    router.push({
                      pathname: "/secretaria/paciente",
                      params: { id },
                    });
                  }}
                >
                  <Text style={styles.enlaceTexto}>{t.comun.verFicha}</Text>
                </Pressable>
                <Pressable style={styles.enlace} onPress={cerrar}>
                  <Text style={styles.cerrarTexto}>{t.comun.cerrar}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
      <HorariosDisponiblesModal
        medico={reprogramando && oferta ? oferta.horario.medico : null}
        oferta={oferta}
        onCerrar={cerrar}
      />
    </>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(26, 24, 21, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  tarjeta: {
    backgroundColor: c.tarjeta,
    borderRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  titulo: {
    fontSize: 12,
    fontWeight: "700",
    color: c.textoSecundario,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chip: {
    backgroundColor: COLOR_PENDIENTE,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  paciente: {
    fontSize: 20,
    fontWeight: "700",
    color: c.texto,
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: "600",
    color: c.acento,
    marginTop: 2,
    marginBottom: 14,
  },
  filas: {
    borderTopWidth: 1,
    borderTopColor: c.bordeSuave,
    marginBottom: 16,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.bordeSuave,
  },
  filaUltima: {
    borderBottomWidth: 0,
  },
  etiqueta: {
    fontSize: 13,
    color: c.textoTenue,
  },
  valor: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: c.texto,
    textAlign: "right",
    marginLeft: 12,
  },
  botonSecundario: {
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  botonSecundarioMitad: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  botonSecundarioTexto: {
    color: c.acento,
    fontSize: 14,
    fontWeight: "700",
  },
  botonCancelar: {
    borderWidth: 1,
    borderColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  botonCancelarTexto: {
    color: COLOR_CANCELADO,
    fontSize: 14,
    fontWeight: "700",
  },
  confirmarTexto: {
    fontSize: 14,
    color: c.texto,
    marginBottom: 12,
  },
  filaBotones: {
    flexDirection: "row",
    gap: 10,
  },
  botonConfirmar: {
    flex: 1,
    backgroundColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  botonConfirmarTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  enlace: {
    alignItems: "center",
    paddingTop: 12,
  },
  enlaceTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: c.acento,
  },
  cerrarTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: c.textoSecundario,
  },
});
