// Los estudios que los médicos le piden al paciente. Vienen de la API (ver contextos/EstudiosContext.tsx).

export type EstadoEstudio = 'pendiente' | 'vencido' | 'realizado';

export type Estudio = {
  id: string;
  tipo: string; // 3 letras para el ícono (LAB, ECO, RX)
  titulo: string;
  detalle: string; // línea corta de la tarjeta
  medico: string; // quién pidió el estudio
  indicaciones: string[];
  estado: EstadoEstudio;
};
