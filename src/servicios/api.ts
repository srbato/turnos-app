// Conexión con la API de MiConsultorio (el backend con Express + Prisma + SQLite).
// La app no toca la base de datos: le pide los datos a la API con fetch() y recibe JSON.

// La dirección sale del archivo .env (o de .env.local, para probar desde un celular).
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// El consultorio con el que trabaja la app. Con varios consultorios lo definiría la cuenta del usuario.
export const ID_CONSULTORIO = 1;

// El resultado de un pedido: si salió bien, los datos que devolvió la API; si no, el mensaje de error.
// datos es "any" porque cada ruta devuelve una forma distinta: cada contexto la convierte a sus tipos.
export type Respuesta = {
  ok: boolean;
  datos: any;
  error: string;
};

// Hace un pedido a la API. metodo: 'GET', 'POST', 'PATCH', 'PUT' o 'DELETE'. ruta: '/api/turnos?consultorioId=1'.
// cuerpo: lo que se manda (solo en POST, PATCH y PUT). Nunca lanza un error: si algo falla, devuelve ok: false.
export async function pedir(metodo: string, ruta: string, cuerpo?: object): Promise<Respuesta> {
  try {
    const opciones: RequestInit = { method: metodo };
    if (cuerpo !== undefined) {
      // JSON.stringify convierte el objeto en texto, y Content-Type le dice a la API que es JSON.
      opciones.headers = { 'Content-Type': 'application/json' };
      opciones.body = JSON.stringify(cuerpo);
    }
    const respuesta = await fetch(`${API_URL}${ruta}`, opciones);

    // 204 No Content (por ejemplo, al borrar): salió bien y no hay JSON para leer.
    if (respuesta.status === 204) {
      return { ok: true, datos: null, error: '' };
    }
    const datos = await respuesta.json();
    if (!respuesta.ok) {
      // La API explica el error en { error: "..." }.
      return { ok: false, datos: null, error: datos.error ?? 'Ocurrió un error' };
    }
    return { ok: true, datos: datos, error: '' };
  } catch {
    return { ok: false, datos: null, error: 'No se pudo conectar con el servidor' };
  }
}
