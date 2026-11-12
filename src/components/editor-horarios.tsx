import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { FranjaHoraria, NOMBRES_DIAS, NOMBRES_DIAS_LARGOS, normalizarHora, ordenarFranjas, SEMANA } from '@/datos/atencion';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';

type Props = {
  franjas: FranjaHoraria[];
  onCambiar: (franjas: FranjaHoraria[]) => void; // recibe la lista completa, ya con el cambio
};

// Editor de los horarios de un médico: la lista de franjas (día, desde, hasta) y un formulario para agregar otra.
// Lo usa Secretaría en la ficha del médico y en el alta.
export function EditorHorarios({ franjas, onCambiar }: Props) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  const [dia, setDia] = useState(-1); // -1 = ningún día elegido
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [error, setError] = useState('');

  function agregar() {
    const horaDesde = normalizarHora(desde);
    const horaHasta = normalizarHora(hasta);
    if (dia === -1) {
      setError(t.editor.errores.dia);
      return;
    }
    if (horaDesde === '' || horaHasta === '') {
      setError(t.editor.errores.horas);
      return;
    }
    if (horaDesde >= horaHasta) {
      setError(t.editor.errores.orden);
      return;
    }
    // Dos franjas del mismo día no se pueden pisar.
    const sePisa = franjas.some((franja) => franja.dia === dia && horaDesde < franja.hasta && franja.desde < horaHasta);
    if (sePisa) {
      setError(t.editor.errores.superpone);
      return;
    }
    onCambiar([...franjas, { dia: dia, desde: horaDesde, hasta: horaHasta }]);
    setDesde('');
    setHasta('');
    setError('');
  }

  function quitar(franjaQuitada: FranjaHoraria) {
    onCambiar(franjas.filter((franja) => franja !== franjaQuitada));
  }

  return (
    <View>
      {franjas.length === 0 && (
        <Text style={styles.vacio}>{t.editor.sinHorarios}</Text>
      )}
      {ordenarFranjas(franjas).map((franja) => (
        <View key={`${franja.dia}-${franja.desde}`} style={styles.fila}>
          <Text style={styles.filaDia}>{t.diasLargos[franja.dia]}</Text>
          <Text style={styles.filaHoras}>
            {t.editor.a(franja.desde, franja.hasta)}
          </Text>
          <Pressable onPress={() => quitar(franja)} hitSlop={8}>
            <Text style={styles.quitar}>{t.editor.quitar}</Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.etiqueta}>{t.editor.agregar}</Text>
      <View style={styles.dias}>
        {SEMANA.map((numero) => (
          <Pressable
            key={numero}
            style={[styles.diaChip, dia === numero && styles.diaChipActivo]}
            onPress={() => setDia(numero)}>
            <Text style={[styles.diaChipTexto, dia === numero && styles.diaChipTextoActivo]}>
              {t.dias[numero]}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.horas}>
        <TextInput
          style={styles.campo}
          value={desde}
          onChangeText={setDesde}
          placeholder={t.editor.desde}
          placeholderTextColor="#8FB9B5"
          maxLength={5}
        />
        <TextInput
          style={styles.campo}
          value={hasta}
          onChangeText={setHasta}
          placeholder={t.editor.hasta}
          placeholderTextColor="#8FB9B5"
          maxLength={5}
        />
      </View>
      {error !== '' && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.botonAgregar} onPress={agregar}>
        <Text style={styles.botonAgregarTexto}>{t.editor.boton}</Text>
      </Pressable>
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  vacio: {
    fontSize: 13,
    color: COLOR_CANCELADO,
    marginBottom: 4,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F2',
  },
  filaDia: {
    width: 90,
    fontSize: 14,
    fontWeight: '700',
    color: c.texto,
  },
  filaHoras: {
    flex: 1,
    fontSize: 14,
    color: c.texto,
  },
  quitar: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_CANCELADO,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    marginTop: 14,
    marginBottom: 6,
  },
  // Los 7 días en una sola fila, todos del mismo ancho.
  dias: {
    flexDirection: 'row',
    gap: 4,
  },
  diaChip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.bordeAcento,
    borderRadius: 999,
    paddingVertical: 6,
  },
  diaChipActivo: {
    backgroundColor: COLOR_SECRETARIA,
    borderColor: COLOR_SECRETARIA,
  },
  diaChipTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: c.texto,
  },
  diaChipTextoActivo: {
    color: '#FFFFFF',
  },
  horas: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  // minWidth: 0 deja que los dos campos se achiquen para entrar en la fila (si no, el segundo se sale de la tarjeta).
  campo: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: c.bordeAcento,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: c.texto,
  },
  error: {
    fontSize: 12,
    color: COLOR_CANCELADO,
    marginTop: 8,
  },
  // Botón solo (ocupa todo el ancho): no lleva flex.
  botonAgregar: {
    backgroundColor: c.chipAzul,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botonAgregarTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: c.acento,
  },
});
