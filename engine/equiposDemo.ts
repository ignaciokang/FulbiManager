import { crearRng } from './rng';
import { NOMBRES_STATS } from './tipos';
import type { Equipo, Estilo, Formacion, Jugador, NombreStat, Posicion } from './tipos';

const SESGOS: Record<Posicion, Partial<Record<NombreStat, number>>> = {
  POR: { reflejos: 15, juegoAereo: 12, remate: -30, gambeta: -25, velocidad: -10, barrida: -10 },
  DEF: {
    barrida: 10,
    anticipacion: 8,
    fuerza: 8,
    garra: 5,
    remate: -15,
    gambeta: -10,
    reflejos: -30,
    juegoAereo: -30,
  },
  MED: {
    paseCorto: 8,
    paseLargo: 6,
    tecnica: 6,
    inteligencia: 6,
    barrida: -5,
    reflejos: -30,
    juegoAereo: -30,
  },
  DEL: {
    remate: 12,
    velocidad: 8,
    gambeta: 8,
    cabezazo: 6,
    barrida: -15,
    reflejos: -30,
    juegoAereo: -30,
  },
};

const CANTIDADES: Record<Formacion, { DEF: number; MED: number; DEL: number }> = {
  '4-4-2': { DEF: 4, MED: 4, DEL: 2 },
  '4-3-3': { DEF: 4, MED: 3, DEL: 3 },
  '4-5-1': { DEF: 4, MED: 5, DEL: 1 },
};

// Genera un equipo demo. Misma semilla = mismo plantel (útil para comparar estilos).
export function generarEquipo(
  nombre: string,
  nivel: number,
  formacion: Formacion,
  estilo: Estilo,
  semillaPlantel: number,
): Equipo {
  const rng = crearRng(semillaPlantel);
  const cant = CANTIDADES[formacion];
  const posiciones: Posicion[] = [
    'POR',
    ...Array<Posicion>(cant.DEF).fill('DEF'),
    ...Array<Posicion>(cant.MED).fill('MED'),
    ...Array<Posicion>(cant.DEL).fill('DEL'),
  ];

  const jugadores: Jugador[] = posiciones.map((posicion, i) => {
    const base: Record<string, number> = {};
    for (const stat of NOMBRES_STATS) {
      const ruido = Math.round(rng() * 16 - 8);
      const sesgo = SESGOS[posicion][stat] ?? 0;
      base[stat] = Math.min(99, Math.max(1, nivel + sesgo + ruido));
    }
    return {
      id: `${nombre}-${i + 1}`,
      nombre: `${nombre} ${posicion}${i + 1}`,
      posicion,
      ...(base as Record<NombreStat, number>),
    };
  });

  return { nombre, jugadores, formacion, estilo };
}
