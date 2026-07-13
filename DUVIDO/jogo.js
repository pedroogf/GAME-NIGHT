/* ============================================================
   DUVIDO — lógica do jogo
   ------------------------------------------------------------
   O app é o JUIZ, não o jogo: mostra o tema, responde se a
   palavra duvidada está na lista secreta e controla as vidas.
   Palavras faladas e não duvidadas NUNCA entram aqui.
   ============================================================ */

/* ================= ESTADO ================= */

const estado = {
  jogadores: [],        // { nome, vidas }
  vidasIniciais: 3,
  filaTemas: [],        // índices de TEMAS embaralhados (sem repetir até esgotar)
  tema: null,           // tema da rodada atual
  reveladas: new Set(), // posições já reveladas nesta rodada
  veredito: null,       // veredito pendente no overlay
  sugestao: null,       // item pendente da pergunta "você quis dizer…?"
};

/* ================= ATALHOS DE DOM ================= */

const $ = (id) => document.getElementById(id);

const telas = {
  setup: $("tela-setup"),
  jogo: $("tela-jogo"),
  rodada: $("tela-rodada"),
  vitoria: $("tela-vitoria"),
};

function mostrarTela(nome) {
  Object.values(telas).forEach((t) => t.classList.add("escondido"));
  telas[nome].classList.remove("escondido");
}

/* O reconhecimento de palavras (normalizar/julgar) vive em motor.js */

/* ================= FEEDBACK (vibração + som curto) ================= */

function feedback(tipo) {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(tipo === "na-lista" ? [80, 40, 80] : tipo === "fora" ? 250 : 40);
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notas = tipo === "na-lista" ? [523, 784] : tipo === "fora" ? [220, 165] : [392];
    notas.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.14 + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.14);
      osc.stop(ctx.currentTime + i * 0.14 + 0.25);
    });
  } catch (e) {
    /* sem som/vibração, sem drama */
  }
}

/* ================= TELA 1: SETUP ================= */

function renderizarSetup() {
  const lista = $("lista-jogadores");
  lista.innerHTML = "";
  estado.jogadores.forEach((j, i) => {
    const tag = document.createElement("div");
    tag.className = "tag-jogador";
    const nome = document.createElement("span");
    nome.textContent = j.nome;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "✕";
    btn.addEventListener("click", () => {
      estado.jogadores.splice(i, 1);
      renderizarSetup();
    });
    tag.append(nome, btn);
    lista.appendChild(tag);
  });
  $("btn-comecar").disabled = estado.jogadores.length < 2;
}

$("form-jogador").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("input-nome");
  const nome = input.value.trim();
  if (!nome) return;
  if (estado.jogadores.length >= 10) return;
  const repetido = estado.jogadores.some(
    (j) => j.nome.toLowerCase() === nome.toLowerCase()
  );
  if (repetido) {
    input.select();
    return;
  }
  estado.jogadores.push({ nome, vidas: estado.vidasIniciais });
  input.value = "";
  input.focus();
  renderizarSetup();
});

$("chips-vidas").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip-vida");
  if (!chip) return;
  estado.vidasIniciais = parseInt(chip.dataset.vidas, 10);
  document.querySelectorAll(".chip-vida").forEach((c) =>
    c.classList.toggle("selecionado", c === chip)
  );
});

$("btn-comecar").addEventListener("click", () => iniciarJogo());

function iniciarJogo() {
  estado.jogadores.forEach((j) => (j.vidas = estado.vidasIniciais));
  estado.filaTemas = [];
  proximoTema();
  mostrarTela("jogo");
}

/* ================= TEMAS ================= */

function proximoTema() {
  if (estado.filaTemas.length === 0) {
    // reembaralha todos os índices (Fisher-Yates)
    estado.filaTemas = TEMAS.map((_, i) => i);
    for (let i = estado.filaTemas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [estado.filaTemas[i], estado.filaTemas[j]] = [estado.filaTemas[j], estado.filaTemas[i]];
    }
  }
  estado.tema = TEMAS[estado.filaTemas.pop()];
  estado.reveladas = new Set();
  renderizarJogo();
}

