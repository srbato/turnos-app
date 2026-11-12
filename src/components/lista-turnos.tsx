import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { CancelarTurnoModal, DetalleTurnoModal } from '@/components/modales-turno';
import { COLOR_PACIENTE, FONDO_PACIENTE } from '@/constantes/colores';
import { Turno } from '@/contextos/TurnosContext';
import { COLORES_ESTADO, detalleFecha, ETIQUETAS_ESTADO } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

type Props = {
  turnos: Turno[];
  textoVacio: string;
};

// Lista de turnos para las tabs de Mis turnos. Tocar un turno abre el mismo detalle que el home.
export function ListaTurnos({ turnos, textoVacio }: Props) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);
  const [turnoACancelar, setTurnoACancelar] = useState<Turno | null>(null);

  return (
    <View style={styles.pantalla}>
      <FlatList
        contentContainerStyle={[styles.contenido, turnos.length === 0 && styles.contenidoVacio]}
        data={turnos}
        keyExtractor={(turno) => turno.id}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioTexto}>{textoVacio}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.tarjeta} onPress={() => setTurnoSeleccionado(item)}>
            <View style={styles.fechaCaja}>
              <Text style={styles.fechaDia}>{detalleFecha(item.fecha, idioma).dia}</Text>
              <Text style={styles.fechaMes}>{detalleFecha(item.fecha, idioma).mes}</Text>
            </View>
            <View style={styles.datos}>
              <Text style={styles.medico}>{item.medico}</Text>
              <Text style={styles.especialidad}>{item.especialidad}</Text>
              <Text style={styles.hora}>
                {t.home.hora(detalleFecha(item.fecha, idioma).diaSemana, item.hora)}
              </Text>
            </View>
            <View style={[styles.chipEstado, { backgroundColor: COLORES_ESTADO[item.estado] }]}>
              <Text style={styles.chipEstadoTexto}>{t.estados[item.estado]}</Text>
            </View>
          </Pressable>
        )}
      />

      <DetalleTurnoModal
        turno={turnoSeleccionado}
        onCerrar={() => setTurnoSeleccionado(null)}
        onCancelar={setTurnoACancelar}
      />
      <CancelarTurnoModal turno={turnoACancelar} onCerrar={() => setTurnoACancelar(null)} />
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
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  fechaCaja: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: c.chipAzul,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fechaDia: {
    fontSize: 17,
    fontWeight: '700',
    color: c.acento,
  },
  fechaMes: {
    fontSize: 11,
    fontWeight: '600',
    color: c.acento,
  },
  datos: {
    flex: 1,
  },
  medico: {
    fontSize: 15,
    fontWeight: '700',
    color: c.texto,
  },
  especialidad: {
    fontSize: 13,
    color: c.textoSecundario,
    marginTop: 2,
  },
  hora: {
    fontSize: 13,
    fontWeight: '600',
    color: c.acento,
    marginTop: 3,
  },
  chipEstado: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipEstadoTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  vacio: {
    paddingHorizontal: 20,
  },
  vacioTexto: {
    fontSize: 14,
    color: c.textoSecundario,
    textAlign: 'center',
  },
});
