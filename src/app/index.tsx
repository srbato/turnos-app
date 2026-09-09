import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function OpcionRol(props) {
  return(
    <Pressable
      style={({ pressed }) => [
        styles.opcion,
        { backgroundColor: props.colorFondo },
        pressed && styles.opcionPresionada,
      ]}
      onPress={props.onPress}
    >
      <View style={[styles.cuadro, { backgroundColor: props.colorCuadro }]}>
        <Text style={styles.letra}>{props.letra}</Text>
      </View>

      <View style={styles.textos}>
        <Text style={[styles.tituloOpcion, { color: props.colorCuadro }]}>
          {props.titulo}
        </Text>
        <Text style={styles.subtituloOpcion}>{props.subtitulo}</Text>
      </View>

      <Text style={styles.flecha}>›</Text>
    </Pressable>
  );
}

export default function SeleccionRol (){
  return (
    <View style={styles.container}>
      <View style={styles.logo}><Text style={styles.logoTexto}>C</Text></View>

      <Text style={styles.titulo}>¿Cómo querés ingresar?</Text>
      <Text style={styles.subTitulo}>Elegí tu perfil para continuar.</Text>

      <View style={styles.lista}>
        <OpcionRol
          letra="P"
          titulo="Paciente"
          subtitulo="Turnos, estudios y medicación"
          colorFondo="#eff6ff"
          colorCuadro="#2563eb"
          onPress={() => router.push('/login?rol=paciente')}
        />

        <OpcionRol
          letra="M"
          titulo="Médico"
          subtitulo="Agenda, preconsultas y recetas"
          colorFondo="#f1f5f9"
          colorCuadro="#1e293b"
          onPress={() => router.push('/login?rol=medico')}
        />

        <OpcionRol
          letra="S"
          titulo="Secretaría"
          subtitulo="Agendas, lista de espera y avisos"
          colorFondo="#ecfdf5"
          colorCuadro="#0f766e"
          onPress={() => router.push('/login?rol=secretaria')}
        />

        <OpcionRol
          letra="A"
          titulo="Administrador"
          subtitulo="Métricas, personal y consultorio"
          colorFondo="#f5f3ff"
          colorCuadro="#7c3aed"
          onPress={() => router.push('/login?rol=administrador')}
        />
      </View>

      <View style={styles.pie}>
        <Text style={styles.pieTexto}>¿Primera vez? </Text>
        <Pressable>
          <Text style={styles.pieLink}>Registrate como paciente</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    paddingHorizontal: 22,
    flex: 1,
  },
  titulo: {
    color: 'black',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 22,
  },
  subTitulo: {
    color: 'grey',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  logo: {
    backgroundColor: 'black',
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  logoTexto: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  lista: {
    marginTop: 26,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 15,
  },
  cuadro: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  letra: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textos: {
    flex: 1,
    marginLeft: 14,
  },
  tituloOpcion: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtituloOpcion: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  flecha: {
    color: '#94a3b8',
    fontSize: 22,
  },
  pie: {
    marginTop: 'auto',
    marginBottom: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieTexto: {
    color: 'grey',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pieLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: 'bold',
  },
  opcionPresionada: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

});