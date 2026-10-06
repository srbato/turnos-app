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
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { ofertasVigentes } from '@/datos/adelantos';
import { evaluarRiesgo } from '@/datos/ausentismo';
import { HOY } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { detalleFecha, fechaComoTexto, formatearFecha } from '@/utilidades/turnos';

// Lo único que suma puntos de riesgo (ver datos/ausentismo.ts).
const REGLAS = [{ puntos: '+1', texto: 'Cada falta (no asistió)' }];

// "Dra. Lucía Fernández" -> "Dra. Fernández"
function medicoCorto(nombre: string) {
  const palabras = nombre.split(' ');
  return `${palabras[0]} ${palabras[palabras.length - 1]}`;
}

// Alertas: todos los turnos que todavía no confirmó el paciente. Un turno nuevo nace "pendiente", así que acá
// están todos hasta que se confirmen. La idea: avisarles para que confirmen y, si no responden, liberar el horario.
export default function AlertasSecretaria() {
  const { turnos, cambiarEstadoTurno, cancelarTurno } = useTurnos();
  const pacientes = pacientesConPerfil(usePerfilPaciente());
  const { ofertas } = useAdelantos();

  const hoy = new Date();
  const manana = fechaComoTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1));

  const sinConfirmar = turnos
    .filter((turno) => turno.estado === 'pendiente' && turno.fecha >= HOY)
    .sort((a, b) => (`${a.fecha} ${a.hora}` < `${b.fecha} ${b.hora}` ? -1 : 1))
    .map((turno) => {
      const paciente = pacientes.find((p) => p.id === turno.idPaciente);
      return { turno, paciente, riesgo: paciente ? evaluarRiesgo(paciente, turnos) : undefined };
    });

  function cuando(fecha: string, hora: string) {
    if (fecha === HOY) return `Hoy ${hora} h`;
    if (fecha === manana) return `Mañana ${hora} h`;
    return `${detalleFecha(fecha).diaSemana.slice(0, 3)} ${formatearFecha(fecha).slice(0, 5)} · ${hora} h`;
  }

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
          const faltas = riesgo?.puntaje ?? 0;
          const alto = riesgo?.nivel === 'alto';
          const color = alto ? COLOR_CANCELADO : COLOR_PENDIENTE;
          return (
            <View key={turno.id} style={[styles.tarjeta, { borderLeftColor: color }]}>
              <View style={styles.filaEncabezado}>
                <Text style={styles.nombre}>{paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente'}</Text>
                {faltas > 0 && (
                  <Text style={[styles.nivel, { color }]}>
                    {faltas} {faltas === 1 ? 'falta' : 'faltas'} · riesgo {alto ? 'alto' : 'medio'}
                  </Text>
                )}
              </View>
              <Text style={styles.detalle}>
                {cuando(turno.fecha, turno.hora)} · {medicoCorto(turno.medico)}
              </Text>

              <View style={styles.filaBotones}>
                <Pressable style={styles.botonPrimario} onPress={() => cambiarEstadoTurno(turno.id, 'confirmado')}>
                  <Text style={styles.botonPrimarioTexto}>Ya confirmó</Text>
                </Pressable>
                <Pressable style={styles.botonSecundario} onPress={() => cancelarTurno(turno.id)}>
                  <Text style={styles.botonSecundarioTexto}>Liberar turno</Text>
                </Pressable>
              </View>
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
          <Text style={styles.panelTitulo}>Cómo se calcula el riesgo</Text>
          <Text style={styles.panelAyuda}>
            Solo suman puntos las faltas. 1 punto es riesgo medio y 2 o más, riesgo alto. No confirmar un turno no suma
            puntos. Los puntos de cada paciente están en su ficha.
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
