import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';


const ROLES = ['paciente', 'medico', 'secretaria', 'administrador'] as const;
type Rol = (typeof ROLES)[number];

function normalizarRol(valor: string | string[] | undefined): Rol {
  const candidato = Array.isArray(valor) ? valor[0] : valor;
  return (ROLES as readonly string[]).includes(candidato ?? '') ? (candidato as Rol) : 'paciente';
}

const TEMAS: Record<Rol, {
  color: string;
  fondo: string;
  colorCard: string;
  etiqueta: string;
  alternativo: string | null;
}> = {
  paciente: {
    color: '#2563eb',
    fondo: '#eff6ff',
    colorCard: '#ffffff',
    etiqueta: 'Ingreso paciente',
    alternativo: 'Ingresar con DNI y N° de afiliado',
  },
  medico: {
    color: '#1e293b',
    fondo: '#f1f5f9',
    colorCard: '#ffffff',
    etiqueta: 'Ingreso médico',
    alternativo: 'Ingresar con matrícula',
  },
  secretaria: {
    color: '#0f766e',
    fondo: '#ecfdf5',
    colorCard: '#ffffff',
    etiqueta: 'Ingreso secretaría',
    alternativo: null,
  },
  administrador: {
    color: '#7c3aed',
    fondo: '#f5f3ff',
    colorCard: '#ffffff',
    etiqueta: 'Ingreso administrador',
    alternativo: null,
  },
};

// Credenciales de prueba: todavía no hay backend, se validan a mano.
const CREDENCIALES: Record<Rol, { email: string; password: string }> = {
  paciente: { email: 'paciente@test.com', password: 'paciente123' },
  medico: { email: 'medico@test.com', password: 'medico123' },
  secretaria: { email: 'secretaria@test.com', password: 'secretaria123' },
  administrador: { email: 'admin@test.com', password: 'admin123' },
};

export default function Login() {
    const { rol: rolParam } = useLocalSearchParams();
    const rol = normalizarRol(rolParam);
    const tema = TEMAS[rol];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verPassword, setVerPassword] = useState(false);
    const [recordarme, setRecordarme] = useState(false);
    const [mensaje, setMensaje] = useState<{ texto: string; esError: boolean } | null>(null);

    function handleIngresar() {
        const credenciales = CREDENCIALES[rol];
        if (email !== credenciales.email || password !== credenciales.password) {
            setMensaje({ texto: 'Email o contraseña incorrectos.', esError: true });
            return;
        }
        if (rol === 'paciente') {
            router.push('/paciente');
            return;
        }
        setMensaje({ texto: `${tema.etiqueta} correcto. Esta pantalla todavía no está armada.`, esError: false });
    }

    return(
        <View style = {[styles.container, { backgroundColor: tema.fondo }]}>

            <Pressable style = {({pressed}) => [styles.volver, pressed && styles.presionado]} onPress={() => router.back()}>
                <Text style={styles.volverTexto}>‹    Cambiar de perfil</Text>
            </Pressable>

            <View style={[styles.etiqueta, {backgroundColor: tema.color}]}>
                <Text style={styles.etiquetaTexto}>● {tema.etiqueta}</Text>
            </View>

            <Text style={styles.titulo}>Hola de nuevo</Text>
            <Text style={styles.subtitulo}>Ingresá con tu email y contraseña.</Text>

            <View style={[styles.card, {backgroundColor: tema.colorCard}]}>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput
                    style={[styles.input, {borderColor: tema.color}]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder='tucorreo@gmail.com'
                    placeholderTextColor='grey'
                    keyboardType='email-address'
                    autoCapitalize='none'
                />

                <View style={styles.passwordFila}>
                    <TextInput
                        style={[styles.passwordInput, {borderColor: tema.color}]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder='••••••••'
                        placeholderTextColor='grey'
                        secureTextEntry={!verPassword}
                    />
                    <Pressable onPress={() => setVerPassword(!verPassword)}>
                        <Text style={[styles.link, {color: tema.color}]}>
                            {verPassword ? 'Ocultar' : 'Ver'}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.opcionesFila}> 
                    <Pressable style={styles.checkFila} onPress={() => setRecordarme(!recordarme)}>
                        <View
                        style={[
                            styles.checkbox,
                            recordarme && { backgroundColor: tema.color, borderColor: tema.color },
                        ]}
                        >
                            {recordarme && <Text style={styles.check}>✓</Text>}
                        </View>
                        <Text style={styles.checkTexto}>Recordarme</Text>
                    </Pressable>
                    <Pressable>
                        <Text style={[styles.link, { color: tema.color }]}>
                            Olvidé mi contraseña
                        </Text>
                    </Pressable>
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.botonIngresar,
                        { backgroundColor: tema.color },
                        pressed && styles.botonIngresarPresionado,
                    ]}
                    onPress={handleIngresar}
                >
                    <Text style={styles.botonIngresarTexto}>Ingresar</Text>
                </Pressable>
            </View>

            {mensaje && (
                <Text style={mensaje.esError ? styles.mensajeError : styles.mensajeExito}>
                    {mensaje.texto}
                </Text>
            )}

        </View>
    );
}


const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    paddingHorizontal: 22,
    flex: 1,
  },
  volver: {

  },
  volverTexto: {
    color: 'grey',
    fontWeight: 'bold',
  },
  etiqueta: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 40,
  },
  etiquetaTexto: {
    color: 'white',
    fontWeight: 'bold',
  },
  titulo: {
    color: 'black',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 25,
  },
  subtitulo: {
    color: 'grey',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  card: {
    borderRadius: 18,
    padding: 20,
    marginTop: 30,
  },
  label: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  passwordFila: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
  },
  link: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: 'bold',
  },
  opcionesFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkFila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 5,
    marginRight: 8,
  },
  check: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  checkTexto: {
    color: 'grey',
    fontSize: 13,
    fontWeight: 'bold',
  },
  botonIngresar: {
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonIngresarPresionado: {
    opacity: 0.8,
  },
  botonIngresarTexto: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  mensajeError: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  mensajeExito: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
});