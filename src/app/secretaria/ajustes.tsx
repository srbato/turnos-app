import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { MenuSecretaria } from '@/components/menu-secretaria';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { COLOR_CONFIRMADO, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { useConfiguracion } from '@/contextos/ConfiguracionContext';
import { DURACIONES_DE_TURNO } from '@/datos/atencion';
import { textoPuntaje } from '@/datos/ausentismo';
import { soloNumeros } from '@/utilidades/texto';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';

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
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  return (
    <View style={styles.contador}>
      <Pressable style={styles.contadorBoton} onPress={onMenos} accessibilityLabel={t.ajustes.restar} hitSlop={6}>
        <Text style={styles.contadorBotonTexto}>−</Text>
      </Pressable>
      <Text style={styles.contadorValor}>{texto}</Text>
      <Pressable style={styles.contadorBoton} onPress={onMas} accessibilityLabel={t.ajustes.sumar} hitSlop={6}>
        <Text style={styles.contadorBotonTexto}>+</Text>
      </Pressable>
    </View>
  );
}

export default function AjustesSecretaria() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
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


  async function guardar() {
    // El riesgo alto tiene que empezar más arriba que el medio, si no no habría nivel medio.
    if (riesgoAlto <= riesgoMedio) {
      setError(t.ajustes.errorRiesgo);
      setGuardado(false);
      return;
    }
    setError('');
    const cantidad = parseInt(sobreturnos, 10);
    const errorApi = await configuracion.guardarConfiguracion({
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
    if (errorApi !== '') {
      setError(errorApi);
      setGuardado(false);
      return;
    }
    setGuardado(true);
  }

  return (
    <PantallaConTeclado style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>{t.ajustes.titulo}</Text>
        <Text style={styles.subtitulo}>{t.ajustes.subtitulo}</Text>

        <Pressable style={styles.tarjetaPerfil} onPress={() => router.push('/perfil?rol=secretaria')}>
          <Text style={styles.perfilTexto}>{t.ajustes.miPerfil}</Text>
          <Text style={styles.perfilFlecha}>›</Text>
        </Pressable>

        <Text style={styles.seccion}>{t.ajustes.datos}</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>{t.ajustes.nombre}</Text>
          <TextInput style={styles.campo} value={nombre} onChangeText={(t) => { setNombre(t); setGuardado(false); }} />
          <Text style={styles.etiqueta}>{t.ajustes.direccion}</Text>
          <TextInput style={styles.campo} value={direccion} onChangeText={(t) => { setDireccion(t); setGuardado(false); }} />
          <Text style={styles.etiqueta}>{t.ajustes.ciudad}</Text>
          <TextInput style={styles.campo} value={ciudad} onChangeText={(t) => { setCiudad(t); setGuardado(false); }} />
          <Text style={styles.etiqueta}>{t.ajustes.telefono}</Text>
          <TextInput
            style={styles.campo}
            value={telefono}
            onChangeText={(t) => { setTelefono(t); setGuardado(false); }}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.seccion}>{t.ajustes.duracion}</Text>
        <View style={styles.tarjeta}>
          <View style={styles.duraciones}>
            {DURACIONES_DE_TURNO.map((minutos) => (
              <Pressable
                key={minutos}
                style={[styles.duracion, duracion === minutos && styles.duracionActiva]}
                onPress={() => { setDuracion(minutos); setGuardado(false); }}>
                <Text style={[styles.duracionTexto, duracion === minutos && styles.duracionTextoActiva]}>
                  {t.ajustes.minutos(minutos)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.nota}>{t.ajustes.notaDuracion(duracion, Math.floor(180 / duracion))}</Text>
        </View>

        <Text style={styles.seccion}>{t.ajustes.riesgo}</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.nota}>{t.ajustes.notaRiesgo}</Text>
          <View style={styles.filaContador}>
            <View style={styles.filaContadorTextos}>
              <Text style={styles.switchTitulo}>{t.ajustes.riesgoMedio}</Text>
              <Text style={styles.switchDetalle}>{t.ajustes.puntos}</Text>
            </View>
            <Contador
              valor={riesgoMedio}
              texto={textoPuntaje(riesgoMedio, idioma)}
              onMenos={() => { setRiesgoMedio(Math.max(PASO_PUNTOS, riesgoMedio - PASO_PUNTOS)); setGuardado(false); }}
              onMas={() => { setRiesgoMedio(Math.min(MAXIMO_PUNTOS, riesgoMedio + PASO_PUNTOS)); setGuardado(false); }}
            />
          </View>
          <View style={styles.filaContador}>
            <View style={styles.filaContadorTextos}>
              <Text style={styles.switchTitulo}>{t.ajustes.riesgoAlto}</Text>
              <Text style={styles.switchDetalle}>{t.ajustes.puntos}</Text>
            </View>
            <Contador
              valor={riesgoAlto}
              texto={textoPuntaje(riesgoAlto, idioma)}
              onMenos={() => { setRiesgoAlto(Math.max(PASO_PUNTOS, riesgoAlto - PASO_PUNTOS)); setGuardado(false); }}
              onMas={() => { setRiesgoAlto(Math.min(MAXIMO_PUNTOS, riesgoAlto + PASO_PUNTOS)); setGuardado(false); }}
            />
          </View>
          <View style={styles.filaContador}>
            <View style={styles.filaContadorTextos}>
              <Text style={styles.switchTitulo}>{t.ajustes.avisosAntes}</Text>
              <Text style={styles.switchDetalle}>{t.ajustes.avisosAntesDetalle}</Text>
            </View>
            <Contador
              valor={avisos}
              texto={String(avisos)}
              onMenos={() => { setAvisos(Math.max(1, avisos - 1)); setGuardado(false); }}
              onMas={() => { setAvisos(Math.min(MAXIMO_AVISOS, avisos + 1)); setGuardado(false); }}
            />
          </View>
        </View>

        <Text style={styles.seccion}>{t.ajustes.horariosYReglas}</Text>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>{t.ajustes.atencion}</Text>
          <TextInput style={styles.campo} value={atencion} onChangeText={(t) => { setAtencion(t); setGuardado(false); }} />
          <Text style={styles.etiqueta}>{t.ajustes.sobreturnos}</Text>
          <TextInput
            style={styles.campo}
            value={sobreturnos}
            onChangeText={(t) => { setSobreturnos(soloNumeros(t)); setGuardado(false); }}
            keyboardType="number-pad"
          />
          <View style={styles.filaSwitch}>
            <View style={styles.filaSwitchTextos}>
              <Text style={styles.switchTitulo}>{t.ajustes.recordatorio}</Text>
              <Text style={styles.switchDetalle}>{t.ajustes.recordatorioDetalle}</Text>
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
          <Text style={styles.botonGuardarTexto}>{t.ajustes.guardar}</Text>
        </Pressable>
        {guardado && <Text style={styles.confirmacion}>{t.ajustes.guardado}</Text>}
      </ScrollView>

      <MenuSecretaria activa="ajustes" />
    </PantallaConTeclado>
  );
}

const crearEstilos = (c: PaletaApp) => StyleSheet.create({
  pantalla: {
    flex: 1,
    paddingTop: MARGEN_SUPERIOR,
    backgroundColor: c.fondo,
  },
  contenido: {
    padding: 18,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 24,
    fontFamily: FUENTE_TITULOS,
    color: c.acento,
  },
  subtitulo: {
    fontSize: 13,
    color: c.textoSecundario,
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
    color: c.textoTenue,
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
  },
  tarjeta: {
    backgroundColor: c.tarjeta,
    borderRadius: 16,
    padding: 14,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    marginTop: 8,
    marginBottom: 6,
  },
  campo: {
    borderWidth: 1,
    borderColor: c.bordeAcento,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: c.texto,
  },
  duraciones: {
    flexDirection: 'row',
    gap: 8,
  },
  duracion: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.bordeAcento,
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
    color: c.texto,
  },
  duracionTextoActiva: {
    color: '#FFFFFF',
  },
  nota: {
    fontSize: 12,
    color: c.textoSecundario,
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
    color: c.acento,
  },
  contadorValor: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: c.texto,
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
    color: c.texto,
  },
  switchDetalle: {
    fontSize: 12,
    color: c.textoSecundario,
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
