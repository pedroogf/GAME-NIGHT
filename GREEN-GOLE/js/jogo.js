/* ============================================================
   GREEN OU GOLE — LÓGICA DO JOGO
   ------------------------------------------------------------
   Fluxo: escolher tema → cadastrar jogadores → nova aposta
   (desafio + alvo sorteado entre os jogadores) → juiz define
   o risco (gera odds coerentes) → cada um marca SIM ou NÃO no
   próprio nome → juiz marca GREEN ou RED → quem errou bebe.
   Goles e pipocadas de cada um ficam no Placar da Galera.
   ============================================================ */

/* A mesa de jogadores agora é a global do Game Night (ranking.js).
   A chave antiga fica só para migrar nomes salvos antes da mudança. */
const CHAVE_JOGADORES_ANTIGA = 'greengole_jogadores';
const CHAVE_PLACAR = 'greengole_placar';

/* Faixas de odds por dificuldade. A odd vira os goles de quem
   errou: palpite improvável = odd alta = castigo maior. */
const DIFICULDADES = {
  facil:   { sim: [1.15, 1.60], nao: [2.80, 4.50] },
  media:   { sim: [1.80, 2.60], nao: [1.80, 2.60] },
  dificil: { sim: [2.80, 4.50], nao: [1.15, 1.60] }
};

const estado = {
  tema: null,        // chave em TEMAS ('futebol' | 'resenha')
  baralho: [],       // desafios embaralhados, sem repetição até esgotar
  rodada: 0,
  green: 0,
  red: 0,
  jogadores: [],     // nomes da mesa (persistidos)
  alvo: null,        // quem encara o desafio da rodada
  ultimoAlvo: null,
  dificuldade: null,
  apostas: {},       // nome -> 'sim' | 'nao'
  oddsTravadas: false,
  animandoOdds: false,
  timerId: null
};

/* Placar por pessoa, persistido entre sessões */
let placarPessoal = { goles: {}, pipocadas: {} };

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

function listarNomes(nomes) {
  if (nomes.length === 1) return nomes[0];
  return nomes.slice(0, -1).join(', ') + ' e ' + nomes[nomes.length - 1];
}

/* ---------- persistência ---------- */

function carregarDados() {
  // migra nomes salvos pela versão antiga para a mesa global
  if (GameNight.jogadores().length === 0) {
    try {
      const antigos = JSON.parse(localStorage.getItem(CHAVE_JOGADORES_ANTIGA));
      if (Array.isArray(antigos) && antigos.length) GameNight.salvarJogadores(antigos);
    } catch (e) { /* dados corrompidos: ignora */ }
  }
  estado.jogadores = GameNight.jogadores();

  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_PLACAR));
    if (salvo && salvo.goles && salvo.pipocadas) placarPessoal = salvo;
  } catch (e) { /* idem */ }
}

function salvarJogadores() {
  GameNight.salvarJogadores(estado.jogadores);
}

function salvarPlacar() {
  localStorage.setItem(CHAVE_PLACAR, JSON.stringify(placarPessoal));
}

/* ---------- troca de telas / tema ---------- */

function irParaTela(id) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  el(id).classList.add('ativa');
}

function selecionarTema(chave) {
  estado.tema = chave;
  estado.baralho = embaralhar(TEMAS[chave].desafios);

  const t = TEMAS[chave];
  el('chip-tema').textContent = `${t.emoji} ${t.nome} · trocar`;
  vibrar(40);

  // Sem mesa montada, primeiro cadastra os jogadores
  if (estado.jogadores.length < 2) abrirJogadores();
  else irParaTela('tela-jogo');
}

function trocarTema() {
  cancelarTimer();
  irParaTela('tela-temas');
}

/* ---------- jogadores ---------- */

function abrirJogadores() {
  cancelarTimer();
  renderizarListaJogadores();
  irParaTela('tela-jogadores');
}

