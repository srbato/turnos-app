import { Idioma } from '@/contextos/PreferenciasContext';
import { PASOS, SINTOMAS, SINTOMAS_DE_ALARMA, RespuestasPreconsulta } from '@/datos/preconsulta';
import { TEXTOS_PACIENTE } from '@/datos/textos-paciente';

// Asistente de preconsulta SIMULADO.
//
// Es la única función que "habla" con la IA. Hoy responde al instante con preguntas guiadas; cuando exista el
// backend, se reemplaza por un fetch a un endpoint de Express que llame al LLM (la clave de la API vive en el
// servidor, nunca en la app).
//
// Reglas del asistente: solo recoge información. No diagnostica, no sugiere tratamientos ni medicamentos.

type Contexto = {
  nombre: string;
  medicamentosCargados: string[]; // los que ya tiene en la app (recetados y propios)
  alergiasCargadas: string; // las que figuran en su perfil ('' si no cargó ninguna)
};

// Devuelve los mensajes (burbujas) con los que el asistente responde para pasar al paso `indicePaso`.
// El idioma es opcional: si no se pasa, el asistente habla en español.
export function respuestaDelAsistente(
  indicePaso: number,
  respuestas: RespuestasPreconsulta,
  contexto: Contexto,
  idioma: Idioma = 'es'
) {
  const t = TEXTOS_PACIENTE[idioma].preconsulta;
  const mensajes: string[] = [];

  // Aviso de seguridad, solo después de que el paciente marcó síntomas de alarma.
  const alarma = respuestas.sintomas.filter((sintoma) => SINTOMAS_DE_ALARMA.includes(sintoma));
  if (indicePaso === 3 && alarma.length > 0) {
    const nombres = alarma.map((sintoma) => (t.sintomas[SINTOMAS.indexOf(sintoma)] ?? sintoma).toLowerCase());
    mensajes.push(t.alarma(nombres.join(idioma === 'es' ? ' y ' : ' and ')));
  }

  if (indicePaso === 0) {
    mensajes.push(t.saludo(contexto.nombre));
    mensajes.push(t.pMotivo);
  } else if (indicePaso === 1) {
    mensajes.push(t.pDuracion);
  } else if (indicePaso === 2) {
    mensajes.push(t.pSintomas);
  } else if (indicePaso === 3) {
    if (contexto.medicamentosCargados.length > 0) {
      mensajes.push(t.pMedicacionCargada(contexto.medicamentosCargados.join(', ')));
    } else {
      mensajes.push(t.pMedicacion);
    }
  } else if (indicePaso === 4) {
    if (contexto.alergiasCargadas !== '') {
      mensajes.push(t.pAlergiasCargadas(contexto.alergiasCargadas));
    } else {
      mensajes.push(t.pAlergias);
    }
  } else if (indicePaso === 5) {
    mensajes.push(t.pAdicional);
  } else if (indicePaso === PASOS.length) {
    mensajes.push(t.cierre);
  }

  return mensajes;
}
