import { Image, StyleSheet, Text, View } from 'react-native';

import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';

type Props = {
  tamano: number;
  colorFondo?: string;
  colorTexto: string;
  colorBorde?: string;
};

// Iniciales del nombre: las de las dos primeras palabras, o la primera letra si es una sola.
function iniciales(nombre: string) {
  const palabras = nombre.trim().split(/\s+/).filter((palabra) => palabra !== '');
  return palabras
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');
}

// Foto de perfil del paciente en círculo; si no eligió una, muestra sus iniciales.
export function AvatarPaciente({ tamano, colorFondo, colorTexto, colorBorde }: Props) {
  const { nombre, fotoUri } = usePerfilPaciente();

  const caja = {
    width: tamano,
    height: tamano,
    borderRadius: tamano / 2,
    backgroundColor: colorFondo,
    borderColor: colorBorde,
    borderWidth: colorBorde ? 2 : 0,
  };

  return (
    <View style={[styles.caja, caja]}>
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.foto} resizeMode="cover" />
      ) : (
        <Text style={{ color: colorTexto, fontSize: tamano / 3, fontWeight: '700' }}>
          {iniciales(nombre)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  foto: {
    width: '100%',
    height: '100%',
  },
});