function adicionarJogador() {
  const input = el('input-nome');
  const nome = input.value.trim();
  input.value = '';
  input.focus();
  if (!nome) return;

  const jaExiste = estado.jogadores.some(j => j.toLowerCase() === nome.toLowerCase());
  if (jaExiste) return;

  estado.jogadores.push(nome);
  salvarJogadores();
  renderizarListaJogadores();
  vibrar(30);
}

function removerJogador(nome) {
  estado.jogadores = estado.jogadores.filter(j => j !== nome);
  salvarJogadores();
  renderizarListaJogadores();
}

function renderizarListaJogadores() {
  const lista = el('lista-jogadores');
  lista.innerHTML = '';
  estado.jogadores.forEach(nome => {
    const chip = document.createElement('button');
    chip.className = 'chip-jogador';
    chip.innerHTML = `${nome} <span class="x">×</span>`;
    chip.onclick = () => removerJogador(nome);
    lista.appendChild(chip);
  });

  const btn = el('btn-comecar');
  btn.disabled = estado.jogadores.length < 2;
  btn.textContent = estado.jogadores.length < 2
    ? 'Cadastre pelo menos 2 jogadores'
    : `🎲 Valendo com ${estado.jogadores.length} na mesa`;

  el('chip-jogadores').textContent = `👥 ${estado.jogadores.length}`;
}

function confirmarJogadores() {
  if (estado.jogadores.length < 2) return;
  if (!estado.tema) { irParaTela('tela-temas'); return; }
  irParaTela('tela-jogo');
}

/* ---------- rodada ---------- */

function gerarAposta() {
  if (estado.animandoOdds) return;
  cancelarTimer();
  if (estado.jogadores.length < 2) { abrirJogadores(); return; }

  // reembaralha quando o baralho esgota
  if (estado.baralho.length === 0) {
    estado.baralho = embaralhar(TEMAS[estado.tema].desafios);
  }
  const desafio = estado.baralho.pop();

  // alvo sorteado entre os jogadores, sem repetir o último
  let alvo = sortear(estado.jogadores);
  while (alvo === estado.ultimoAlvo && estado.jogadores.length > 1) {
    alvo = sortear(estado.jogadores);
  }
  estado.ultimoAlvo = alvo;
  estado.alvo = alvo;

  estado.rodada++;
  estado.dificuldade = null;
  estado.apostas = {};
  estado.oddsTravadas = false;

  el('num-rodada').textContent = estado.rodada;
  el('mercado-titulo').textContent =
    `${sortear(TEMAS[estado.tema].mercados)} · Ao Vivo`;

  el('resultado-box').className = '';
  el('alvo-box').style.display = 'block';
  el('alvo-nome').textContent = alvo;
  el('texto-desafio').textContent = desafio;

  el('odd-sim').textContent = '-.--';
  el('odd-nao').textContent = '-.--';
  el('odds-box').style.display = 'none';
  el('apostas-box').style.display = 'none';
  el('timer-row').style.display = 'none';
  el('botoes-acao').style.display = 'none';

  // rodada começa com o juiz definindo o risco
  el('dificuldade-box').style.display = 'block';
  document.querySelectorAll('.chip-dif').forEach(c => {
    c.disabled = false;
    c.classList.remove('selecionada');
  });

  vibrar(30);
}

/* ---------- dificuldade e odds ---------- */

function escolherDificuldade(nivel) {
  if (estado.animandoOdds || estado.oddsTravadas) return;
  estado.dificuldade = nivel;

  document.querySelectorAll('.chip-dif').forEach(c => {
    c.classList.toggle('selecionada', c.dataset.dif === nivel);
    c.disabled = true;
  });

  el('odds-box').style.display = 'flex';
  animarOdds(nivel);
  vibrar(30);
}

function oddNaFaixa(faixa) {
  return (Math.random() * (faixa[1] - faixa[0]) + faixa[0]).toFixed(2);
}