/* ================= TELA 2: JOGO ================= */

function renderizarJogo(posicaoNova) {
  $("tema-titulo").textContent = estado.tema.tema;

  const lista = $("lista-slots");
  lista.innerHTML = "";
  const porPosicao = new Map(estado.tema.itens.map((it) => [it.posicao, it]));
  for (let p = 1; p <= 10; p++) {
    const li = document.createElement("li");
    li.className = "slot";
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = p + ".";
    const valor = document.createElement("span");
    valor.className = "valor";
    if (estado.reveladas.has(p)) {
      li.classList.add("revelado");
      if (p === posicaoNova) li.classList.add("novo");
      valor.textContent = porPosicao.get(p).resposta;
    } else {
      valor.textContent = "● ● ● ●";
    }
    li.append(num, valor);
    lista.appendChild(li);
  }

  renderizarPlacar();
}

function renderizarPlacar() {
  const placar = $("placar");
  placar.innerHTML = "";
  estado.jogadores.forEach((j) => {
    const chip = document.createElement("div");
    chip.className = "chip-jogador" + (j.vidas <= 0 ? " eliminado" : "");
    const nome = document.createElement("span");
    nome.className = "nome";
    nome.textContent = j.nome;
    const coracoes = document.createElement("span");
    coracoes.className = "coracoes";
    const cheios = "♥".repeat(Math.max(j.vidas, 0));
    const vazios = "♥".repeat(estado.vidasIniciais - Math.max(j.vidas, 0));
    coracoes.innerHTML = cheios + `<span class="vazio">${vazios}</span>`;
    chip.append(nome, coracoes);
    placar.appendChild(chip);
  });
}

/* ================= RESOLVER UM DUVIDO ================= */

$("form-duvido").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("input-palavra");
  const palavra = input.value;
  const resultado = julgar(palavra, estado.tema, estado.reveladas);
  if (!resultado) return; // campo vazio
  input.value = "";
  input.blur(); // recolhe o teclado: todo mundo precisa ver o veredito

  if (resultado.tipo === "fuzzy") {
    abrirConfirmacao(resultado.item);
  } else {
    abrirVeredito(resultado);
  }
});

/* ---------- overlay: "você quis dizer…?" ---------- */

const overlay = $("overlay");

function abrirConfirmacao(item) {
  estado.sugestao = item;
  overlay.className = "overlay confirmar";
  $("ov-confirmar").classList.remove("escondido");
  $("ov-veredito").classList.add("escondido");
  $("ov-sugestao").textContent = item.resposta;
}

$("btn-sim").addEventListener("click", () => {
  const item = estado.sugestao;
  estado.sugestao = null;
  abrirVeredito({
    tipo: estado.reveladas.has(item.posicao) ? "ja-revelado" : "na-lista",
    item,
  });
});

$("btn-nao").addEventListener("click", () => {
  // não era isso que o jogador falou → então não está na lista
  estado.sugestao = null;
  abrirVeredito({ tipo: "fora", item: null });
});

/* ---------- overlay: veredito ---------- */

