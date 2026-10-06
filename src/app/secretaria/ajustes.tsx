import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { MenuSecretaria } from '@/components/menu-secretaria';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { COLOR_CONFIRMADO, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConfiguracion, type Configuracion } from '@/contextos/ConfiguracionContext';

const DURACIONES: Configuracion['duracionTurno'][] = [15, 20, 30, 45];

export default function AjustesSecretaria() {
  const configuracion = useConfiguracion();

  // Borrador local: los cambios se aplican recién al tocar "Guardar cambios".
  const [nombre, setNombre] = useState(configuracion.nombre);
  const [direccion, setDireccion] = useState(configuracion.direccion);
  const [ciudad, setCiudad] = useState(configuracion.ciudad);
  const [telefono, setTelefono] = useState(configuracion.telefono);
  const [duracion, setDuracion] = useState(configuracion.duracionTurno);
  const [atencion, setAtencion] = useState(configuracion.atencion);
  const [sobreturnos, setSobreturnos] = useState(String(configuracion.sobreturnos));
  const [recordatorio, setRecordatorio] = useState(configuracion.recordatorioAutomatico);
  const [guardado, setGuardado] = useState(false);

  function modificar<T>(setter: (valor: T) => void, valor: T) {
    setter(valor);
    setGuardado(false);
  }

  function guardar() {
    const cantidad = parseInt(sobreturnos, 10);
    configuracion.guardarConfiguracion({
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      ciudad: ciudad.trim(),
      telefono: telefono.trim(),
      duracionTurno: duracion,
      atencion: atencion.trim(),
      sobreturnos: Number.isNaN(cantidad) ? 0 : cantidad,
      recordatorioAutomatico: recordatorio,
    });
    setGuardado(true);
  }

  return (
    <PantallaConTeclado style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Configuración</Text>
        <Text style={styles.subtitulo}>Datos y reglas del consultorio</Text>

        <Pressable style={styles.tarjetaPerfil} onPress={() => router.push('/perfil?rol=secretaria')}>
          <Text style={styles.perfilTexto}>Mi perfil</Text>
          <Text style={styles.perfilFlecha}>›</Text>
        </Pressable>

        <Text style={styles.seccion}>DATOS DEL CONSULTORIO</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Nombre</Text>
          <TextInput style={styles.campo} value={nombre} onChangeText={(t) => modificar(setNombre, t)} />
          <Text style={styles.etiqueta}>Dirección</Text>
          <TextInput style={styles.campo} value={direccion} onChangeText={(t) => modificar(setDireccion, t)} />
          <Text style={styles.etiqueta}>Ciudad</Text>
          <TextInput style={styles.campo} value={ciudad} onChangeText={(t) => modificar(setCiudad, t)} />
          <Text style={styles.etiqueta}>Teléfono</Text>
          <TextInput
            style={styles.campo}
            value={telefono}
            onChangeText={(t) => modificar(setTelefono, t)}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.seccion}>DURACIÓN DE TURNO</Text>
        <View style={styles.tarjeta}>
          <View style={styles.duraciones}>
            {DURACIONES.map((minutos) => (
              <Pressable
                key={minutos}
                style={[styles.duracion, duracion === minutos && styles.duracionActiva]}
                onPress={() => modificar(setDuracion, minutos)}>
                <Text style={[styles.duracionTexto, duracion === minutos && styles.duracionTextoActiva]}>
                  {minutos} min
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.seccion}>HORARIOS Y REGLAS</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Atención</Text>
          <TextInput style={styles.campo} value={atencion} onChangeText={(t) => modificar(setAtencion, t)} />
          <Text style={styles.etiqueta}>Sobreturnos por día</Text>
          <TextInput
            style={styles.campo}
            value={sobreturnos}
            onChangeText={(t) => modificar(setSobreturnos, t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
          />
          <View style={styles.filaSwitch}>
            <View style={styles.filaSwitchTextos}>
              <Text style={styles.switchTitulo}>Recordatorio automático</Text>
              <Text style={styles.switchDetalle}>Aviso al paciente 24 h antes del turno</Text>
            </View>
            <Switch
              value={recordatorio}
              onValueChange={(valor) => modificar(setRecordatorio, valor)}
              trackColor={{ true: COLOR_SECRETARIA, false: '#C9D6D4' }}
            />
          </View>
        </View>

        <Pressable style={styles.botonGuardar} onPress={guardar}>
          <Text style={styles.botonGuardarTexto}>Guardar cambios</Text>
        </Pressable>
        {guardado && <Text style={styles.confirmacion}>Cambios guardados ✓</Text>}
      </ScrollView>

      <MenuSecretaria activa="ajustes" />
    </PantallaConTeclado>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_SECRETARIA,
  },
  contenido: {
    padding: 18,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  subtitulo: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
    marginBottom: 14,
  },
  tarjetaPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  perfilTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  perfilFlecha: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  seccion: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginTop: 8,
    marginBottom: 6,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  duraciones: {
    flexDirection: 'row',
    gap: 8,
  },
  duracion: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  duracionActiva: {
    backgroundColor: COLOR_SECRETARIA,
    borderColor: COLOR_SECRETARIA,
  },
  duracionTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  duracionTextoActiva: {
    color: '#FFFFFF',
  },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  filaSwitchTextos: {
    flex: 1,
  },
  switchTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  switchDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  botonGuardar: {
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  botonGuardarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmacion: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_CONFIRMADO,
    textAlign: 'center',
    marginTop: 10,
  },
});
