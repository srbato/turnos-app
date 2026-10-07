import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AvatarPaciente } from '@/components/avatar-paciente';
import { BarraPerfil } from '@/components/barra-perfil';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { TEMA_CLARO, TEMA_OSCURO } from '@/constantes/tema';
import { usePerfilMedico } from '@/contextos/PerfilMedicoContext';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { useSesion } from '@/contextos/SesionContext';
import { TEXTOS_EDITAR } from '@/datos/textos-editar-perfil';

const COLOR_PERFIL = '#C9A24C';

// En iPhone, un diálogo de permisos o la cámara no se pueden abrir mientras otro Modal se está cerrando:
// se espera a que termine la animación antes de pedir el permiso.
const ESPERA_CIERRE_MODAL_MS = 600;

function esperar(milisegundos: number) {
  return new Promise((resolver) => setTimeout(resolver, milisegundos));
}

// Editor del perfil del médico: foto, teléfono y domicilio. Nombre, matrícula, especialidad y email figuran en los
// turnos y en el ingreso, así que se muestran sin poder editarse (los cambia Secretaría).
export default function EditarPerfilMedico() {
  const perfil = usePerfilMedico();
  const { medicoLogueado } = useSesion();
  const { idioma, modoOscuro } = usePreferencias();
  const tema = modoOscuro ? TEMA_OSCURO : TEMA_CLARO;
  const textos = TEXTOS_EDITAR[idioma];

  // Borrador: los cambios se aplican recién al tocar "Guardar cambios".
  const [telefono, setTelefono] = useState(perfil.telefono);
  const [domicilio, setDomicilio] = useState(perfil.domicilio);
  const [fotoUri, setFotoUri] = useState<string | null>(perfil.fotoUri);
  const [opcionesFotoAbiertas, setOpcionesFotoAbiertas] = useState(false);
  const [errorFoto, setErrorFoto] = useState('');

  // La imagen se guarda en sí (base64), no una ruta temporal que después deja de existir.
  const opcionesFoto = {
    allowsEditing: true,
    aspect: [1, 1] as [number, number],
    quality: 0.4,
    base64: true,
  };

  // La foto se guarda apenas se elige o se quita, como en cualquier app (el resto de los datos, con "Guardar cambios").
  // Por eso se guardan los demás datos tal como estaban, no lo que se esté escribiendo en el formulario.
  function cambiarFoto(nueva: string | null) {
    setFotoUri(nueva);
    perfil.actualizarPerfil({ telefono: perfil.telefono, domicilio: perfil.domicilio, fotoUri: nueva });
  }

  function usarResultado(resultado: ImagePicker.ImagePickerResult) {
    if (!resultado.canceled) {
      const imagen = resultado.assets[0];
      cambiarFoto(
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

  function guardar() {
    perfil.actualizarPerfil({ telefono: telefono.trim(), domicilio: domicilio.trim(), fotoUri });
    // Al guardar se vuelve a Mi perfil, donde ya se ven los datos nuevos.
    router.navigate('/perfil?rol=medico');
  }

  const estiloCampo = [
    styles.campo,
    { backgroundColor: tema.fondo, borderColor: tema.borde, color: tema.texto },
  ];
  const estiloCampoBloqueado = [styles.campo, styles.campoBloqueado, { borderColor: tema.borde }];

  return (
    // El contenido sube cuando aparece el teclado, así no tapa los campos.
    <PantallaConTeclado style={[styles.pantalla, { backgroundColor: tema.fondo }]}>
      <ScrollView style={styles.contenido} contentContainerStyle={styles.contenidoInterno}>
        {/* Vuelve a Mi perfil yendo directo a esa ruta, sin depender del historial. */}
        <Pressable onPress={() => router.navigate('/perfil?rol=medico')}>
          <Text style={[styles.titulo, { color: tema.texto }]}>‹ {textos.titulo}</Text>
        </Pressable>

        <View style={styles.bloqueFoto}>
          <View style={styles.avatarFoto}>
            <AvatarPaciente
              tamano={88}
              colorTexto={COLOR_PERFIL}
              colorBorde={COLOR_PERFIL}
              datos={{ nombre: medicoLogueado.nombre, fotoUri, iniciales: medicoLogueado.iniciales }}
            />
          </View>
          <Pressable style={styles.botonFoto} onPress={() => setOpcionesFotoAbiertas(true)}>
            <Text style={styles.botonFotoTexto}>{textos.cambiarFoto}</Text>
          </Pressable>
          {errorFoto !== '' && <Text style={[styles.mensajeError, styles.errorFoto]}>{errorFoto}</Text>}
          {fotoUri !== null && (
            <Pressable onPress={() => cambiarFoto(null)}>
              <Text style={[styles.quitarFoto, { color: tema.textoSecundario }]}>{textos.quitarFoto}</Text>
            </Pressable>
          )}
        </View>

        <Text style={[styles.seccionTitulo, { color: tema.textoSecundario }]}>{textos.datos}</Text>
        <View style={[styles.grupo, { backgroundColor: tema.tarjeta }]}>
          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.nombre}</Text>
          <View style={estiloCampoBloqueado}>
            <Text style={[styles.valorFijo, { color: tema.textoSecundario }]}>{medicoLogueado.nombre}</Text>
          </View>

          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.email}</Text>
          <View style={estiloCampoBloqueado}>
            <Text style={[styles.valorFijo, { color: tema.textoSecundario }]}>{medicoLogueado.email}</Text>
          </View>

          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.matricula}</Text>
          <View style={estiloCampoBloqueado}>
            <Text style={[styles.valorFijo, { color: tema.textoSecundario }]}>{medicoLogueado.matricula}</Text>
          </View>

          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.especialidad}</Text>
          <View style={estiloCampoBloqueado}>
            <Text style={[styles.valorFijo, { color: tema.textoSecundario }]}>{medicoLogueado.especialidad}</Text>
          </View>
          <Text style={[styles.nota, { color: tema.textoTenue }]}>{textos.datosFijosNota}</Text>

          <Text style={[styles.etiqueta, styles.etiquetaEditable, { color: tema.textoSecundario }]}>
            {textos.telefono}
          </Text>
          <TextInput style={estiloCampo} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />

          <Text style={[styles.etiqueta, { color: tema.textoSecundario }]}>{textos.domicilio}</Text>
          <TextInput style={estiloCampo} value={domicilio} onChangeText={setDomicilio} />
        </View>

        <Pressable style={styles.botonGuardar} onPress={guardar}>
          <Text style={styles.botonGuardarTexto}>{textos.guardar}</Text>
        </Pressable>
      </ScrollView>

      <BarraPerfil rol="medico" pantalla="editar" tema={tema} />

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
    fontFamily: FUENTE_TITULOS,
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
  etiquetaEditable: {
    marginTop: 14,
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
  },
  valorFijo: {
    fontSize: 14,
    fontWeight: '600',
  },
  nota: {
    fontSize: 12,
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
  botonPrimarioTexto: {
    color: '#1A1815',
    fontSize: 14,
    fontWeight: '700',
  },
  botonSecundarioTexto: {
    color: COLOR_PERFIL,
    fontSize: 14,
    fontWeight: '700',
  },
});
