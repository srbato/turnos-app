import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ADMINISTRADOR, NOMBRE_CONSULTORIO, SECRETARIA } from '../datos';
import { PacienteContext } from '../PacienteContext';
import { SesionContext } from '../SesionContext';

const PERFILES = {
  secretaria: {
    nombre: SECRETARIA.nombre,
    iniciales: SECRETARIA.iniciales,
    email: SECRETARIA.email,
    chip: `Secretaría · ${NOMBRE_CONSULTORIO}`,
    filaTitulo: 'Turno de trabajo',
    filaSubtitulo: SECRETARIA.horario,
    etiqueta: 'Secretaría',
  },
  administrador: {
    nombre: ADMINISTRADOR.nombre,
    iniciales: ADMINISTRADOR.iniciales,
    email: ADMINISTRADOR.email,
    chip: `Administrador · ${NOMBRE_CONSULTORIO}`,
    filaTitulo: 'Acceso',
    filaSubtitulo: 'Gestión completa del consultorio',
    etiqueta: 'Administrador',
  },
};

const COLOR_PERFIL = '#C9A24C';
const FONDO_PERFIL = '#1A1815';

export default function Perfil() {
  const { rol } = useLocalSearchParams();
  const { medicoLogueado } = useContext(SesionContext);
  const { paciente, actualizarPaciente } = useContext(PacienteContext);

  // El perfil del paciente se arma con sus datos (que se pueden editar).
  let info = {
    nombre: `${paciente.nombre} ${paciente.apellido}`,
    iniciales: paciente.iniciales,
    email: paciente.email,
    chip: `Paciente · ${paciente.cobertura}`,
    filaTitulo: 'Cobertura médica',
    filaSubtitulo: `${paciente.cobertura} ${paciente.plan} · ${paciente.numeroAfiliado}`,
    etiqueta: 'Paciente',
  };
  if (rol === 'medico') {
    // El perfil del médico se arma con los datos del médico que inició sesión.
    info = {
      nombre: medicoLogueado.nombre,
      iniciales: medicoLogueado.iniciales,
      email: medicoLogueado.email,
      chip: `Médico · ${medicoLogueado.especialidad}`,
      filaTitulo: 'Matrícula',
      filaSubtitulo: medicoLogueado.matricula,
      etiqueta: 'Médico',
    };
  } else if (rol === 'secretaria') {
    info = PERFILES.secretaria;
  } else if (rol === 'administrador') {
    info = PERFILES.administrador;
  }

  const [recordatorios, setRecordatorios] = useState(true);
  const [alertasMedicacion, setAlertasMedicacion] = useState(true);

  // Formulario para editar los datos del paciente (se muestra en un Modal).
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [alergias, setAlergias] = useState('');
  const [cobertura, setCobertura] = useState('');
  const [plan, setPlan] = useState('');
  const [numeroAfiliado, setNumeroAfiliado] = useState('');
  const [errorNombre, setErrorNombre] = useState('');
  const [errorApellido, setErrorApellido] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorCobertura, setErrorCobertura] = useState('');

  function proximamente() {
    Alert.alert('Próximamente', 'Esta opción todavía no está disponible.');
  }

  // Solo el paciente puede editar sus datos por ahora.
  function abrirEditar() {
    if (rol !== 'paciente') {
      proximamente();
      return;
    }
    setNombre(paciente.nombre);
    setApellido(paciente.apellido);
    setEmail(paciente.email);
    setAlergias(paciente.alergias);
    setCobertura(paciente.cobertura);
    setPlan(paciente.plan);
    setNumeroAfiliado(paciente.numeroAfiliado);
    setErrorNombre('');
    setErrorApellido('');
    setErrorEmail('');
    setErrorCobertura('');
    setEditando(true);
  }

  function guardarCambios() {
    let hayError = false;

    if (nombre.trim() === '') {
      setErrorNombre('El nombre es obligatorio');
      hayError = true;
    } else {
      setErrorNombre('');
    }

    if (apellido.trim() === '') {
      setErrorApellido('El apellido es obligatorio');
      hayError = true;
    } else {
      setErrorApellido('');
    }

    if (email.trim() === '') {
      setErrorEmail('El email es obligatorio');
      hayError = true;
    } else if (!email.includes('@')) {
      setErrorEmail('El email debe contener @');
      hayError = true;
    } else {
      setErrorEmail('');
    }

    if (cobertura.trim() === '') {
      setErrorCobertura('La cobertura es obligatoria');
      hayError = true;
    } else {
      setErrorCobertura('');
    }

    if (hayError) {
      return;
    }

    actualizarPaciente({
      ...paciente,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      iniciales: (nombre.trim()[0] + apellido.trim()[0]).toUpperCase(),
      email: email.trim(),
      alergias: alergias.trim(),
      cobertura: cobertura.trim(),
      plan: plan.trim(),
      numeroAfiliado: numeroAfiliado.trim(),
    });
    setEditando(false);
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView style={styles.contenido} contentContainerStyle={styles.contenidoInterno}>
        <View style={styles.encabezado}>
          <Text style={styles.tituloPantalla}>Mi perfil</Text>
          <Pressable onPress={abrirEditar}>
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
          <Pressable style={styles.fila} onPress={abrirEditar}>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>Datos personales</Text>
              <Text style={styles.filaSubtitulo}>
                {rol === 'paciente' ? 'Nombre, email y alergias' : 'DNI, contacto y domicilio'}
              </Text>
            </View>
            <Text style={styles.flecha}>›</Text>
          </Pressable>
          <View style={styles.divisor} />
          <Pressable style={styles.fila} onPress={abrirEditar}>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>{info.filaTitulo}</Text>
              <Text style={styles.filaSubtitulo}>{info.filaSubtitulo}</Text>
            </View>
            <Text style={styles.flecha}>›</Text>
          </Pressable>
          <View style={styles.divisor} />
          <Pressable style={styles.fila} onPress={proximamente}>
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

        <Text style={styles.version}>versión 2.4.1 · {NOMBRE_CONSULTORIO}</Text>
      </ScrollView>

      {rol === 'paciente' && (
        <SafeAreaView style={styles.tabBar} edges={['bottom']}>
          <Pressable style={styles.tabItem} onPress={() => router.push('/paciente')}>
            <Text style={styles.tabIcono}>⌂</Text>
            <Text style={styles.tabTexto}>Inicio</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => router.push('/paciente/turnos')}>
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
          <Pressable style={styles.tabItem} onPress={() => router.push('/medico/pacientes')}>
            <Text style={styles.tabIcono}>◍</Text>
            <Text style={styles.tabTexto}>Pacientes</Text>
          </Pressable>
          <Pressable style={styles.tabItem} onPress={() => router.push('/medico/recetas')}>
            <Text style={styles.tabIcono}>℞</Text>
            <Text style={styles.tabTexto}>Recetas</Text>
          </Pressable>
          <View style={styles.tabItem}>
            <Text style={[styles.tabIcono, styles.tabIconoActivo]}>⚙</Text>
            <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Perfil</Text>
          </View>
        </SafeAreaView>
      )}

      {/* Formulario para editar los datos del paciente */}
      <Modal
        visible={editando}
        animationType="slide"
        transparent
        onRequestClose={() => setEditando(false)}>
        <KeyboardAvoidingView
          style={styles.fondoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.tarjetaModal} edges={['bottom']}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitulo}>Editar perfil</Text>

              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={[styles.input, errorNombre !== '' && styles.inputError]}
                value={nombre}
                onChangeText={setNombre}
                maxLength={30}
              />
              {errorNombre !== '' && <Text style={styles.errorTexto}>{errorNombre}</Text>}

              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={[styles.input, errorApellido !== '' && styles.inputError]}
                value={apellido}
                onChangeText={setApellido}
                maxLength={30}
              />
              {errorApellido !== '' && <Text style={styles.errorTexto}>{errorApellido}</Text>}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errorEmail !== '' && styles.inputError]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errorEmail !== '' && <Text style={styles.errorTexto}>{errorEmail}</Text>}

              <Text style={styles.label}>Alergias</Text>
              <TextInput
                style={styles.input}
                value={alergias}
                onChangeText={setAlergias}
                placeholder="Ej: penicilina"
                placeholderTextColor="#6B675F"
              />

              <Text style={styles.label}>Cobertura médica</Text>
              <TextInput
                style={[styles.input, errorCobertura !== '' && styles.inputError]}
                value={cobertura}
                onChangeText={setCobertura}
              />
              {errorCobertura !== '' && <Text style={styles.errorTexto}>{errorCobertura}</Text>}

              <Text style={styles.label}>Plan</Text>
              <TextInput style={styles.input} value={plan} onChangeText={setPlan} />

              <Text style={styles.label}>N° de afiliado</Text>
              <TextInput
                style={styles.input}
                value={numeroAfiliado}
                onChangeText={setNumeroAfiliado}
              />

              <View style={styles.filaBotones}>
                <Pressable style={styles.botonCancelar} onPress={() => setEditando(false)}>
                  <Text style={styles.botonCancelarTexto}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.botonGuardar} onPress={guardarCambios}>
                  <Text style={styles.botonGuardarTexto}>Guardar</Text>
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
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
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  tarjetaModal: {
    backgroundColor: '#242119',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A9A49B',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3D3A33',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  inputError: {
    borderColor: '#D64545',
  },
  errorTexto: {
    fontSize: 12,
    color: '#E06A6A',
    marginTop: -8,
    marginBottom: 12,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_PERFIL,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: COLOR_PERFIL,
    fontSize: 14,
    fontWeight: '700',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: COLOR_PERFIL,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonGuardarTexto: {
    color: FONDO_PERFIL,
    fontSize: 14,
    fontWeight: '700',
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
