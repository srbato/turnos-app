// Funciones chicas para trabajar con listas.

// La misma lista, sin textos repetidos: ["a", "b", "a"] -> ["a", "b"].
export function sinRepetidos(lista: string[]) {
  const resultado: string[] = [];
  for (const elemento of lista) {
    if (!resultado.includes(elemento)) {
      resultado.push(elemento);
    }
  }
  return resultado;
}
