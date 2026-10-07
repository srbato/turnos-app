import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MenuSecretaria } from '@/components/menu-secretaria';
import {
  COLOR_CANCELADO,
  COLOR_CONFIRMADO,
  COLOR_PENDIENTE,
  COLOR_SECRETARIA,
  FONDO_SECRETARIA,
} from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useAdelantos } from '@/contextos/AdelantosContext';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { ofertasVigentes } from '@/datos/adelantos';
import { colorNivelRiesgo, evaluarRiesgo, nombreNivelRiesgo, PUNTOS_POR_ASISTENCIA, PUNTOS_POR_CONFIRMACION, PUNTOS_POR_FALTA, textoPuntaje } from '@/datos/ausentismo';
import { HOY } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { detalleFecha, fechaComoTexto, formatearFecha } from '@/utilidades/turnos';

// Cómo suman y restan los puntos de riesgo (ver datos/ausentismo.ts).
const REGLAS = [
  { puntos: `+${textoPuntaje(PUNTOS_POR_FALTA)}`, texto: 'Cada falta (no asistió)' },
  { puntos: `−${textoPuntaje(PUNTOS_POR_ASISTENCIA)}`, texto: 'Cada vez que asistió' },
  { puntos: `−${textoPuntaje(PUNTOS_POR_CONFIRMACION)}`, texto: 'Cada turno que confirmó' },
];

// "Dra. Lucía Fernández" -> "Dra. Fernández"
function medicoCorto(nombre: string) {
  const palabras = nombre.split(' ');
  return `${palabras[0]} ${palabras[palabras.length - 1]}`;
}

// Alertas: todos los turnos que todavía no confirmó el paciente. Un turno nuevo nace "pendiente", así que acá
// están todos hasta que se confirmen. La idea: avisarles para que confirmen y, si no responden, liberar el horario.

// Texto que se suma al panel de historial cuando hay turnos cancelados por el sistema o por riesgo.
function avisoCancelados(cantidad: number) {
  if (cantidad === 0) {
    return '';
  }
  if (cantidad === 1) {
    return ' Hay 1 turno próximo cancelado por el sistema o por riesgo: avisales a los pacientes.';
  }
  return ` Hay ${cantidad} turnos próximos cancelados por el sistema o por riesgo: avisales a los pacientes.`;
}

