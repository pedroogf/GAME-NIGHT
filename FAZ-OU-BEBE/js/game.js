/* ============================================================
   GAME — estado da partida e regras do jogo
   ------------------------------------------------------------
   Aqui fica toda a lógica: baralho sem repetição, ordem dos
   jogadores, cartas especiais e eventos temporários.
   A parte visual fica em script.js.
   ============================================================ */

const CHANCE_ESPECIAL = 0.05; // ~5% das rodadas

const partida = {
  jogadores: [],      // nomes, na ordem da roda
  indiceAtual: 0,     // de quem é a vez
  sentido: 1,         // 1 = horário, -1 = invertido (carta "Marcha ré")
  modo: "aleatorio",  // "resenha" | "pesado" | "aleatorio"
  baralho: [],        // cartas embaralhadas da partida
  posicao: 0,         // próxima carta a ser comprada
  cartaAtual: null,   // carta revelada na rodada
  revelada: false,
  eventosAtivos: []   // regras temporárias: { titulo, descricao, restantes }
};

/* ---------- MONTAGEM ---------- */

/* Filtra o banco conforme o modo escolhido e a config "sem pesado" */
function cartasDoModo() {
  return CARDS.filter(c => {
    if (config.semPesado && c.modo === "pesado") return false;
    if (partida.modo === "aleatorio") return true;
    return c.modo === partida.modo;
  });
}

/* Começa uma partida nova do zero */
function iniciarPartida(nomes, modo) {
  partida.jogadores = nomes;
  partida.modo = modo;
  partida.indiceAtual = 0;
  partida.sentido = 1;
  partida.eventosAtivos = [];
  reembaralhar();
}

/* (Re)embaralha o banco inteiro — só acontece no início
   ou quando TODAS as cartas já foram usadas */
function reembaralhar() {
  partida.baralho = embaralhar(cartasDoModo());
  partida.posicao = 0;
}

/* ---------- COMPRA DE CARTAS ---------- */

function cartasRestantes() {
  return partida.baralho.length - partida.posicao;
}

/* Compra a próxima carta, sem repetir. Retorna { carta, reiniciou } */
function comprarCarta() {
  let reiniciou = false;
  if (partida.posicao >= partida.baralho.length) {
    reembaralhar();
    reiniciou = true;
  }
  const carta = partida.baralho[partida.posicao];
  partida.posicao++;
  partida.cartaAtual = carta;
  partida.revelada = true;
  return { carta, reiniciou };
}

/* Sorteia (ou não) uma carta especial para a rodada.
   Ela NÃO substitui a carta principal — é um evento extra. */
function sortearEspecial() {
  if (Math.random() >= CHANCE_ESPECIAL) return null;
  const especial = sortearItem(SPECIAL_CARDS);
  if (especial.duracao > 0) {
    partida.eventosAtivos.push({
      titulo: especial.titulo,
      descricao: especial.descricao,
      restantes: especial.duracao
    });
  }
  if (especial.efeito === "inverter_ordem") partida.sentido *= -1;
  return especial;
}

/* ---------- RODADAS E JOGADORES ---------- */

function jogadorAtual() {
  return partida.jogadores[partida.indiceAtual];
}

/* Passa a vez seguindo o sentido atual da roda */
function avancarJogador() {
  const n = partida.jogadores.length;
  partida.indiceAtual = (partida.indiceAtual + partida.sentido + n) % n;
}

/* Define a vez manualmente (botão "Trocar jogador") */
function definirJogador(indice) {
  partida.indiceAtual = indice;
}

/* Fecha a rodada atual: desconta 1 rodada de cada evento ativo
   e devolve a lista dos que acabaram agora */
function passarRodada() {
  partida.cartaAtual = null;
  partida.revelada = false;
  const encerrados = [];
  partida.eventosAtivos = partida.eventosAtivos.filter(ev => {
    ev.restantes--;
    if (ev.restantes <= 0) { encerrados.push(ev); return false; }
    return true;
  });
  return encerrados;
}
