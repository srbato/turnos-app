import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_MEDICO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { coberturaQueAtiende, Especialidad, Medico } from '@/datos/catalogo';

// onCambiar es opcional: en Reprogramar la especialidad y el médico están fijos y no se muestra el link.
type PropsEspecialidad = {
  especialidad: Especialidad;
  onCambiar?: () => void;
};

type PropsMedico = {
  medico: Medico;
  onCambiar?: () => void;
};

// Tarjeta de un paso ya elegido, con el link "Cambiar" que vuelve a ese paso.
export function ResumenEspecialidad({ especialidad, onCambiar }: PropsEspecialidad) {
  return (
    <View style={styles.tarjeta}>
      <View style={styles.icono}>
        <Text style={styles.iconoTexto}>{especialidad.codigo}</Text>
      </View>
      <View style={styles.textos}>
        <Text style={styles.etiqueta}>Especialidad</Text>
        <Text style={styles.valor}>{especialidad.nombre}</Text>
      </View>
      {onCambiar && (
        <Pressable onPress={onCambiar}>
          <Text style={styles.cambiar}>Cambiar</Text>
        </Pressable>
      )}
    </View>
  );
}

export function ResumenMedico({ medico, onCambiar }: PropsMedico) {
  const { coberturaIds } = usePerfilPaciente();

  return (
    <View style={[styles.tarjeta, styles.tarjetaSeleccionada]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexto}>{medico.iniciales}</Text>
      </View>
      <View style={styles.textos}>
        <Text style={styles.etiqueta}>Profesional</Text>
        <Text style={styles.valor}>{medico.nombre}</Text>
        <Text style={styles.subvalor}>Atiende {coberturaQueAtiende(medico, coberturaIds)}</Text>
      </View>
      {onCambiar && (
        <Pressable onPress={onCambiar}>
          <Text style={styles.cambiar}>Cambiar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  tarjetaSeleccionada: {
    borderWidth: 1.5,
    borderColor: COLOR_PACIENTE,
    marginBottom: 20,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLOR_MEDICO,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textos: {
    flex: 1,
  },
  etiqueta: {
    fontSize: 11,
    color: '#8A8A8A',
  },
  valor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 1,
  },
  subvalor: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 1,
  },
  cambiar: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
});
