import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { MARGEN_INFERIOR, MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConsultorio } from '@/contextos/ConsultorioContext';

// Los consultorios que administra la app. Cada uno guarda sus propios pacientes, médicos y secretarias: una misma
// persona puede estar en varios, pero cada consultorio tiene su ficha y no ve la de los demás.
export default function Consultorios() {
  const { consultorio: activo, consultorios, elegirConsultorio } = useConsultorio();

  function entrar(id: string) {
    elegirConsultorio(id);
    router.replace('/');
  }

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
        <Text style={styles.volver}>‹ Volver</Text>
      </Pressable>
      <Text style={styles.titulo}>Consultorios</Text>
      <Text style={styles.subtitulo}>
        Cada consultorio guarda sus propios datos. Una persona puede atenderse en varios, y cada uno tiene su propia ficha.
      </Text>

      {consultorios.map((consultorio) => {
        const esActivo = consultorio.id === activo.id;
        return (
          <View key={consultorio.id} style={[styles.tarjeta, esActivo && styles.tarjetaActiva]}>
            <View style={styles.tarjetaCabecera}>
              <View style={styles.tarjetaTextos}>
                <Text style={styles.nombre}>{consultorio.nombre}</Text>
                <Text style={styles.direccion}>{consultorio.direccion}</Text>
              </View>
              {esActivo && (
                <View style={styles.chipActivo}>
                  <Text style={styles.chipActivoTexto}>Actual</Text>
                </View>
              )}
            </View>

            <View style={styles.conteos}>
              <View style={styles.conteo}>
                <Text style={styles.conteoNumero}>{consultorio.pacientes.length}</Text>
                <Text style={styles.conteoTexto}>Pacientes</Text>
              </View>
              <View style={styles.conteo}>
                <Text style={styles.conteoNumero}>{consultorio.medicos.length}</Text>
                <Text style={styles.conteoTexto}>Médicos</Text>
              </View>
              <View style={styles.conteo}>
                <Text style={styles.conteoNumero}>{consultorio.secretarias.length}</Text>
                <Text style={styles.conteoTexto}>Secretarias</Text>
              </View>
            </View>

            <Text style={styles.seccion}>Médicos</Text>
            {consultorio.medicos.map((medico) => (
              <Text key={medico.matricula} style={styles.fila}>
                {medico.nombre} · {medico.especialidad}
              </Text>
            ))}

            <Text style={styles.seccion}>Pacientes (según la ficha de este consultorio)</Text>
            {consultorio.pacientes.map((paciente) => (
              <Text key={paciente.id} style={styles.fila}>
                {paciente.nombre} {paciente.apellido} · {paciente.cobertura} {paciente.plan}
                {paciente.faltas > 0 ? ` · ${paciente.faltas} falta${paciente.faltas === 1 ? '' : 's'}` : ''}
              </Text>
            ))}

            <Pressable
              style={[styles.boton, esActivo && styles.botonSecundario]}
              onPress={() => entrar(consultorio.id)}>
              <Text style={[styles.botonTexto, esActivo && styles.botonSecundarioTexto]}>
                {esActivo ? 'Seguir en este consultorio' : 'Entrar a este consultorio'}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  contenido: {
    paddingTop: MARGEN_SUPERIOR + 16,
    paddingHorizontal: 22,
    paddingBottom: 24 + MARGEN_INFERIOR,
  },
  volver: {
    fontSize: 16,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 14,
  },
  subtitulo: {
    fontSize: 14,
    color: 'grey',
    marginTop: 8,
    marginBottom: 20,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tarjetaActiva: {
    borderColor: COLOR_PACIENTE,
  },
  tarjetaCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tarjetaTextos: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  direccion: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
  },
  chipActivo: {
    backgroundColor: FONDO_PACIENTE,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipActivoTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  conteos: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  conteo: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  conteoNumero: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  conteoTexto: {
    fontSize: 11,
    color: '#5A5A5A',
  },
  seccion: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 4,
  },
  fila: {
    fontSize: 13,
    color: '#1A1A1A',
    paddingVertical: 2,
  },
  boton: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  botonSecundario: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
  },
  botonSecundarioTexto: {
    color: COLOR_PACIENTE,
  },
});
