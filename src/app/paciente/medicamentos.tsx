import { router } from 'expo-router';
import { useContext, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PacienteContext } from '../../PacienteContext';

const COLOR_PACIENTE = '#2D6FE0';
const FONDO_PACIENTE = '#EAF2FE';
const COLOR_RIESGO = '#D64545';
const FONDO_RIESGO = '#FBDCDC';
const COLOR_OK = '#2F9E52';
const FONDO_OK = '#DCF3E3';

export default function MisMedicamentos() {
  const { medicamentos, agregarMedicamento, quitarMedicamento, avisoEnviado, avisarAlMedico } =
    useContext(PacienteContext);

  // Formulario para agregar un medicamento (se muestra en un Modal).
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [detalle, setDetalle] = useState('');
  const [esRiesgoso, setEsRiesgoso] = useState(false);
  const [errorNombre, setErrorNombre] = useState('');
  const [errorDetalle, setErrorDetalle] = useState('');

  const [infoVisible, setInfoVisible] = useState(false);
  // id del medicamento que está pidiendo confirmación para quitarse ('' si ninguno).
  const [idConfirmandoQuitar, setIdConfirmandoQuitar] = useState('');

  const medicamentosRiesgo = medicamentos.filter((medicamento) => medicamento.riesgo);
  const hayRiesgo = medicamentosRiesgo.length > 0;

  function cerrarFormulario() {
    setFormularioVisible(false);
    setNombre('');
    setDetalle('');
    setEsRiesgoso(false);
    setErrorNombre('');
    setErrorDetalle('');
  }

  function guardarMedicamento() {
    let hayError = false;

    if (nombre.trim() === '') {
      setErrorNombre('El nombre es obligatorio');
      hayError = true;
    } else {
      setErrorNombre('');
    }

    if (detalle.trim() === '') {
      setErrorDetalle('Indicá la dosis o cada cuánto lo tomás');
      hayError = true;
    } else {
      setErrorDetalle('');
    }

    if (hayError) {
      return;
    }

    agregarMedicamento({
      id: String(Date.now()),
      abreviatura: nombre.trim().slice(0, 3).toUpperCase(),
      nombre: nombre.trim(),
      detalle: detalle.trim(),
      riesgo: esRiesgoso,
    });
    cerrarFormulario();
  }

  function confirmarQuitar(id: string) {
    quitarMedicamento(id);
    setIdConfirmandoQuitar('');
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.volver}>‹ Mis medicamentos</Text>
          </Pressable>
          <Pressable onPress={() => setFormularioVisible(true)}>
            <Text style={styles.agregar}>+ Agregar</Text>
          </Pressable>
        </View>

        {hayRiesgo && (
          <View style={styles.alertaCaja}>
            <View style={styles.alertaEncabezado}>
              <View style={styles.alertaIcono}>
                <Text style={styles.alertaIconoTexto}>!</Text>
              </View>
              <Text style={styles.alertaTitulo}>Combinación riesgosa detectada</Text>
            </View>
            <Text style={styles.alertaTexto}>
              {medicamentosRiesgo.map((m) => m.nombre).join(' + ')}: tomarlos juntos puede ser
              riesgoso. Consultalo con tu médico.
            </Text>
            <View style={styles.alertaBotones}>
              <Pressable
                style={[styles.botonAvisar, avisoEnviado && styles.botonAvisarEnviado]}
                disabled={avisoEnviado}
                onPress={avisarAlMedico}>
                <Text style={styles.botonAvisarTexto}>
                  {avisoEnviado ? 'Aviso enviado ✓' : 'Avisar a mi médico'}
                </Text>
              </Pressable>
              <Pressable style={styles.botonMasInfo} onPress={() => setInfoVisible(true)}>
                <Text style={styles.botonMasInfoTexto}>Más info</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={styles.seccionTitulo}>Tratamiento actual</Text>

        {medicamentos.length === 0 && (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>No tenés medicamentos cargados.</Text>
          </View>
        )}

        {medicamentos.map((medicamento) => (
          <View key={medicamento.id} style={styles.tarjeta}>
            <View style={styles.filaTarjeta}>
              <View
                style={[
                  styles.tarjetaIcono,
                  { backgroundColor: medicamento.riesgo ? FONDO_RIESGO : FONDO_PACIENTE },
                ]}>
                <Text
                  style={[
                    styles.tarjetaIconoTexto,
                    { color: medicamento.riesgo ? COLOR_RIESGO : COLOR_PACIENTE },
                  ]}>
                  {medicamento.abreviatura}
                </Text>
              </View>
              <View style={styles.tarjetaTextos}>
                <Text style={styles.tarjetaNombre}>{medicamento.nombre}</Text>
                <Text style={styles.tarjetaDetalle}>{medicamento.detalle}</Text>
                {idConfirmandoQuitar !== medicamento.id && (
                  <Pressable onPress={() => setIdConfirmandoQuitar(medicamento.id)}>
                    <Text style={styles.quitar}>Quitar</Text>
                  </Pressable>
                )}
              </View>
              <View
                style={[
                  styles.chipEstado,
                  { backgroundColor: medicamento.riesgo ? FONDO_RIESGO : FONDO_OK },
                ]}>
                <Text
                  style={[
                    styles.chipEstadoTexto,
                    { color: medicamento.riesgo ? COLOR_RIESGO : COLOR_OK },
                  ]}>
                  {medicamento.riesgo ? 'Riesgo' : 'OK'}
                </Text>
              </View>
            </View>

            {idConfirmandoQuitar === medicamento.id && (
              <View>
                <Text style={styles.textoConfirmacion}>¿Quitar este medicamento de tu lista?</Text>
                <View style={styles.filaBotones}>
                  <Pressable style={styles.botonNo} onPress={() => setIdConfirmandoQuitar('')}>
                    <Text style={styles.botonNoTexto}>No</Text>
                  </Pressable>
                  <Pressable style={styles.botonSiQuitar} onPress={() => confirmarQuitar(medicamento.id)}>
                    <Text style={styles.botonSiQuitarTexto}>Sí, quitar</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        ))}

        <View style={styles.notaCaja}>
          <Text style={styles.notaTexto}>
            La revisión se actualiza cada vez que agregás un medicamento o recibís una receta
            nueva.
          </Text>
        </View>
      </ScrollView>

      <SafeAreaView style={styles.tabBar} edges={['bottom']}>
        <Pressable style={styles.tabItem} onPress={() => router.push('/paciente')}>
          <Text style={styles.tabIcono}>⌂</Text>
          <Text style={styles.tabTexto}>Inicio</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => router.push('/paciente/turnos')}>
          <Text style={styles.tabIcono}>+</Text>
          <Text style={styles.tabTexto}>Turnos</Text>
        </Pressable>
        <View style={styles.tabItem}>
          <Text style={[styles.tabIcono, styles.tabIconoActivo]}>℞</Text>
          <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Salud</Text>
        </View>
        <Pressable style={styles.tabItem} onPress={() => router.push('/perfil?rol=paciente')}>
          <Text style={styles.tabIcono}>◐</Text>
          <Text style={styles.tabTexto}>Perfil</Text>
        </Pressable>
      </SafeAreaView>

      {/* Formulario para agregar un medicamento */}
      <Modal
        visible={formularioVisible}
        animationType="slide"
        transparent
        onRequestClose={cerrarFormulario}>
        <KeyboardAvoidingView
          style={styles.fondoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.tarjetaModal} edges={['bottom']}>
            <Text style={styles.modalTitulo}>Agregar medicamento</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={[styles.input, errorNombre !== '' && styles.inputError]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Amoxicilina 500 mg"
              placeholderTextColor="#8A8A8A"
            />
            {errorNombre !== '' && <Text style={styles.errorTexto}>{errorNombre}</Text>}

            <Text style={styles.label}>Dosis / frecuencia</Text>
            <TextInput
              style={[styles.input, errorDetalle !== '' && styles.inputError]}
              value={detalle}
              onChangeText={setDetalle}
              placeholder="Ej: 1 comprimido cada 8 h"
              placeholderTextColor="#8A8A8A"
            />
            {errorDetalle !== '' && <Text style={styles.errorTexto}>{errorDetalle}</Text>}

            <View style={styles.filaSwitch}>
              <Text style={styles.textoSwitch}>Puede ser riesgoso con otros medicamentos</Text>
              <Switch value={esRiesgoso} onValueChange={setEsRiesgoso} />
            </View>

            <View style={styles.filaBotones}>
              <Pressable style={styles.botonNo} onPress={cerrarFormulario}>
                <Text style={styles.botonNoTexto}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.botonGuardar} onPress={guardarMedicamento}>
                <Text style={styles.botonGuardarTexto}>Agregar</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Más info sobre la combinación riesgosa */}
      <Modal
        visible={infoVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setInfoVisible(false)}>
        <View style={styles.fondoModalCentrado}>
          <View style={styles.tarjetaInfo}>
            <Text style={styles.modalTitulo}>¿Por qué es riesgoso?</Text>
            <Text style={styles.infoTexto}>
              Algunos medicamentos, tomados juntos, pueden potenciar o anular su efecto, o generar
              efectos no deseados (por ejemplo, subir la presión o afectar los riñones).
            </Text>
            <Text style={styles.infoTexto}>
              No dejes de tomar ninguno por tu cuenta: avisale a tu médico y consultalo en tu
              próximo turno.
            </Text>
            <Pressable style={styles.botonGuardar} onPress={() => setInfoVisible(false)}>
              <Text style={styles.botonGuardarTexto}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  volver: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  agregar: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  alertaCaja: {
    backgroundColor: FONDO_RIESGO,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  alertaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertaIcono: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLOR_RIESGO,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  alertaIconoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  alertaTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_RIESGO,
  },
  alertaTexto: {
    fontSize: 13,
    color: '#7A2E2E',
    lineHeight: 19,
    marginBottom: 14,
  },
  alertaBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonAvisar: {
    flex: 1,
    backgroundColor: COLOR_RIESGO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonAvisarEnviado: {
    backgroundColor: COLOR_OK,
  },
  botonAvisarTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  botonMasInfo: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonMasInfoTexto: {
    color: COLOR_RIESGO,
    fontSize: 13,
    fontWeight: '700',
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  filaTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quitar: {
    fontSize: 12,
    fontWeight: '600',
    color: COLOR_RIESGO,
    marginTop: 6,
  },
  tarjetaIcono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tarjetaIconoTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  tarjetaTextos: {
    flex: 1,
    marginRight: 10,
  },
  tarjetaNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tarjetaDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  chipEstado: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipEstadoTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  estadoVacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  estadoVacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
  },
  textoConfirmacion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 12,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  botonNo: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonNoTexto: {
    color: COLOR_PACIENTE,
    fontSize: 14,
    fontWeight: '700',
  },
  botonSiQuitar: {
    flex: 1,
    backgroundColor: COLOR_RIESGO,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonSiQuitarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'flex-end',
  },
  tarjetaModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C7D6F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  inputError: {
    borderColor: COLOR_RIESGO,
  },
  errorTexto: {
    fontSize: 12,
    color: COLOR_RIESGO,
    marginTop: -8,
    marginBottom: 12,
  },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  textoSwitch: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  botonGuardarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fondoModalCentrado: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  tarjetaInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
  },
  infoTexto: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 12,
  },
  notaCaja: {
    borderWidth: 1,
    borderColor: '#C7D6F5',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  notaTexto: {
    fontSize: 12,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcono: {
    fontSize: 20,
    color: '#9A9A9A',
  },
  tabIconoActivo: {
    color: COLOR_PACIENTE,
  },
  tabTexto: {
    fontSize: 11,
    color: '#9A9A9A',
    marginTop: 2,
  },
  tabTextoActivo: {
    color: COLOR_PACIENTE,
    fontWeight: '700',
  },
});
