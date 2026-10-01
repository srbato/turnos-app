import { router, useLocalSearchParams } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MEDICOS } from '../datos';
import { SesionContext } from '../SesionContext';


const TEMAS = {
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
    alternativo: '',
  },
  administrador: {
    color: '#7c3aed',
    fondo: '#f5f3ff',
    colorCard: '#ffffff',
    etiqueta: 'Ingreso administrador',
    alternativo: '',
  },
};

// Credenciales de prueba: todavía no hay backend, se validan a mano.
// Los médicos tienen un usuario cada uno, en la lista MEDICOS de datos.ts.
const CREDENCIALES = {
  paciente: { email: 'p@t.com', password: 'p' },
  secretaria: { email: 's@t.com', password: 's' },
  administrador: { email: 'a@t.com', password: 'a' },
};

export default function Login() {
    const { rol } = useLocalSearchParams();

    let tema = TEMAS.paciente;
    let credenciales = CREDENCIALES.paciente;

    if (rol === 'medico') {
        tema = TEMAS.medico;
    } else if (rol === 'secretaria') {
        tema = TEMAS.secretaria;
        credenciales = CREDENCIALES.secretaria;
    } else if (rol === 'administrador') {
        tema = TEMAS.administrador;
        credenciales = CREDENCIALES.administrador;
    }

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verPassword, setVerPassword] = useState(false);
    const [recordarme, setRecordarme] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const { setMedicoLogueado } = useContext(SesionContext);

    // Opciones que todavía no funcionan (necesitan backend).
    const proximamente = () => {
        Alert.alert('Próximamente', 'Esta opción todavía no está disponible.');
    }

    const irAlInicio = () => {
        if (rol === 'paciente') {
            router.replace('/paciente');
            return;
        }
        if (rol === 'medico') {
            router.replace('/medico');
            return;
        }
        setMensajeExito('Ingreso correcto. Esta pantalla todavía no está armada.');
    }

    const handleIngresar = () => {
      let hayError = false;
      setMensajeError('');
      setMensajeExito('');

        if (email.trim() === '') {
          setEmailError('El email es obligatorio');
          hayError = true;
        } else if (!email.includes('@')) {
          setEmailError('El email debe contener @');
          hayError = true;
        } else {
          setEmailError('');
        }

        if (password.trim() === '') {
          setPasswordError('La contraseña es obligatoria');
          hayError = true;
        } else {
          setPasswordError('');
        }

        if (hayError) {
          return;
        }

        // Médicos: se busca en la lista cuál médico es, y se guarda en la sesión.
        if (rol === 'medico') {
          const medico = MEDICOS.find((m) => m.email === email.trim() && m.password === password);
          if (!medico) {
            setMensajeError('Email o contraseña incorrectos.');
            return;
          }
          setMedicoLogueado(medico);
          irAlInicio();
          return;
        }

        if (email.trim() !== credenciales.email || password !== credenciales.password) {
          setMensajeError('Email o contraseña incorrectos.');
          return;
        }

        irAlInicio();
    }

    return(
        <KeyboardAvoidingView style={styles.teclado} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
            style={{ backgroundColor: tema.fondo }}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps='handled'
        >

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
                    style={[
                      styles.input, 
                      {borderColor: emailError !== '' ? '#dc2626' : tema.color},
                    ]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder='tucorreo@gmail.com'
                    placeholderTextColor='grey'
                    keyboardType='email-address'
                    autoCapitalize='none'
                />
                {emailError !== '' && <Text style={styles.errorText}>{emailError}</Text>}

                <Text style={styles.label}>CONTRASEÑA</Text>
                    <View style={[
                            styles.passwordFila,
                            {borderColor: passwordError !== '' ? '#dc2626' : tema.color},
                          ]}>
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
                {passwordError !== '' && <Text style={styles.errorText}>{passwordError}</Text>}

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
                    <Pressable onPress={proximamente}>
                        <Text style={[styles.link, { color: tema.color }]}>
                            Olvidé mi contraseña
                        </Text>
                    </Pressable>
                </View>

                <Pressable
                  style={({pressed}) => [
                    styles.boton,
                    {backgroundColor:tema.color},
                    pressed && styles.presionado,
                  ]}
                  onPress={handleIngresar}
                >
                  <Text style={styles.textoBoton}>Ingresar</Text>
                </Pressable>

                {mensajeError !== '' && <Text style={styles.mensajeError}>{mensajeError}</Text>}
                {mensajeExito !== '' && <Text style={styles.mensajeExito}>{mensajeExito}</Text>}
              </View>

              {tema.alternativo !== '' && (
                <>
                  <Text style={styles.separador}>____________________    o    ____________________</Text>
                  <Pressable
                  style={({pressed}) => [
                    styles.botonAlternativo,
                    {borderColor:tema.color},
                    pressed && styles.presionado,
                  ]}
                  onPress={proximamente}
                  >
                  <Text style={[styles.textoBotonAlternativo, { color: tema.color }]}>
                    {tema.alternativo}
                  </Text>
                  </Pressable>
                </>
              )}

              <View style={styles.pie}>
                <Text style={styles.pieTexto}>¿No tenés cuenta?</Text>
                <Pressable onPress={proximamente}>
                  <Text style={[styles.pieLink, {color: tema.color}]}>  Registrate</Text>
                </Pressable>
              </View>

        </ScrollView>
        </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({
  teclado: {
    flex: 1,
  },
  container: {
    paddingTop: 70,
    paddingHorizontal: 22,
    paddingBottom: 30,
    flexGrow: 1,
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
  presionado: {
    opacity:0.7,
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
  boton: {
    borderRadius:17,
    alignItems:'center',
    justifyContent:'center',
    height:50,
  },
  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize:15,
  },
  separador: {
    textAlign:'center',
    marginVertical:30,
    color: '#cbd5e1',
  },
  botonAlternativo: {
    backgroundColor:'transparent',
    borderWidth:1,
    borderRadius:17,
    alignItems:'center',
    justifyContent:'center',
    height:60,
  },
  textoBotonAlternativo: {
    fontWeight: 'bold',
    fontSize:15,
  },
  pie: {
    marginTop:40,
    justifyContent:'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pieTexto: {
    color: '#64748b',
    fontSize: 13,
  },
  pieLink: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 14,
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