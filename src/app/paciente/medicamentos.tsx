import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Medicamento = {
  id: string;
  abreviatura: string;
  nombre: string;
  detalle: string;
  riesgo: boolean;
};

const MEDICAMENTOS: Medicamento[] = [
  {
    id: '1',
    abreviatura: 'ENA',
    nombre: 'Enalapril 10 mg',
    detalle: '1 comprimido · 8:00 h · hipertensión',
    riesgo: true,
  },
  {
    id: '2',
    abreviatura: 'IBU',
    nombre: 'Ibuprofeno 400 mg',
    detalle: 'Cada 8 h si hay dolor · automedicado',
    riesgo: true,
  },
  {
    id: '3',
    abreviatura: 'LEV',
    nombre: 'Levotiroxina 50 mcg',
    detalle: '1 comprimido en ayunas · tiroides',
    riesgo: false,
  },
  {
    id: '4',
    abreviatura: 'VIT',
    nombre: 'Vitamina D 2000 UI',
    detalle: '1 gota por día · con el almuerzo',
    riesgo: false,
  },
];

const COLOR_PACIENTE = '#2D6FE0';
const FONDO_PACIENTE = '#EAF2FE';
const COLOR_RIESGO = '#D64545';
const FONDO_RIESGO = '#FBDCDC';
const COLOR_OK = '#2F9E52';
const FONDO_OK = '#DCF3E3';

export default function MisMedicamentos() {
  const hayRiesgo = MEDICAMENTOS.some((medicamento) => medicamento.riesgo);
  const medicamentosRiesgo = MEDICAMENTOS.filter((medicamento) => medicamento.riesgo);

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.volver}>‹ Mis medicamentos</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.agregar}>+ Agregar</Text>
          </Pressable>
        </View>

        {hayRiesgo && (
          <View style={styles.alertaCaja}>
            <View style={styles.alertaEncabezado}>
              <View style={styles.alertaIcono}>
                <Text style={styles.alertaIconoTexto}>!</Text>
              </View>
              <Text style={styles.alertaTitulo}>Combinación riesgosa detectada</Text>
            </View>
            <Text style={styles.alertaTexto}>
              {medicamentosRiesgo.map((m) => m.nombre).join(' + ')}: el ibuprofeno puede subirte la
              presión y afectar el riñón.
            </Text>
            <View style={styles.alertaBotones}>
              <Pressable style={styles.botonAvisar}>
                <Text style={styles.botonAvisarTexto}>Avisar a mi médica</Text>
              </Pressable>
              <Pressable style={styles.botonMasInfo}>
                <Text style={styles.botonMasInfoTexto}>Más info</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Text style={styles.seccionTitulo}>Tratamiento actual</Text>

        {MEDICAMENTOS.map((medicamento) => (
          <View key={medicamento.id} style={styles.tarjeta}>
            <View
              style={[
                styles.tarjetaIcono,
                { backgroundColor: medicamento.riesgo ? FONDO_RIESGO : FONDO_PACIENTE },
              ]}>
              <Text
                style={[
                  styles.tarjetaIconoTexto,
                  { color: medicamento.riesgo ? COLOR_RIESGO : COLOR_PACIENTE },
                ]}>
                {medicamento.abreviatura}
              </Text>
            </View>
            <View style={styles.tarjetaTextos}>
              <Text style={styles.tarjetaNombre}>{medicamento.nombre}</Text>
              <Text style={styles.tarjetaDetalle}>{medicamento.detalle}</Text>
            </View>
            <View
              style={[
                styles.chipEstado,
                { backgroundColor: medicamento.riesgo ? FONDO_RIESGO : FONDO_OK },
              ]}>
              <Text
                style={[
                  styles.chipEstadoTexto,
                  { color: medicamento.riesgo ? COLOR_RIESGO : COLOR_OK },
                ]}>
                {medicamento.riesgo ? 'Riesgo' : 'OK'}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.notaCaja}>
          <Text style={styles.notaTexto}>
            La revisión se actualiza cada vez que agregás un medicamento o recibís una receta
            nueva.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <Pressable style={styles.tabItem} onPress={() => router.push('/paciente')}>
          <Text style={styles.tabIcono}>⌂</Text>
          <Text style={styles.tabTexto}>Inicio</Text>
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => router.push('/paciente/sacar-turno')}>
          <Text style={styles.tabIcono}>+</Text>
          <Text style={styles.tabTexto}>Turnos</Text>
        </Pressable>
        <View style={styles.tabItem}>
          <Text style={[styles.tabIcono, styles.tabIconoActivo]}>℞</Text>
          <Text style={[styles.tabTexto, styles.tabTextoActivo]}>Salud</Text>
        </View>
        <Pressable style={styles.tabItem} onPress={() => router.push('/perfil?rol=paciente')}>
          <Text style={styles.tabIcono}>◐</Text>
          <Text style={styles.tabTexto}>Perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: FONDO_PACIENTE,
  },
  contenido: {
    padding: 20,
    paddingBottom: 24,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  volver: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  agregar: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR_PACIENTE,
  },
  alertaCaja: {
    backgroundColor: FONDO_RIESGO,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  alertaEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertaIcono: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLOR_RIESGO,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  alertaIconoTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  alertaTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: COLOR_RIESGO,
  },
  alertaTexto: {
    fontSize: 13,
    color: '#7A2E2E',
    lineHeight: 19,
    marginBottom: 14,
  },
  alertaBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonAvisar: {
    flex: 1,
    backgroundColor: COLOR_RIESGO,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonAvisarTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  botonMasInfo: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonMasInfoTexto: {
    color: COLOR_RIESGO,
    fontSize: 13,
    fontWeight: '700',
  },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  tarjetaIcono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tarjetaIconoTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  tarjetaTextos: {
    flex: 1,
    marginRight: 10,
  },
  tarjetaNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tarjetaDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  chipEstado: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipEstadoTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  notaCaja: {
    borderWidth: 1,
    borderColor: '#C7D6F5',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  notaTexto: {
    fontSize: 12,
    color: '#5A5A5A',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabIcono: {
    fontSize: 20,
    color: '#9A9A9A',
  },
  tabIconoActivo: {
    color: COLOR_PACIENTE,
  },
  tabTexto: {
    fontSize: 11,
    color: '#9A9A9A',
    marginTop: 2,
  },
  tabTextoActivo: {
    color: COLOR_PACIENTE,
    fontWeight: '700',
  },
});
