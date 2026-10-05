import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { COLOR_CANCELADO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useMedicamentos, type MedicamentoPropio } from '@/contextos/MedicamentosContext';

// Tab "Agregados por mí": medicamentos que el paciente carga por su cuenta.
export default function MedicamentosPropios() {
  const { medicamentos, agregarMedicamento, editarMedicamento, eliminarMedicamento } = useMedicamentos();
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

  function guardar() {
    // El nombre y la dosis son obligatorios; el motivo es opcional.
    const faltaNombre = nombre.trim() === '';
    const faltaDosis = dosis.trim() === '';
    setErrorNombre(faltaNombre ? 'El nombre es obligatorio' : '');
    setErrorDosis(faltaDosis ? 'Indicá la dosis o cada cuánto lo tomás' : '');
    if (faltaNombre || faltaDosis) {
      return;
    }
    const datos = { nombre: nombre.trim(), dosis: dosis.trim(), motivo: motivo.trim() };
    if (medicamentoEditando) {
      editarMedicamento({ ...datos, id: medicamentoEditando.id });
    } else {
      agregarMedicamento({ ...datos, id: String(Date.now()) });
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
          <Text style={styles.vacioTexto}>Todavía no agregaste ningún medicamento.</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.tarjeta} onPress={() => abrirFormularioEdicion(item)}>
            <View style={styles.icono}>
              <Text style={styles.iconoTexto}>{item.nombre.slice(0, 3).toUpperCase()}</Text>
            </View>
            <View style={styles.datos}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              {item.dosis !== '' && <Text style={styles.detalle}>{item.dosis}</Text>}
              {item.motivo !== '' && <Text style={styles.detalle}>Para: {item.motivo}</Text>}
            </View>
            <Text style={styles.editar}>Editar</Text>
          </Pressable>
        )}
      />

      <Pressable style={styles.botonAgregar} onPress={abrirFormularioNuevo}>
        <Text style={styles.botonAgregarTexto}>Agregar medicamento</Text>
      </Pressable>

      <Modal visible={formularioAbierto} animationType="fade" transparent onRequestClose={cerrarFormulario}>
        {/* El formulario sube cuando aparece el teclado. */}
        <PantallaConTeclado style={styles.fondoModal}>
          <View style={styles.tarjetaModal}>
            <Text style={styles.modalTitulo}>
              {medicamentoEditando ? 'Editar medicamento' : 'Agregar medicamento'}
            </Text>

            <Text style={styles.campoEtiqueta}>Nombre</Text>
            <TextInput
              style={styles.campo}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Paracetamol 500 mg"
              placeholderTextColor="#9A9A9A"
              maxLength={40}
            />
            {errorNombre !== '' && <Text style={styles.errorTexto}>{errorNombre}</Text>}

            <Text style={styles.campoEtiqueta}>Dosis y frecuencia</Text>
            <TextInput
              style={styles.campo}
              value={dosis}
              onChangeText={setDosis}
              placeholder="Ej. 1 comprimido cada 8 h"
              placeholderTextColor="#9A9A9A"
              maxLength={60}
            />
            {errorDosis !== '' && <Text style={styles.errorTexto}>{errorDosis}</Text>}

            <Text style={styles.campoEtiqueta}>Motivo</Text>
            <TextInput
              style={styles.campo}
              value={motivo}
              onChangeText={setMotivo}
              placeholder="Ej. Dolor de cabeza"
              placeholderTextColor="#9A9A9A"
            />

            {medicamentoEditando && (
              <Pressable style={styles.botonEliminar} onPress={pedirEliminar}>
                <Text style={styles.botonEliminarTexto}>Eliminar medicamento</Text>
              </Pressable>
            )}

            <View style={styles.modalBotones}>
              <Pressable style={styles.botonSecundario} onPress={cerrarFormulario}>
                <Text style={styles.botonSecundarioTexto}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.botonPrimario}
                onPress={guardar}>
                <Text style={styles.botonPrimarioTexto}>Guardar</Text>
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
                <Text style={styles.modalTitulo}>¿Eliminar este medicamento?</Text>
                <Text style={styles.confirmarTexto}>{medicamentoAEliminar.nombre}</Text>
                <Text style={styles.confirmarTexto}>Lo vas a sacar de tu lista.</Text>
                <View style={styles.modalBotones}>
                  <Pressable style={styles.botonSecundario} onPress={() => setMedicamentoAEliminar(null)}>
                    <Text style={styles.botonSecundarioTexto}>Volver</Text>
                  </Pressable>
                  <Pressable
                    style={styles.botonConfirmarEliminar}
                    onPress={() => {
                      eliminarMedicamento(medicamentoAEliminar.id);
                      setMedicamentoAEliminar(null);
                    }}>
                    <Text style={styles.botonPrimarioTexto}>Sí, eliminar</Text>
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

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
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
    color: '#5A5A5A',
    textAlign: 'center',
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: FONDO_PACIENTE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconoTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: COLOR_PACIENTE,
  },
  datos: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  editar: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PACIENTE,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
  },
  campoEtiqueta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A5A5A',
    marginBottom: 4,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
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
    color: '#3A3A3A',
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
    color: COLOR_PACIENTE,
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
