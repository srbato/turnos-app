import { router } from 'expo-router';
import { useState } from 'react';
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
import { MenuMedico } from '@/components/menu-medico';
import { useMedicamentos } from '@/contextos/MedicamentosContext';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { useRecetas } from '@/contextos/RecetasContext';
import { useSesion } from '@/contextos/SesionContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { recetaVigente, vencimientoReceta, type Receta } from '@/datos/recetas';
import { datosParaMedico } from '@/utilidades/datos-medico';
import { formatearFecha } from '@/utilidades/turnos';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_ERROR = '#D64545';

export default function RecetasDelMedico() {
  const { turnos } = useTurnos();
  const { medicoLogueado } = useSesion();
  const perfilPaciente = usePerfilPaciente();
  const { medicamentos: medicamentosPropios } = useMedicamentos();
  const { recetas, emitirReceta, editarReceta, eliminarReceta } = useRecetas();
  const { consultorio } = useConsultorio();
  const { pacientes } = datosParaMedico(perfilPaciente, consultorio.pacientes, medicamentosPropios, recetas);

  // Formulario de nueva receta (se muestra en un Modal).
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [idPaciente, setIdPaciente] = useState('');
  const [medicamento, setMedicamento] = useState('');
  const [indicacion, setIndicacion] = useState('');
  const [esRiesgoso, setEsRiesgoso] = useState(false);
  const [errorPaciente, setErrorPaciente] = useState('');
  const [errorMedicamento, setErrorMedicamento] = useState('');
  const [errorIndicacion, setErrorIndicacion] = useState('');
  // Si se está corrigiendo una receta ya emitida, su id ('' = receta nueva).
  const [idEditando, setIdEditando] = useState('');
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [vista, setVista] = useState<'vigentes' | 'historial'>('vigentes');

  // Se calcula en cada render: no hace falta useEffect para esto.
  // Se le pueden hacer recetas a los pacientes que tienen turnos con este médico.
  const turnosDelMedico = turnos.filter((turno) => turno.medico === medicoLogueado.nombre);
  const pacientesDelMedico = pacientes.filter((paciente) =>
    turnosDelMedico.some((turno) => turno.idPaciente === paciente.id)
  );

  // Recetas de este médico, de la más nueva a la más vieja. Las vencidas pasan al historial y ya no se editan.
  const recetasDelMedico = recetas
    .filter((receta) => receta.medico === medicoLogueado.nombre)
    .sort((a, b) => (a.fechaEmision < b.fechaEmision ? 1 : -1));
  const recetasVigentes = recetasDelMedico.filter((receta) => recetaVigente(receta));
  const recetasPasadas = recetasDelMedico.filter((receta) => !recetaVigente(receta));
  const recetasMostradas = vista === 'vigentes' ? recetasVigentes : recetasPasadas;

  function abrirEdicion(receta: Receta) {
    setIdEditando(receta.id);
    setIdPaciente(receta.idPaciente);
    setMedicamento(receta.medicamento);
    setIndicacion(receta.indicacion);
    setEsRiesgoso(receta.riesgo);
    setFormularioVisible(true);
  }

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
    setIdEditando('');
    setConfirmandoEliminar(false);
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

    if (idEditando !== '') {
      editarReceta(idEditando, {
        medicamento: medicamento.trim(),
        indicacion: indicacion.trim(),
        riesgo: esRiesgoso,
      });
    } else {
      emitirReceta({
        idPaciente: idPaciente,
        medico: medicoLogueado.nombre,
        medicamento: medicamento.trim(),
        indicacion: indicacion.trim(),
        riesgo: esRiesgoso,
      });
    }
    cerrarFormulario();
  }

  function eliminar() {
    eliminarReceta(idEditando);
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
        <View style={styles.vistaFila}>
          <Pressable
            style={[styles.vistaChip, vista === 'vigentes' && styles.vistaChipActivo]}
            onPress={() => setVista('vigentes')}>
            <Text style={[styles.vistaTexto, vista === 'vigentes' && styles.vistaTextoActivo]}>
              Vigentes ({recetasVigentes.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.vistaChip, vista === 'historial' && styles.vistaChipActivo]}
            onPress={() => setVista('historial')}>
            <Text style={[styles.vistaTexto, vista === 'historial' && styles.vistaTextoActivo]}>
              Historial ({recetasPasadas.length})
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido}>
        {recetasMostradas.length === 0 && (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>
              {vista === 'vigentes' ? 'No tenés recetas vigentes.' : 'Todavía no tenés recetas vencidas.'}
            </Text>
          </View>
        )}

        {recetasMostradas.map((receta) => (
          <Pressable
            key={receta.id}
            style={styles.tarjeta}
            disabled={vista === 'historial'}
            onPress={() => abrirEdicion(receta)}>
            <View style={[styles.icono, vista === 'historial' && styles.iconoVencida]}>
              <Text style={styles.iconoTexto}>℞</Text>
            </View>
            <View style={styles.datos}>
              <Text style={styles.medicamento}>
                {receta.medicamento}
                {receta.riesgo ? '  ⚠' : ''}
              </Text>
              <Text style={styles.detalle}>{receta.indicacion}</Text>
              <Text style={styles.detalle}>
                {nombreDelPaciente(receta.idPaciente)} · {formatearFecha(receta.fechaEmision)}
              </Text>
              <Text style={styles.detalleVigencia}>
                {vista === 'historial'
                  ? `Venció el ${formatearFecha(vencimientoReceta(receta))}`
                  : `Vigente hasta el ${formatearFecha(vencimientoReceta(receta))}`}
              </Text>
            </View>
            {vista === 'vigentes' && <Text style={styles.editar}>Editar ›</Text>}
          </Pressable>
        ))}
      </ScrollView>

      <MenuMedico activa="recetas" />

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
              <Text style={styles.modalTitulo}>{idEditando !== '' ? 'Editar receta' : 'Nueva receta'}</Text>

              <Text style={styles.label}>Paciente</Text>
              {idEditando !== '' ? (
                <Text style={styles.pacienteFijo}>{nombreDelPaciente(idPaciente)}</Text>
              ) : (
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
              )}
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
                  <Text style={styles.botonGuardarTexto}>{idEditando !== '' ? 'Guardar cambios' : 'Emitir receta'}</Text>
                </Pressable>
              </View>

              {idEditando !== '' && !confirmandoEliminar && (
                <Pressable style={styles.botonEliminar} onPress={() => setConfirmandoEliminar(true)}>
                  <Text style={styles.botonEliminarTexto}>Eliminar receta</Text>
                </Pressable>
              )}
              {idEditando !== '' && confirmandoEliminar && (
                <View style={styles.confirmacion}>
                  <Text style={styles.confirmacionTexto}>
                    ¿Eliminar esta receta? El paciente deja de verla y no se puede deshacer.
                  </Text>
                  <View style={styles.filaBotones}>
                    <Pressable style={styles.botonCancelar} onPress={() => setConfirmandoEliminar(false)}>
                      <Text style={styles.botonCancelarTexto}>No, volver</Text>
                    </Pressable>
                    <Pressable style={styles.botonConfirmarEliminar} onPress={eliminar}>
                      <Text style={styles.botonGuardarTexto}>Sí, eliminar</Text>
                    </Pressable>
                  </View>
                </View>
              )}
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
  vistaFila: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  vistaChip: {
    borderWidth: 1,
    borderColor: '#4A4F58',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  vistaChipActivo: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  vistaTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A9ADB4',
  },
  vistaTextoActivo: {
    color: '#1E2126',
  },
  detalleVigencia: {
    fontSize: 11,
    fontWeight: '600',
    color: COLOR_MEDICO,
    marginTop: 3,
  },
  editar: {
    fontSize: 12,
    fontWeight: '700',
    color: COLOR_MEDICO,
  },
  iconoVencida: {
    backgroundColor: '#ECECEC',
  },
  pacienteFijo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    backgroundColor: '#F4F5F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  botonEliminar: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  botonEliminarTexto: {
    color: COLOR_ERROR,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmacion: {
    backgroundColor: '#FBDCDC',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  confirmacionTexto: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  botonConfirmarEliminar: {
    flex: 1,
    backgroundColor: COLOR_ERROR,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
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
});
