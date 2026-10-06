import { Redirect, router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ResumenEspecialidad } from '@/components/resumen-turno';
import { COLOR_MEDICO, FONDO_PACIENTE } from '@/constantes/colores';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { aceptaTurnos, fechaDeVuelta, usePersonal } from '@/contextos/PersonalContext';
import { useSacarTurno } from '@/contextos/SacarTurnoContext';
import { formatearFecha } from '@/utilidades/turnos';
import { coberturaQueAtiende, medicosParaPaciente, type Medico } from '@/datos/catalogo';

export default function ElegirMedico() {
  const { especialidad, elegirMedico } = useSacarTurno();
  const { coberturaIds } = usePerfilPaciente();
  const { medicos: personal } = usePersonal();

  // Si se entra a esta URL directo (sin haber elegido especialidad), se vuelve al paso 1.
  if (!especialidad) {
    return <Redirect href="/paciente/sacar-turno" />;
  }

  // Solo los médicos que aceptan alguna cobertura del paciente y que atienden ahora (no de licencia ni de baja).
  const medicos = medicosParaPaciente(especialidad.id, coberturaIds).filter((medico) =>
    aceptaTurnos(personal, medico.nombre)
  );

  function elegir(medico: Medico) {
    elegirMedico(medico);
    router.push('/paciente/sacar-turno/horario');
  }

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      data={medicos}
      keyExtractor={(medico) => medico.id}
      ListHeaderComponent={
        <View>
          <ResumenEspecialidad
            especialidad={especialidad}
            onCambiar={() => router.dismissTo('/paciente/sacar-turno')}
          />
          <Text style={styles.titulo}>Elegí un profesional</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>
            {coberturaIds.length === 0
              ? 'Todavía no cargaste tu obra social. Agregala en Perfil > Editar perfil.'
              : `No hay profesionales de ${especialidad.nombre} disponibles ahora que atiendan tus obras sociales.`}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable style={styles.tarjeta} onPress={() => elegir(item)}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{item.iniciales}</Text>
          </View>
          <View style={styles.textos}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.cobertura}>Atiende {coberturaQueAtiende(item, coberturaIds)}</Text>
            {fechaDeVuelta(personal, item.nombre) && (
              <Text style={styles.licencia}>
                De licencia · vuelve el {formatearFecha(fechaDeVuelta(personal, item.nombre) ?? '').slice(0, 5)}
              </Text>
            )}
          </View>
          <Text style={styles.flecha}>›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  licencia: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A66F00',
    marginTop: 2,
  },
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5A5A5A',
    marginBottom: 12,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLOR_MEDICO,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textos: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cobertura: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  flecha: {
    fontSize: 22,
    color: '#B7C6E8',
  },
  vacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  vacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
  },
});