export default function AlertasSecretaria() {
  const { turnos, cambiarEstadoTurno, cancelarConMotivo, enviarAviso } = useTurnos();
  const { consultorio } = useConsultorio();
  const { reglasRiesgo, avisosAntesDeActuar } = useConfiguracion();
  const pacientes = pacientesConPerfil(usePerfilPaciente(), consultorio.pacientes);
  const { ofertas } = useAdelantos();

  const hoy = new Date();
  const manana = fechaComoTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1));

  const sinConfirmar = turnos
    .filter((turno) => turno.estado === 'pendiente' && turno.fecha >= HOY)
    .sort((a, b) => (`${a.fecha} ${a.hora}` < `${b.fecha} ${b.hora}` ? -1 : 1))
    .map((turno) => {
      const paciente = pacientes.find((p) => p.id === turno.idPaciente);
      return { turno, paciente, riesgo: paciente ? evaluarRiesgo(paciente, turnos, reglasRiesgo) : undefined };
    });

  // Cancelación por riesgo: queda con motivo, así el horario no se ofrece solo y Secretaría elige a quién dárselo.
  function cancelarPorRiesgo(id: string) {
    cancelarConMotivo([
      {
        id,
        motivo: `Cancelado por riesgo de inasistencia: no confirmó tras ${avisosAntesDeActuar} avisos. El horario quedó libre para la lista de espera.`,
      },
    ]);
  }

  function cuando(fecha: string, hora: string) {
    if (fecha === HOY) return `Hoy ${hora} h`;
    if (fecha === manana) return `Mañana ${hora} h`;
    return `${detalleFecha(fecha).diaSemana.slice(0, 3)} ${formatearFecha(fecha).slice(0, 5)} · ${hora} h`;
  }

  // Turnos que el sistema canceló solo porque el médico no atiende ese día (cambió sus días, licencia, baja o error de
  // carga). Quedan acá hasta que pasa la fecha, para avisar al paciente y darle otro turno.
  const canceladosPorSistema = turnos
    .filter((turno) => turno.estado === 'cancelado' && turno.motivoCancelacion !== undefined && turno.fecha >= HOY)
    .sort((a, b) => (`${a.fecha} ${a.hora}` < `${b.fecha} ${b.hora}` ? -1 : 1));

  // Ofertas de adelanto esperando respuesta: son las que se ven en la pantalla Espera.
  const ofertasEnCurso = ofertasVigentes(ofertas, turnos).length;
  const noAsistieron = turnos.filter((turno) => turno.fecha === HOY && turno.estado === 'ausente');

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Alertas</Text>
        <Text style={styles.subtitulo}>
          Turnos que todavía no confirmaron los pacientes. Avisales para que confirmen; si no responden, liberá el
          horario.
        </Text>

        {ofertasEnCurso > 0 && (
          <Pressable style={styles.banner} onPress={() => router.replace('/secretaria/espera')}>
            <Text style={styles.bannerTexto}>
              {ofertasEnCurso === 1
                ? 'Hay 1 oferta de adelanto esperando respuesta'
                : `Hay ${ofertasEnCurso} ofertas de adelanto esperando respuesta`}
            </Text>
            <Text style={styles.bannerFlecha}>›</Text>
          </Pressable>
        )}

        <Text style={styles.seccion}>SIN CONFIRMAR ({sinConfirmar.length})</Text>

        {sinConfirmar.length === 0 && (
          <View style={styles.tarjeta}>
            <Text style={styles.vacioTitulo}>Todo en orden</Text>
            <Text style={styles.detalle}>No hay turnos pendientes de confirmar.</Text>
          </View>
        )}

        {sinConfirmar.map(({ turno, paciente, riesgo }) => {
          const alto = riesgo?.nivel === 'alto';
          const color = colorNivelRiesgo(riesgo?.nivel);
          const avisos = turno.avisos?.length ?? 0;
          // Solo a un paciente de riesgo alto que ya recibió los avisos se le puede reprogramar o cancelar el turno.
          const puedeActuar = alto && avisos >= avisosAntesDeActuar;
          return (
            <View key={turno.id} style={[styles.tarjeta, { borderLeftColor: color }]}>
              <View style={styles.filaEncabezado}>
                <Text style={styles.nombre}>{paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente'}</Text>
                {riesgo && riesgo.faltas > 0 && (
                  <Text style={[styles.nivel, { color }]}>
                    {textoPuntaje(riesgo.puntaje)} pts · riesgo {nombreNivelRiesgo(riesgo.nivel)}
                  </Text>
                )}
              </View>
              <Text style={styles.detalle}>
                {cuando(turno.fecha, turno.hora)} · {medicoCorto(turno.medico)}
              </Text>
              {avisos > 0 && (
                <Text style={styles.detalle}>
                  Avisos enviados: {avisos} · último el {formatearFecha(turno.avisos![avisos - 1]).slice(0, 5)}
                </Text>
              )}

              <View style={styles.filaBotones}>
                <Pressable style={styles.botonPrimario} onPress={() => cambiarEstadoTurno(turno.id, 'confirmado')}>
                  <Text style={styles.botonPrimarioTexto}>Ya confirmó</Text>
                </Pressable>
                {avisos < avisosAntesDeActuar ? (
                  <Pressable style={styles.botonSuave} onPress={() => enviarAviso(turno.id, avisosAntesDeActuar)}>
                    <Text style={styles.botonSuaveTexto}>
                      Enviar aviso ({avisos}/{avisosAntesDeActuar})
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.avisosCompletos}>
                    <Text style={styles.avisosCompletosTexto}>
                      {avisosAntesDeActuar}/{avisosAntesDeActuar} avisos enviados
                    </Text>
                  </View>
                )}
              </View>

              {alto && !puedeActuar && (
                <Text style={styles.ayudaRiesgo}>
                  Riesgo alto: después de {avisosAntesDeActuar} avisos podés reprogramar o cancelar este turno para darle el
                  horario a alguien de la lista de espera con mejor historial.
                </Text>
              )}
              {puedeActuar && (
                <>
                  <Text style={styles.ayudaRiesgo}>
                    Ya recibió {avisosAntesDeActuar} avisos y tiene riesgo alto: podés reprogramar o cancelar su turno.
                  </Text>
                  <View style={styles.filaBotones}>
                    <Pressable
                      style={styles.botonSuave}
                      onPress={() => router.push({ pathname: '/secretaria/reprogramar/[id]', params: { id: turno.id } })}>
                      <Text style={styles.botonSuaveTexto}>Reprogramar</Text>
                    </Pressable>
                    <Pressable style={styles.botonCancelarRiesgo} onPress={() => cancelarPorRiesgo(turno.id)}>
                      <Text style={styles.botonPrimarioTexto}>Cancelar turno</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          );
        })}

        {noAsistieron.length > 0 && (
          <View style={styles.panel}>
            <Text style={styles.panelTitulo}>No asistieron hoy</Text>
            <View style={styles.fichas}>
              {noAsistieron.map((turno) => {
                const paciente = pacientes.find((p) => p.id === turno.idPaciente);
                return (
                  <View key={turno.id} style={styles.fichaAusente}>
                    <Text style={styles.fichaAusenteTexto}>
                      {paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente'} · {turno.hora}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.panel}>
          <Text style={styles.panelTitulo}>Historial de turnos</Text>
          <Text style={styles.panelAyuda}>
            Los turnos que ya pasaron y los cancelados, con el motivo.
            {avisoCancelados(canceladosPorSistema.length)}
          </Text>
          <Pressable style={styles.botonHistorial} onPress={() => router.push('/secretaria/historial')}>
            <Text style={styles.botonHistorialTexto}>Ver historial de turnos</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitulo}>Cómo se calcula el riesgo</Text>
          <Text style={styles.panelAyuda}>
            Las faltas suman y asistir o confirmar resta; el puntaje no baja de 0. Desde {textoPuntaje(reglasRiesgo.medio)} {reglasRiesgo.medio === 1 ? 'punto' : 'puntos'} el riesgo es medio y desde{' '}
            {textoPuntaje(reglasRiesgo.alto)}, alto. No confirmar no suma nada. A un paciente de riesgo alto que no confirma, después de {avisosAntesDeActuar}{' '}
            avisos tuyos podés reprogramarle o cancelarle el turno y darle el horario a alguien de la lista de espera con
            mejor historial. Los puntos de cada paciente están en su ficha.
          </Text>
          <View style={styles.fichas}>
            {REGLAS.map((regla) => (
              <View key={regla.texto} style={styles.fichaRegla}>
                <View style={styles.fichaPuntos}>
                  <Text style={styles.fichaPuntosTexto}>{regla.puntos}</Text>
                </View>
                <Text style={styles.fichaReglaTexto}>{regla.texto}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <MenuSecretaria activa="alertas" />
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
    padding: 18,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  subtitulo: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 4,
    marginBottom: 14,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bannerFlecha: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  seccion: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: COLOR_CONFIRMADO,
    padding: 14,
    marginBottom: 10,
  },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vacioTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_CONFIRMADO,
    marginBottom: 2,
  },
  nombre: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  nivel: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  detalle: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
  },
  avisosCompletos: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#E3E6E8',
  },
  avisosCompletosTexto: {
    color: '#5A5A5A',
    fontSize: 13,
    fontWeight: '700',
  },
  botonSuave: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  botonSuaveTexto: {
    color: COLOR_SECRETARIA,
    fontSize: 13,
    fontWeight: '700',
  },
  botonHistorial: {
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
  },
  botonHistorialTexto: {
    color: COLOR_SECRETARIA,
    fontSize: 13,
    fontWeight: '700',
  },
  ayudaRiesgo: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 10,
  },
  botonCancelarRiesgo: {
    flex: 1,
    backgroundColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  motivo: {
    fontSize: 12,
    color: COLOR_CANCELADO,
    fontWeight: '600',
    marginTop: 6,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: COLOR_CANCELADO,
    fontSize: 13,
    fontWeight: '700',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  panelTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  panelAyuda: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  fichas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  fichaAusente: {
    backgroundColor: '#F6E3E3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fichaAusenteTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B03A3A',
  },
  fichaRegla: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FONDO_SECRETARIA,
    borderRadius: 12,
    paddingRight: 12,
    paddingVertical: 5,
    paddingLeft: 5,
  },
  fichaPuntos: {
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 8,
  },
  fichaPuntosTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  fichaReglaTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
