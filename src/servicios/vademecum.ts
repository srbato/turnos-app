// Consulta al vademécum público CIMA, de la AEMPS (la agencia de medicamentos de España).
// Es una API externa y abierta: solo GET, sin clave ni autenticación.
//
// Es un servicio aparte de api.ts a propósito: api.ts es para NUESTRA API y manda el token de la sesión en cada pedido,
// y ese token no tiene que viajar nunca a un servidor ajeno.

const URL_CIMA = 'https://cima.aemps.es/cima/rest/medicamentos';

// Lo único que usamos de cada medicamento. CIMA devuelve muchísimos campos más (documentos, fotos, principio activo,
// forma farmacéutica...) y se ignoran.
export type MedicamentoVademecum = {
  nregistro: string; // número de registro: identifica al medicamento
  nombre: string; // "IBUPROFENO CINFA 600 mg COMPRIMIDOS RECUBIERTOS CON PELICULA"
  laboratorio: string; // laboratorio titular
  receta: boolean; // si se vende solo con receta
};

export type ResultadoVademecum = {
  total: number; // cuántos medicamentos coinciden en total
  medicamentos: MedicamentoVademecum[]; // los de la primera página (no se pagina)
};

// Un medicamento tal como lo devuelve CIMA (solo los campos que leemos).
type MedicamentoCima = {
  nregistro: string;
  nombre: string;
  labtitular: string;
  receta: boolean;
};

// Busca medicamentos por nombre y devuelve la primera página, ya reducida a los cuatro campos que usamos.
// Si algo falla (sin conexión, o CIMA responde con error) lanza un Error: quien la llama lo atrapa con try/catch.
export async function buscarMedicamentos(texto: string): Promise<ResultadoVademecum> {
  // encodeURIComponent convierte lo escrito en algo seguro para una URL (espacios, tildes, "&", etc.).
  const respuesta = await fetch(`${URL_CIMA}?nombre=${encodeURIComponent(texto)}&pagina=1`);
  if (!respuesta.ok) {
    throw new Error(`El vademécum respondió con un error (${respuesta.status})`);
  }
  const datos = await respuesta.json();

  const resultados: MedicamentoCima[] = datos.resultados ?? [];
  const medicamentos = resultados.map((medicamento) => ({
    nregistro: medicamento.nregistro,
    nombre: medicamento.nombre,
    laboratorio: medicamento.labtitular,
    receta: medicamento.receta,
  }));
  return { total: datos.totalFilas ?? medicamentos.length, medicamentos: medicamentos };
}
