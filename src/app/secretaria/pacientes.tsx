import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MenuSecretaria } from '@/components/menu-secretaria';
import { COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { pacientesConPerfil } from '@/utilidades/datos-medico';
import { buscarProximoTurno, detalleFecha } from '@/utilidades/turnos';

// Lista de pacientes del consultorio, con buscador. Solo datos administrativos.
export default function PacientesSecretaria() {
  const { turnos } = useTurnos();
  const perfilPaciente = usePerfilPaciente();
  const pacientes = pacientesConPerfil(perfilPaciente);
  const [busqueda, setBusqueda] = useState('');

  const filtrados = pacientes.filter((paciente) =>
    `${paciente.nombre} ${paciente.apellido}`.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <View style={styles.pantalla}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Pacientes</Text>
        <TextInput
          style={styles.buscador}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por nombre o apellido"
          placeholderTextColor="#8FB9B5"
        />
      </View>

      <FlatList
        style={styles.lista}
        contentContainerStyle={[styles.listaContenido, filtrados.length === 0 && styles.listaVacia]}
        data={filtrados}
        keyExtractor={(paciente) => paciente.id}
        ListEmptyComponent={<Text style={styles.vacioTexto}>No se encontró ningún paciente.</Text>}
        renderItem={({ item }) => {
          const proximo = buscarProximoTurno(turnos.filter((turno) => turno.idPaciente === item.id));
          return (
            <Pressable
              style={styles.tarjeta}
              onPress={() => router.push({ pathname: '/secretaria/paciente', params: { id: item.id } })}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{item.iniciales}</Text>
              </View>
              <View style={styles.datos}>
                <Text style={styles.nombre}>
                  {item.nombre} {item.apellido}
                </Text>
                <Text style={styles.detalle}>{item.cobertura}</Text>
                <Text style={styles.proximo}>
                  {proximo
                    ? `Próximo turno: ${detalleFecha(proximo.fecha).dia}/${proximo.fecha.split('-')[1]} ${proximo.hora} h`
                    : 'Sin turnos próximos'}
                </Text>
              </View>
              <Text style={styles.flecha}>›</Text>
            </Pressable>
          );
        }}
      />

      <MenuSecretaria />
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
    paddingBottom: 16,
    backgroundColor: COLOR_SECRETARIA,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  buscador: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  lista: {
    flex: 1,
  },
  listaContenido: {
    padding: 20,
  },
  listaVacia: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  vacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FONDO_SECRETARIA,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  datos: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  proximo: {
    fontSize: 12,
    fontWeight: '600',
    color: COLOR_SECRETARIA,
    marginTop: 2,
  },
  flecha: {
    fontSize: 22,
    color: '#B9DAD6',
  },
});
