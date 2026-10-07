import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EditorHorarios } from '@/components/editor-horarios';
import { MenuSecretaria } from '@/components/menu-secretaria';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { COLOR_CONFIRMADO, COLOR_PENDIENTE, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { estadoEfectivo, usePersonal } from '@/contextos/PersonalContext';
import { FranjaHoraria, textoDeDias } from '@/datos/atencion';
import { formatearFecha } from '@/utilidades/turnos';

type Pestana = 'medicos' | 'secretarias';

const COLORES_ESTADO_MEDICO = { activo: COLOR_CONFIRMADO, licencia: COLOR_PENDIENTE, baja: '#8A8A8A' };
const ETIQUETAS_ESTADO_MEDICO = { activo: 'Activo', licencia: 'Licencia', baja: 'Baja' };

export default function PersonalSecretaria() {
  const { medicos, secretarias, altaMedico } = usePersonal();

  const [pestana, setPestana] = useState<Pestana>('medicos');
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [matricula, setMatricula] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [franjas, setFranjas] = useState<FranjaHoraria[]>([]);
  const [error, setError] = useState('');

  function darDeAlta() {
    if (nombre.trim() === '' || matricula.trim() === '' || especialidad.trim() === '') {
      setError('Completá todos los campos.');
      return;
    }
    if (franjas.length === 0) {
      setError('Cargá al menos un horario de atención.');
      return;
    }
    if (medicos.some((medico) => medico.matricula === matricula.trim())) {
      setError('Ya hay un médico con esa matrícula.');
      return;
    }
    altaMedico({ nombre, matricula, especialidad, franjas });
    setNombre('');
    setMatricula('');
    setEspecialidad('');
    setFranjas([]);
    setError('');
    setFormularioAbierto(false);
  }

  return (
    <PantallaConTeclado style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Personal</Text>
        <Text style={styles.subtitulo}>
          {medicos.filter((medico) => medico.estado !== 'baja').length} médicos · {secretarias.length} secretarias
        </Text>

        <View style={styles.pestanas}>
          <Pressable
            style={[styles.pestana, pestana === 'medicos' && styles.pestanaActiva]}
            onPress={() => setPestana('medicos')}>
            <Text style={[styles.pestanaTexto, pestana === 'medicos' && styles.pestanaTextoActiva]}>Médicos</Text>
          </Pressable>
          <Pressable
            style={[styles.pestana, pestana === 'secretarias' && styles.pestanaActiva]}
            onPress={() => setPestana('secretarias')}>
            <Text style={[styles.pestanaTexto, pestana === 'secretarias' && styles.pestanaTextoActiva]}>Secretarias</Text>
          </Pressable>
        </View>

        {pestana === 'medicos' &&
          [...medicos].sort((a, b) => Number(a.estado === 'baja') - Number(b.estado === 'baja')).map((medico) => (
            <Pressable
              key={medico.matricula}
              style={[styles.tarjeta, medico.estado === 'baja' && styles.tarjetaBaja]}
              onPress={() => router.push({ pathname: '/secretaria/medico', params: { matricula: medico.matricula } })}>
              <View style={[styles.avatar, medico.estado === 'baja' && styles.avatarBaja]}>
                <Text style={styles.avatarTexto}>{medico.iniciales}</Text>
              </View>
              <View style={styles.tarjetaTextos}>
                <Text style={styles.nombre}>{medico.nombre}</Text>
                <Text style={styles.detalle}>
                  {medico.especialidad} · {textoDeDias(medico.franjas)}
                </Text>
                <Text style={styles.detalle}>Mat. {medico.matricula}</Text>
              </View>
              <View style={styles.estadoCaja}>
                <Text style={[styles.estado, { color: COLORES_ESTADO_MEDICO[estadoEfectivo(medico)] }]}>
                  {ETIQUETAS_ESTADO_MEDICO[estadoEfectivo(medico)]}
                </Text>
                {estadoEfectivo(medico) === 'licencia' && medico.licenciaHasta && (
                  <Text style={styles.vuelve}>Vuelve el {formatearFecha(medico.licenciaHasta).slice(0, 5)}</Text>
                )}
              </View>
              <Text style={styles.flecha}>›</Text>
            </Pressable>
          ))}

        {pestana === 'secretarias' &&
          secretarias.map((secretaria) => (
            <View key={secretaria.nombre} style={styles.tarjeta}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{secretaria.iniciales}</Text>
              </View>
              <View style={styles.tarjetaTextos}>
                <Text style={styles.nombre}>{secretaria.nombre}</Text>
                <Text style={styles.detalle}>{secretaria.horario}</Text>
              </View>
              <Text style={[styles.estado, { color: COLOR_CONFIRMADO }]}>Activa</Text>
            </View>
          ))}

        {pestana === 'medicos' && !formularioAbierto && (
          <Pressable style={styles.botonAlta} onPress={() => setFormularioAbierto(true)}>
            <Text style={styles.botonAltaTexto}>+ Alta de médico</Text>
          </Pressable>
        )}

        {pestana === 'medicos' && formularioAbierto && (
          <View style={styles.formulario}>
            <Text style={styles.formularioTitulo}>Alta de médico</Text>

            <Text style={styles.etiqueta}>Nombre y apellido</Text>
            <TextInput
              style={styles.campo}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Dra. Laura Gómez"
              placeholderTextColor="#8FB9B5"
            />

            <Text style={styles.etiqueta}>Matrícula</Text>
            <TextInput
              style={styles.campo}
              value={matricula}
              onChangeText={setMatricula}
              placeholder="MN 000000"
              placeholderTextColor="#8FB9B5"
            />

            <Text style={styles.etiqueta}>Especialidad</Text>
            <TextInput
              style={styles.campo}
              value={especialidad}
              onChangeText={setEspecialidad}
              placeholder="Pediatría"
              placeholderTextColor="#8FB9B5"
            />

            <Text style={styles.etiqueta}>Horarios de atención</Text>
            <EditorHorarios franjas={franjas} onCambiar={setFranjas} />

            {error !== '' && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.botonGuardar} onPress={darDeAlta}>
              <Text style={styles.botonGuardarTexto}>Dar de alta</Text>
            </Pressable>
            <Pressable
              style={styles.cancelar}
              onPress={() => {
                setFormularioAbierto(false);
                setError('');
              }}>
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <MenuSecretaria activa="personal" />
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
  pestanas: {
    flexDirection: 'row',
    backgroundColor: '#D5ECE9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  pestana: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  pestanaActiva: {
    backgroundColor: '#FFFFFF',
  },
  pestanaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  pestanaTextoActiva: {
    color: COLOR_SECRETARIA,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLOR_SECRETARIA,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tarjetaTextos: {
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
  tarjetaBaja: {
    opacity: 0.6,
  },
  avatarBaja: {
    backgroundColor: '#8A8A8A',
  },
  flecha: {
    fontSize: 20,
    color: '#8A8A8A',
    marginLeft: 8,
  },
  estadoCaja: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  vuelve: {
    fontSize: 11,
    color: '#8A5A00',
    marginTop: 1,
  },
  estado: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  botonAlta: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLOR_SECRETARIA,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  botonAltaTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  formulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
  },
  formularioTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
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
    borderColor: '#B9DAD6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  error: {
    fontSize: 13,
    color: '#D64545',
    marginTop: 12,
  },
  botonGuardar: {
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  botonGuardarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelar: {
    alignItems: 'center',
    paddingTop: 12,
  },
  cancelarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A5A5A',
  },
});
