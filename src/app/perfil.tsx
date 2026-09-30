import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PERFILES = {
  paciente: {
    nombre: 'Valentín',
    iniciales: 'VM',
    email: 'valentin@test.com',
    chip: 'Paciente · Swiss Medical',
    filaTitulo: 'Cobertura médica',
    filaSubtitulo: 'Swiss Medical SMG20 · 62-4418902/01',
    etiqueta: 'Paciente',
  },
  medico: {
    nombre: 'Dra. Lucía Fernández',
    iniciales: 'LF',
    email: 'lucia.fernandez@consultoriosrivadavia.com',
    chip: 'Médico · Clínica médica',
    filaTitulo: 'Matrícula',
    filaSubtitulo: 'MN 118.402',
    etiqueta: 'Médico',
  },
  secretaria: {
    nombre: 'Norma Aguilar',
    iniciales: 'NA',
    email: 'norma.aguilar@consultoriosrivadavia.com',
    chip: 'Secretaría · Consultorios Rivadavia',
    filaTitulo: 'Turno de trabajo',
    filaSubtitulo: 'Lunes a viernes · 8:00 a 16:00',
    etiqueta: 'Secretaría',
  },
  administrador: {
    nombre: 'Gustavo Aráoz',
    iniciales: 'GA',
    email: 'gustavo.araoz@consultoriosrivadavia.com',
    chip: 'Administrador · Consultorios Rivadavia',
    filaTitulo: 'Acceso',
    filaSubtitulo: 'Gestión completa del consultorio',
    etiqueta: 'Administrador',
  },
};

const COLOR_PERFIL = '#C9A24C';
const FONDO_PERFIL = '#1A1815';

