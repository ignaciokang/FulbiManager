import { simularPartido } from './simulador';
import { generarEquipo } from './equiposDemo';
import type { Equipo, Estilo } from './tipos';

const N = 3000;

interface Resumen {
  victoriasLocal: number;
  empates: number;
  victoriasVisitante: number;
  golesPorPartido: number;
  rematesPorPartido: number;
  posesionLocal: number;
}

function correr(local: Equipo, visitante: Equipo, n: number): Resumen {
  let vl = 0,
    em = 0,
    vv = 0,
    goles = 0,
    remates = 0,
    pos = 0;
  for (let i = 0; i < n; i++) {
    const r = simularPartido(local, visitante, i + 1);
    if (r.golesLocal > r.golesVisitante) vl++;
    else if (r.golesLocal < r.golesVisitante) vv++;
    else em++;
    goles += r.golesLocal + r.golesVisitante;
    remates += r.rematesLocal + r.rematesVisitante;
    pos += r.posesionLocal;
  }
  return {
    victoriasLocal: (vl / n) * 100,
    empates: (em / n) * 100,
    victoriasVisitante: (vv / n) * 100,
    golesPorPartido: goles / n,
    rematesPorPartido: remates / n,
    posesionLocal: pos / n,
  };
}

function imprimir(titulo: string, r: Resumen) {
  console.log(`\n=== ${titulo} (${N} partidos) ===`);
  console.log(
    `Local gana: ${r.victoriasLocal.toFixed(1)}% | Empate: ${r.empates.toFixed(1)}% | Visitante gana: ${r.victoriasVisitante.toFixed(1)}%`,
  );
  console.log(
    `Goles/partido: ${r.golesPorPartido.toFixed(2)} | Remates/partido: ${r.rematesPorPartido.toFixed(2)} | Posesión local: ${r.posesionLocal.toFixed(1)}%`,
  );
}

// Prueba 1: equipos parejos (mismo plantel, mismo estilo)
imprimir(
  'Parejos (nivel 60 vs 60)',
  correr(
    generarEquipo('A', 60, '4-4-2', 'equilibrado', 11),
    generarEquipo('B', 60, '4-4-2', 'equilibrado', 11),
    N,
  ),
);

// Prueba 2: uno más fuerte que el otro
imprimir(
  'Fuerte vs débil (nivel 70 vs 55)',
  correr(
    generarEquipo('Fuerte', 70, '4-4-2', 'equilibrado', 21),
    generarEquipo('Debil', 55, '4-4-2', 'equilibrado', 22),
    N,
  ),
);

// Prueba 3: matriz de estilos con el mismo plantel (puntaje de la fila contra la columna)
const estilos: Estilo[] = ['equilibrado', 'posesion', 'contragolpe', 'pelotazo'];
console.log('\n=== Matriz de estilos (% de puntos de la FILA contra la COLUMNA, 50 = parejo) ===');
console.log(['', ...estilos].map((s) => s.padEnd(12)).join(''));
for (const a of estilos) {
  const fila: string[] = [a.padEnd(12)];
  for (const b of estilos) {
    const r = correr(
      generarEquipo('A', 60, '4-4-2', a, 31),
      generarEquipo('B', 60, '4-4-2', b, 31),
      N,
    );
    const puntos = r.victoriasLocal + r.empates * 0.5;
    fila.push(puntos.toFixed(1).padEnd(12));
  }
  console.log(fila.join(''));
}

// Prueba 4: formaciones con el mismo nivel
console.log('\n=== Formaciones (A en 4-3-3 / 4-5-1 contra B en 4-4-2) ===');
for (const f of ['4-3-3', '4-5-1'] as const) {
  imprimir(
    `${f} vs 4-4-2`,
    correr(
      generarEquipo('A', 60, f, 'equilibrado', 41),
      generarEquipo('B', 60, '4-4-2', 'equilibrado', 41),
      N,
    ),
  );
}
