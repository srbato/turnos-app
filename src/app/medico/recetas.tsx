import { router, Href } from 'expo-router';
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
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { BuscadorMedicamentos } from '@/components/buscador-medicamentos';
import { Desplegable } from '@/components/desplegable';
import { MenuMedico } from '@/components/menu-medico';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { useErrores } from '@/contextos/ErroresContext';
import { useMedicoLogueado } from '@/contextos/PersonalContext';
import { useRecetas } from '@/contextos/RecetasContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { recetaVigente, vencimientoReceta, Receta } from '@/datos/recetas';
import { MedicamentoVademecum } from '@/servicios/vademecum';
import { formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_MEDICO } from '@/datos/textos-medico';

const COLOR_MEDICO = '#1B4B8F';
const FONDO_GRAFITO = '#1E2126';
const COLOR_ERROR = '#D64545';

export default function RecetasDelMedico() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro));
  const t = TEXTOS_MEDICO[idioma];
  const { turnos } = useTurnos();
  const medicoLogueado = useMedicoLogueado();
  const { recetas, emitirReceta, editarReceta, eliminarReceta } = useRecetas();
  const { mostrarError } = useErrores();
  const { consultorio } = useConsultorio();
  const pacientes = consultorio.pacientes;

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
  // Si el médico está buscando el medicamento en el vademécum (reemplaza los campos del formulario mientras tanto).
  const [buscandoMedicamento, setBuscandoMedicamento] = useState(false);

  // Se calcula en cada render: no hace falta useEffect para esto.
  // Se le pueden hacer recetas a los pacientes que tienen turnos con este médico.
  const turnosDelMedico = turnos.filter((turno) => turno.medico === medicoLogueado.nombre);
  const pacientesDelMedico = pacientes.filter((paciente) =>
    turnosDelMedico.some((turno) => turno.idPaciente === paciente.id)
  );
  const opcionesPacientes = pacientesDelMedico.map((paciente) => ({
    id: paciente.id,
    texto: `${paciente.nombre} ${paciente.apellido}`,
  }));

  // Recetas de este médico, de la más nueva a la más vieja. Las vencidas pasan al historial y ya no se editan.
  const recetasDelMedico = recetas
    .filter((receta) => receta.idMedico === medicoLogueado.id)
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
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : t.recetas.nombreDePaciente;
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
    setBuscandoMedicamento(false);
  }

  // El medicamento elegido del vademécum se carga con su nombre completo en el mismo campo que se escribía a mano:
  // desde acá la receta se trata igual que siempre (el médico todavía puede editar el texto).
  function elegirDelVademecum(elegido: MedicamentoVademecum) {
    setMedicamento(elegido.nombre);
    setErrorMedicamento('');
    setBuscandoMedicamento(false);
  }

  async function guardarReceta() {
    let hayError = false;

    if (idPaciente === '') {
      setErrorPaciente(t.recetas.errorPaciente);
      hayError = true;
    } else {
      setErrorPaciente('');
    }

    if (medicamento.trim() === '') {
      setErrorMedicamento(t.recetas.errorMedicamento);
      hayError = true;
    } else {
      setErrorMedicamento('');
    }

    if (indicacion.trim() === '') {
      setErrorIndicacion(t.recetas.errorIndicacion);
      hayError = true;
    } else {
      setErrorIndicacion('');
    }

    if (hayError) {
      return;
    }

    let error = '';
    if (idEditando !== '') {
      error = await editarReceta(idEditando, {
        medicamento: medicamento.trim(),
        indicacion: indicacion.trim(),
        riesgo: esRiesgoso,
      });
    } else {
      error = await emitirReceta({
        idPaciente: idPaciente,
        idMedico: medicoLogueado.id,
        medicamento: medicamento.trim(),
        indicacion: indicacion.trim(),
        riesgo: esRiesgoso,
      });
    }
    // Si la API no la aceptó, el formulario queda abierto con el motivo.
    if (error !== '') {
      setErrorMedicamento(error);
      return;
    }
    cerrarFormulario();
  }

  async function eliminar() {
    cerrarFormulario();
    mostrarError(await eliminarReceta(idEditando));
  }

  return (
    <View style={styles.pantalla}>
      <SafeAreaView style={styles.encabezado} edges={['top']}>
        <Text style={styles.subtituloEncabezado}>{medicoLogueado.nombre}</Text>
        <View style={styles.filaTitulo}>
          <Text style={styles.titulo}>{t.recetas.titulo}</Text>
          <Pressable style={styles.botonNueva} onPress={() => setFormularioVisible(true)}>
            <Text style={styles.botonNuevaTexto}>{t.recetas.nueva}</Text>
          </Pressable>
        </View>
        <View style={styles.vistaFila}>
          <Pressable
            style={[styles.vistaChip, vista === 'vigentes' && styles.vistaChipActivo]}
            onPress={() => setVista('vigentes')}>
            <Text style={[styles.vistaTexto, vista === 'vigentes' && styles.vistaTextoActivo]}>
              {t.recetas.vigentes(recetasVigentes.length)}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.vistaChip, vista === 'historial' && styles.vistaChipActivo]}
            onPress={() => setVista('historial')}>
            <Text style={[styles.vistaTexto, vista === 'historial' && styles.vistaTextoActivo]}>
              {t.recetas.historial(recetasPasadas.length)}
            </Text>
          </Pressable>
          {/* Pantalla de consulta del vademécum: no toca las recetas. */}
          <Pressable style={styles.botonVademecum} onPress={() => router.push('/medico/vademecum' as Href)}>
            <Text style={styles.botonVademecumTexto}>{t.recetas.vademecum}</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido}>
        {recetasMostradas.length === 0 && (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoVacioTexto}>
              {vista === 'vigentes' ? t.recetas.sinVigentes : t.recetas.sinVencidas}
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
                  ? t.recetas.vencio(formatearFecha(vencimientoReceta(receta)))
                  : t.recetas.vigenteHasta(formatearFecha(vencimientoReceta(receta)))}
              </Text>
            </View>
            {vista === 'vigentes' && <Text style={styles.editar}>{t.recetas.editar}</Text>}
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
            {buscandoMedicamento ? (
              <View>
                <Pressable onPress={() => setBuscandoMedicamento(false)} hitSlop={10}>
                  <Text style={styles.volverReceta}>{t.recetas.volverAReceta}</Text>
                </Pressable>
                <Text style={styles.modalTitulo}>{t.recetas.buscarMedicamento}</Text>
                <Text style={styles.ayudaBuscador}>{t.recetas.ayudaBuscador}</Text>
                <View style={styles.alturaBuscador}>
                  <BuscadorMedicamentos onElegir={elegirDelVademecum} />
                </View>
              </View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.modalTitulo}>{idEditando !== '' ? t.recetas.editarReceta : t.recetas.nuevaReceta}</Text>

                <Text style={styles.label}>{t.recetas.paciente}</Text>
                {idEditando !== '' ? (
                  <Text style={styles.pacienteFijo}>{nombreDelPaciente(idPaciente)}</Text>
                ) : (
                  <View style={styles.selectorPaciente}>
                    <Desplegable
                      opciones={opcionesPacientes}
                      elegida={opcionesPacientes.find((opcion) => opcion.id === idPaciente)}
                      onElegir={setIdPaciente}
                      placeholder={t.recetas.elegirPaciente}
                      placeholderBuscador={t.recetas.buscarPaciente}
                      modo="modal"
                      color={COLOR_MEDICO}
                      textoVacio={t.recetas.sinPacientesConTurnos}
                    />
                  </View>
                )}
                {errorPaciente !== '' && <Text style={styles.errorTexto}>{errorPaciente}</Text>}

                <View style={styles.filaMedicamento}>
                  <Text style={styles.labelSinMargen}>{t.recetas.medicamento}</Text>
                  <Pressable onPress={() => setBuscandoMedicamento(true)} hitSlop={8}>
                    <Text style={styles.linkVademecum}>{t.recetas.buscarEnVademecum}</Text>
                  </Pressable>
                </View>
                <TextInput
                  style={[styles.input, errorMedicamento !== '' && styles.inputError]}
                  value={medicamento}
                  onChangeText={setMedicamento}
                  placeholder={t.recetas.medicamentoEjemplo}
                  placeholderTextColor="#8A8A8A"
                />
                {errorMedicamento !== '' && <Text style={styles.errorTexto}>{errorMedicamento}</Text>}

                <Text style={styles.label}>{t.recetas.indicacion}</Text>
                <TextInput
                  style={[styles.input, errorIndicacion !== '' && styles.inputError]}
                  value={indicacion}
                  onChangeText={setIndicacion}
                  placeholder={t.recetas.indicacionEjemplo}
                  placeholderTextColor="#8A8A8A"
                />
                {errorIndicacion !== '' && <Text style={styles.errorTexto}>{errorIndicacion}</Text>}

                <Text style={styles.label}>{t.recetas.riesgo}</Text>
                <View style={styles.filaSwitch}>
                  <Text style={styles.textoSwitch}>{t.recetas.puedeSerRiesgoso}</Text>
                  <Switch
                    value={esRiesgoso}
                    onValueChange={setEsRiesgoso}
                    trackColor={{ false: '#D5D8DD', true: COLOR_MEDICO }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.filaBotones}>
                  <Pressable style={styles.botonCancelar} onPress={cerrarFormulario}>
                    <Text style={styles.botonCancelarTexto}>{t.recetas.cancelar}</Text>
                  </Pressable>
                  <Pressable style={styles.botonGuardar} onPress={guardarReceta}>
                    <Text style={styles.botonGuardarTexto}>{idEditando !== '' ? t.recetas.guardarCambios : t.recetas.emitir}</Text>
                  </Pressable>
                </View>

                {idEditando !== '' && !confirmandoEliminar && (
                  <Pressable style={styles.botonEliminar} onPress={() => setConfirmandoEliminar(true)}>
                    <Text style={styles.botonEliminarTexto}>{t.recetas.eliminar}</Text>
                  </Pressable>
                )}
                {idEditando !== '' && confirmandoEliminar && (
                  <View style={styles.confirmacion}>
                    <Text style={styles.confirmacionTexto}>{t.recetas.confirmarEliminar}</Text>
                    <View style={styles.filaBotones}>
                      <Pressable style={styles.botonCancelar} onPress={() => setConfirmandoEliminar(false)}>
                        <Text style={styles.botonCancelarTexto}>{t.recetas.noVolver}</Text>
                      </Pressable>
                      <Pressable style={styles.botonConfirmarEliminar} onPress={eliminar}>
                        <Text style={styles.botonGuardarTexto}>{t.recetas.siEliminar}</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: c.fondo,
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
    fontFamily: FUENTE_TITULOS,
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
  filaMedicamento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelSinMargen: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
  },
  linkVademecum: {
    fontSize: 12,
    fontWeight: '700',
    color: c.acento,
  },
  volverReceta: {
    fontSize: 15,
    fontWeight: '700',
    color: c.acento,
    marginBottom: 12,
  },
  ayudaBuscador: {
    fontSize: 12,
    color: c.textoSecundario,
    marginBottom: 12,
  },
  alturaBuscador: {
    height: 420,
  },
  botonVademecum: {
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  botonVademecumTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A9ADB4',
  },
  detalleVigencia: {
    fontSize: 11,
    fontWeight: '600',
    color: c.acento,
    marginTop: 3,
  },
  editar: {
    fontSize: 12,
    fontWeight: '700',
    color: c.acento,
  },
  iconoVencida: {
    backgroundColor: c.relleno,
  },
  pacienteFijo: {
    fontSize: 15,
    fontWeight: '600',
    color: c.texto,
    backgroundColor: c.fondo,
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
    backgroundColor: c.chipRojo,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  confirmacionTexto: {
    fontSize: 13,
    color: c.texto,
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
    backgroundColor: c.tarjeta,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  estadoVacioTexto: {
    fontSize: 14,
    color: c.textoSecundario,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: c.chipAzul,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconoTexto: {
    fontSize: 20,
    color: c.acento,
  },
  datos: {
    flex: 1,
  },
  medicamento: {
    fontSize: 15,
    fontWeight: '700',
    color: c.texto,
  },
  detalle: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 2,
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'flex-end',
  },
  tarjetaModal: {
    backgroundColor: c.tarjeta,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitulo: {
    fontSize: 20,
    fontFamily: FUENTE_TITULOS,
    color: c.texto,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    marginBottom: 6,
  },
  selectorPaciente: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: c.borde,
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
    borderColor: c.borde,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    marginBottom: 12,
  },
  textoSwitch: {
    flex: 1,
    fontSize: 14,
    color: c.texto,
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
    color: c.acento,
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
