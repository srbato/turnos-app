import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_SECRETARIA } from '@/constantes/colores';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useErrores } from '@/contextos/ErroresContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';

type Props = {
  idTurno: string; // '' = cerrado
  onCerrar: () => void;
};

// Detalle de un turno para Secretaría: confirmar, reprogramar, cancelar y ver la ficha del paciente.
// Se guarda el id (y no el turno) para que el Modal muestre siempre el estado actualizado.
export function DetalleTurnoSecretaria({ idTurno, onCerrar }: Props) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  const { turnos, cambiarEstadoTurno, cancelarTurno } = useTurnos();
  const { mostrarError } = useErrores();
  const { consultorio } = useConsultorio();
  const pacientes = consultorio.pacientes;
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);

  const turno = turnos.find((t) => t.id === idTurno);
  const paciente = turno ? pacientes.find((p) => p.id === turno.idPaciente) : undefined;
  const sePuedeModificar = turno !== undefined && (turno.estado === 'pendiente' || turno.estado === 'confirmado');

  function cerrar() {
    setConfirmandoCancelacion(false);
    onCerrar();
  }

  return (
    <Modal visible={turno !== undefined} animationType="fade" transparent onRequestClose={cerrar}>
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          {turno && paciente && (
            <>
              <View style={styles.encabezado}>
                <Text style={styles.titulo}>{t.detalleTurno.titulo}</Text>
                <View style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[turno.estado] }]}>
                  <Text style={styles.chipEstadoTexto}>{TEXTOS_PACIENTE[idioma].estados[turno.estado]}</Text>
                </View>
              </View>

              <Text style={styles.paciente}>
                {paciente.nombre} {paciente.apellido}
              </Text>
              <Text style={styles.subtitulo}>
                {detalleFecha(turno.fecha, idioma).diaSemana} {formatearFecha(turno.fecha)} · {t.comun.hora(turno.hora)}
              </Text>

              <View style={styles.filas}>
                <View style={styles.fila}>
                  <Text style={styles.etiqueta}>{t.comun.medico}</Text>
                  <Text style={styles.valor}>{turno.medico}</Text>
                </View>
                <View style={styles.fila}>
                  <Text style={styles.etiqueta}>{t.detalleTurno.especialidad}</Text>
                  <Text style={styles.valor}>
                    {turno.especialidad} · {turno.sala}
                  </Text>
                </View>
                <View style={[styles.fila, styles.filaUltima]}>
                  <Text style={styles.etiqueta}>{t.detalleTurno.cobertura}</Text>
                  <Text style={styles.valor}>{turno.cobertura || paciente.cobertura}</Text>
                </View>
              </View>

              {sePuedeModificar && !confirmandoCancelacion && (
                <>
                  {turno.estado === 'pendiente' && (
                    <Pressable
                      style={styles.botonPrimario}
                      onPress={async () => {
                        cerrar();
                        mostrarError(await cambiarEstadoTurno(turno.id, 'confirmado'));
                      }}>
                      <Text style={styles.botonPrimarioTexto}>{t.detalleTurno.confirmar}</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.botonSecundario}
                    onPress={() => {
                      const id = turno.id;
                      cerrar();
                      router.push({ pathname: '/secretaria/reprogramar/[id]', params: { id } });
                    }}>
                    <Text style={styles.botonSecundarioTexto}>{t.comun.reprogramar}</Text>
                  </Pressable>
                  <Pressable style={styles.botonCancelar} onPress={() => setConfirmandoCancelacion(true)}>
                    <Text style={styles.botonCancelarTexto}>{t.comun.cancelarTurno}</Text>
                  </Pressable>
                </>
              )}

              {sePuedeModificar && confirmandoCancelacion && (
                <>
                  <Text style={styles.confirmarTexto}>{t.detalleTurno.confirmarCancelacion}</Text>
                  <View style={styles.filaBotones}>
                    <Pressable style={styles.botonSecundarioMitad} onPress={() => setConfirmandoCancelacion(false)}>
                      <Text style={styles.botonSecundarioTexto}>{t.comun.volver}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.botonConfirmarCancelar}
                      onPress={async () => {
                        cerrar();
                        mostrarError(await cancelarTurno(turno.id));
                      }}>
                      <Text style={styles.botonPrimarioTexto}>{t.detalleTurno.siCancelar}</Text>
                    </Pressable>
                  </View>
                </>
              )}

              <Pressable
                style={styles.cerrar}
                onPress={() => {
                  const id = turno.idPaciente;
                  cerrar();
                  router.push({ pathname: '/secretaria/paciente', params: { id } });
                }}>
                <Text style={styles.linkFicha}>{t.comun.verFicha}</Text>
              </Pressable>
              <Pressable style={styles.cerrar} onPress={cerrar}>
                <Text style={styles.cerrarTexto}>{t.comun.cerrar}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    backgroundColor: c.tarjeta,
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titulo: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipEstado: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  paciente: {
    fontSize: 20,
    fontWeight: '700',
    color: c.texto,
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '600',
    color: c.texto,
    textAlign: 'right',
    marginLeft: 12,
  },
  botonPrimario: {
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  botonSecundario: {
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  botonSecundarioMitad: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: c.acento,
    fontSize: 14,
    fontWeight: '700',
  },
  botonCancelar: {
    borderWidth: 1,
    borderColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  botonCancelarTexto: {
    color: COLOR_CANCELADO,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmarTexto: {
    fontSize: 14,
    color: c.texto,
    marginBottom: 12,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  botonConfirmarCancelar: {
    flex: 1,
    backgroundColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cerrar: {
    alignItems: 'center',
    paddingTop: 12,
  },
  linkFicha: {
    fontSize: 14,
    fontWeight: '700',
    color: c.acento,
  },
  cerrarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textoSecundario,
  },
});
