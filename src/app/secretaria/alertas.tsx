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
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { evaluarRiesgo } from '@/datos/ausentismo';
import { HOY } from '@/datos/consultorio';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { fechaComoTexto } from '@/utilidades/turnos';

// "Dra. Lucía Fernández" -> "Dra. Fernández"
function medicoCorto(nombre: string) {
  const palabras = nombre.split(' ');
  return `${palabras[0]} ${palabras[palabras.length - 1]}`;
}

// Reglas que suman puntos de riesgo (ver datos/ausentismo.ts).
const REGLAS = [
  { puntos: '+1 a 3', texto: 'Faltas anteriores' },
  { puntos: '+1', texto: 'Primera consulta' },
  { puntos: '+1', texto: 'Reserva con 3+ meses' },
  { puntos: '+1', texto: 'Turno sin confirmar' },
];

// Alertas: pacientes con turno hoy o mañana que todavía no confirmaron y tienen más chances de faltar.
// La idea: avisarles, y si no responden, liberar el horario para la lista de espera.
export default function AlertasSecretaria() {
  const { turnos, cambiarEstadoTurno, cancelarTurno } = useTurnos();
  const pacientes = pacientesConPerfil(usePerfilPaciente());

  const hoy = new Date();
  const manana = fechaComoTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1));

  const aContactar = turnos
    .filter((turno) => turno.estado === 'pendiente' && (turno.fecha === HOY || turno.fecha === manana))
    .map((turno) => {
      const paciente = pacientes.find((p) => p.id === turno.idPaciente);
      return { turno, paciente, riesgo: paciente ? evaluarRiesgo(turno, paciente, turnos) : undefined };
    })
    .filter((item) => item.riesgo !== undefined && item.riesgo.nivel !== 'bajo')
    .sort((a, b) => (b.riesgo?.puntaje ?? 0) - (a.riesgo?.puntaje ?? 0));

  // Turnos cancelados que nadie volvió a ocupar: se pueden ofrecer a la lista de espera.
  const liberados = turnos.filter(
    (turno) =>
      turno.estado === 'cancelado' &&
      turno.fecha >= HOY &&
      !turnos.some(
        (otro) =>
          otro.estado !== 'cancelado' && otro.medico === turno.medico && otro.fecha === turno.fecha && otro.hora === turno.hora
      )
  ).length;

  const noAsistieron = turnos.filter((turno) => turno.fecha === HOY && turno.estado === 'ausente');

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>Alertas</Text>
        <Text style={styles.subtitulo}>
          Pacientes con turno hoy o mañana que no confirmaron y podrían faltar. Avisales para confirmar; si no
          responden, liberá el horario.
        </Text>

        {liberados > 0 && (
          <Pressable style={styles.banner} onPress={() => router.replace('/secretaria/espera')}>
            <Text style={styles.bannerTexto}>
              {liberados === 1 ? 'Hay 1 turno liberado' : `Hay ${liberados} turnos liberados`} para la lista de espera
            </Text>
            <Text style={styles.bannerFlecha}>›</Text>
          </Pressable>
        )}

        <Text style={styles.seccion}>PARA CONTACTAR ({aContactar.length})</Text>

        {aContactar.length === 0 && (
          <View style={styles.tarjeta}>
            <Text style={styles.vacioTitulo}>Todo en orden</Text>
            <Text style={styles.detalle}>No hay turnos sin confirmar con riesgo de ausencia.</Text>
          </View>
        )}

        {aContactar.map(({ turno, paciente, riesgo }) => {
          const alto = riesgo?.nivel === 'alto';
          const color = alto ? COLOR_CANCELADO : COLOR_PENDIENTE;
          return (
            <View key={turno.id} style={[styles.tarjeta, { borderLeftColor: color }]}>
              <View style={styles.filaEncabezado}>
                <Text style={styles.nombre}>{paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente'}</Text>
                <Text style={[styles.nivel, { color }]}>{alto ? 'Riesgo alto' : 'Riesgo medio'}</Text>
              </View>
              <Text style={styles.detalle}>
                {turno.fecha === HOY ? 'Hoy' : 'Mañana'} {turno.hora} h · {medicoCorto(turno.medico)}
              </Text>
              <Text style={styles.motivos}>Por qué: {riesgo?.reglas.join(', ')}</Text>

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
          <Text style={styles.panelAyuda}>Cada regla suma puntos. Desde 2 es riesgo medio; desde 3, alto.</Text>
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  nivel: {
    fontSize: 12,
    fontWeight: '700',
  },
  detalle: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
  },
  motivos: {
    fontSize: 13,
    color: '#3A3A3A',
    marginTop: 8,
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
