import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { FranjaHoraria, NOMBRES_DIAS, NOMBRES_DIAS_LARGOS, normalizarHora, ordenarFranjas, SEMANA } from '@/datos/atencion';

type Props = {
  franjas: FranjaHoraria[];
  onCambiar: (franjas: FranjaHoraria[]) => void; // recibe la lista completa, ya con el cambio
};

// Editor de los horarios de un médico: la lista de franjas (día, desde, hasta) y un formulario para agregar otra.
// Lo usa Secretaría en la ficha del médico y en el alta.
export function EditorHorarios({ franjas, onCambiar }: Props) {
  const [dia, setDia] = useState(-1); // -1 = ningún día elegido
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [error, setError] = useState('');

  function agregar() {
    const horaDesde = normalizarHora(desde);
    const horaHasta = normalizarHora(hasta);
    if (dia === -1) {
      setError('Elegí el día.');
      return;
    }
    if (horaDesde === '' || horaHasta === '') {
      setError('Escribí las horas así: 9, 9:30 o 14:00.');
      return;
    }
    if (horaDesde >= horaHasta) {
      setError('La hora de inicio tiene que ser anterior a la de fin.');
      return;
    }
    // Dos franjas del mismo día no se pueden pisar.
    const sePisa = franjas.some((franja) => franja.dia === dia && horaDesde < franja.hasta && franja.desde < horaHasta);
    if (sePisa) {
      setError('Se superpone con otro horario de ese día.');
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
        <Text style={styles.vacio}>Todavía no tiene horarios: no se le pueden dar turnos.</Text>
      )}
      {ordenarFranjas(franjas).map((franja) => (
        <View key={`${franja.dia}-${franja.desde}`} style={styles.fila}>
          <Text style={styles.filaDia}>{NOMBRES_DIAS_LARGOS[franja.dia]}</Text>
          <Text style={styles.filaHoras}>
            {franja.desde} a {franja.hasta}
          </Text>
          <Pressable onPress={() => quitar(franja)} hitSlop={8}>
            <Text style={styles.quitar}>Quitar</Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.etiqueta}>Agregar horario</Text>
      <View style={styles.dias}>
        {SEMANA.map((numero) => (
          <Pressable
            key={numero}
            style={[styles.diaChip, dia === numero && styles.diaChipActivo]}
            onPress={() => setDia(numero)}>
            <Text style={[styles.diaChipTexto, dia === numero && styles.diaChipTextoActivo]}>
              {NOMBRES_DIAS[numero]}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.horas}>
        <TextInput
          style={styles.campo}
          value={desde}
          onChangeText={setDesde}
          placeholder="Desde (9:00)"
          placeholderTextColor="#8FB9B5"
          maxLength={5}
        />
        <TextInput
          style={styles.campo}
          value={hasta}
          onChangeText={setHasta}
          placeholder="Hasta (13:00)"
          placeholderTextColor="#8FB9B5"
          maxLength={5}
        />
      </View>
      {error !== '' && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.botonAgregar} onPress={agregar}>
        <Text style={styles.botonAgregarTexto}>+ Agregar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: '#1A1A1A',
  },
  filaHoras: {
    flex: 1,
    fontSize: 14,
    color: '#3A3A3A',
  },
  quitar: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_CANCELADO,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
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
    borderColor: '#B9DAD6',
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
    color: '#3A3A3A',
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
    borderColor: '#B9DAD6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  error: {
    fontSize: 12,
    color: COLOR_CANCELADO,
    marginTop: 8,
  },
  // Botón solo (ocupa todo el ancho): no lleva flex.
  botonAgregar: {
    backgroundColor: FONDO_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botonAgregarTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
});
