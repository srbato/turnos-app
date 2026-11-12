import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { aceptaTurnos, usePersonal } from '@/contextos/PersonalContext';
import { useSacarTurno } from '@/contextos/SacarTurnoContext';
import { especialidadesDe, Especialidad } from '@/datos/catalogo';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

export default function ElegirEspecialidad() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const { elegirEspecialidad } = useSacarTurno();
  const { medicos: personal } = usePersonal();
  // Solo las especialidades que tienen algún médico que atiende (no de baja ni de licencia sin fecha).
  const especialidades = especialidadesDe(personal.filter((medico) => aceptaTurnos(personal, medico.nombre)));

  function elegir(especialidad: Especialidad) {
    elegirEspecialidad(especialidad);
    router.push('/paciente/sacar-turno/medico');
  }

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      data={especialidades}
      keyExtractor={(especialidad) => especialidad.id}
      ListHeaderComponent={<Text style={styles.titulo}>{t.sacarTurno.tituloEspecialidad}</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.tarjeta} onPress={() => elegir(item)}>
          <View style={styles.icono}>
            <Text style={styles.iconoTexto}>{item.codigo}</Text>
          </View>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.flecha}>›</Text>
        </Pressable>
      )}
    />
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
  titulo: {
    fontSize: 15,
    fontWeight: '600',
    color: c.textoSecundario,
    marginBottom: 12,
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
  nombre: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: c.texto,
  },
  flecha: {
    fontSize: 22,
    color: '#B7C6E8',
  },
});