/* Odds com efeito de "roleta" antes de travar na faixa do risco */
function animarOdds(nivel) {
  estado.animandoOdds = true;
  el('btn-gerar').disabled = true;

  const faixas = DIFICULDADES[nivel];
  const fim = Date.now() + 900;
  const intervalo = setInterval(() => {
    el('odd-sim').textContent = (Math.random() * 3.3 + 1.2).toFixed(2);
    el('odd-nao').textContent = (Math.random() * 3.3 + 1.2).toFixed(2);

    if (Date.now() >= fim) {
      clearInterval(intervalo);
      el('odd-sim').textContent = oddNaFaixa(faixas.sim);
      el('odd-nao').textContent = oddNaFaixa(faixas.nao);
      estado.animandoOdds = false;
      estado.oddsTravadas = true;
      el('btn-gerar').disabled = false;
      abrirApostas();
      vibrar(60);
    }
  }, 70);
}

/* ---------- apostas da roda ---------- */

function abrirApostas() {
  el('apostas-box').style.display = 'block';
  el('timer-row').style.display = 'flex';
  el('botoes-acao').style.display = 'flex';
  el('btn-green').disabled = false;
  el('btn-red').disabled = false;
  renderizarApostas();
}

/* Cada toque no nome alterna: fora → SIM → NÃO → fora */
function alternarAposta(nome) {
  const atual = estado.apostas[nome];
  if (atual === 'sim') estado.apostas[nome] = 'nao';
  else if (atual === 'nao') delete estado.apostas[nome];
  else estado.apostas[nome] = 'sim';
  renderizarApostas();
  vibrar(20);
}

function renderizarApostas() {
  const grade = el('apostas-grid');
  grade.innerHTML = '';
  estado.jogadores.forEach(nome => {
    if (nome === estado.alvo) return; // o alvo não aposta em si mesmo
    const aposta = estado.apostas[nome];
    const chip = document.createElement('button');
    chip.className = 'chip-aposta' + (aposta ? ' ' + aposta : '');
    chip.textContent =
      aposta === 'sim' ? `${nome} ✅` :
      aposta === 'nao' ? `${nome} ❌` : nome;
    chip.onclick = () => alternarAposta(nome);
    grade.appendChild(chip);
  });
}

/* ---------- resultado ---------- */

function somarGoles(nome, qtd) {
  placarPessoal.goles[nome] = (placarPessoal.goles[nome] || 0) + qtd;
}

function resolverAposta(deuGreen) {
  if (estado.animandoOdds || !estado.oddsTravadas) return;
  cancelarTimer();
  estado.oddsTravadas = false;

  const oddSim = parseFloat(el('odd-sim').textContent);
  const oddNao = parseFloat(el('odd-nao').textContent);
  // a odd vira a quantidade de goles (mínimo 1)
  const golesSim = Math.max(1, Math.round(oddSim));
  const golesNao = Math.max(1, Math.round(oddNao));

  const apostaramSim = estado.jogadores.filter(n => estado.apostas[n] === 'sim');
  const apostaramNao = estado.jogadores.filter(n => estado.apostas[n] === 'nao');

  el('dificuldade-box').style.display = 'none';
  el('odds-box').style.display = 'none';
  el('apostas-box').style.display = 'none';
  el('timer-row').style.display = 'none';
  el('botoes-acao').style.display = 'none';

  const box = el('resultado-box');
  const alvo = estado.alvo;

  if (deuGreen) {
    estado.green++;
    el('placar-green').textContent = estado.green;
    apostaramNao.forEach(n => somarGoles(n, golesNao));
    GameNight.adicionarPontos('green-gole', alvo, 1); // ranking do Game Night

    box.className = 'green';
    box.innerHTML =
      `<span class="resultado-titulo">✅ GREEN! ${sortear(FRASES_GREEN)}</span>` +
      `<b>${alvo}</b> cumpriu o desafio!<br>` +
      (apostaramNao.length
        ? `Quem apostou <b>NÃO</b> bebe ` +
          `<span class="resultado-goles">${golesNao} gole${golesNao > 1 ? 's' : ''}</span>: ` +
          `<b>${listarNomes(apostaramNao)}</b>.`
        : `Ninguém duvidou — rodada sem gole. 😇`);
  } else {
    estado.red++;
    el('placar-red').textContent = estado.red;
    placarPessoal.pipocadas[alvo] = (placarPessoal.pipocadas[alvo] || 0) + 1;
    somarGoles(alvo, 1);
    apostaramSim.forEach(n => somarGoles(n, golesSim));

    box.className = 'red';
    box.innerHTML =
      `<span class="resultado-titulo">❌ RED! ${sortear(FRASES_RED)}</span>` +
      (apostaramSim.length
        ? `Quem apostou <b>SIM</b> bebe ` +
          `<span class="resultado-goles">${golesSim} gole${golesSim > 1 ? 's' : ''}</span>: ` +
          `<b>${listarNomes(apostaramSim)}</b>.`
        : `Ninguém confiou no alvo — e fizeram bem. 🫣`) +
      `<span class="resultado-extra">🍿 ${alvo} bebe 1 gole por ter pipocado ` +
      `(pipocada nº ${placarPessoal.pipocadas[alvo]} da noite).</span>`;
  }

  salvarPlacar();
  vibrar([60, 40, 60]);
}

