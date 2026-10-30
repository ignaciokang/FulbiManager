import { crearRng, Rng } from './rng';
import type { Equipo, Estilo, Evento, Formacion, Jugador, Resultado } from './tipos';

const TURNOS = 50;

const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const prom = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// Modificadores por estilo de juego
const ESTILOS: Record<Estilo, { posesion: number; avance: number }> = {
  equilibrado: { posesion: 1, avance: 0 },
  posesion: { posesion: 1.12, avance: -0.03 },
  contragolpe: { posesion: 0.9, avance: 0.05 },
  pelotazo: { posesion: 0.95, avance: 0.05 },
};

// Modificadores por formación sobre cada línea
const FORMACIONES: Record<Formacion, { def: number; med: number; ata: number }> = {
  '4-4-2': { def: 1, med: 1, ata: 1 },
  '4-3-3': { def: 0.98, med: 0.96, ata: 1.06 },
  '4-5-1': { def: 1.02, med: 1.06, ata: 0.99 },
};

interface Lineas {
  def: number;
  med: number;
  ata: number;
  portero: number;
  posesion: number;
  avance: number;
}

function calcularLineas(eq: Equipo): Lineas {
  const por = eq.jugadores.filter((j) => j.posicion === 'POR');
  const defs = eq.jugadores.filter((j) => j.posicion === 'DEF');
  const meds = eq.jugadores.filter((j) => j.posicion === 'MED');
  const dels = eq.jugadores.filter((j) => j.posicion === 'DEL');
  const f = FORMACIONES[eq.formacion];
  const e = ESTILOS[eq.estilo];

  const def =
    prom(
      defs.map(
        (j) =>
          j.barrida * 0.3 + j.anticipacion * 0.3 + j.fuerza * 0.2 + j.garra * 0.1 + j.inteligencia * 0.1,
      ),
    ) * f.def;

  const med =
    prom(
      meds.map(
        (j) =>
          j.paseCorto * 0.3 +
          j.tecnica * 0.2 +
          j.inteligencia * 0.2 +
          j.paseLargo * 0.1 +
          j.gambeta * 0.1 +
          j.resistencia * 0.1,
      ),
    ) * f.med;

  const ata =
    prom(
      dels.map(
        (j) =>
          j.velocidad * 0.25 +
          j.gambeta * 0.25 +
          j.remate * 0.2 +
          j.tecnica * 0.1 +
          j.fuerza * 0.1 +
          j.inteligencia * 0.1,
      ),
    ) * f.ata;

  const portero = prom(por.map((j) => j.reflejos * 0.7 + j.juegoAereo * 0.3));

  // El pelotazo rinde más si los mediocampistas tienen buen pase largo
  let avance = e.avance;
  if (eq.estilo === 'pelotazo') {
    avance += (prom(meds.map((j) => j.paseLargo)) - 60) / 500;
  }

  return { def, med, ata, portero, posesion: e.posesion, avance };
}

function elegirPonderado<T>(items: T[], pesos: number[], rng: Rng): T {
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= pesos[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function elegirTirador(eq: Equipo, rng: Rng): Jugador {
  const pesoPos = { POR: 0, DEF: 0.5, MED: 2, DEL: 5 } as const;
  const pesos = eq.jugadores.map((j) => pesoPos[j.posicion] * (j.remate / 50));
  return elegirPonderado(eq.jugadores, pesos, rng);
}

export function simularPartido(local: Equipo, visitante: Equipo, semilla: number): Resultado {
  const rng = crearRng(semilla);
  const L = calcularLineas(local);
  const V = calcularLineas(visitante);

  const fuerzaPosL = L.med * L.posesion;
  const fuerzaPosV = V.med * V.posesion;
  const pPosesionLocal = fuerzaPosL / (fuerzaPosL + fuerzaPosV);

  const eventos: Evento[] = [];
  let golesLocal = 0;
  let golesVisitante = 0;
  let turnosLocal = 0;
  let rematesLocal = 0;
  let rematesVisitante = 0;

  for (let t = 0; t < TURNOS; t++) {
    const minuto = Math.max(1, Math.round(((t + 1) * 90) / TURNOS));
    const ataca: 'local' | 'visitante' = rng() < pPosesionLocal ? 'local' : 'visitante';
    if (ataca === 'local') turnosLocal++;

    const A = ataca === 'local' ? L : V;
    const D = ataca === 'local' ? V : L;
    const eqA = ataca === 'local' ? local : visitante;

    // 1) ¿Avanza hasta zona de remate?
    const pAvance = limitar(0.45 + (A.ata - D.def) / 150 + A.avance, 0.15, 0.75);
    if (rng() >= pAvance) continue;

    // 2) ¿Llega a rematar?
    if (rng() >= 0.66) continue;

    const tirador = elegirTirador(eqA, rng);
    if (ataca === 'local') rematesLocal++;
    else rematesVisitante++;

    // 3) ¿Es gol?
    const tiro =
      eqA.estilo === 'pelotazo'
        ? tirador.cabezazo * 0.6 + tirador.remate * 0.4
        : tirador.remate * 0.7 + tirador.tecnica * 0.3;
    const pGol = limitar(0.29 + (tiro - D.portero) / 250, 0.04, 0.6);

    if (rng() < pGol) {
      if (ataca === 'local') golesLocal++;
      else golesVisitante++;
      eventos.push({ minuto, tipo: 'gol', equipo: ataca, jugador: tirador.nombre });
    } else {
      const tipo = rng() < 0.5 ? 'atajada' : 'desviado';
      eventos.push({ minuto, tipo, equipo: ataca, jugador: tirador.nombre });
    }
  }

  return {
    golesLocal,
    golesVisitante,
    eventos,
    posesionLocal: Math.round((turnosLocal / TURNOS) * 100),
    rematesLocal,
    rematesVisitante,
  };
}