function abrirVeredito(resultado) {
  estado.veredito = resultado;

  // item confirmado é revelado NA HORA e fica visível o resto da rodada
  if (resultado.tipo === "na-lista") {
    estado.reveladas.add(resultado.item.posicao);
    renderizarJogo(resultado.item.posicao);
  }

  overlay.className = "overlay " + resultado.tipo;
  $("ov-confirmar").classList.add("escondido");
  $("ov-veredito").classList.remove("escondido");

  const cfg = {
    "na-lista": {
      emoji: "✅",
      titulo: `ESTÁ NA LISTA — #${resultado.item ? resultado.item.posicao : ""}`,
      item: resultado.item ? resultado.item.resposta : "",
      subtitulo: "Quem DUVIDOU perde 1 vida. Toque no nome:",
      escolhe: true,
    },
    fora: {
      emoji: "❌",
      titulo: "NÃO ESTÁ NA LISTA",
      item: "",
      subtitulo: "Quem FALOU perde 1 vida. Toque no nome:",
      escolhe: true,
    },
    "ja-revelado": {
      emoji: "⚪",
      titulo: "JÁ FOI REVELADO",
      item: resultado.item ? `#${resultado.item.posicao} — ${resultado.item.resposta}` : "",
      subtitulo: "Ninguém perde vida.",
      escolhe: false,
    },
  }[resultado.tipo];

  $("ov-emoji").textContent = cfg.emoji;
  $("ov-titulo").textContent = cfg.titulo;
  $("ov-item").textContent = cfg.item;
  $("ov-item").classList.toggle("escondido", !cfg.item);
  $("ov-subtitulo").textContent = cfg.subtitulo;

  const nomes = $("ov-jogadores");
  nomes.innerHTML = "";
  if (cfg.escolhe) {
    // só jogadores vivos podem perder vida
    estado.jogadores
      .filter((j) => j.vidas > 0)
      .forEach((j) => {
        const btn = document.createElement("button");
        btn.className = "btn-perdedor";
        btn.textContent = j.nome;
        btn.addEventListener("click", () => aplicarPerda(j));
        nomes.appendChild(btn);
      });
  }
  $("btn-ninguem").classList.toggle("escondido", !cfg.escolhe);
  $("btn-voltar-jogo").classList.toggle("escondido", cfg.escolhe);

  feedback(resultado.tipo);
}

function fecharOverlay() {
  overlay.className = "overlay escondido";
  estado.veredito = null;
}

function aplicarPerda(jogador) {
  jogador.vidas--;
  if (navigator.vibrate) navigator.vibrate(60);
  fecharOverlay();

  const vivos = estado.jogadores.filter((j) => j.vidas > 0);
  if (vivos.length === 1) {
    $("nome-vencedor").textContent = `🎉 ${vivos[0].nome} 🎉`;
    // a rodada morreu junto com o penúltimo jogador: revela a lista + fonte
    $("vitoria-tema").textContent = estado.tema.tema;
    preencherListaFinal($("lista-final-vitoria"));
    $("vitoria-fonte").textContent = estado.tema.fonte ? `Fonte: ${estado.tema.fonte}` : "";
    mostrarTela("vitoria");
    return;
  }
  renderizarJogo();
}

$("btn-ninguem").addEventListener("click", () => {
  // válvula de escape pra digitação por engano — ninguém perde vida
  fecharOverlay();
  renderizarJogo();
});

$("btn-voltar-jogo").addEventListener("click", () => {
  fecharOverlay();
  renderizarJogo();
});

/* ================= FIM DE RODADA / PULAR ================= */

/* Monta a lista completa (10 itens em ordem, ✅ nos descobertos) num <ol> */
function preencherListaFinal(lista) {
  lista.innerHTML = "";
  [...estado.tema.itens]
    .sort((a, b) => a.posicao - b.posicao)
    .forEach((item) => {
      const li = document.createElement("li");
      const descoberto = estado.reveladas.has(item.posicao);
      if (descoberto) li.classList.add("descoberto");
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = item.posicao + ".";
      const nome = document.createElement("span");
      nome.textContent = item.resposta;
      li.append(num, nome);
      if (descoberto) {
        const marca = document.createElement("span");
        marca.className = "marcador";
        marca.textContent = "✅";
        li.appendChild(marca);
      }
      lista.appendChild(li);
    });
}

$("btn-encerrar").addEventListener("click", () => {
  $("rodada-tema").textContent = estado.tema.tema;
  preencherListaFinal($("lista-final"));
  $("rodada-fonte").textContent = estado.tema.fonte ? `Fonte: ${estado.tema.fonte}` : "";
  mostrarTela("rodada");
});

$("btn-proximo-tema").addEventListener("click", () => {
  proximoTema();
  mostrarTela("jogo");
});

$("btn-pular").addEventListener("click", () => {
  proximoTema();
});

/* ================= FIM DE JOGO ================= */

$("btn-revanche").addEventListener("click", () => iniciarJogo());

$("btn-novos-jogadores").addEventListener("click", () => {
  renderizarSetup();
  mostrarTela("setup");
});

/* ================= BOOT ================= */

validarBanco();
renderizarSetup();
