import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useConsultorio } from '@/contextos/ConsultorioContext';
import { obrasSocialesDe } from '@/datos/catalogo';

// Colores del selector: cambian según la pantalla (registro o editor de perfil, con modo claro u oscuro).
export type ColoresSelector = {
  acento: string;
  fondoMarcada: string;
  texto: string;
  borde: string;
  fondoCampo: string;
  textoTenue: string;
};

type Props = {
  coberturaIds: string[]; // las coberturas marcadas
  numerosAfiliado: Record<string, string>; // N° de afiliado de cada cobertura
  onCambiarCoberturas: (ids: string[]) => void;
  onCambiarNumeros: (numeros: Record<string, string>) => void;
  textoNumero: string; // lo que se muestra en el campo del N° de afiliado
  colores: ColoresSelector;
};

// Elegir obra social en dos niveles: se toca la obra social, se despliegan sus planes y se marca uno (uno por obra social).
export function SelectorCoberturas({
  coberturaIds,
  numerosAfiliado,
  onCambiarCoberturas,
  onCambiarNumeros,
  textoNumero,
  colores,
}: Props) {
  const { coberturas } = useConsultorio();
  // Las obras sociales con sus planes, armadas con lo que manda la API.
  const obrasSociales = obrasSocialesDe(coberturas);
  // Ids de las obras sociales que tienen sus planes desplegados.
  const [obrasAbiertas, setObrasAbiertas] = useState<string[]>([]);

  function alternarCobertura(id: string) {
    if (coberturaIds.includes(id)) {
      onCambiarCoberturas(coberturaIds.filter((c) => c !== id));
      return;
    }
    // Un solo plan por obra social: al marcar uno se sacan los otros planes de la misma obra social.
    // PAMI no tiene planes, así que no encuentra obra social y se marca sin sacar nada.
    const obra = obrasSociales.find((o) => o.planes.some((plan) => plan.id === id));
    const idsDeLaObra = obra ? obra.planes.map((plan) => plan.id) : [];
    onCambiarCoberturas([...coberturaIds.filter((c) => !idsDeLaObra.includes(c)), id]);
  }

  function alternarObra(id: string) {
    setObrasAbiertas(obrasAbiertas.includes(id) ? obrasAbiertas.filter((o) => o !== id) : [...obrasAbiertas, id]);
  }

  const estiloFila = { borderColor: colores.borde };
  const estiloFilaMarcada = { borderColor: colores.acento, backgroundColor: colores.fondoMarcada };

  // Fila con checkbox (y su N° de afiliado cuando está marcada). Sirve para un plan y para PAMI, que no tiene planes.
  function filaMarcable(id: string, nombreFila: string, esPlan: boolean) {
    const marcada = coberturaIds.includes(id);
    return (
      <View key={id}>
        <Pressable
          style={[styles.fila, estiloFila, esPlan && styles.sangriaPlan, marcada && estiloFilaMarcada]}
          onPress={() => alternarCobertura(id)}>
          <Text style={[styles.nombre, { color: colores.texto }]}>{nombreFila}</Text>
          <View style={[styles.checkbox, { borderColor: colores.acento }, marcada && { backgroundColor: colores.acento }]}>
            {marcada && <Text style={styles.tilde}>✓</Text>}
          </View>
        </Pressable>
        {marcada && (
          <TextInput
            style={[
              styles.campo,
              { backgroundColor: colores.fondoCampo, borderColor: colores.borde, color: colores.texto },
              esPlan && styles.sangriaPlan,
            ]}
            value={numerosAfiliado[id] ?? ''}
            onChangeText={(valor) => onCambiarNumeros({ ...numerosAfiliado, [id]: valor })}
            placeholder={textoNumero}
            placeholderTextColor={colores.textoTenue}
            maxLength={20}
          />
        )}
      </View>
    );
  }

  return (
    <View>
      {obrasSociales.map((obra) => {
        // Sin planes (PAMI): se marca directamente la obra social.
        if (obra.planes.length === 0) {
          return filaMarcable(obra.id, obra.nombre, false);
        }
        const abierta = obrasAbiertas.includes(obra.id);
        // Como mucho hay un plan marcado por obra social.
        const planElegido = obra.planes.find((plan) => coberturaIds.includes(plan.id));
        return (
          <View key={obra.id}>
            <Pressable
              style={[styles.fila, estiloFila, planElegido && estiloFilaMarcada]}
              onPress={() => alternarObra(obra.id)}>
              <Text style={[styles.nombre, { color: colores.texto }]}>{obra.nombre}</Text>
              <Text style={[styles.detalle, { color: colores.acento }]}>
                {planElegido ? `${planElegido.nombre}   ` : ''}
                {abierta ? '▴' : '▾'}
              </Text>
            </Pressable>
            {abierta && obra.planes.map((plan) => filaMarcable(plan.id, plan.nombre, true))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 8,
    marginBottom: 6,
  },
  // Los planes van corridos a la derecha, debajo de su obra social.
  sangriaPlan: {
    marginLeft: 18,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '600',
  },
  detalle: {
    fontSize: 13,
    fontWeight: '700',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tilde: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  campo: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 8,
  },
});
