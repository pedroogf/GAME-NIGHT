/* ============================================================
   GREEN OU GOLE — LÓGICA DO JOGO
   ------------------------------------------------------------
   Fluxo: escolher tema → nova aposta (desafio + alvo + odds)
   → roda aposta em voz alta → juiz marca GREEN ou RED →
   resultado diz quantos goles quem errou bebe.
   ============================================================ */

const estado = {
  tema: null,        // chave em TEMAS ('futebol' | 'resenha')
  baralho: [],       // desafios embaralhados, sem repetição até esgotar
  rodada: 0,
  green: 0,
  red: 0,
  ultimoAlvo: null,
  animandoOdds: false,
  timerId: null
};

/* ---------- utilidades ---------- */

function sortear(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function vibrar(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function el(id) {
  return document.getElementById(id);
}

/* ---------- troca de telas / tema ---------- */

function selecionarTema(chave) {
  estado.tema = chave;
  estado.baralho = embaralhar(TEMAS[chave].desafios);

  const t = TEMAS[chave];
  el('chip-tema').textContent = `${t.emoji} ${t.nome} · trocar`;

  el('tela-temas').classList.remove('ativa');
  el('tela-jogo').classList.add('ativa');
  vibrar(40);
}

function trocarTema() {
  cancelarTimer();
  el('tela-jogo').classList.remove('ativa');
  el('tela-temas').classList.add('ativa');
}

/* ---------- rodada ---------- */

function gerarAposta() {
  if (estado.animandoOdds) return;
  cancelarTimer();

  // reembaralha quando o baralho esgota
  if (estado.baralho.length === 0) {
    estado.baralho = embaralhar(TEMAS[estado.tema].desafios);
  }
  const desafio = estado.baralho.pop();

  // evita repetir o mesmo alvo duas vezes seguidas
  let alvo = sortear(ALVOS);
  while (alvo === estado.ultimoAlvo && ALVOS.length > 1) {
    alvo = sortear(ALVOS);
  }
  estado.ultimoAlvo = alvo;

  estado.rodada++;
  el('num-rodada').textContent = estado.rodada;
  el('mercado-titulo').textContent =
    `${sortear(TEMAS[estado.tema].mercados)} · Ao Vivo`;

  el('resultado-box').className = '';
  el('alvo-box').style.display = 'block';
  el('alvo-nome').textContent = alvo;
  el('texto-desafio').textContent = desafio;
  el('odds-box').style.display = 'flex';
  el('aviso-aposta').style.display = 'block';
  el('timer-row').style.display = 'flex';
  el('botoes-acao').style.display = 'flex';

  animarOdds();
  vibrar(30);
}

/* Odds sorteadas com efeito de "roleta" antes de travar */
function animarOdds() {
  estado.animandoOdds = true;
  el('btn-green').disabled = true;
  el('btn-red').disabled = true;
  el('btn-gerar').disabled = true;

  const fim = Date.now() + 900;
  const intervalo = setInterval(() => {
    el('odd-sim').textContent = oddAleatoria();
    el('odd-nao').textContent = oddAleatoria();

    if (Date.now() >= fim) {
      clearInterval(intervalo);
      el('odd-sim').textContent = oddAleatoria();
      el('odd-nao').textContent = oddAleatoria();
      estado.animandoOdds = false;
      el('btn-green').disabled = false;
      el('btn-red').disabled = false;
      el('btn-gerar').disabled = false;
      vibrar(60);
    }
  }, 70);
}

function oddAleatoria() {
  return (Math.random() * (4.5 - 1.2) + 1.2).toFixed(2);
}

/* ---------- resultado ---------- */

function resolverAposta(deuGreen) {
  if (estado.animandoOdds) return;
  cancelarTimer();

  const oddSim = parseFloat(el('odd-sim').textContent);
  const oddNao = parseFloat(el('odd-nao').textContent);
  // a odd vira a quantidade de goles (mínimo 1)
  const golesSim = Math.max(1, Math.round(oddSim));
  const golesNao = Math.max(1, Math.round(oddNao));

  el('odds-box').style.display = 'none';
  el('aviso-aposta').style.display = 'none';
  el('timer-row').style.display = 'none';
  el('botoes-acao').style.display = 'none';

  const box = el('resultado-box');

  if (deuGreen) {
    estado.green++;
    el('placar-green').textContent = estado.green;
    box.className = 'green';
    box.innerHTML =
      `<span class="resultado-titulo">✅ GREEN! ${sortear(FRASES_GREEN)}</span>` +
      `Quem apostou <b>NÃO</b> perdeu e bebe ` +
      `<span class="resultado-goles">${golesNao} gole${golesNao > 1 ? 's' : ''}</span>!`;
  } else {
    estado.red++;
    el('placar-red').textContent = estado.red;
    box.className = 'red';
    box.innerHTML =
      `<span class="resultado-titulo">❌ RED! ${sortear(FRASES_RED)}</span>` +
      `Quem apostou <b>SIM</b> perdeu e bebe ` +
      `<span class="resultado-goles">${golesSim} gole${golesSim > 1 ? 's' : ''}</span>!` +
      `<span class="resultado-extra">O alvo também bebe 1 gole por ter pipocado. 🍺</span>`;
  }

  vibrar([60, 40, 60]);
}

/* ---------- cronômetro rápido ---------- */

function iniciarTimer(segundos, botao) {
  // tocar no chip que já está contando cancela
  if (botao.classList.contains('contando')) {
    cancelarTimer();
    return;
  }
  cancelarTimer();

  botao.classList.add('contando');
  botao.dataset.rotulo = botao.textContent;
  let restante = segundos;
  botao.textContent = `⏱ ${restante}s`;

  estado.timerId = setInterval(() => {
    restante--;
    if (restante <= 0) {
      botao.textContent = '⏰ FIM!';
      vibrar([120, 80, 120, 80, 200]);
      clearInterval(estado.timerId);
      estado.timerId = null;
      setTimeout(() => restaurarChip(botao), 1500);
    } else {
      botao.textContent = `⏱ ${restante}s`;
      if (restante <= 3) vibrar(50);
    }
  }, 1000);
}

function cancelarTimer() {
  if (estado.timerId) {
    clearInterval(estado.timerId);
    estado.timerId = null;
  }
  document.querySelectorAll('.chip-timer.contando').forEach(restaurarChip);
}

function restaurarChip(botao) {
  botao.classList.remove('contando');
  if (botao.dataset.rotulo) botao.textContent = botao.dataset.rotulo;
}
