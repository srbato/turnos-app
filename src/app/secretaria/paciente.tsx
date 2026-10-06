import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_CONFIRMADO, COLOR_PENDIENTE, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_INFERIOR, MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useTurnos } from '@/contextos/TurnosContext';
import {
  evaluarRiesgo,
  PUNTOS_POR_ASISTENCIA,
  PUNTOS_POR_CONFIRMACION,
  PUNTOS_POR_FALTA,
  textoPuntaje,
} from '@/datos/ausentismo';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import {
  COLORES_ESTADO,
  detalleFecha,
  ETIQUETAS_ESTADO,
  fechaHoraComoDate,
  formatearFecha,
} from '@/utilidades/turnos';

function volver() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/secretaria/pacientes');
  }
}

// Ficha de un paciente para Secretaría: datos administrativos y sus turnos.
// No muestra nada clínico (medicación, alergias, preconsultas): eso es solo del médico.
export default function FichaPacienteSecretaria() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { turnos } = useTurnos();
  const perfilPaciente = usePerfilPaciente();
  const { consultorio } = useConsultorio();
  const { reglasRiesgo } = useConfiguracion();
  const paciente = pacientesConPerfil(perfilPaciente, consultorio.pacientes).find((p) => p.id === id);

  if (!paciente) {
    return (
      <View style={styles.pantalla}>
        <Pressable style={styles.volverFila} onPress={volver}>
          <Text style={styles.volver}>‹ Pacientes</Text>
        </Pressable>
        <Text style={styles.vacioTexto}>No se encontró el paciente.</Text>
      </View>
    );
  }

  // Sus turnos, del más nuevo al más viejo.
  const turnosDelPaciente = turnos
    .filter((turno) => turno.idPaciente === paciente.id)
    .sort(
      (a, b) => fechaHoraComoDate(b.fecha, b.hora).getTime() - fechaHoraComoDate(a.fecha, a.hora).getTime()
    );

  // Puntos de riesgo de ausencia: las faltas suman; asistir y confirmar restan (ver datos/ausentismo.ts).
  const riesgo = evaluarRiesgo(paciente, turnos, reglasRiesgo);
  const colorRiesgo =
    riesgo.nivel === 'alto' ? COLOR_CANCELADO : riesgo.nivel === 'en-riesgo' ? COLOR_PENDIENTE : COLOR_CONFIRMADO;
  const etiquetaRiesgo =
    riesgo.nivel === 'alto' ? 'Riesgo alto' : riesgo.nivel === 'en-riesgo' ? 'Riesgo medio' : 'Riesgo bajo';
  const ausenciasEnApp = turnosDelPaciente.filter((turno) => turno.estado === 'ausente');

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Pressable onPress={volver}>
          <Text style={styles.volver}>‹ Pacientes</Text>
        </Pressable>
        <View style={styles.encabezadoFila}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{paciente.iniciales}</Text>
          </View>
          <View style={styles.encabezadoTextos}>
            <Text style={styles.nombre}>
              {paciente.nombre} {paciente.apellido}
            </Text>
            <Text style={styles.email}>{paciente.email}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.seccion}>Datos administrativos</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Cobertura</Text>
          <Text style={styles.valor}>
            {paciente.cobertura} {paciente.plan}
          </Text>
          <Text style={styles.etiqueta}>N° de afiliado</Text>
          <Text style={styles.valor}>{paciente.numeroAfiliado}</Text>
          <Text style={styles.etiqueta}>Email de contacto</Text>
          <Text style={styles.valor}>{paciente.email}</Text>
        </View>

        <Text style={styles.seccion}>Riesgo de ausencia</Text>
        <View style={styles.tarjeta}>
          <View style={styles.riesgoFila}>
            <View style={[styles.riesgoPuntos, { backgroundColor: colorRiesgo }]}>
              <Text style={styles.riesgoPuntosNumero}>{textoPuntaje(riesgo.puntaje)}</Text>
              <Text style={styles.riesgoPuntosTexto}>{riesgo.puntaje === 1 ? 'punto' : 'puntos'}</Text>
            </View>
            <View style={styles.riesgoTextos}>
              <Text style={[styles.riesgoNivel, { color: colorRiesgo }]}>{etiquetaRiesgo}</Text>
              <Text style={styles.riesgoDetalle}>
                Faltó {riesgo.faltas} {riesgo.faltas === 1 ? 'vez' : 'veces'} · asistió {riesgo.asistencias} ·
                confirmó {riesgo.confirmaciones}.
              </Text>
            </View>
          </View>
          <Text style={styles.riesgoRegla}>
            Cada falta suma {textoPuntaje(PUNTOS_POR_FALTA)} punto; cada asistencia resta {textoPuntaje(PUNTOS_POR_ASISTENCIA)} y
            cada turno confirmado resta {textoPuntaje(PUNTOS_POR_CONFIRMACION)}. No baja de 0.
          </Text>
          {ausenciasEnApp.length > 0 && (
            <>
              <Text style={styles.etiqueta}>Turnos a los que no asistió</Text>
              {ausenciasEnApp.map((turno) => (
                <Text key={turno.id} style={styles.valor}>
                  {detalleFecha(turno.fecha).diaSemana} {formatearFecha(turno.fecha)} · {turno.hora} h · {turno.medico}
                </Text>
              ))}
            </>
          )}
        </View>

        <Text style={styles.seccion}>Turnos</Text>
        {turnosDelPaciente.length === 0 && (
          <View style={styles.tarjeta}>
            <Text style={styles.valor}>Todavía no tiene turnos.</Text>
          </View>
        )}
        {turnosDelPaciente.map((turno) => (
          <View key={turno.id} style={styles.tarjetaTurno}>
            <View style={styles.turnoDatos}>
              <Text style={styles.turnoFecha}>
                {detalleFecha(turno.fecha).diaSemana} {formatearFecha(turno.fecha)} · {turno.hora} h
              </Text>
              <Text style={styles.turnoDetalle}>
                {turno.medico} · {turno.especialidad}
              </Text>
            </View>
            <View style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[turno.estado] }]}>
              <Text style={styles.chipEstadoTexto}>{ETIQUETAS_ESTADO[turno.estado]}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_SECRETARIA,
  },
  encabezado: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: COLOR_SECRETARIA,
  },
  volverFila: {
    padding: 20,
  },
  volver: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  encabezadoFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarTexto: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  encabezadoTextos: {
    flex: 1,
  },
  nombre: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 13,
    color: '#CFEDEA',
    marginTop: 2,
  },
  contenido: {
    padding: 20,
    paddingBottom: 20 + MARGEN_INFERIOR,
  },
  seccion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 8,
  },
  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 2,
  },
  riesgoFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riesgoPuntos: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  riesgoPuntosNumero: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  riesgoPuntosTexto: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  riesgoTextos: {
    flex: 1,
  },
  riesgoNivel: {
    fontSize: 16,
    fontWeight: '700',
  },
  riesgoRegla: {
    fontSize: 11,
    color: '#8A8A8A',
    marginTop: 10,
  },
  riesgoDetalle: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
  },
  vacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
    padding: 20,
  },
  tarjetaTurno: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  turnoDatos: {
    flex: 1,
    marginRight: 8,
  },
  turnoFecha: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  turnoDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
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
});
