import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_SECRETARIA } from '@/constantes/colores';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO, formatearFecha } from '@/utilidades/turnos';

type Props = {
  idTurno: string; // '' = cerrado
  onCerrar: () => void;
};

// Detalle de un turno para Secretaría: confirmar, reprogramar, cancelar y ver la ficha del paciente.
// Se guarda el id (y no el turno) para que el Modal muestre siempre el estado actualizado.
export function DetalleTurnoSecretaria({ idTurno, onCerrar }: Props) {
  const { turnos, cambiarEstadoTurno, cancelarTurno } = useTurnos();
  const { consultorio } = useConsultorio();
  const pacientes = pacientesConPerfil(usePerfilPaciente(), consultorio.pacientes);
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
                <Text style={styles.titulo}>Detalle del turno</Text>
                <View style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[turno.estado] }]}>
                  <Text style={styles.chipEstadoTexto}>{ETIQUETAS_ESTADO[turno.estado]}</Text>
                </View>
              </View>

              <Text style={styles.paciente}>
                {paciente.nombre} {paciente.apellido}
              </Text>
              <Text style={styles.subtitulo}>
                {detalleFecha(turno.fecha).diaSemana} {formatearFecha(turno.fecha)} · {turno.hora} h
              </Text>

              <View style={styles.filas}>
                <View style={styles.fila}>
                  <Text style={styles.etiqueta}>Médico</Text>
                  <Text style={styles.valor}>{turno.medico}</Text>
                </View>
                <View style={styles.fila}>
                  <Text style={styles.etiqueta}>Especialidad</Text>
                  <Text style={styles.valor}>
                    {turno.especialidad} · {turno.sala}
                  </Text>
                </View>
                <View style={[styles.fila, styles.filaUltima]}>
                  <Text style={styles.etiqueta}>Cobertura</Text>
                  <Text style={styles.valor}>{turno.cobertura || paciente.cobertura}</Text>
                </View>
              </View>

              {sePuedeModificar && !confirmandoCancelacion && (
                <>
                  {turno.estado === 'pendiente' && (
                    <Pressable
                      style={styles.botonPrimario}
                      onPress={() => {
                        cambiarEstadoTurno(turno.id, 'confirmado');
                        cerrar();
                      }}>
                      <Text style={styles.botonPrimarioTexto}>Confirmar turno</Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.botonSecundario}
                    onPress={() => {
                      const id = turno.id;
                      cerrar();
                      router.push({ pathname: '/secretaria/reprogramar/[id]', params: { id } });
                    }}>
                    <Text style={styles.botonSecundarioTexto}>Reprogramar</Text>
                  </Pressable>
                  <Pressable style={styles.botonCancelar} onPress={() => setConfirmandoCancelacion(true)}>
                    <Text style={styles.botonCancelarTexto}>Cancelar turno</Text>
                  </Pressable>
                </>
              )}

              {sePuedeModificar && confirmandoCancelacion && (
                <>
                  <Text style={styles.confirmarTexto}>
                    ¿Cancelar este turno? El horario queda libre y se le puede ofrecer a la lista de espera.
                  </Text>
                  <View style={styles.filaBotones}>
                    <Pressable style={styles.botonSecundarioMitad} onPress={() => setConfirmandoCancelacion(false)}>
                      <Text style={styles.botonSecundarioTexto}>Volver</Text>
                    </Pressable>
                    <Pressable
                      style={styles.botonConfirmarCancelar}
                      onPress={() => {
                        cancelarTurno(turno.id);
                        cerrar();
                      }}>
                      <Text style={styles.botonPrimarioTexto}>Sí, cancelar</Text>
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
                <Text style={styles.linkFicha}>Ver ficha del paciente</Text>
              </Pressable>
              <Pressable style={styles.cerrar} onPress={cerrar}>
                <Text style={styles.cerrarTexto}>Cerrar</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
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
    color: '#5A5A5A',
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
    color: '#1A1A1A',
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_SECRETARIA,
    marginTop: 2,
    marginBottom: 14,
  },
  filas: {
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    marginBottom: 16,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  filaUltima: {
    borderBottomWidth: 0,
  },
  etiqueta: {
    fontSize: 13,
    color: '#8A8A8A',
  },
  valor: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
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
    color: COLOR_SECRETARIA,
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
    color: '#3A3A3A',
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
    color: COLOR_SECRETARIA,
  },
  cerrarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
  },
});
