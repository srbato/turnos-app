import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { EditorHorarios } from '@/components/editor-horarios';
import { MenuSecretaria } from '@/components/menu-secretaria';
import { PantallaConTeclado } from '@/components/pantalla-con-teclado';
import { COLOR_CONFIRMADO, COLOR_PENDIENTE, COLOR_SECRETARIA, FONDO_SECRETARIA } from '@/constantes/colores';
import { FUENTE_TITULOS } from '@/constantes/fuentes';
import { MARGEN_SUPERIOR } from '@/constantes/pantalla';
import { estadoEfectivo, usePersonal } from '@/contextos/PersonalContext';
import { FranjaHoraria, textoDeDias } from '@/datos/atencion';
import { formatearFecha } from '@/utilidades/turnos';
import { PaletaApp, paletaApp } from '@/constantes/paleta-app';
import { usePreferencias } from '@/contextos/PreferenciasContext';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';
import { TEXTOS_SECRETARIA } from '@/datos/textos-secretaria';

type Pestana = 'medicos' | 'secretarias';

const COLORES_ESTADO_MEDICO = { activo: COLOR_CONFIRMADO, licencia: COLOR_PENDIENTE, baja: '#8A8A8A' };

export default function PersonalSecretaria() {
  const { idioma, modoOscuro } = usePreferencias();
  const styles = crearEstilos(paletaApp(modoOscuro, 'secretaria'));
  const t = TEXTOS_SECRETARIA[idioma];
  const { medicos, secretarias, altaMedico } = usePersonal();

  const [pestana, setPestana] = useState<Pestana>('medicos');
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [matricula, setMatricula] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [franjas, setFranjas] = useState<FranjaHoraria[]>([]);
  const [error, setError] = useState('');

  async function darDeAlta() {
    if (nombre.trim() === '' || matricula.trim() === '' || especialidad.trim() === '' || email.trim() === '') {
      setError(t.personal.errores.completar);
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError(t.personal.errores.email);
      return;
    }
    if (contrasena.length < 6) {
      setError(t.personal.errores.contrasena);
      return;
    }
    if (franjas.length === 0) {
      setError(t.personal.errores.horario);
      return;
    }
    if (medicos.some((medico) => medico.matricula === matricula.trim())) {
      setError(t.personal.errores.matricula);
      return;
    }
    // El médico ingresa a la app con este email y esta contraseña.
    const errorApi = await altaMedico({
      nombre: nombre.trim(),
      matricula: matricula.trim(),
      especialidad: especialidad.trim(),
      email: email.trim(),
      contrasena: contrasena,
      franjas: franjas,
    });
    if (errorApi !== '') {
      setError(errorApi);
      return;
    }
    setNombre('');
    setMatricula('');
    setEspecialidad('');
    setEmail('');
    setContrasena('');
    setFranjas([]);
    setError('');
    setFormularioAbierto(false);
  }

  return (
    <PantallaConTeclado style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>{t.personal.titulo}</Text>
        <Text style={styles.subtitulo}>
          {t.personal.subtitulo(medicos.filter((medico) => medico.estado !== 'baja').length, secretarias.length)}
        </Text>

        <View style={styles.pestanas}>
          <Pressable
            style={[styles.pestana, pestana === 'medicos' && styles.pestanaActiva]}
            onPress={() => setPestana('medicos')}>
            <Text style={[styles.pestanaTexto, pestana === 'medicos' && styles.pestanaTextoActiva]}>{t.personal.medicos}</Text>
          </Pressable>
          <Pressable
            style={[styles.pestana, pestana === 'secretarias' && styles.pestanaActiva]}
            onPress={() => setPestana('secretarias')}>
            <Text style={[styles.pestanaTexto, pestana === 'secretarias' && styles.pestanaTextoActiva]}>{t.personal.secretarias}</Text>
          </Pressable>
        </View>

        {pestana === 'medicos' &&
          [...medicos].sort((a, b) => Number(a.estado === 'baja') - Number(b.estado === 'baja')).map((medico) => (
            <Pressable
              key={medico.id}
              style={[styles.tarjeta, medico.estado === 'baja' && styles.tarjetaBaja]}
              onPress={() => router.push({ pathname: '/secretaria/medico', params: { id: medico.id } })}>
              <View style={[styles.avatar, medico.estado === 'baja' && styles.avatarBaja]}>
                <Text style={styles.avatarTexto}>{medico.iniciales}</Text>
              </View>
              <View style={styles.tarjetaTextos}>
                <Text style={styles.nombre}>{medico.nombre}</Text>
                <Text style={styles.detalle}>
                  {medico.especialidad} · {textoDeDias(medico.franjas, idioma)}
                </Text>
                <Text style={styles.detalle}>{t.personal.matricula(medico.matricula)}</Text>
              </View>
              <View style={styles.estadoCaja}>
                <Text style={[styles.estado, { color: COLORES_ESTADO_MEDICO[estadoEfectivo(medico)] }]}>
                  {t.personal.estados[estadoEfectivo(medico)]}
                </Text>
                {estadoEfectivo(medico) === 'licencia' && medico.licenciaHasta && (
                  <Text style={styles.vuelve}>{t.personal.vuelveEl(formatearFecha(medico.licenciaHasta).slice(0, 5))}</Text>
                )}
              </View>
              <Text style={styles.flecha}>›</Text>
            </Pressable>
          ))}

        {pestana === 'secretarias' &&
          secretarias.map((secretaria) => (
            <View key={secretaria.id} style={styles.tarjeta}>
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>{secretaria.iniciales}</Text>
              </View>
              <View style={styles.tarjetaTextos}>
                <Text style={styles.nombre}>{secretaria.nombre}</Text>
                <Text style={styles.detalle}>{secretaria.horario}</Text>
              </View>
              <Text style={[styles.estado, { color: COLOR_CONFIRMADO }]}>{t.personal.activa}</Text>
            </View>
          ))}

        {pestana === 'medicos' && !formularioAbierto && (
          <Pressable style={styles.botonAlta} onPress={() => setFormularioAbierto(true)}>
            <Text style={styles.botonAltaTexto}>{t.personal.alta}</Text>
          </Pressable>
        )}

        {pestana === 'medicos' && formularioAbierto && (
          <View style={styles.formulario}>
            <Text style={styles.formularioTitulo}>{t.personal.altaTitulo}</Text>

            <Text style={styles.etiqueta}>{t.personal.nombre}</Text>
            <TextInput
              style={styles.campo}
              value={nombre}
              onChangeText={setNombre}
              placeholder={t.personal.nombreEjemplo}
              placeholderTextColor="#8FB9B5"
            />

            <Text style={styles.etiqueta}>{t.personal.matriculaCampo}</Text>
            <TextInput
              style={styles.campo}
              value={matricula}
              onChangeText={setMatricula}
              placeholder="MN 000000"
              placeholderTextColor="#8FB9B5"
            />

            <Text style={styles.etiqueta}>{t.personal.especialidad}</Text>
            <TextInput
              style={styles.campo}
              value={especialidad}
              onChangeText={setEspecialidad}
              placeholder={t.personal.especialidadEjemplo}
              placeholderTextColor="#8FB9B5"
            />

            <Text style={styles.etiqueta}>{t.personal.email}</Text>
            <TextInput
              style={styles.campo}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="laura.gomez@consultorio.com"
              placeholderTextColor="#8FB9B5"
            />

            <Text style={styles.etiqueta}>{t.personal.contrasena}</Text>
            <TextInput
              style={styles.campo}
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry
              placeholder={t.personal.contrasenaEjemplo}
              placeholderTextColor="#8FB9B5"
            />

            <Text style={styles.etiqueta}>{t.personal.horarios}</Text>
            <EditorHorarios franjas={franjas} onCambiar={setFranjas} />

            {error !== '' && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.botonGuardar} onPress={darDeAlta}>
              <Text style={styles.botonGuardarTexto}>{t.personal.darDeAlta}</Text>
            </Pressable>
            <Pressable
              style={styles.cancelar}
              onPress={() => {
                setFormularioAbierto(false);
                setError('');
              }}>
              <Text style={styles.cancelarTexto}>{t.personal.cancelar}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <MenuSecretaria activa="personal" />
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
  pestanas: {
    flexDirection: 'row',
    backgroundColor: c.chipAzul,
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  pestana: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  pestanaActiva: {
    backgroundColor: c.tarjeta,
  },
  pestanaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textoSecundario,
  },
  pestanaTextoActiva: {
    color: c.acento,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.tarjeta,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLOR_SECRETARIA,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tarjetaTextos: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: c.texto,
  },
  detalle: {
    fontSize: 12,
    color: c.textoSecundario,
    marginTop: 2,
  },
  tarjetaBaja: {
    opacity: 0.6,
  },
  avatarBaja: {
    backgroundColor: '#8A8A8A',
  },
  flecha: {
    fontSize: 20,
    color: c.textoTenue,
    marginLeft: 8,
  },
  estadoCaja: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  vuelve: {
    fontSize: 11,
    color: '#8A5A00',
    marginTop: 1,
  },
  estado: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  botonAlta: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLOR_SECRETARIA,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  botonAltaTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: c.acento,
  },
  formulario: {
    backgroundColor: c.tarjeta,
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
  },
  formularioTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: c.texto,
    marginBottom: 4,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: c.textoSecundario,
    marginTop: 12,
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
  error: {
    fontSize: 13,
    color: '#D64545',
    marginTop: 12,
  },
  botonGuardar: {
    backgroundColor: COLOR_SECRETARIA,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  botonGuardarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelar: {
    alignItems: 'center',
    paddingTop: 12,
  },
  cancelarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textoSecundario,
  },
});
