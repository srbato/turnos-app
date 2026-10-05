// Datos mock de estudios del paciente. Cuando exista el backend pasa a ser un fetch.

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

export const ESTUDIOS: Estudio[] = [
  {
    id: '1',
    tipo: 'LAB',
    titulo: 'Laboratorio completo',
    detalle: 'Orden vence el 30/10',
    medico: 'Dra. Lucía Fernández',
    indicaciones: ['Ayuno de 8 horas', 'Llevá la orden de Swiss Medical'],
    estado: 'pendiente',
  },
  {
    id: '2',
    tipo: 'ECO',
    titulo: 'Ecografía abdominal',
    detalle: 'Turno a coordinar',
    medico: 'Dra. Lucía Fernández',
    indicaciones: ['Tomar 1 litro de agua una hora antes', 'No orinar hasta después del estudio'],
    estado: 'pendiente',
  },
  {
    id: '3',
    tipo: 'RX',
    titulo: 'Radiografía de tórax',
    detalle: 'Realizado el 12/08',
    medico: 'Dr. Ricardo Paz',
    indicaciones: [],
    estado: 'realizado',
  },
  {
    id: '4',
    tipo: 'ECG',
    titulo: 'Electrocardiograma',
    detalle: 'Realizado el 02/07',
    medico: 'Dr. Ricardo Paz',
    indicaciones: [],
    estado: 'realizado',
  },
  {
    id: '5',
    tipo: 'LAB',
    titulo: 'Perfil lipídico',
    detalle: 'Orden vencida el 15/09',
    medico: 'Dr. Ricardo Paz',
    indicaciones: ['Ayuno de 12 horas'],
    estado: 'vencido',
  },
];
