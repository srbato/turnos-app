import { Image, StyleSheet, Text, View } from 'react-native';

import { usePerfilPaciente } from '@/contextos/PerfilPacienteContext';

type Props = {
  tamano: number;
  colorFondo?: string;
  colorTexto: string;
  colorBorde?: string;
  // Si se pasan, se muestran estos datos en lugar de los del paciente (por ejemplo, los de Secretaría).
  // Las iniciales son opcionales: un médico las trae armadas (RP), porque su nombre empieza con "Dr." o "Dra.".
  datos?: { nombre: string; fotoUri: string | null; iniciales?: string };
};

// Iniciales del nombre: las de las dos primeras palabras, o la primera letra si es una sola.
function iniciales(nombre: string) {
  const palabras = nombre.trim().split(/\s+/).filter((palabra) => palabra !== '');
  return palabras
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');
}

// Foto de perfil en círculo (del paciente, o de quien se pase en datos); si no eligió una, muestra sus iniciales.
export function AvatarPaciente({ tamano, colorFondo, colorTexto, colorBorde, datos }: Props) {
  const paciente = usePerfilPaciente();
  const { nombre, fotoUri } = datos ?? paciente;
  const letras = datos?.iniciales ?? iniciales(nombre);

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
          {letras}
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