/* ---------- placar da galera ---------- */

function abrirPlacar() {
  cancelarTimer();
  renderizarPlacarPessoal();
  irParaTela('tela-placar');
}

function fecharPlacar() {
  irParaTela(estado.tema ? 'tela-jogo' : 'tela-temas');
}

function renderizarPlacarPessoal() {
  const lista = el('placar-lista');
  lista.innerHTML = '';

  // junta jogadores atuais + quem já pontuou (mesmo que tenha saído)
  const nomes = [...new Set([
    ...estado.jogadores,
    ...Object.keys(placarPessoal.goles),
    ...Object.keys(placarPessoal.pipocadas)
  ])];
  nomes.sort((a, b) => (placarPessoal.goles[b] || 0) - (placarPessoal.goles[a] || 0));

  // Pipoqueiro da Noite: quem mais deu RED como alvo
  let pipoqueiro = null;
  let maxPipocadas = 0;
  nomes.forEach(n => {
    const p = placarPessoal.pipocadas[n] || 0;
    if (p > maxPipocadas) { maxPipocadas = p; pipoqueiro = n; }
  });

  const banner = el('banner-pipoqueiro');
  if (pipoqueiro) {
    banner.style.display = 'block';
    banner.innerHTML =
      `🍿 Pipoqueiro da Noite: <b>${pipoqueiro}</b> ` +
      `(${maxPipocadas} pipocada${maxPipocadas > 1 ? 's' : ''})`;
  } else {
    banner.style.display = 'none';
  }

  if (nomes.length === 0) {
    lista.innerHTML = '<p class="placar-vazio">Ninguém bebeu ainda. Rodem uma aposta!</p>';
    return;
  }

  nomes.forEach((n, i) => {
    const goles = placarPessoal.goles[n] || 0;
    const pipocadas = placarPessoal.pipocadas[n] || 0;
    const row = document.createElement('div');
    row.className = 'placar-row';
    row.innerHTML =
      `<span class="pos">${i + 1}º</span>` +
      `<span class="nome">${n}${n === pipoqueiro ? ' 🍿' : ''}</span>` +
      `<span class="dados">🍺 ${goles} gole${goles === 1 ? '' : 's'} · ❌ ${pipocadas} red${pipocadas === 1 ? '' : 's'}</span>`;
    lista.appendChild(row);
  });
}

function zerarPlacar() {
  placarPessoal = { goles: {}, pipocadas: {} };
  salvarPlacar();
  renderizarPlacarPessoal();
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

/* ---------- início ---------- */

carregarDados();
renderizarListaJogadores();
el('input-nome').addEventListener('keydown', e => {
  if (e.key === 'Enter') adicionarJogador();
});
