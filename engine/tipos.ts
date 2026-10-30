export const NOMBRES_STATS = [
  'velocidad',
  'resistencia',
  'inteligencia',
  'remate',
  'cabezazo',
  'gambeta',
  'paseCorto',
  'paseLargo',
  'tecnica',
  'barrida',
  'anticipacion',
  'fuerza',
  'garra',
  'reflejos',
  'juegoAereo',
] as const;

export type NombreStat = (typeof NOMBRES_STATS)[number];
export type Posicion = 'POR' | 'DEF' | 'MED' | 'DEL';
export type Formacion = '4-4-2' | '4-3-3' | '4-5-1';
export type Estilo = 'equilibrado' | 'posesion' | 'contragolpe' | 'pelotazo';

export interface Jugador extends Record<NombreStat, number> {
  id: string;
  nombre: string;
  posicion: Posicion;
}

export interface Equipo {
  nombre: string;
  jugadores: Jugador[]; // 11 titulares
  formacion: Formacion;
  estilo: Estilo;
}

export interface Evento {
  minuto: number;
  tipo: 'gol' | 'atajada' | 'desviado';
  equipo: 'local' | 'visitante';
  jugador: string;
}

export interface Resultado {
  golesLocal: number;
  golesVisitante: number;
  eventos: Evento[];
  posesionLocal: number; // porcentaje 0-100
  rematesLocal: number;
  rematesVisitante: number;
}
