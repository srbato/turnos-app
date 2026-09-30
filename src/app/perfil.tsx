import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const ROLES = ['paciente', 'medico', 'secretaria', 'administrador'] as const;
type Rol = (typeof ROLES)[number];

function normalizarRol(valor: string | string[] | undefined): Rol {
  const candidato = Array.isArray(valor) ? valor[0] : valor;
  return (ROLES as readonly string[]).includes(candidato ?? '') ? (candidato as Rol) : 'paciente';
}

type InfoPerfil = {
  nombre: string;
  iniciales: string;
  email: string;
  chip: string;
  filaTitulo: string;
  filaSubtitulo: string;
};

const PERFILES: Record<Rol, InfoPerfil> = {
  paciente: {
    nombre: 'Valentín',
    iniciales: 'VM',
    email: 'valentin@test.com',
    chip: 'Paciente · Swiss Medical',
    filaTitulo: 'Cobertura médica',
    filaSubtitulo: 'Swiss Medical SMG20 · 62-4418902/01',
  },
  medico: {
    nombre: 'Dra. Lucía Fernández',
    iniciales: 'LF',
    email: 'lucia.fernandez@consultoriosrivadavia.com',
    chip: 'Médico · Clínica médica',
    filaTitulo: 'Matrícula',
    filaSubtitulo: 'MN 118.402',
  },
  secretaria: {
    nombre: 'Norma Aguilar',
    iniciales: 'NA',
    email: 'norma.aguilar@consultoriosrivadavia.com',
    chip: 'Secretaría · Consultorios Rivadavia',
    filaTitulo: 'Turno de trabajo',
    filaSubtitulo: 'Lunes a viernes · 8:00 a 16:00',
  },
  administrador: {
    nombre: 'Gustavo Aráoz',
    iniciales: 'GA',
    email: 'gustavo.araoz@consultoriosrivadavia.com',
    chip: 'Administrador · Consultorios Rivadavia',
    filaTitulo: 'Acceso',
    filaSubtitulo: 'Gestión completa del consultorio',
  },
};

const ETIQUETAS_ROL: Record<Rol, string> = {
  paciente: 'Paciente',
  medico: 'Médico',
  secretaria: 'Secretaría',
  administrador: 'Administrador',
};

const TABS_POR_ROL: Partial<Record<Rol, { icono: string; texto: string; ruta: Href }[]>> = {
  paciente: [
    { icono: '⌂', texto: 'Inicio', ruta: '/paciente' },
    { icono: '+', texto: 'Turnos', ruta: '/paciente/sacar-turno' },
    { icono: '℞', texto: 'Salud', ruta: '/paciente/medicamentos' },
  ],
  medico: [
    { icono: '▤', texto: 'Agenda', ruta: '/medico' },
  ],
};

const COLOR_PERFIL = '#C9A24C';
const FONDO_PERFIL = '#1A1815';

export default function Perfil() {
  const { rol: rolParam } = useLocalSearchParams();
  const rol = normalizarRol(rolParam);
  const info = PERFILES[rol];
  const tabs = TABS_POR_ROL[rol] ?? [];

  const [recordatorios, setRecordatorios] = useState(true);
  const [alertasMedicacion, setAlertasMedicacion] = useState(true);

  return (
    <View style={styles.pantalla}>
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
            <Text style={styles.email}>{info.email}</Text>
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
            <Toggle activo={recordatorios} onCambiar={() => setRecordatorios(!recordatorios)} />
          </View>
          <View style={styles.divisor} />
          <View style={styles.filaToggle}>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>Alertas de medicación</Text>
              <Text style={styles.filaSubtitulo}>Avisos de interacciones</Text>
            </View>
            <Toggle
              activo={alertasMedicacion}
              onCambiar={() => setAlertasMedicacion(!alertasMedicacion)}
            />
          </View>
        </View>

        <Pressable style={styles.filaCambiarPerfil} onPress={() => router.push('/')}>
          <Text style={styles.filaTitulo}>Cambiar de perfil</Text>
          <Text style={styles.cambiarPerfilValor}>{ETIQUETAS_ROL[rol]} ▾</Text>
        </Pressable>

        <Pressable style={styles.botonCerrarSesion} onPress={() => router.push('/')}>
          <Text style={styles.botonCerrarSesionTexto}>Cerrar sesión</Text>
        </Pressable>

        <Text style={styles.version}>versión 2.4.1 · Consultorios Rivadavia</Text>
      </ScrollView>

      {tabs.length > 0 && (
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <Pressable key={tab.texto} style={styles.tabItem} onPress={() => router.push(tab.ruta)}>
              <Text style={styles.tabIcono}>{tab.icono}</Text>
              <Text style={styles.tabTexto}>{tab.texto}</Text>
            </Pressable>
          ))}
          <View style={styles.tabItem}>
            <Text style={[styles.tabIcono, styles.tabIconoActivo]}>⚙</Text>
            <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Perfil</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function Toggle({ activo, onCambiar }: { activo: boolean; onCambiar: () => void }) {
  return (
    <Pressable
      style={[styles.toggleTrack, activo && styles.toggleTrackActivo]}
      onPress={onCambiar}>
      <View style={[styles.toggleThumb, activo && styles.toggleThumbActivo]} />
    </Pressable>
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
