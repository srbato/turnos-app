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
import { HOY } from '../../datos';
import { formatearFecha } from '../../fechas';
import { PacienteContext } from '../../PacienteContext';
import { SesionContext } from '../../SesionContext';
import { TurnosContext } from '../../TurnosContext';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_ERROR = '#D64545';

export default function RecetasDelMedico() {
  const { turnos } = useContext(TurnosContext);
  const { medicoLogueado } = useContext(SesionContext);
  const { pacientes, recetas, emitirReceta } = useContext(PacienteContext);

  // Formulario de nueva receta (se muestra en un Modal).
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [idPaciente, setIdPaciente] = useState('');
  const [medicamento, setMedicamento] = useState('');
  const [indicacion, setIndicacion] = useState('');
  const [esRiesgoso, setEsRiesgoso] = useState(false);
  const [errorPaciente, setErrorPaciente] = useState('');
  const [errorMedicamento, setErrorMedicamento] = useState('');
  const [errorIndicacion, setErrorIndicacion] = useState('');

  // Se calcula en cada render: no hace falta useEffect para esto.
  // Se le pueden hacer recetas a los pacientes que tienen turnos con este médico.
  const turnosDelMedico = turnos.filter((turno) => turno.medico === medicoLogueado.nombre);
  const pacientesDelMedico = pacientes.filter((paciente) =>
    turnosDelMedico.some((turno) => turno.idPaciente === paciente.id)
  );

  // Recetas de este médico, de la más nueva a la más vieja.
  const recetasDelMedico = recetas
    .filter((receta) => receta.medico === medicoLogueado.nombre)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  function nombreDelPaciente(id: string) {
    const paciente = pacientes.find((pacienteDeLaLista) => pacienteDeLaLista.id === id);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente';
  }

  function cerrarFormulario() {
    setFormularioVisible(false);
    setIdPaciente('');
    setMedicamento('');
    setIndicacion('');
    setEsRiesgoso(false);
    setErrorPaciente('');
    setErrorMedicamento('');
    setErrorIndicacion('');
  }

  function guardarReceta() {
    let hayError = false;

    if (idPaciente === '') {
      setErrorPaciente('Elegí un paciente');
      hayError = true;
    } else {
      setErrorPaciente('');
    }

    if (medicamento.trim() === '') {
      setErrorMedicamento('El medicamento es obligatorio');
      hayError = true;
    } else {
      setErrorMedicamento('');
    }

    if (indicacion.trim() === '') {
      setErrorIndicacion('Indicá la dosis o cada cuánto tomarlo');
      hayError = true;
    } else {
      setErrorIndicacion('');
    }

    if (hayError) {
      return;
    }

    emitirReceta({
      id: String(Date.now()),
      idPaciente: idPaciente,
      medico: medicoLogueado.nombre,
      medicamento: medicamento.trim(),
      indicacion: indicacion.trim(),
      riesgo: esRiesgoso,
      fecha: HOY,
    });
    cerrarFormulario();
  }

  return (
    <View style={styles.pantalla}>
      <SafeAreaView style={styles.encabezado} edges={['top']}>
        <Text style={styles.subtituloEncabezado}>{medicoLogueado.nombre}</Text>
        <View style={styles.filaTitulo}>
          <Text style={styles.titulo}>Recetas</Text>
          <Pressable style={styles.botonNueva} onPress={() => setFormularioVisible(true)}>
            <Text style={styles.botonNuevaTexto}>+ Nueva receta</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido}>
        {recetasDelMedico.length === 0 && (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>Todavía no emitiste recetas.</Text>
          </View>
        )}

        {recetasDelMedico.map((receta) => (
          <View key={receta.id} style={styles.tarjeta}>
            <View style={styles.icono}>
              <Text style={styles.iconoTexto}>℞</Text>
            </View>
            <View style={styles.datos}>
              <Text style={styles.medicamento}>
                {receta.medicamento}
                {receta.riesgo ? '  ⚠' : ''}
              </Text>
              <Text style={styles.detalle}>{receta.indicacion}</Text>
              <Text style={styles.detalle}>
                {nombreDelPaciente(receta.idPaciente)} · {formatearFecha(receta.fecha)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <SafeAreaView style={styles.tabBar} edges={['bottom']}>
        <Pressable style={styles.tabItem} onPress={() => router.push('/medico')}>
          <Text style={styles.tabIcono}>▤</Text>
          <Text style={styles.tabTexto}>Agenda</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => router.push('/medico/pacientes')}>
          <Text style={styles.tabIcono}>◍</Text>
          <Text style={styles.tabTexto}>Pacientes</Text>
        </Pressable>
        <View style={styles.tabItem}>
          <Text style={[styles.tabIcono, styles.tabIconoActivo]}>℞</Text>
          <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Recetas</Text>
        </View>
        <Pressable style={styles.tabItem} onPress={() => router.push('/perfil?rol=medico')}>
          <Text style={styles.tabIcono}>⚙</Text>
          <Text style={styles.tabTexto}>Perfil</Text>
        </Pressable>
      </SafeAreaView>

      {/* Formulario de nueva receta */}
      <Modal
        visible={formularioVisible}
        animationType="slide"
        transparent
        onRequestClose={cerrarFormulario}>
        <KeyboardAvoidingView
          style={styles.fondoModal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.tarjetaModal} edges={['bottom']}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitulo}>Nueva receta</Text>

              <Text style={styles.label}>Paciente</Text>
              <View style={styles.filaPacientes}>
                {pacientesDelMedico.map((paciente) => {
                  const elegido = paciente.id === idPaciente;
                  return (
                    <Pressable
                      key={paciente.id}
                      style={[styles.chipPaciente, elegido && styles.chipPacienteElegido]}
                      onPress={() => setIdPaciente(paciente.id)}>
                      <Text style={[styles.chipPacienteTexto, elegido && styles.chipPacienteTextoElegido]}>
                        {paciente.nombre} {paciente.apellido}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {errorPaciente !== '' && <Text style={styles.errorTexto}>{errorPaciente}</Text>}

              <Text style={styles.label}>Medicamento</Text>
              <TextInput
                style={[styles.input, errorMedicamento !== '' && styles.inputError]}
                value={medicamento}
                onChangeText={setMedicamento}
                placeholder="Ej: Amoxicilina 500 mg"
                placeholderTextColor="#8A8A8A"
              />
              {errorMedicamento !== '' && <Text style={styles.errorTexto}>{errorMedicamento}</Text>}

              <Text style={styles.label}>Indicación</Text>
              <TextInput
                style={[styles.input, errorIndicacion !== '' && styles.inputError]}
                value={indicacion}
                onChangeText={setIndicacion}
                placeholder="Ej: 1 comprimido cada 8 h por 7 días"
                placeholderTextColor="#8A8A8A"
              />
              {errorIndicacion !== '' && <Text style={styles.errorTexto}>{errorIndicacion}</Text>}

              <Text style={styles.label}>Riesgo</Text>
              <View style={styles.filaSwitch}>
                <Text style={styles.textoSwitch}>Puede ser riesgoso con otros medicamentos</Text>
                <Switch
                  value={esRiesgoso}
                  onValueChange={setEsRiesgoso}
                  trackColor={{ false: '#D5D8DD', true: COLOR_MEDICO }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.filaBotones}>
                <Pressable style={styles.botonCancelar} onPress={cerrarFormulario}>
                  <Text style={styles.botonCancelarTexto}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.botonGuardar} onPress={guardarReceta}>
                  <Text style={styles.botonGuardarTexto}>Emitir receta</Text>
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  encabezado: {
    backgroundColor: FONDO_GRAFITO,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subtituloEncabezado: {
    fontSize: 13,
    color: '#A9ADB4',
  },
  filaTitulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  botonNueva: {
    backgroundColor: COLOR_MEDICO,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  botonNuevaTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  lista: {
    flex: 1,
  },
  listaContenido: {
    padding: 20,
    paddingBottom: 24,
  },
  estadoVacio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  estadoVacioTexto: {
    fontSize: 14,
    color: '#5A5A5A',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6ECF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconoTexto: {
    fontSize: 20,
    color: COLOR_MEDICO,
  },
  datos: {
    flex: 1,
  },
  medicamento: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
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
    maxHeight: '90%',
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
  filaPacientes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chipPaciente: {
    borderWidth: 1,
    borderColor: '#D5D8DD',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipPacienteElegido: {
    backgroundColor: COLOR_MEDICO,
    borderColor: COLOR_MEDICO,
  },
  chipPacienteTexto: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  chipPacienteTextoElegido: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5D8DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  inputError: {
    borderColor: COLOR_ERROR,
  },
  errorTexto: {
    fontSize: 12,
    color: COLOR_ERROR,
    marginTop: -8,
    marginBottom: 12,
  },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderColor: '#D5D8DD',
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    marginBottom: 12,
  },
  textoSwitch: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  filaBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  botonCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCancelarTexto: {
    color: COLOR_MEDICO,
    fontSize: 14,
    fontWeight: '700',
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: COLOR_MEDICO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonGuardarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
    color: COLOR_MEDICO,
  },
  tabTexto: {
    fontSize: 11,
    color: '#9A9A9A',
    marginTop: 2,
  },
  tabTextoActivo: {
    color: COLOR_MEDICO,
    fontWeight: '700',
  },
});
