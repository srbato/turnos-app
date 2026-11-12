import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { OpcionAdelanto } from '@/components/opcion-adelanto';
import { COLOR_CANCELADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useErrores } from '@/contextos/ErroresContext';
import { usePersonal, MiembroMedico } from '@/contextos/PersonalContext';
import { usePreconsultas } from '@/contextos/PreconsultasContext';
import { useTurnos, Turno } from '@/contextos/TurnosContext';
import {
  COLORES_ESTADO,
  detalleFecha,
  ETIQUETAS_ESTADO,
  fechaHoraComoDate,
  formatearFecha,
} from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

const FONDO_PENDIENTE = '#FCF1DC'; // tinte claro del ámbar, para el recuadro de instrucciones

type PropsDetalle = {
  turno: Turno | null; // null = modal cerrado
  onCerrar: () => void;
  onCancelar: (turno: Turno) => void;
};

// Modal de "Ver detalle". Lo usan el home y Mis turnos.
export function DetalleTurnoModal({ turno, onCerrar, onCancelar }: PropsDetalle) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { buscarPorTurno } = usePreconsultas();
  const { turnos, activarAdelanto } = useTurnos();
  const { mostrarError } = useErrores();
  const { direccion } = useConfiguracion();
  const { medicos } = usePersonal();
  // El turno recibido es una foto de cuando se abrió el modal: el estado actual se busca en el contexto.
  const turnoActual = turno ? turnos.find((t) => t.id === turno.id) : undefined;

  return (
    <Modal visible={turno !== null} animationType="fade" transparent onRequestClose={onCerrar}>
      <View style={styles.fondoModal}>
        <View style={styles.tarjetaModal}>
          {turno && (
            <>
              <View style={styles.encabezado}>
                <Text style={styles.titulo}>{t.detalleTurno.titulo}</Text>
                <View style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[turno.estado] }]}>
                  <Text style={styles.chipEstadoTexto}>{t.estados[turno.estado]}</Text>
                </View>
              </View>

              <View style={styles.cuerpo}>
                <View style={styles.fechaCaja}>
                  <Text style={styles.fechaDia}>{detalleFecha(turno.fecha, idioma).dia}</Text>
                  <Text style={styles.fechaMes}>{detalleFecha(turno.fecha, idioma).mes}</Text>
                </View>
                <View style={styles.datos}>
                  <Text style={styles.medico}>{turno.medico}</Text>
                  <Text style={styles.especialidad}>{turno.especialidad}</Text>
                  <Text style={styles.hora}>
                    {t.detalleTurno.hora(detalleFecha(turno.fecha, idioma).diaSemana, formatearFecha(turno.fecha), turno.hora)}
                  </Text>
                </View>
              </View>

              <View style={styles.filas}>
                <View style={styles.fila}>
                  <Text style={styles.etiqueta}>{t.detalleTurno.consultorio}</Text>
                  <Text style={styles.valor}>{turno.sala}</Text>
                </View>
                <View style={styles.fila}>
                  <Text style={styles.etiqueta}>{t.detalleTurno.sede}</Text>
                  <View style={styles.valorCaja}>
                    <Text style={styles.valor}>{turno.sede}</Text>
                    <Text style={styles.subvalor}>{direccion}</Text>
                  </View>
                </View>
                <View style={[styles.fila, styles.filaUltima]}>
                  <Text style={styles.etiqueta}>{t.detalleTurno.cobertura}</Text>
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

              {/* Lo que anotó el médico al atenderlo (sin sus notas privadas). */}
              {turnoActual?.consulta && (
                <View style={styles.consultaCaja}>
                  <Text style={styles.consultaTitulo}>{t.detalleTurno.indicoMedico}</Text>
                  <Text style={styles.consultaTexto}>{t.detalleTurno.diagnostico(turnoActual.consulta.diagnostico)}</Text>
                  {turnoActual.consulta.indicaciones !== '' && (
                    <Text style={styles.consultaTexto}>{turnoActual.consulta.indicaciones}</Text>
                  )}
                </View>
              )}

              {puedeModificarse(turno) ? (
                <>
                  <OpcionAdelanto
                    activo={turnoActual?.adelantoDesde !== undefined}
                    onCambiar={async (activo) => {
                      const error = await activarAdelanto(turno.id, activo);
                      // Se cierra el detalle para que se vea el aviso.
                      if (error !== '') {
                        onCerrar();
                        mostrarError(error);
                      }
                    }}
                  />
                  <View style={styles.botones}>
                    <Pressable
                      style={styles.botonPrimario}
                      onPress={() => {
                        onCerrar();
                        router.push({ pathname: '/paciente/preconsulta', params: { turnoId: turno.id } });
                      }}>
                      <Text style={styles.botonPrimarioTexto}>
                        {buscarPorTurno(turno.id) ? t.detalleTurno.verPreconsulta : t.detalleTurno.preconsulta}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.botonSecundario}
                      onPress={() => {
                        onCerrar();
                        router.push({ pathname: '/paciente/reprogramar/[id]', params: { id: turno.id } });
                      }}>
                      <Text style={styles.botonSecundarioTexto}>{t.comun.reprogramar}</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    style={styles.botonCancelar}
                    onPress={() => {
                      onCancelar(turno);
                      onCerrar();
                    }}>
                    <Text style={styles.botonCancelarTexto}>{t.comun.cancelarTurno}</Text>
                  </Pressable>
                </>
              ) : (
                // Turno cancelado o ya pasado: en lugar de acciones sobre ese turno, se ofrece pedir otro.
                <Pressable
                  style={styles.botonPrimarioAncho}
                  onPress={() => {
                    onCerrar();
                    volverAPedirTurno(turno, medicos);
                  }}>
                  <Text style={styles.botonPrimarioTexto}>{t.detalleTurno.volverAPedir}</Text>
                </Pressable>
              )}
              <Pressable style={styles.cerrar} onPress={onCerrar}>
                <Text style={styles.cerrarTexto}>{t.comun.cerrar}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Abre Sacar turno directo en el paso del horario, con la especialidad y el médico del turno ya elegidos.
