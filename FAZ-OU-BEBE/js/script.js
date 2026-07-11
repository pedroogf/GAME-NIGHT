/* ============================================================
   SCRIPT — interface: telas, botões e renderização
   ------------------------------------------------------------
   Liga o HTML à lógica do game.js. Nenhuma regra de jogo
   mora aqui, só apresentação.
   ============================================================ */

/* ---------- ESTADO DA CONFIGURAÇÃO DE PARTIDA (setup) ---------- */

const setup = {
  qtdJogadores: 4,
  nomesAutomaticos: true,
  modo: null
};

/* ---------- NAVEGAÇÃO BÁSICA ---------- */

function abrirTela(id) {
  Som.clique();
  irParaTela(id);
}

function voltarInicio() {
  Som.clique();
  irParaTela("tela-inicio");
}

/* ---------- SETUP: QUANTIDADE DE JOGADORES ---------- */

function mudarQtd(delta) {
  Som.clique();
  setup.qtdJogadores = Math.min(20, Math.max(2, setup.qtdJogadores + delta));
  document.getElementById("qtd-valor").textContent = setup.qtdJogadores;
  if (!setup.nomesAutomaticos) montarCamposNomes();
}

function definirNomesAuto(auto) {
  Som.clique();
  setup.nomesAutomaticos = auto;
  document.getElementById("chip-auto").classList.toggle("on", auto);
  document.getElementById("chip-manual").classList.toggle("on", !auto);
  document.getElementById("lista-nomes").classList.toggle("oculto", auto);
  if (!auto) montarCamposNomes();
}

/* Nomes da mesa do Game Night (cadastrados no hub) */
function nomesDaMesa() {
  return (typeof GameNight !== "undefined") ? GameNight.jogadores() : [];
}

/* Cria um campo de nome para cada jogador, preservando o que já foi
   digitado e sugerindo os nomes da mesa do Game Night */
function montarCamposNomes() {
  const lista = document.getElementById("lista-nomes");
  const digitados = Array.from(lista.querySelectorAll("input")).map(i => i.value);
  const globais = nomesDaMesa();
  lista.innerHTML = "";
  for (let i = 0; i < setup.qtdJogadores; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 18;
    input.placeholder = "Jogador " + (i + 1);
    input.value = digitados[i] || globais[i] || "";
    lista.appendChild(input);
  }
}

function confirmarJogadores() {
  Som.clique();
  irParaTela("tela-modo");
}

/* ---------- SETUP: MODO DE JOGO ---------- */

function escolherModo(modo) {
  if (modo === "pesado" && config.semPesado) {
    mostrarToast("Cartas pesadas estão desativadas nas configurações.");
    return;
  }
  Som.clique();
  setup.modo = modo;

  // monta a lista final de nomes: digitados > mesa do Game Night > Jogador N
  const nomes = [];
  const inputs = document.querySelectorAll("#lista-nomes input");
  const globais = nomesDaMesa();
  for (let i = 0; i < setup.qtdJogadores; i++) {
    const digitado = !setup.nomesAutomaticos && inputs[i] ? inputs[i].value.trim() : "";
    const daMesa = setup.nomesAutomaticos ? (globais[i] || "") : "";
    nomes.push(digitado || daMesa || "Jogador " + (i + 1));
  }

  iniciarPartida(nomes, modo);
  novaRodada(false);
  irParaTela("tela-jogo");
}

/* ---------- JOGO: RODADAS ---------- */

/* Prepara a tela para uma rodada nova (carta virada para baixo) */
function novaRodada(avancar) {
  if (avancar) {
    const encerrados = passarRodada();
    encerrados.forEach(ev => mostrarToast("Regra encerrada: " + ev.titulo));
    avancarJogador();
  }
  partida.cartaAtual = null;
  partida.revelada = false;
  virarCarta(false);
  renderizarRodada();
}

function renderizarRodada() {
  document.getElementById("vez-nome").textContent = jogadorAtual();
  document.getElementById("acoes-reveladas").classList.toggle("oculto", !partida.revelada);
  document.getElementById("dica-toque").classList.toggle("oculto", partida.revelada);
  renderizarEventos();
  renderizarContador();
}

function renderizarContador() {
  const el = document.getElementById("contador-cartas");
  el.classList.toggle("oculto", !config.mostrarRestantes);
  el.textContent = "🃏 " + cartasRestantes() + " cartas restantes";
}

/* Chips com as regras temporárias ativas */
function renderizarEventos() {
  const area = document.getElementById("eventos-ativos");
  area.innerHTML = "";
  partida.eventosAtivos.forEach(ev => {
    const chip = document.createElement("div");
    chip.className = "evento-chip";
    chip.textContent = "⚡ " + ev.titulo + " · " + ev.restantes + (ev.restantes === 1 ? " rodada" : " rodadas");
    chip.title = ev.descricao;
    chip.onclick = () => mostrarToast(ev.descricao);
    area.appendChild(chip);
  });
}

/* ---------- JOGO: REVELAR CARTA ---------- */

