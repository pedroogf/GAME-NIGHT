/* ============================================================
   UTILS — funções de apoio: configurações, sorteio e sons
   ============================================================ */

/* ---------- CONFIGURAÇÕES (persistem no aparelho) ---------- */

const CONFIG_KEY = "fazoubebe_config";

const CONFIG_PADRAO = {
  sons: true,          // efeitos sonoros
  animacoes: true,     // animações de tela e flip
  temaClaro: false,    // false = escuro (padrão)
  semPesado: false,    // remove cartas pesadas do jogo
  mostrarRestantes: true // exibe contador de cartas restantes
};

let config = carregarConfig();

function carregarConfig() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CONFIG_KEY));
    return Object.assign({}, CONFIG_PADRAO, salvo || {});
  } catch (e) {
    return Object.assign({}, CONFIG_PADRAO);
  }
}

function salvarConfig() {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) { /* modo anônimo: segue sem salvar */ }
}

/* ---------- SORTEIO ---------- */

/* Embaralha um array (Fisher–Yates) sem alterar o original */
function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* Sorteia um item qualquer de um array */
function sortearItem(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

/* ---------- SONS (gerados na hora, sem arquivos externos) ---------- */

let audioCtx = null;

function obterAudio() {
  if (!config.sons) return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/* Toca uma nota simples (frequência em Hz, duração em segundos) */
function tocarNota(freq, duracao, tipo, volume, atraso) {
  const ctx = obterAudio();
  if (!ctx) return;
  const t = ctx.currentTime + (atraso || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tipo || "sine";
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(volume || 0.12, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duracao);
}

const Som = {
  clique()   { tocarNota(650, 0.06, "square", 0.05); },
  flip()     { tocarNota(300, 0.10, "triangle", 0.10); tocarNota(520, 0.12, "triangle", 0.08, 0.06); },
  suspense() { tocarNota(140, 0.35, "sine", 0.08); tocarNota(180, 0.30, "sine", 0.06, 0.12); },
  especial() { tocarNota(523, 0.12, "triangle", 0.10); tocarNota(659, 0.12, "triangle", 0.10, 0.10); tocarNota(784, 0.20, "triangle", 0.10, 0.20); },
  vitoria()  { tocarNota(523, 0.15, "triangle", 0.12); tocarNota(659, 0.15, "triangle", 0.12, 0.12); tocarNota(784, 0.15, "triangle", 0.12, 0.24); tocarNota(1046, 0.30, "triangle", 0.12, 0.36); }
};
