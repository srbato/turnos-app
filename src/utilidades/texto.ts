// Funciones chicas para trabajar con textos (se escriben con un for en lugar de expresiones regulares).

const CON_TILDE = 'áàäâéèëêíìïîóòöôúùüûñÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑ';
const SIN_TILDE = 'aaaaeeeeiiiioooouuuunAAAAEEEEIIIIOOOOUUUUN';

// Deja solo los números: "40.123-456" -> "40123456".
export function soloNumeros(texto: string) {
  let resultado = '';
  for (const caracter of texto) {
    if (caracter >= '0' && caracter <= '9') {
      resultado += caracter;
    }
  }
  return resultado;
}

// Saca las tildes: "Clínica médica" -> "Clinica medica".
export function sinTildes(texto: string) {
  let resultado = '';
  for (const caracter of texto) {
    const posicion = CON_TILDE.indexOf(caracter);
    if (posicion >= 0) {
      resultado += SIN_TILDE[posicion];
    } else {
      resultado += caracter;
    }
  }
  return resultado;
}

// Las palabras de un texto, separadas por espacios: "  Juan   Pérez " -> ["Juan", "Pérez"].
export function palabras(texto: string) {
  return texto.split(' ').filter((palabra) => palabra !== '');
}

// Las palabras hechas solo de letras minúsculas sin tilde (a-z): cualquier otro carácter separa.
// "lun, mie-vie" -> ["lun", "mie", "vie"]
export function palabrasDeLetras(texto: string) {
  const resultado: string[] = [];
  let actual = '';
  for (const caracter of texto) {
    if (caracter >= 'a' && caracter <= 'z') {
      actual += caracter;
    } else if (actual !== '') {
      resultado.push(actual);
      actual = '';
    }
  }
  if (actual !== '') {
    resultado.push(actual);
  }
  return resultado;
}

// "40123456" -> "40.123.456" (como mucho 8 números).
export function formatearDni(texto: string) {
  const digitos = soloNumeros(texto).slice(0, 8);
  let resultado = '';
  for (let i = 0; i < digitos.length; i++) {
    const quedan = digitos.length - i;
    // Se pone un punto antes de cada grupo de 3 números, contando desde el final.
    if (i > 0 && quedan % 3 === 0) {
      resultado += '.';
    }
    resultado += digitos[i];
  }
  return resultado;
}
