import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';

import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_INFERIOR, MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useTurnos } from '@/contextos/TurnosContext';
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
  const paciente = pacientesConPerfil(perfilPaciente).find((p) => p.id === id);

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
