import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_MEDICO, COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { useConsultorio } from '@/contextos/ConsultorioContext';
import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';
import { coberturaQueAtiende, Especialidad, Medico } from '@/datos/catalogo';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

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
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  return (
    <View style={styles.tarjeta}>
      <View style={styles.icono}>
        <Text style={styles.iconoTexto}>{especialidad.codigo}</Text>
      </View>
      <View style={styles.textos}>
        <Text style={styles.etiqueta}>{t.resumen.especialidad}</Text>
        <Text style={styles.valor}>{especialidad.nombre}</Text>
      </View>
      {onCambiar && (
        <Pressable onPress={onCambiar}>
          <Text style={styles.cambiar}>{t.comun.cambiar}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function ResumenMedico({ medico, onCambiar }: PropsMedico) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { coberturaIds } = usePerfilPaciente();
  const { coberturas } = useConsultorio();

  return (
    <View style={[styles.tarjeta, styles.tarjetaSeleccionada]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexto}>{medico.iniciales}</Text>
      </View>
      <View style={styles.textos}>
        <Text style={styles.etiqueta}>{t.resumen.profesional}</Text>
        <Text style={styles.valor}>{medico.nombre}</Text>
        <Text style={styles.subvalor}>{t.sacarTurno.atiende(coberturaQueAtiende(medico, coberturaIds, coberturas))}</Text>
      </View>
      {onCambiar && (
        <Pressable onPress={onCambiar}>
          <Text style={styles.cambiar}>{t.comun.cambiar}</Text>
        </Pressable>
      )}
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
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
    color: c.textoTenue,
  },
  valor: {
    fontSize: 15,
    fontWeight: '700',
    color: c.texto,
    marginTop: 1,
  },
  subvalor: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 1,
  },
  cambiar: {
    fontSize: 13,
    fontWeight: '600',
    color: c.acento,
  },
});
