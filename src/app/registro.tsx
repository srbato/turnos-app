import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { COLOR_CANCELADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { MARGEN_INFERIOR, MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { COBERTURAS } from '@/datos/catalogo';
import { formatearDni, palabras, soloNumeros } from '@/utilidades/texto';

// Registro de un paciente nuevo. Pide los mismos datos que después se ven y se editan en el perfil.
// Solo las alergias son opcionales.
// Todavía no hay backend: la cuenta queda guardada en el dispositivo y después se ingresa desde el login.
export default function Registro() {
  const { actualizarPerfil } = usePerfilPaciente();

  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [alergias, setAlergias] = useState('');
  const [coberturaIds, setCoberturaIds] = useState<string[]>([]);
  const [numerosAfiliado, setNumerosAfiliado] = useState<Record<string, string>>({});
  const [contrasena, setContrasena] = useState('');
  const [repetida, setRepetida] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState('');

  function alternarCobertura(id: string) {
    setCoberturaIds(coberturaIds.includes(id) ? coberturaIds.filter((c) => c !== id) : [...coberturaIds, id]);
  }

  function crearCuenta() {
    if (palabras(nombre).length < 2) {
      setError('Ingresá tu nombre y apellido.');
      return;
    }
    if (soloNumeros(dni).length < 7) {
      setError('Ingresá un DNI válido (7 u 8 números).');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Ingresá un email válido.');
      return;
    }
    if (soloNumeros(telefono).length < 8) {
      setError('Ingresá un teléfono válido (al menos 8 números).');
      return;
    }
    if (domicilio.trim().length < 5) {
      setError('Ingresá tu domicilio.');
      return;
    }
    if (coberturaIds.length === 0) {
      setError('Elegí al menos una obra social.');
      return;
    }
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (contrasena !== repetida) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    // Solo se guardan los N° de afiliado de las obras sociales que quedaron marcadas.
    const afiliados: Record<string, string> = {};
    coberturaIds.forEach((id) => {
      afiliados[id] = (numerosAfiliado[id] ?? '').trim();
    });
    actualizarPerfil({
      nombre: nombre.trim(),
      dni: formatearDni(dni),
      email: email.trim(),
      telefono: telefono.trim(),
      domicilio: domicilio.trim(),
      alergias: alergias.trim(),
      coberturaIds,
      numerosAfiliado: afiliados,
      contrasena,
      fotoUri: null,
    });
    // Con la cuenta creada, se pasa al login de paciente para ingresar.
    router.replace('/login?rol=paciente&registrado=1');
  }

  return (
    <PantallaConTeclado style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.volver}>‹ Volver</Text>
        </Pressable>

        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>Registrate como paciente para sacar turnos y ver tus estudios y medicación.</Text>

        <Text style={styles.seccion}>TUS DATOS</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Nombre y apellido</Text>
          <TextInput style={styles.campo} value={nombre} onChangeText={setNombre} maxLength={60} />

          <Text style={styles.etiqueta}>DNI</Text>
          <TextInput
            style={styles.campo}
            value={dni}
            onChangeText={(texto) => setDni(formatearDni(texto))}
            keyboardType="number-pad"
            placeholder="40.123.456"
            placeholderTextColor="#9AA3B2"
          />

          <Text style={styles.etiqueta}>Email</Text>
          <TextInput
            style={styles.campo}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="tucorreo@gmail.com"
            placeholderTextColor="#9AA3B2"
          />

          <Text style={styles.etiqueta}>Teléfono</Text>
          <TextInput style={styles.campo} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />

          <Text style={styles.etiqueta}>Domicilio</Text>
          <TextInput style={styles.campo} value={domicilio} onChangeText={setDomicilio} />

          <Text style={styles.etiqueta}>Alergias (opcional)</Text>
          <TextInput
            style={styles.campo}
            value={alergias}
            onChangeText={setAlergias}
            placeholder='Ej: penicilina (escribí "ninguna" si no tenés)'
            placeholderTextColor="#9AA3B2"
            maxLength={120}
          />
        </View>

        <Text style={styles.seccion}>OBRA SOCIAL</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.ayuda}>Marcá las que tengas. Te mostramos solo los médicos que las atienden.</Text>
          {COBERTURAS.map((cobertura) => {
            const marcada = coberturaIds.includes(cobertura.id);
            return (
              <View key={cobertura.id}>
                <Pressable
                  style={[styles.filaCobertura, marcada && styles.filaCoberturaMarcada]}
                  onPress={() => alternarCobertura(cobertura.id)}>
                  <Text style={styles.coberturaNombre}>{cobertura.nombre}</Text>
                  <View style={[styles.checkbox, marcada && styles.checkboxMarcado]}>
                    {marcada && <Text style={styles.checkboxTilde}>✓</Text>}
                  </View>
                </Pressable>
                {marcada && (
                  <TextInput
                    style={[styles.campo, styles.campoAfiliado]}
                    value={numerosAfiliado[cobertura.id] ?? ''}
                    onChangeText={(valor) => setNumerosAfiliado({ ...numerosAfiliado, [cobertura.id]: valor })}
                    placeholder="N° de afiliado"
                    placeholderTextColor="#9AA3B2"
                    maxLength={20}
                  />
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.seccion}>CONTRASEÑA</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput style={styles.campo} value={contrasena} onChangeText={setContrasena} secureTextEntry={!verContrasena} />

          <Text style={styles.etiqueta}>Repetir contraseña</Text>
          <TextInput style={styles.campo} value={repetida} onChangeText={setRepetida} secureTextEntry={!verContrasena} />

          <Pressable onPress={() => setVerContrasena(!verContrasena)}>
            <Text style={styles.verContrasena}>{verContrasena ? 'Ocultar contraseñas' : 'Ver contraseñas'}</Text>
          </Pressable>
        </View>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.botonCrear} onPress={crearCuenta}>
          <Text style={styles.botonCrearTexto}>Crear cuenta</Text>
        </Pressable>

        <View style={styles.pie}>
          <Text style={styles.pieTexto}>¿Ya tenés cuenta? </Text>
          <Pressable onPress={() => router.replace('/login?rol=paciente')}>
            <Text style={styles.pieLink}>Ingresá</Text>
          </Pressable>
        </View>
      </ScrollView>
    </PantallaConTeclado>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24 + MARGEN_INFERIOR,
  },
  volver: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 14,
  },
  subtitulo: {
    fontSize: 14,
    color: '#5A5A5A',
    marginTop: 4,
    marginBottom: 8,
  },
  seccion: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  ayuda: {
    fontSize: 12,
    color: '#5A5A5A',
    marginBottom: 8,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginTop: 12,
    marginBottom: 6,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#C9D6EE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  campoAfiliado: {
    marginBottom: 8,
  },
  filaCobertura: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E3E8F2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 8,
    marginBottom: 6,
  },
  filaCoberturaMarcada: {
    borderColor: COLOR_PACIENTE,
    backgroundColor: FONDO_PACIENTE,
  },
  coberturaNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLOR_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxMarcado: {
    backgroundColor: COLOR_PACIENTE,
  },
  checkboxTilde: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  verContrasena: {
    fontSize: 13,
    fontWeight: '700',
    color: COLOR_PACIENTE,
    marginTop: 12,
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_CANCELADO,
    marginTop: 14,
  },
  botonCrear: {
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  botonCrearTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pie: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  pieTexto: {
    fontSize: 14,
    color: '#5A5A5A',
  },
  pieLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
});
