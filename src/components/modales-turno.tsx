import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useTurnos, type Turno } from '@/contextos/TurnosContext';
import { DIRECCION_SEDE, MEDICOS } from '@/datos/catalogo';
import {
  COLORES_ESTADO,
  detalleFecha,
  ETIQUETAS_ESTADO,
  fechaHoraComoDate,
  formatearFecha,
} from '@/utilidades/turnos';

const FONDO_PENDIENTE = '#FCF1DC'; // tinte claro del ámbar, para el recuadro de instrucciones

type PropsDetalle = {
  turno: Turno | null; // null = modal cerrado
  onCerrar: () => void;
  onCancelar: (turno: Turno) => void;
};

// Modal de "Ver detalle". Lo usan el home y Mis turnos.
export function DetalleTurnoModal({ turno, onCerrar, onCancelar }: PropsDetalle) {
  return (
    <Modal visible={turno !== null} animationType="fade" transparent onRequestClose={onCerrar}>
      <View style={styles.fondoModal}>
        <View style={styles.tarjetaModal}>
          {turno && (
            <>
              <View style={styles.encabezado}>
                <Text style={styles.titulo}>Detalle del turno</Text>
                <View style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[turno.estado] }]}>
                  <Text style={styles.chipEstadoTexto}>{ETIQUETAS_ESTADO[turno.estado]}</Text>
                </View>
              </View>

              <View style={styles.cuerpo}>
                <View style={styles.fechaCaja}>
                  <Text style={styles.fechaDia}>{detalleFecha(turno.fecha).dia}</Text>
                  <Text style={styles.fechaMes}>{detalleFecha(turno.fecha).mes}</Text>
                </View>
                <View style={styles.datos}>
                  <Text style={styles.medico}>{turno.medico}</Text>
                  <Text style={styles.especialidad}>{turno.especialidad}</Text>
                  <Text style={styles.hora}>
                    {detalleFecha(turno.fecha).diaSemana} {formatearFecha(turno.fecha)} · {turno.hora} h
                  </Text>
                </View>
              </View>

              <View style={styles.filas}>
                <View style={styles.fila}>
                  <Text style={styles.etiqueta}>Consultorio</Text>
                  <Text style={styles.valor}>{turno.consultorio}</Text>
                </View>
                <View style={styles.fila}>
                  <Text style={styles.etiqueta}>Sede</Text>
                  <View style={styles.valorCaja}>
                    <Text style={styles.valor}>{turno.sede}</Text>
                    <Text style={styles.subvalor}>{DIRECCION_SEDE}</Text>
                  </View>
                </View>
                <View style={[styles.fila, styles.filaUltima]}>
                  <Text style={styles.etiqueta}>Cobertura</Text>
                  <Text style={styles.valor}>{turno.cobertura}</Text>
                </View>
              </View>

              {turno.instrucciones.length > 0 && (
                <View style={styles.avisoCaja}>
                  {turno.instrucciones.map((instruccion) => (
                    <Text key={instruccion} style={styles.avisoTexto}>
                      • {instruccion}
                    </Text>
                  ))}
                </View>
              )}

              {puedeModificarse(turno) ? (
                <>
                  <View style={styles.botones}>
                    <Pressable
                      style={styles.botonPrimario}
                      onPress={() => {
                        onCerrar();
                        router.push('/paciente/preconsulta');
                      }}>
                      <Text style={styles.botonPrimarioTexto}>Ir a Preconsulta</Text>
                    </Pressable>
                    <Pressable
                      style={styles.botonSecundario}
                      onPress={() => {
                        onCerrar();
                        router.push({ pathname: '/paciente/reprogramar/[id]', params: { id: turno.id } });
                      }}>
                      <Text style={styles.botonSecundarioTexto}>Reprogramar</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    style={styles.botonCancelar}
                    onPress={() => {
                      onCancelar(turno);
                      onCerrar();
                    }}>
                    <Text style={styles.botonCancelarTexto}>Cancelar turno</Text>
                  </Pressable>
                </>
              ) : (
                // Turno cancelado o ya pasado: en lugar de acciones sobre ese turno, se ofrece pedir otro.
                <Pressable
                  style={styles.botonPrimarioAncho}
                  onPress={() => {
                    onCerrar();
                    volverAPedirTurno(turno);
                  }}>
                  <Text style={styles.botonPrimarioTexto}>Volver a pedir turno con este profesional</Text>
                </Pressable>
              )}
              <Pressable style={styles.cerrar} onPress={onCerrar}>
                <Text style={styles.cerrarTexto}>Cerrar</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Abre Sacar turno directo en el paso del horario, con la especialidad y el médico del turno ya elegidos.
function volverAPedirTurno(turno: Turno) {
  const medico = MEDICOS.find((m) => m.nombre === turno.medico);
  if (!medico) {
    router.push('/paciente/sacar-turno');
    return;
  }
  router.push({ pathname: '/paciente/sacar-turno/horario', params: { medicoId: medico.id } });
}

// Solo se reprograma o cancela un turno que no está cancelado y todavía no pasó.
function puedeModificarse(turno: Turno) {
  return turno.estado !== 'cancelado' && fechaHoraComoDate(turno.fecha, turno.hora) >= new Date();
}

type PropsCancelar = {
  turno: Turno | null; // null = modal cerrado
  onCerrar: () => void;
};

// Confirmación antes de cancelar. Lo usan el home y Mis turnos.
export function CancelarTurnoModal({ turno, onCerrar }: PropsCancelar) {
  const { cancelarTurno } = useTurnos();

  return (
    <Modal visible={turno !== null} animationType="fade" transparent onRequestClose={onCerrar}>
      <View style={styles.fondoModal}>
        <View style={styles.tarjetaModal}>
          {turno && (
            <>
              <Text style={styles.confirmarTitulo}>¿Cancelar este turno?</Text>
              <Text style={styles.confirmarTexto}>
                {turno.medico} · {formatearFecha(turno.fecha)} · {turno.hora} h
              </Text>
              <Text style={styles.confirmarTexto}>
                El horario va a quedar libre para otros pacientes.
              </Text>
              <View style={styles.confirmarBotones}>
                <Pressable style={styles.botonSecundario} onPress={onCerrar}>
                  <Text style={styles.botonSecundarioTexto}>Volver</Text>
                </Pressable>
                <Pressable
                  style={styles.botonConfirmarCancelar}
                  onPress={() => {
                    cancelarTurno(turno.id);
                    onCerrar();
                  }}>
                  <Text style={styles.botonPrimarioTexto}>Sí, cancelar</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipEstado: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  cuerpo: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  fechaCaja: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fechaDia: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  fechaMes: {
    fontSize: 11,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  datos: {
    flex: 1,
    justifyContent: 'center',
  },
  medico: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  especialidad: {
    fontSize: 14,
    color: '#5A5A5A',
    marginTop: 2,
  },
  hora: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_PACIENTE,
    marginTop: 4,
  },
  filas: {
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    marginBottom: 14,
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
  valorCaja: {
    flex: 1,
    alignItems: 'flex-end',
  },
  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  subvalor: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  avisoCaja: {
    backgroundColor: FONDO_PENDIENTE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  avisoTexto: {
    fontSize: 13,
    color: '#7A5A12',
    lineHeight: 19,
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  botonPrimarioAncho: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: COLOR_PACIENTE,
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
  cerrar: {
    alignItems: 'center',
    paddingTop: 14,
  },
  cerrarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  confirmarTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  confirmarTexto: {
    fontSize: 14,
    color: '#3A3A3A',
    marginBottom: 6,
  },
  confirmarBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  botonConfirmarCancelar: {
    flex: 1,
    backgroundColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
