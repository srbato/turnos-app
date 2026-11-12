import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { COLOR_CANCELADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useErrores } from '@/contextos/ErroresContext';
import { useMedicamentos, MedicamentoPropio } from '@/contextos/MedicamentosContext';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

// Tab "Agregados por mí": medicamentos que el paciente carga por su cuenta.
export default function MedicamentosPropios() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { medicamentos, agregarMedicamento, editarMedicamento, eliminarMedicamento } = useMedicamentos();
  const { mostrarError } = useErrores();
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  // Si hay un medicamento acá, el formulario edita ese; si es null, agrega uno nuevo.
  const [medicamentoEditando, setMedicamentoEditando] = useState<MedicamentoPropio | null>(null);
  // Medicamento pendiente de confirmar su eliminación.
  const [medicamentoAEliminar, setMedicamentoAEliminar] = useState<MedicamentoPropio | null>(null);
  const [nombre, setNombre] = useState('');
  const [dosis, setDosis] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errorNombre, setErrorNombre] = useState('');
  const [errorDosis, setErrorDosis] = useState('');

  function abrirFormularioNuevo() {
    setMedicamentoEditando(null);
    setFormularioAbierto(true);
  }

  function abrirFormularioEdicion(medicamento: MedicamentoPropio) {
    setMedicamentoEditando(medicamento);
    setNombre(medicamento.nombre);
    setDosis(medicamento.dosis);
    setMotivo(medicamento.motivo);
    setErrorNombre('');
    setErrorDosis('');
    setFormularioAbierto(true);
  }

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setMedicamentoEditando(null);
    setNombre('');
    setDosis('');
    setMotivo('');
    setErrorNombre('');
    setErrorDosis('');
  }

  async function guardar() {
    // El nombre y la dosis son obligatorios; el motivo es opcional.
    const faltaNombre = nombre.trim() === '';
    const faltaDosis = dosis.trim() === '';
    setErrorNombre(faltaNombre ? t.medicamentos.errorNombre : '');
    setErrorDosis(faltaDosis ? t.medicamentos.errorDosis : '');
    if (faltaNombre || faltaDosis) {
      return;
    }
    const datos = { nombre: nombre.trim(), dosis: dosis.trim(), motivo: motivo.trim() };
    let error = '';
    if (medicamentoEditando) {
      error = await editarMedicamento(medicamentoEditando.id, datos);
    } else {
      error = await agregarMedicamento(datos);
    }
    if (error !== '') {
      setErrorNombre(error);
      return;
    }
    cerrarFormulario();
  }

  function pedirEliminar() {
    setMedicamentoAEliminar(medicamentoEditando);
    cerrarFormulario();
  }

  return (
    <View style={styles.pantalla}>
      <FlatList
        contentContainerStyle={[styles.contenido, medicamentos.length === 0 && styles.contenidoVacio]}
        data={medicamentos}
        keyExtractor={(medicamento) => medicamento.id}
        ListEmptyComponent={
          <Text style={styles.vacioTexto}>{t.medicamentos.sinPropios}</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.tarjeta} onPress={() => abrirFormularioEdicion(item)}>
            <View style={styles.icono}>
              <Text style={styles.iconoTexto}>{item.nombre.slice(0, 3).toUpperCase()}</Text>
            </View>
            <View style={styles.datos}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              {item.dosis !== '' && <Text style={styles.detalle}>{item.dosis}</Text>}
              {item.motivo !== '' && <Text style={styles.detalle}>{t.medicamentos.para(item.motivo)}</Text>}
            </View>
            <Text style={styles.editar}>{t.medicamentos.editar}</Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.botonAgregar} onPress={abrirFormularioNuevo}>
        <Text style={styles.botonAgregarTexto}>{t.medicamentos.agregar}</Text>
      </Pressable>

      <Modal visible={formularioAbierto} animationType="fade" transparent onRequestClose={cerrarFormulario}>
        {/* El formulario sube cuando aparece el teclado. */}
        <PantallaConTeclado style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>
              {medicamentoEditando ? t.medicamentos.editarMedicamento : t.medicamentos.agregar}
            </Text>

            <Text style={styles.campoEtiqueta}>{t.medicamentos.nombre}</Text>
            <TextInput
              style={styles.campo}
              value={nombre}
              onChangeText={setNombre}
              placeholder={t.medicamentos.nombreEjemplo}
              placeholderTextColor="#9A9A9A"
              maxLength={40}
            />
            {errorNombre !== '' && <Text style={styles.errorTexto}>{errorNombre}</Text>}

            <Text style={styles.campoEtiqueta}>{t.medicamentos.dosis}</Text>
            <TextInput
              style={styles.campo}
              value={dosis}
              onChangeText={setDosis}
              placeholder={t.medicamentos.dosisEjemplo}
              placeholderTextColor="#9A9A9A"
              maxLength={60}
            />
            {errorDosis !== '' && <Text style={styles.errorTexto}>{errorDosis}</Text>}

            <Text style={styles.campoEtiqueta}>{t.medicamentos.motivo}</Text>
            <TextInput
              style={styles.campo}
              value={motivo}
              onChangeText={setMotivo}
              placeholder={t.medicamentos.motivoEjemplo}
              placeholderTextColor="#9A9A9A"
            />

            {medicamentoEditando && (
              <Pressable style={styles.botonEliminar} onPress={pedirEliminar}>
                <Text style={styles.botonEliminarTexto}>{t.medicamentos.eliminar}</Text>
              </Pressable>
            )}

            <View style={styles.modalBotones}>
              <Pressable style={styles.botonSecundario} onPress={cerrarFormulario}>
                <Text style={styles.botonSecundarioTexto}>{t.medicamentos.cancelar}</Text>
              </Pressable>
              <Pressable
                style={styles.botonPrimario}
                onPress={guardar}>
                <Text style={styles.botonPrimarioTexto}>{t.medicamentos.guardar}</Text>
              </Pressable>
            </View>
          </View>
        </PantallaConTeclado>
      </Modal>

      <Modal
        visible={medicamentoAEliminar !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setMedicamentoAEliminar(null)}>
        <View style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            {medicamentoAEliminar && (
              <>
                <Text style={styles.modalTitulo}>{t.medicamentos.eliminarTitulo}</Text>
                <Text style={styles.confirmarTexto}>{medicamentoAEliminar.nombre}</Text>
                <Text style={styles.confirmarTexto}>{t.medicamentos.sacarDeLista}</Text>
                <View style={styles.modalBotones}>
                  <Pressable style={styles.botonSecundario} onPress={() => setMedicamentoAEliminar(null)}>
                    <Text style={styles.botonSecundarioTexto}>{t.medicamentos.volver}</Text>
                  </Pressable>
                  <Pressable
                    style={styles.botonConfirmarEliminar}
                    onPress={async () => {
                      setMedicamentoAEliminar(null);
                      mostrarError(await eliminarMedicamento(medicamentoAEliminar.id));
                    }}>
                    <Text style={styles.botonPrimarioTexto}>{t.medicamentos.siEliminar}</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: c.fondo,
  },
  contenido: {
    padding: 20,
  },
  contenidoVacio: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  vacioTexto: {
    fontSize: 14,
    color: c.textoSecundario,
    textAlign: 'center',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
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
    fontSize: 11,
    fontWeight: '700',
    color: c.acento,
  },
  datos: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: c.texto,
  },
  detalle: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 2,
  },
  editar: {
    fontSize: 13,
    fontWeight: '600',
    color: c.acento,
  },
  errorTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: COLOR_CANCELADO,
    marginTop: -8,
    marginBottom: 12,
  },
  botonAgregar: {
    backgroundColor: COLOR_PACIENTE,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botonAgregarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 24, 21, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  tarjetaModal: {
    backgroundColor: c.tarjeta,
    borderRadius: 20,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: c.texto,
    marginBottom: 14,
  },
  campoEtiqueta: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textoSecundario,
    marginBottom: 4,
  },
  campo: {
    borderWidth: 1,
    borderColor: c.borde,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: c.texto,
    marginBottom: 12,
  },
  botonEliminar: {
    borderWidth: 1,
    borderColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  botonEliminarTexto: {
    color: COLOR_CANCELADO,
    fontSize: 14,
    fontWeight: '700',
  },
  botonConfirmarEliminar: {
    flex: 1,
    backgroundColor: COLOR_CANCELADO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmarTexto: {
    fontSize: 14,
    color: c.texto,
    marginBottom: 6,
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  botonSecundario: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: c.acento,
    fontSize: 14,
    fontWeight: '700',
  },
  botonPrimario: {
    flex: 1,
    backgroundColor: COLOR_PACIENTE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonPrimarioTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
