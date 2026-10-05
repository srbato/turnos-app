import * as LocalAuthentication from 'expo-local-authentication';

// Pide Face ID / Touch ID / huella antes de un cambio de seguridad.
// Devuelve true si el usuario se verificó. Si el dispositivo no tiene biometría (por ejemplo, en la web)
// devuelve true: en ese caso la pantalla ya exigió la contraseña actual como verificación.
export async function confirmarIdentidad(): Promise<boolean> {
  try {
    const hayHardware = await LocalAuthentication.hasHardwareAsync();
    const hayBiometriaCargada = await LocalAuthentication.isEnrolledAsync();
    if (!hayHardware || !hayBiometriaCargada) {
      return true;
    }
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirmá tu identidad para cambiar tu seguridad',
    });
    return resultado.success;
  } catch {
    return false;
  }
}
