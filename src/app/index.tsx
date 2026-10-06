import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  COLOR_MEDICO_GRIS,
  COLOR_PACIENTE,
  COLOR_SECRETARIA,
  FONDO_MEDICO,
  FONDO_PACIENTE,
  FONDO_SECRETARIA,
} from '@/constantes/colores';

type PropsOpcionRol = {
  letra: string;
  titulo: string;
  subtitulo: string;
  colorFondo: string;
  colorCuadro: string;
  onPress: () => void;
};

function OpcionRol(props: PropsOpcionRol) {
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
          colorFondo={FONDO_PACIENTE}
          colorCuadro={COLOR_PACIENTE}
          onPress={() => router.push('/login?rol=paciente')}
        />

        <OpcionRol
          letra="M"
          titulo="Médico"
          subtitulo="Agenda, preconsultas y recetas"
          colorFondo={FONDO_MEDICO}
          colorCuadro={COLOR_MEDICO_GRIS}
          onPress={() => router.push('/login?rol=medico')}
        />

        <OpcionRol
          letra="S"
          titulo="Secretaría"
          subtitulo="Agendas, lista de espera y avisos"
          colorFondo={FONDO_SECRETARIA}
          colorCuadro={COLOR_SECRETARIA}
          onPress={() => router.push('/login?rol=secretaria')}
        />
      </View>

      <View style={styles.pie}>
        <Text style={styles.pieTexto}>¿Primera vez? </Text>
        <Pressable onPress={() => router.push('/registro' as Href)}>
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
    color: COLOR_PACIENTE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  opcionPresionada: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

});