export default function Perfil() {
  const { rol } = useLocalSearchParams();

  let info = PERFILES.paciente;
  if (rol === 'medico') {
    info = PERFILES.medico;
  } else if (rol === 'secretaria') {
    info = PERFILES.secretaria;
  } else if (rol === 'administrador') {
    info = PERFILES.administrador;
  }

  const [recordatorios, setRecordatorios] = useState(true);
  const [alertasMedicacion, setAlertasMedicacion] = useState(true);

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView style={styles.contenido} contentContainerStyle={styles.contenidoInterno}>
        <View style={styles.encabezado}>
          <Text style={styles.tituloPantalla}>Mi perfil</Text>
          <Pressable>
            <Text style={styles.editar}>Editar</Text>
          </Pressable>
        </View>

        <View style={styles.filaPerfil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{info.iniciales}</Text>
          </View>
          <View style={styles.datosPerfil}>
            <Text style={styles.nombre}>{info.nombre}</Text>
            <Text style={styles.email} numberOfLines={1}>{info.email}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipTexto}>{info.chip}</Text>
            </View>
          </View>
        </View>

        <View style={styles.grupo}>
          <Pressable style={styles.fila}>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>Datos personales</Text>
              <Text style={styles.filaSubtitulo}>DNI, contacto y domicilio</Text>
            </View>
            <Text style={styles.flecha}>›</Text>
          </Pressable>
          <View style={styles.divisor} />
          <Pressable style={styles.fila}>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>{info.filaTitulo}</Text>
              <Text style={styles.filaSubtitulo}>{info.filaSubtitulo}</Text>
            </View>
            <Text style={styles.flecha}>›</Text>
          </Pressable>
          <View style={styles.divisor} />
          <Pressable style={styles.fila}>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>Seguridad</Text>
              <Text style={styles.filaSubtitulo}>Contraseña y huella</Text>
            </View>
            <Text style={styles.flecha}>›</Text>
          </Pressable>
        </View>

        <View style={styles.grupo}>
          <View style={styles.filaToggle}>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>Recordatorios de turno</Text>
              <Text style={styles.filaSubtitulo}>WhatsApp y notificaciones</Text>
            </View>
            <Pressable
              style={[styles.toggleTrack, recordatorios && styles.toggleTrackActivo]}
              onPress={() => setRecordatorios(!recordatorios)}>
              <View style={[styles.toggleThumb, recordatorios && styles.toggleThumbActivo]} />
            </Pressable>
          </View>
          <View style={styles.divisor} />
          <View style={styles.filaToggle}>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>Alertas de medicación</Text>
              <Text style={styles.filaSubtitulo}>Avisos de interacciones</Text>
            </View>
            <Pressable
              style={[styles.toggleTrack, alertasMedicacion && styles.toggleTrackActivo]}
              onPress={() => setAlertasMedicacion(!alertasMedicacion)}>
              <View style={[styles.toggleThumb, alertasMedicacion && styles.toggleThumbActivo]} />
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.filaCambiarPerfil} onPress={() => router.push('/')}>
          <Text style={styles.filaTitulo}>Cambiar de perfil</Text>
          <Text style={styles.cambiarPerfilValor}>{info.etiqueta} ▾</Text>
        </Pressable>

        <Pressable style={styles.botonCerrarSesion} onPress={() => router.push('/')}>
          <Text style={styles.botonCerrarSesionTexto}>Cerrar sesión</Text>
        </Pressable>

        <Text style={styles.version}>versión 2.4.1 · Consultorios Rivadavia</Text>
      </ScrollView>

      {rol === 'paciente' && (
        <SafeAreaView style={styles.tabBar} edges={['bottom']}>
          <Pressable style={styles.tabItem} onPress={() => router.push('/paciente')}>
            <Text style={styles.tabIcono}>⌂</Text>
            <Text style={styles.tabTexto}>Inicio</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => router.push('/paciente/sacar-turno')}>
            <Text style={styles.tabIcono}>+</Text>
            <Text style={styles.tabTexto}>Turnos</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => router.push('/paciente/medicamentos')}>
            <Text style={styles.tabIcono}>℞</Text>
            <Text style={styles.tabTexto}>Salud</Text>
          </Pressable>
          <View style={styles.tabItem}>
            <Text style={[styles.tabIcono, styles.tabIconoActivo]}>⚙</Text>
            <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Perfil</Text>
          </View>
        </SafeAreaView>
      )}

      {rol === 'medico' && (
        <SafeAreaView style={styles.tabBar} edges={['bottom']}>
          <Pressable style={styles.tabItem} onPress={() => router.push('/medico')}>
            <Text style={styles.tabIcono}>▤</Text>
            <Text style={styles.tabTexto}>Agenda</Text>
          </Pressable>
          <View style={styles.tabItem}>
            <Text style={[styles.tabIcono, styles.tabIconoActivo]}>⚙</Text>
            <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Perfil</Text>
          </View>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PERFIL,
  },
  contenido: {
    flex: 1,
  },
  contenidoInterno: {
    padding: 20,
    paddingBottom: 32,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tituloPantalla: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editar: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_PERFIL,
  },
  filaPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLOR_PERFIL,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarTexto: {
    color: COLOR_PERFIL,
    fontSize: 20,
    fontWeight: '700',
  },
  datosPerfil: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 13,
    color: '#A9A49B',
    marginTop: 2,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLOR_PERFIL,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 8,
  },
  chipTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: COLOR_PERFIL,
  },
  grupo: {
    backgroundColor: '#242119',
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  filaToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  filaTextos: {
    flex: 1,
    marginRight: 10,
  },
  filaTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filaSubtitulo: {
    fontSize: 12,
    color: '#A9A49B',
    marginTop: 2,
  },
  flecha: {
    fontSize: 18,
    color: '#6B675F',
  },
  divisor: {
    height: 1,
    backgroundColor: '#33302A',
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3D3A33',
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActivo: {
    backgroundColor: COLOR_PERFIL,
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActivo: {
    backgroundColor: '#1A1815',
  },
  filaCambiarPerfil: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#242119',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  cambiarPerfilValor: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PERFIL,
  },
  botonCerrarSesion: {
    borderWidth: 1,
    borderColor: COLOR_PERFIL,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  botonCerrarSesionTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR_PERFIL,
  },
  version: {
    fontSize: 11,
    color: '#6B675F',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1815',
    borderTopWidth: 1,
    borderTopColor: '#33302A',
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcono: {
    fontSize: 20,
    color: '#6B675F',
  },
  tabIconoActivo: {
    color: COLOR_PERFIL,
  },
  tabTexto: {
    fontSize: 11,
    color: '#6B675F',
    marginTop: 2,
  },
  tabTextoActivo: {
    color: COLOR_PERFIL,
    fontWeight: '700',
  },
});