function volverAPedirTurno(turno: Turno, medicos: MiembroMedico[]) {
  const medico = medicos.find((m) => m.nombre === turno.medico);
  if (!medico) {
    router.push('/paciente/sacar-turno');
    return;
  }
  router.push({ pathname: '/paciente/sacar-turno/horario', params: { medicoId: medico.matricula } });
}

// Solo se reprograma o cancela un turno que no está cancelado y todavía no pasó.
function puedeModificarse(turno: Turno) {
  return turno.estado !== 'cancelado' && turno.estado !== 'atendido' && turno.estado !== 'ausente' && fechaHoraComoDate(turno.fecha, turno.hora) >= new Date();
}

type PropsCancelar = {
  turno: Turno | null; // null = modal cerrado
  onCerrar: () => void;
};

// Confirmación antes de cancelar. Lo usan el home y Mis turnos.
export function CancelarTurnoModal({ turno, onCerrar }: PropsCancelar) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { cancelarTurno } = useTurnos();
  const { mostrarError } = useErrores();

  return (
    <Modal visible={turno !== null} animationType="fade" transparent onRequestClose={onCerrar}>
      <View style={styles.fondoModal}>
        <View style={styles.tarjetaModal}>
          {turno && (
            <>
              <Text style={styles.confirmarTitulo}>{t.detalleTurno.cancelarTitulo}</Text>
              <Text style={styles.confirmarTexto}>
                {turno.medico} · {formatearFecha(turno.fecha)} · {t.home.hora('', turno.hora).trim()}
              </Text>
              <Text style={styles.confirmarTexto}>{t.detalleTurno.cancelarAviso}</Text>
              <View style={styles.confirmarBotones}>
                <Pressable style={styles.botonSecundario} onPress={onCerrar}>
                  <Text style={styles.botonSecundarioTexto}>{t.comun.volver}</Text>
                </Pressable>
                <Pressable
                  style={styles.botonConfirmarCancelar}
                  onPress={async () => {
                    onCerrar();
                    mostrarError(await cancelarTurno(turno.id));
                  }}>
                  <Text style={styles.botonPrimarioTexto}>{t.detalleTurno.siCancelar}</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjetaModal: {
    backgroundColor: c.tarjeta,
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
    color: c.textoSecundario,
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
    backgroundColor: c.chipAzul,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  fechaDia: {
    fontSize: 18,
    fontWeight: '700',
    color: c.acento,
  },
  fechaMes: {
    fontSize: 11,
    fontWeight: '600',
    color: c.acento,
  },
  datos: {
    flex: 1,
    justifyContent: 'center',
  },
  medico: {
    fontSize: 17,
    fontWeight: '700',
    color: c.texto,
  },
  especialidad: {
    fontSize: 14,
    color: c.textoSecundario,
    marginTop: 2,
  },
  hora: {
    fontSize: 14,
    fontWeight: '600',
    color: c.acento,
    marginTop: 4,
  },
  filas: {
    borderTopWidth: 1,
    borderTopColor: c.bordeSuave,
    marginBottom: 14,
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
  valorCaja: {
    flex: 1,
    alignItems: 'flex-end',
  },
  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: c.texto,
    textAlign: 'right',
  },
  subvalor: {
    fontSize: 12,
    color: c.textoSecundario,
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
  consultaCaja: {
    backgroundColor: c.chipAzul,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  consultaTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: c.acento,
    marginBottom: 4,
  },
  consultaTexto: {
    fontSize: 13,
    color: c.texto,
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
  cerrar: {
    alignItems: 'center',
    paddingTop: 14,
  },
  cerrarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textoSecundario,
  },
  confirmarTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: c.texto,
    marginBottom: 8,
  },
  confirmarTexto: {
    fontSize: 14,
    color: c.texto,
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
