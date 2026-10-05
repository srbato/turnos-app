import { PASOS, SINTOMAS_DE_ALARMA, type RespuestasPreconsulta } from '@/datos/preconsulta';

// Asistente de preconsulta SIMULADO.
//
// Es la única función que "habla" con la IA. Hoy responde con preguntas guiadas; cuando exista el backend
// se reemplaza el cuerpo por un fetch a un endpoint de Express que llame al LLM (la clave de la API vive
// en el servidor, nunca en la app) y el resto de la pantalla no cambia.
//
// Reglas del asistente: solo recoge información. No diagnostica, no sugiere tratamientos ni medicamentos.

type Contexto = {
  nombre: string;
  medicamentosCargados: string[]; // los que ya tiene en la app (recetados y propios)
};

const ESPERA_SIMULADA_MS = 700;

function esperar(milisegundos: number) {
  return new Promise((resolver) => setTimeout(resolver, milisegundos));
}

// Devuelve los mensajes (burbujas) con los que el asistente responde para pasar al paso `indicePaso`.
export async function pedirRespuestaIA(
  indicePaso: number,
  respuestas: RespuestasPreconsulta,
  contexto: Contexto
): Promise<string[]> {
  await esperar(ESPERA_SIMULADA_MS);

  const mensajes: string[] = [];

  // Aviso de seguridad, solo después de que el paciente marcó síntomas de alarma.
  const alarma = respuestas.sintomas.filter((sintoma) => SINTOMAS_DE_ALARMA.includes(sintoma));
  if (indicePaso === 3 && alarma.length > 0) {
    mensajes.push(
      `Marcaste ${alarma.join(' y ').toLowerCase()}. Si en este momento es intenso o te cuesta respirar, no esperes al turno: andá a una guardia o llamá al 107.`
    );
  }

  if (indicePaso === 0) {
    mensajes.push(
      `Hola ${contexto.nombre}. Soy el asistente de preconsulta: no soy médico ni hago diagnósticos, solo junto información para que tu médico llegue al turno con contexto. Podés saltear cualquier pregunta.`
    );
    mensajes.push('¿Cuál es el motivo principal de tu consulta?');
  } else if (indicePaso === 1) {
    mensajes.push('Gracias. ¿Hace cuánto tiempo te pasa? ¿Es constante o va y viene?');
  } else if (indicePaso === 2) {
    mensajes.push('¿Tuviste alguno de estos síntomas? Marcá todos los que apliquen.');
  } else if (indicePaso === 3) {
    if (contexto.medicamentosCargados.length > 0) {
      mensajes.push(
        `En la app tenés cargados: ${contexto.medicamentosCargados.join(', ')}. ¿Tomás algún otro medicamento, o dejaste de tomar alguno?`
      );
    } else {
      mensajes.push('¿Tomás algún medicamento actualmente?');
    }
  } else if (indicePaso === 4) {
    mensajes.push('¿Tenés alguna alergia (a medicamentos, alimentos u otras cosas)?');
  } else if (indicePaso === 5) {
    mensajes.push('¿Querés contarle algo más a tu médico? Por ejemplo, antecedentes o dudas que tengas.');
  } else if (indicePaso === PASOS.length) {
    mensajes.push(
      'Listo, con lo que me contaste armé un resumen para tu médico. Revisalo y corregí lo que haga falta antes de enviarlo.'
    );
  }

  return mensajes;
}