function tocarCarta() {
  if (partida.revelada) return;
  Som.suspense();
  const { carta, reiniciou } = comprarCarta();
  preencherCarta(carta);
  virarCarta(true);
  Som.flip();
  if (reiniciou) {
    Som.vitoria();
    mostrarToast("Todas as cartas foram usadas! Baralho reembaralhado. 🎉");
  }
  renderizarRodada();

  // carta especial (~5%): aparece por cima, sem substituir a principal
  const especial = sortearEspecial();
  if (especial) setTimeout(() => mostrarEspecial(especial), 700);
}

/* Escreve o conteúdo da carta no verso (lado revelado) */
function preencherCarta(carta) {
  document.getElementById("carta-categoria").textContent = carta.categoria;
  const badge = document.getElementById("carta-modo");
  badge.textContent = carta.modo === "pesado" ? "🔥 Pesado" : "🍺 Resenha";
  badge.className = "carta-modo " + carta.modo;
  document.getElementById("carta-titulo").textContent = carta.titulo;
  document.getElementById("carta-descricao").textContent = carta.descricao;
  document.getElementById("carta-goles").textContent =
    "Beba " + carta.goles + (carta.goles === 1 ? " gole" : " goles");
}

/* ---------- JOGO: BOTÕES DE AÇÃO ---------- */

/* Próxima carta → passa a vez e prepara rodada nova */
function proximaCarta() {
  Som.clique();
  novaRodada(true);
}

/* Fez ou bebeu? Registra no ranking do Game Night e passa a vez */
function registrarRodada(fez) {
  Som.clique();
  if (fez && typeof GameNight !== "undefined") {
    GameNight.adicionarPontos("faz-ou-bebe", jogadorAtual(), 1);
    mostrarToast("🏆 +1 ponto para " + jogadorAtual() + "!");
  }
  novaRodada(true);
}

/* Carta aleatória → mesmo jogador, outra carta */
function cartaAleatoria() {
  Som.clique();
  virarCarta(false);
  setTimeout(() => {
    partida.revelada = false;
    tocarCarta();
  }, config.animacoes ? 350 : 0);
}

/* Trocar jogador → abre a lista para escolher de quem é a vez */
function abrirTrocaJogador() {
  Som.clique();
  const lista = document.getElementById("lista-troca");
  lista.innerHTML = "";
  partida.jogadores.forEach((nome, i) => {
    const btn = document.createElement("button");
    btn.className = "btn-jogador" + (i === partida.indiceAtual ? " atual" : "");
    btn.textContent = nome;
    btn.onclick = () => {
      Som.clique();
      definirJogador(i);
      fecharModal("modal-troca");
      novaRodada(false);
    };
    lista.appendChild(btn);
  });
  document.getElementById("modal-troca").classList.add("aberto");
}

function fecharModal(id) {
  document.getElementById(id).classList.remove("aberto");
}

/* Sair da partida (com confirmação) */
function sairPartida() {
  Som.clique();
  document.getElementById("modal-sair").classList.add("aberto");
}

function confirmarSaida() {
  fecharModal("modal-sair");
  irParaTela("tela-inicio");
}

/* ---------- CARTA ESPECIAL (overlay) ---------- */

function mostrarEspecial(especial) {
  Som.especial();
  document.getElementById("especial-titulo").textContent = especial.titulo;
  document.getElementById("especial-descricao").textContent = especial.descricao;
  document.getElementById("especial-duracao").textContent =
    especial.duracao > 0
      ? "Vale pelas próximas " + especial.duracao + " rodadas"
      : "Efeito imediato";
  const overlay = document.getElementById("overlay-especial");
  overlay.classList.add("aberto");
  tremerElemento(overlay.querySelector(".especial-carta"));
  renderizarEventos();
}

function fecharEspecial() {
  Som.clique();
  document.getElementById("overlay-especial").classList.remove("aberto");
}

/* ---------- CONFIGURAÇÕES ---------- */

function alternarConfig(chave) {
  config[chave] = !config[chave];
  salvarConfig();
  aplicarPreferenciasVisuais();
  renderizarSwitches();
  if (chave === "sons" && config.sons) Som.clique();
  if (chave === "mostrarRestantes" && partida.jogadores.length) renderizarContador();
}

function renderizarSwitches() {
  const mapa = {
    "sw-sons": config.sons,
    "sw-animacoes": config.animacoes,
    "sw-tema": config.temaClaro,
    "sw-pesado": config.semPesado,
    "sw-contador": config.mostrarRestantes
  };
  Object.keys(mapa).forEach(id => {
    document.getElementById(id).classList.toggle("on", mapa[id]);
  });
}

/* ---------- INICIALIZAÇÃO ---------- */

document.addEventListener("DOMContentLoaded", () => {
  aplicarPreferenciasVisuais();
  renderizarSwitches();
  // se a mesa do Game Night tem gente, já sugere essa quantidade
  const globais = nomesDaMesa();
  if (globais.length >= 2) setup.qtdJogadores = Math.min(20, globais.length);
  document.getElementById("qtd-valor").textContent = setup.qtdJogadores;
});
