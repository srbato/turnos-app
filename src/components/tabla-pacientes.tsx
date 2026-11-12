import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLOR_CANCELADO, COLOR_CONFIRMADO, COLOR_PENDIENTE } from '@/constantes/colores';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { useTurnos } from '@/contextos/TurnosContext';
import { evaluarRiesgo } from '@/datos/ausentismo';
import { Paciente } from '@/datos/consultorio';
import { buscarProximoTurno } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_MEDICO } from '@/datos/textos-medico';

type Props = {
  pacientes: Paciente[]; // los del consultorio activo
  color: string; // color del rol
  onElegir: (paciente: Paciente) => void; // tocar la fila: darle un turno
  onVerFicha: (paciente: Paciente) => void;
};

const COLOR_RIESGO = { bajo: COLOR_CONFIRMADO, 'en-riesgo': COLOR_PENDIENTE, alto: COLOR_CANCELADO };

// Tabla con todos los pacientes del consultorio: se busca por nombre, DNI u obra social, y al tocar una fila se elige
// al paciente (para darle un turno). Solo datos administrativos.
export function TablaPacientes({ pacientes, color, onElegir, onVerFicha }: Props) {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro));
  const t = TEXTOS_MEDICO[idioma];
  const { turnos } = useTurnos();
  const { reglasRiesgo } = useConfiguracion();
  const [busqueda, setBusqueda] = useState('');

  const texto = busqueda.trim().toLowerCase();
  const filtrados = pacientes
    .filter((p) => `${p.nombre} ${p.apellido} ${p.dni} ${p.cobertura}`.toLowerCase().includes(texto))
    .sort((a, b) => a.apellido.localeCompare(b.apellido));

  return (
    <View style={styles.contenedor}>
      <TextInput
        style={styles.buscador}
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder={t.tabla.buscador}
        placeholderTextColor="#8A8E95"
      />
      <Text style={styles.cantidad}>{t.tabla.cantidad(filtrados.length)}</Text>

      <View style={styles.tabla}>
        <View style={[styles.fila, styles.filaEncabezado]}>
          <Text style={[styles.encabezado, styles.colPaciente]}>{t.tabla.paciente}</Text>
          <Text style={[styles.encabezado, styles.colCobertura]}>{t.tabla.cobertura}</Text>
          <Text style={[styles.encabezado, styles.colProximo]}>{t.tabla.turno}</Text>
          <Text style={[styles.encabezado, styles.colRiesgo]}>{t.tabla.riesgo}</Text>
          <View style={styles.colFicha} />
        </View>

        <ScrollView style={styles.cuerpo} nestedScrollEnabled>
          {filtrados.length === 0 && <Text style={styles.vacio}>{t.tabla.vacio}</Text>}
          {filtrados.map((paciente, i) => {
            const proximo = buscarProximoTurno(turnos.filter((t) => t.idPaciente === paciente.id));
            const riesgo = evaluarRiesgo(paciente, turnos, reglasRiesgo);
            const [, mes, dia] = proximo ? proximo.fecha.split('-') : ['', '', ''];
            return (
              <View key={paciente.id} style={[styles.fila, i % 2 === 1 && styles.filaAlterna]}>
                <Pressable style={styles.cuerpoFila} onPress={() => onElegir(paciente)}>
                  <View style={styles.colPaciente}>
                    <Text style={styles.nombre} numberOfLines={1}>
                      {paciente.apellido}, {paciente.nombre}
                    </Text>
                    <Text style={styles.dni}>DNI {paciente.dni}</Text>
                  </View>
                  <Text style={[styles.celda, styles.colCobertura]} numberOfLines={2}>
                    {paciente.cobertura}
                  </Text>
                  <View style={styles.colProximo}>
                    {proximo ? (
                      <>
                        <Text style={styles.celda}>
                          {dia}/{mes}
                        </Text>
                        <Text style={styles.celdaChica}>{idioma === 'es' ? `${proximo.hora} h` : proximo.hora}</Text>
                      </>
                    ) : (
                      <Text style={styles.celdaChica}>—</Text>
                    )}
                  </View>
                  <View style={styles.colRiesgo}>
                    <View style={[styles.punto, { backgroundColor: COLOR_RIESGO[riesgo.nivel] }]} />
                    <Text style={styles.celdaChica}>{t.tabla.nivelesRiesgo[riesgo.nivel]}</Text>
                  </View>
                </Pressable>
                <Pressable style={styles.colFicha} onPress={() => onVerFicha(paciente)}>
                  <Text style={[styles.ficha, { color }]}>{t.tabla.ficha}</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 16,
  },
  buscador: {
    backgroundColor: c.tarjeta,
    borderWidth: 1,
    borderColor: c.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: c.texto,
  },
  cantidad: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textoSecundario,
    marginVertical: 10,
  },
  tabla: {
    flex: 1,
    backgroundColor: c.tarjeta,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cuerpo: {
    flex: 1,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
  },
  filaEncabezado: {
    backgroundColor: c.relleno,
    paddingVertical: 9,
  },
  filaAlterna: {
    backgroundColor: c.relleno,
  },
  cuerpoFila: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  encabezado: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textoSecundario,
    textTransform: 'uppercase',
  },
  colPaciente: {
    flex: 3,
    paddingRight: 6,
  },
  colCobertura: {
    flex: 1.8,
    paddingRight: 6,
  },
  colProximo: {
    flex: 1.3,
  },
  colRiesgo: {
    width: 46,
    alignItems: 'center',
  },
  colFicha: {
    width: 54,
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  nombre: {
    fontSize: 13,
    fontWeight: '700',
    color: c.texto,
  },
  dni: {
    fontSize: 11,
    color: c.textoTenue,
    marginTop: 1,
  },
  celda: {
    fontSize: 12,
    fontWeight: '600',
    color: c.texto,
  },
  celdaChica: {
    fontSize: 11,
    color: c.textoSecundario,
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 2,
  },
  ficha: {
    fontSize: 12,
    fontWeight: '700',
  },
  vacio: {
    fontSize: 14,
    color: c.textoSecundario,
    textAlign: 'center',
    padding: 24,
  },
});
