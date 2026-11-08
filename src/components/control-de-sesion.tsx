import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { RUTA_AGENDA_SECRETARIA } from '@/constantes/rutas';
import { Rol, useSesion } from '@/contextos/SesionContext';

function irAlInicioDelRol(rol: Rol) {
  if (rol === 'paciente') {
    router.replace('/paciente');
  } else if (rol === 'medico') {
    router.replace('/medico');
  } else {
    router.replace(RUTA_AGENDA_SECRETARIA);
  }
}

// Decide a dónde puede entrar cada uno según su sesión. No dibuja nada: solo redirige.
//   - Sin sesión: solo la pantalla de inicio, el login y el registro.
//   - Con sesión: va directo a su inicio y no puede abrir las pantallas de otro rol.
export function ControlDeSesion() {
  const { usuario, sesionCargada } = useSesion();
  const ruta = usePathname();

  useEffect(() => {
    // Hasta leer la sesión guardada en el dispositivo todavía no se sabe quién es.
    if (!sesionCargada) {
      return;
    }

    // '/secretaria/personal' -> 'secretaria'
    const seccion = ruta.split('/')[1];
    const esPublica = seccion === '' || seccion === 'login' || seccion === 'registro';

    if (usuario === null) {
      if (!esPublica) {
        // Se vacía la pila de pantallas: así deslizar hacia atrás no vuelve a una pantalla de la sesión que se cerró.
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace('/');
      }
      return;
    }

    const esDeOtroRol = (seccion === 'paciente' || seccion === 'medico' || seccion === 'secretaria') && seccion !== usuario.rol;
    if (esPublica || esDeOtroRol) {
      irAlInicioDelRol(usuario.rol);
    }
  }, [sesionCargada, usuario, ruta]);

  return null;
}
