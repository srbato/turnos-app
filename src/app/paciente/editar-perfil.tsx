import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AvatarPaciente } from '@/components/avatar-paciente';
import { BarraPerfil } from '@/components/barra-perfil';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { TEMA_CLARO, TEMA_OSCURO } from '@/constantes/tema';
import { DNI_PACIENTE, usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { COBERTURAS } from '@/datos/catalogo';
import { TEXTOS_EDITAR } from '@/datos/textos-editar-perfil';
import { confirmarIdentidad } from '@/utilidades/biometria';

const COLOR_PERFIL = '#C9A24C';

// En iPhone, un diálogo de permisos o la cámara no se pueden abrir mientras otro Modal se está cerrando:
// se espera a que termine la animación antes de pedir el permiso.
const ESPERA_CIERRE_MODAL_MS = 600;

function esperar(milisegundos: number) {
  return new Promise((resolver) => setTimeout(resolver, milisegundos));
}

// Contraseña de prueba del paciente (la misma del login). Con backend se verificaría en el servidor.
const CONTRASENA_ACTUAL_MOCK = 'p';

export default function EditarPerfil() {
  const perfil = usePerfilPaciente();
  const { idioma, modoOscuro } = usePreferencias();
  const tema = modoOscuro ? TEMA_OSCURO : TEMA_CLARO;
  const textos = TEXTOS_EDITAR[idioma];

  // Borrador: los cambios se aplican recién al tocar "Guardar cambios".
  const [nombre, setNombre] = useState(perfil.nombre);
  const [email, setEmail] = useState(perfil.email);
  const [telefono, setTelefono] = useState(perfil.telefono);
  const [domicilio, setDomicilio] = useState(perfil.domicilio);
  const [fotoUri, setFotoUri] = useState<string | null>(perfil.fotoUri);
  const [coberturaIds, setCoberturaIds] = useState<string[]>(perfil.coberturaIds);
  const [opcionesFotoAbiertas, setOpcionesFotoAbiertas] = useState(false);
  const [errorFoto, setErrorFoto] = useState('');
  const [mensaje, setMensaje] = useState<{ texto: string; esError: boolean } | null>(null);

  // Cambio de contraseña
  const [contrasenaAbierta, setContrasenaAbierta] = useState(false);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [errorContrasena, setErrorContrasena] = useState('');

  // La imagen se guarda en sí (base64), no una ruta temporal que después deja de existir.
  const opcionesFoto = {
    allowsEditing: true,
    aspect: [1, 1] as [number, number],
    quality: 0.4,
    base64: true,
  };

  function usarResultado(resultado: ImagePicker.ImagePickerResult) {
    if (!resultado.canceled) {
      const imagen = resultado.assets[0];
      setFotoUri(
        imagen.base64 ? `data:${imagen.mimeType ?? 'image/jpeg'};base64,${imagen.base64}` : imagen.uri
      );
    }
  }

  // Cada opción pide primero el permiso; si no lo dan, se explica cómo activarlo.
  async function tomarFoto() {
    setOpcionesFotoAbiertas(false);
    setErrorFoto('');
    await esperar(ESPERA_CIERRE_MODAL_MS);
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      setErrorFoto(textos.errorCamara);
      return;
    }
    usarResultado(await ImagePicker.launchCameraAsync(opcionesFoto));
  }

  async function elegirDeGaleria() {
    setOpcionesFotoAbiertas(false);
    setErrorFoto('');
    await esperar(ESPERA_CIERRE_MODAL_MS);
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      setErrorFoto(textos.errorGaleria);
      return;
    }
    usarResultado(
      await ImagePicker.launchImageLibraryAsync({ ...opcionesFoto, mediaTypes: ['images'] })
    );
  }

  function alternarCobertura(id: string) {
    setCoberturaIds(
      coberturaIds.includes(id) ? coberturaIds.filter((c) => c !== id) : [...coberturaIds, id]
    );
  }

  function guardar() {
    if (nombre.trim() === '') {
      setMensaje({ texto: textos.errorNombre, esError: true });
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setMensaje({ texto: textos.errorEmail, esError: true });
      return;
    }
    perfil.actualizarPerfil({
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      domicilio: domicilio.trim(),
      fotoUri,
      coberturaIds,
    });
    // Al guardar se vuelve a Mi perfil, donde ya se ven los datos nuevos.
    router.navigate('/perfil?rol=paciente');
  }

  function cerrarContrasena() {
    setContrasenaAbierta(false);
    setActual('');
    setNueva('');
    setRepetida('');
    setErrorContrasena('');
  }

  async function confirmarContrasena() {
    if (actual !== CONTRASENA_ACTUAL_MOCK) {
      setErrorContrasena(textos.errorActual);
      return;
    }
    if (nueva.length < 6) {
      setErrorContrasena(textos.errorLargo);
      return;
    }
    if (nueva !== repetida) {
      setErrorContrasena(textos.errorNoCoincide);
      return;
    }
    // Un cambio de seguridad pide Face ID / huella antes de aplicarse.
    const verificado = await confirmarIdentidad();
    if (!verificado) {
      setErrorContrasena(textos.errorBiometria);
      return;
    }
    cerrarContrasena();
    setMensaje({ texto: textos.contrasenaCambiada, esError: false });
  }

  const estiloCampo = [
    styles.campo,
    { backgroundColor: tema.fondo, borderColor: tema.borde, color: tema.texto },
  ];

  return (
    // El contenido sube cuando aparece el teclado, así no tapa los campos.
    <PantallaConTeclado style={[styles.pantalla, { backgroundColor: tema.fondo }]}>
      <ScrollView style={styles.contenido} contentContainerStyle={styles.contenidoInterno}>
        {/* Vuelve a Mi perfil yendo directo a esa ruta, sin depender del historial. */}
        <Pressable onPress={() => router.navigate('/perfil?rol=paciente')}>
          <Text style={[styles.titulo, { color: tema.texto }]}>‹ {textos.titulo}</Text>
        </Pressable>

        <View style={styles.bloqueFoto}>
          <View style={styles.avatarFoto}>
            <AvatarPaciente tamano={88} colorTexto={COLOR_PERFIL} colorBorde={COLOR_PERFIL} />
          </View>
          <Pressable style={styles.botonFoto} onPress={() => setOpcionesFotoAbiertas(true)}>
            <Text style={styles.botonFotoTexto}>{textos.cambiarFoto}</Text>
          </Pressable>
          {errorFoto !== '' && <Text style={[styles.mensajeError, styles.errorFoto]}>{errorFoto}</Text>}
          {fotoUri !== null && (
            <Pressable onPress={() => setFotoUri(null)}>
              <Text style={[styles.quitarFoto, { color: tema.textoSecundario }]}>{textos.quitarFoto}</Text>
            </Pressable>
          )}
        </View>
        <Text style={[styles.seccionTitulo, { color: tema.textoSecundario }]}>{textos.datos}</Text>
        <View style={[styles.grupo, { backgroundColor: tema.tarjeta }]}>
          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.nombre}</Text>
          <TextInput style={estiloCampo} value={nombre} onChangeText={setNombre} />

          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.email}</Text>
          <TextInput
            style={estiloCampo}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.telefono}</Text>
          <TextInput
            style={estiloCampo}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.domicilio}</Text>
          <TextInput style={estiloCampo} value={domicilio} onChangeText={setDomicilio} />

          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.dni}</Text>
          <View style={[styles.campo, styles.campoBloqueado, { borderColor: tema.borde }]}>
            <Text style={[styles.dniValor, { color: tema.textoSecundario }]}>{DNI_PACIENTE}</Text>
          </View>
          <Text style={[styles.nota, { color: tema.textoTenue }]}>{textos.dniNota}</Text>
        </View>

        <Text style={[styles.seccionTitulo, { color: tema.textoSecundario }]}>
          {textos.obrasSociales}
        </Text>
        <View style={[styles.grupo, { backgroundColor: tema.tarjeta }]}>
          {COBERTURAS.map((cobertura, indice) => {
            const marcada = coberturaIds.includes(cobertura.id);
            return (
              <View key={cobertura.id}>
                {indice > 0 && <View style={[styles.divisor, { backgroundColor: tema.borde }]} />}
                <Pressable style={styles.filaCobertura} onPress={() => alternarCobertura(cobertura.id)}>
                  <Text style={[styles.coberturaNombre, { color: tema.texto }]}>{cobertura.nombre}</Text>
                  <View style={[styles.checkbox, { borderColor: COLOR_PERFIL }, marcada && styles.checkboxMarcado]}>
                    {marcada && <Text style={styles.checkboxTilde}>✓</Text>}
                  </View>
                </Pressable>
              </View>
            );
          })}
          <Text style={[styles.nota, styles.notaCoberturas, { color: tema.textoTenue }]}>
            {textos.obrasSocialesNota}
          </Text>
        </View>

        {mensaje && (
          <Text style={[styles.mensaje, mensaje.esError ? styles.mensajeError : styles.mensajeOk]}>
            {mensaje.texto}
          </Text>
        )}
        <Pressable style={styles.botonGuardar} onPress={guardar}>
          <Text style={styles.botonGuardarTexto}>{textos.guardar}</Text>
        </Pressable>

        <Text style={[styles.seccionTitulo, { color: tema.textoSecundario }]}>{textos.seguridad}</Text>
        <View style={[styles.grupo, { backgroundColor: tema.tarjeta }]}>
          <Pressable style={styles.filaSeguridad} onPress={() => setContrasenaAbierta(true)}>
            <View style={styles.filaTextos}>
              <Text style={[styles.coberturaNombre, { color: tema.texto }]}>{textos.cambiarContrasena}</Text>
              <Text style={[styles.nota, { color: tema.textoSecundario }]}>
                {textos.cambiarContrasenaDetalle}
              </Text>
            </View>
            <Text style={[styles.flecha, { color: tema.textoTenue }]}>›</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BarraPerfil rol="paciente" pantalla="editar" tema={tema} />

      <Modal
        visible={opcionesFotoAbiertas}
        animationType="fade"
        transparent
        onRequestClose={() => setOpcionesFotoAbiertas(false)}>
        <View style={styles.fondoModal}>
          <View style={[styles.tarjetaModal, { backgroundColor: tema.tarjeta }]}>
            <Text style={[styles.modalTitulo, { color: tema.texto }]}>{textos.foto}</Text>
            <Pressable style={styles.opcionPrimaria} onPress={tomarFoto}>
              <Text style={styles.botonPrimarioTexto}>{textos.tomarFoto}</Text>
            </Pressable>
            <Pressable style={styles.opcionSecundaria} onPress={elegirDeGaleria}>
              <Text style={styles.botonSecundarioTexto}>{textos.elegirDeGaleria}</Text>
            </Pressable>
            <Pressable style={styles.cancelarOpciones} onPress={() => setOpcionesFotoAbiertas(false)}>
              <Text style={[styles.cancelarOpcionesTexto, { color: tema.textoSecundario }]}>
                {textos.cancelar}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={contrasenaAbierta} animationType="fade" transparent onRequestClose={cerrarContrasena}>
        <PantallaConTeclado style={styles.fondoModal}>
          <View style={[styles.tarjetaModal, { backgroundColor: tema.tarjeta }]}>
            <Text style={[styles.modalTitulo, { color: tema.texto }]}>{textos.cambiarContrasena}</Text>

            <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.contrasenaActual}</Text>
            <TextInput style={estiloCampo} value={actual} onChangeText={setActual} secureTextEntry />

            <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.contrasenaNueva}</Text>
            <TextInput style={estiloCampo} value={nueva} onChangeText={setNueva} secureTextEntry />

            <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.contrasenaRepetir}</Text>
            <TextInput style={estiloCampo} value={repetida} onChangeText={setRepetida} secureTextEntry />

            {errorContrasena !== '' && <Text style={styles.mensajeError}>{errorContrasena}</Text>}

            <View style={styles.modalBotones}>
              <Pressable style={styles.botonSecundario} onPress={cerrarContrasena}>
                <Text style={styles.botonSecundarioTexto}>{textos.cancelar}</Text>
              </Pressable>
              <Pressable style={styles.botonPrimario} onPress={confirmarContrasena}>
                <Text style={styles.botonPrimarioTexto}>{textos.confirmar}</Text>
              </Pressable>
            </View>
          </View>
        </PantallaConTeclado>
      </Modal>
    </PantallaConTeclado>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
  },
  contenido: {
    flex: 1,
  },
  contenidoInterno: {
    padding: 20,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  bloqueFoto: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarFoto: {
    marginBottom: 12,
  },
  botonFoto: {
    borderWidth: 1,
    borderColor: COLOR_PERFIL,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  botonFotoTexto: {
    color: COLOR_PERFIL,
    fontSize: 13,
    fontWeight: '700',
  },
  errorFoto: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 0,
  },
  // Botones del menú de foto: van en columna, así que no usan flex como los de las filas.
  opcionPrimaria: {
    backgroundColor: COLOR_PERFIL,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  opcionSecundaria: {
    borderWidth: 1,
    borderColor: COLOR_PERFIL,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelarOpciones: {
    alignItems: 'center',
    paddingTop: 14,
  },
  cancelarOpcionesTexto: {
    fontSize: 14,
    fontWeight: '600',
  },
  quitarFoto: {
    fontSize: 12,
    marginTop: 10,
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  grupo: {
    borderRadius: 14,
    marginBottom: 20,
    padding: 16,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  campo: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  campoBloqueado: {
    opacity: 0.7,
    marginBottom: 6,
  },
  dniValor: {
    fontSize: 14,
    fontWeight: '600',
  },
  nota: {
    fontSize: 12,
  },
  notaCoberturas: {
    marginTop: 10,
  },
  divisor: {
    height: 1,
  },
  filaCobertura: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  coberturaNombre: {
    fontSize: 14,
    fontWeight: '700',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxMarcado: {
    backgroundColor: COLOR_PERFIL,
  },
  checkboxTilde: {
    color: '#1A1815',
    fontSize: 14,
    fontWeight: '700',
  },
  mensaje: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  mensajeOk: {
    color: '#2F9E52',
  },
  mensajeError: {
    color: '#D64545',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  botonGuardar: {
    backgroundColor: COLOR_PERFIL,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 28,
  },
  botonGuardarTexto: {
    color: '#1A1815',
    fontSize: 15,
    fontWeight: '700',
  },
  filaSeguridad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filaTextos: {
    flex: 1,
    marginRight: 10,
  },
  flecha: {
    fontSize: 18,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjetaModal: {
    borderRadius: 20,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_PERFIL,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: COLOR_PERFIL,
    fontSize: 14,
    fontWeight: '700',
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: COLOR_PERFIL,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#1A1815',
    fontSize: 14,
    fontWeight: '700',
  },
});
