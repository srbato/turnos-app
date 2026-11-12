import { StyleSheet, Switch, Text, View } from 'react-native';

import { COLOR_PACIENTE } from '@/constantes/colores';
import { DIAS_MINIMOS_ADELANTO } from '@/datos/adelantos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

type Props = {
  activo: boolean;
  onCambiar: (activo: boolean) => void;
};

// Opción del paciente: entrar a la lista de espera para que le ofrezcan adelantar su turno.
export function OpcionAdelanto({ activo, onCambiar }: Props) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'paciente'));
  const t = TEXTOS_PACIENTE[idioma];
  return (
    <View style={styles.fila}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{t.adelanto.opcionTitulo}</Text>
        <Text style={styles.detalle}>{t.adelanto.opcionDetalle(DIAS_MINIMOS_ADELANTO)}</Text>
      </View>
      <Switch
        value={activo}
        onValueChange={onCambiar}
        trackColor={{ true: COLOR_PACIENTE, false: '#C9D3E3' }}
      />
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  textos: {
    flex: 1,
    marginRight: 12,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: c.texto,
  },
  detalle: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 3,
  },
});
