import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useSacarTurno } from '@/contextos/SacarTurnoContext';
import { ESPECIALIDADES, type Especialidad } from '@/datos/catalogo';

export default function ElegirEspecialidad() {
  const { elegirEspecialidad } = useSacarTurno();

  function elegir(especialidad: Especialidad) {
    elegirEspecialidad(especialidad);
    router.push('/paciente/sacar-turno/medico');
  }

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      data={ESPECIALIDADES}
      keyExtractor={(especialidad) => especialidad.id}
      ListHeaderComponent={<Text style={styles.titulo}>¿Qué especialidad necesitás?</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.tarjeta} onPress={() => elegir(item)}>
          <View style={styles.icono}>
            <Text style={styles.iconoTexto}>{item.codigo}</Text>
          </View>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.flecha}>›</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
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
  icono: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  nombre: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  flecha: {
    fontSize: 22,
    color: '#B7C6E8',
  },
});
