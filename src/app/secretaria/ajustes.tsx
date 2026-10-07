import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { MenuSecretaria } from '@/components/menu-secretaria';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { COLOR_CONFIRMADO, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { DURACIONES_DE_TURNO } from '@/datos/atencion';
import { textoPuntaje } from '@/datos/ausentismo';
import { soloNumeros } from '@/utilidades/texto';

const PASO_PUNTOS = 0.5;
const MAXIMO_PUNTOS = 10;
const MAXIMO_AVISOS = 5;

type PropsContador = {
  valor: number;
  texto: string; // el valor como se muestra ("1,5", "3")
  onMenos: () => void;
  onMas: () => void;
};

// Control de - / + para elegir un número sin escribirlo.
function Contador({ valor, texto, onMenos, onMas }: PropsContador) {
  return (
    <View style={styles.contador}>
      <Pressable style={styles.contadorBoton} onPress={onMenos} accessibilityLabel="Restar" hitSlop={6}>
        <Text style={styles.contadorBotonTexto}>−</Text>
      </Pressable>
      <Text style={styles.contadorValor}>{texto}</Text>
      <Pressable style={styles.contadorBoton} onPress={onMas} accessibilityLabel="Sumar" hitSlop={6}>
        <Text style={styles.contadorBotonTexto}>+</Text>
      </Pressable>
    </View>
  );
}

export default function AjustesSecretaria() {
  const configuracion = useConfiguracion();

  // Borrador local: los cambios se aplican recién al tocar "Guardar cambios".
  const [nombre, setNombre] = useState(configuracion.nombre);
  const [direccion, setDireccion] = useState(configuracion.direccion);
  const [ciudad, setCiudad] = useState(configuracion.ciudad);
  const [telefono, setTelefono] = useState(configuracion.telefono);
  const [duracion, setDuracion] = useState(configuracion.duracionTurno);
  const [atencion, setAtencion] = useState(configuracion.atencion);
  const [sobreturnos, setSobreturnos] = useState(String(configuracion.sobreturnos));
  const [recordatorio, setRecordatorio] = useState(configuracion.recordatorioAutomatico);
  const [riesgoMedio, setRiesgoMedio] = useState(configuracion.puntosRiesgoMedio);
  const [riesgoAlto, setRiesgoAlto] = useState(configuracion.puntosRiesgoAlto);
  const [avisos, setAvisos] = useState(configuracion.avisosAntesDeActuar);
  const [error, setError] = useState('');
  const [guardado, setGuardado] = useState(false);


  function guardar() {
    // El riesgo alto tiene que empezar más arriba que el medio, si no no habría nivel medio.
    if (riesgoAlto <= riesgoMedio) {
      setError('El riesgo alto tiene que empezar en más puntos que el riesgo medio.');
      setGuardado(false);
      return;
    }
    setError('');
    const cantidad = parseInt(sobreturnos, 10);
    configuracion.guardarConfiguracion({
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      ciudad: ciudad.trim(),
      telefono: telefono.trim(),
      duracionTurno: duracion,
      atencion: atencion.trim(),
      sobreturnos: Number.isNaN(cantidad) ? 0 : cantidad,
      recordatorioAutomatico: recordatorio,
      puntosRiesgoMedio: riesgoMedio,
      puntosRiesgoAlto: riesgoAlto,
      avisosAntesDeActuar: avisos,
    });
    setGuardado(true);
  }

  return (
    <PantallaConTeclado style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Configuración</Text>
        <Text style={styles.subtitulo}>Datos y reglas del consultorio</Text>

        <Pressable style={styles.tarjetaPerfil} onPress={() => router.push('/perfil?rol=secretaria')}>
          <Text style={styles.perfilTexto}>Mi perfil</Text>
          <Text style={styles.perfilFlecha}>›</Text>
        </Pressable>

        <Text style={styles.seccion}>DATOS DEL CONSULTORIO</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Nombre</Text>
          <TextInput style={styles.campo} value={nombre} onChangeText={(t) => { setNombre(t); setGuardado(false); }} />
          <Text style={styles.etiqueta}>Dirección</Text>
          <TextInput style={styles.campo} value={direccion} onChangeText={(t) => { setDireccion(t); setGuardado(false); }} />
          <Text style={styles.etiqueta}>Ciudad</Text>
          <TextInput style={styles.campo} value={ciudad} onChangeText={(t) => { setCiudad(t); setGuardado(false); }} />
          <Text style={styles.etiqueta}>Teléfono</Text>
          <TextInput
            style={styles.campo}
            value={telefono}
            onChangeText={(t) => { setTelefono(t); setGuardado(false); }}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.seccion}>DURACIÓN DE TURNO</Text>
        <View style={styles.tarjeta}>
          <View style={styles.duraciones}>
            {DURACIONES_DE_TURNO.map((minutos) => (
              <Pressable
                key={minutos}
                style={[styles.duracion, duracion === minutos && styles.duracionActiva]}
                onPress={() => { setDuracion(minutos); setGuardado(false); }}>
                <Text style={[styles.duracionTexto, duracion === minutos && styles.duracionTextoActiva]}>
                  {minutos} min
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.nota}>
            Cada médico atiende en sus propios horarios (se cargan en su ficha, en Personal). Con {duracion} minutos, un
            horario de 9 a 12 tiene {Math.floor(180 / duracion)} turnos. Es la misma duración para pacientes, médicos y
            Secretaría. Los turnos que ya están cargados se mantienen.
          </Text>
        </View>

        <Text style={styles.seccion}>RIESGO DE INASISTENCIA</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.nota}>
            Cada falta suma 1 punto; asistir resta 0,5 y confirmar un turno resta 0,2. Acá definís desde cuántos puntos un
            paciente se considera de riesgo.
          </Text>
          <View style={styles.filaContador}>
            <View style={styles.filaContadorTextos}>
              <Text style={styles.switchTitulo}>Riesgo medio desde</Text>
              <Text style={styles.switchDetalle}>puntos</Text>
            </View>
            <Contador
              valor={riesgoMedio}
              texto={textoPuntaje(riesgoMedio)}
              onMenos={() => { setRiesgoMedio(Math.max(PASO_PUNTOS, riesgoMedio - PASO_PUNTOS)); setGuardado(false); }}
              onMas={() => { setRiesgoMedio(Math.min(MAXIMO_PUNTOS, riesgoMedio + PASO_PUNTOS)); setGuardado(false); }}
            />
          </View>
          <View style={styles.filaContador}>
            <View style={styles.filaContadorTextos}>
              <Text style={styles.switchTitulo}>Riesgo alto desde</Text>
              <Text style={styles.switchDetalle}>puntos</Text>
            </View>
            <Contador
              valor={riesgoAlto}
              texto={textoPuntaje(riesgoAlto)}
              onMenos={() => { setRiesgoAlto(Math.max(PASO_PUNTOS, riesgoAlto - PASO_PUNTOS)); setGuardado(false); }}
              onMas={() => { setRiesgoAlto(Math.min(MAXIMO_PUNTOS, riesgoAlto + PASO_PUNTOS)); setGuardado(false); }}
            />
          </View>
          <View style={styles.filaContador}>
            <View style={styles.filaContadorTextos}>
              <Text style={styles.switchTitulo}>Avisos antes de actuar</Text>
              <Text style={styles.switchDetalle}>
                Los que mandás a un paciente de riesgo alto antes de poder reprogramar o cancelar su turno
              </Text>
            </View>
            <Contador
              valor={avisos}
              texto={String(avisos)}
              onMenos={() => { setAvisos(Math.max(1, avisos - 1)); setGuardado(false); }}
              onMas={() => { setAvisos(Math.min(MAXIMO_AVISOS, avisos + 1)); setGuardado(false); }}
            />
          </View>
        </View>

        <Text style={styles.seccion}>HORARIOS Y REGLAS</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Atención</Text>
          <TextInput style={styles.campo} value={atencion} onChangeText={(t) => { setAtencion(t); setGuardado(false); }} />
          <Text style={styles.etiqueta}>Sobreturnos por día</Text>
          <TextInput
            style={styles.campo}
            value={sobreturnos}
            onChangeText={(t) => { setSobreturnos(soloNumeros(t)); setGuardado(false); }}
            keyboardType="number-pad"
          />
          <View style={styles.filaSwitch}>
            <View style={styles.filaSwitchTextos}>
              <Text style={styles.switchTitulo}>Recordatorio automático</Text>
              <Text style={styles.switchDetalle}>Aviso al paciente 24 h antes del turno</Text>
            </View>
            <Switch
              value={recordatorio}
              onValueChange={(valor) => { setRecordatorio(valor); setGuardado(false); }}
              trackColor={{ true: COLOR_SECRETARIA, false: '#C9D6D4' }}
            />
          </View>
        </View>

        {error !== '' && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.botonGuardar} onPress={guardar}>
          <Text style={styles.botonGuardarTexto}>Guardar cambios</Text>
        </Pressable>
        {guardado && <Text style={styles.confirmacion}>Cambios guardados ✓</Text>}
      </ScrollView>

      <MenuSecretaria activa="ajustes" />
    </PantallaConTeclado>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: FONDO_SECRETARIA,
  },
  contenido: {
    padding: 18,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  subtitulo: {
    fontSize: 13,
    color: '#5A5A5A',
    marginTop: 2,
    marginBottom: 14,
  },
  tarjetaPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  perfilTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  perfilFlecha: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  seccion: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5A5A5A',
    marginTop: 8,
    marginBottom: 6,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1A',
  },
  duraciones: {
    flexDirection: 'row',
    gap: 8,
  },
  duracion: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B9DAD6',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  duracionActiva: {
    backgroundColor: COLOR_SECRETARIA,
    borderColor: COLOR_SECRETARIA,
  },
  duracionTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  duracionTextoActiva: {
    color: '#FFFFFF',
  },
  nota: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 10,
  },
  filaContador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  filaContadorTextos: {
    flex: 1,
    marginRight: 10,
  },
  contador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contadorBoton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLOR_SECRETARIA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorBotonTexto: {
    fontSize: 18,
    fontWeight: '700',
    color: COLOR_SECRETARIA,
  },
  contadorValor: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  error: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D64545',
    textAlign: 'center',
    marginTop: 14,
  },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  filaSwitchTextos: {
    flex: 1,
  },
  switchTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  switchDetalle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginTop: 2,
  },
  botonGuardar: {
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  botonGuardarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  confirmacion: {
    fontSize: 13,
    fontWeight: '600',
    color: COLOR_CONFIRMADO,
    textAlign: 'center',
    marginTop: 10,
  },
});
