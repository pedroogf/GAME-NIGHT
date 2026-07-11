/* ============================================================
   Monta o menu de jogos a partir da lista em jogos.js.
   Normalmente você NÃO precisa mexer aqui — só no jogos.js.
   ============================================================ */

(function () {
  const lista = document.getElementById("lista-jogos");
  const contador = document.getElementById("contador-jogos");

  // Segurança: se jogos.js não carregou ou está vazio
  if (typeof JOGOS === "undefined" || !Array.isArray(JOGOS) || JOGOS.length === 0) {
    lista.innerHTML = '<div class="vazio">Nenhum jogo cadastrado ainda.<br>Adicione um em <b>jogos.js</b>.</div>';
    contador.textContent = "";
    return;
  }

  // Evita reprocessar caracteres especiais no HTML
  const escapar = (txt) =>
    String(txt).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  // Cria cada card
  JOGOS.forEach((jogo, i) => {
    const card = document.createElement("a");
    card.className = "jogo-card";
    card.href = jogo.link;
    card.style.setProperty("--cor", jogo.cor || "#7C5CFF");
    card.style.animationDelay = (i * 0.07) + "s";
    card.setAttribute("aria-label", jogo.nome);

    card.innerHTML = `
      <div class="jogo-icone">${escapar(jogo.emoji || "🎮")}</div>
      <div class="jogo-info">
        <div class="jogo-nome">${escapar(jogo.nome || "Jogo")}</div>
        <div class="jogo-desc">${escapar(jogo.descricao || "")}</div>
        <div class="jogo-meta">
          ${jogo.jogadores ? `<span class="pill">👥 ${escapar(jogo.jogadores)}</span>` : ""}
        </div>
      </div>
      <div class="jogo-seta" aria-hidden="true">›</div>
    `;

    lista.appendChild(card);
  });

  // Contador no rodapé
  const n = JOGOS.length;
  contador.textContent = n === 1 ? "1 jogo disponível" : `${n} jogos disponíveis`;
})();

/* ============================================================
   MESA GLOBAL E RANKING (usa GameNight, de ranking.js)
   ============================================================ */

let abaRankingAtual = "geral";

function alternarPainel(id) {
  ["painel-mesa", "painel-ranking"].forEach(p => {
    const painel = document.getElementById(p);
    painel.classList.toggle("aberto", p === id ? !painel.classList.contains("aberto") : false);
  });
  if (id === "painel-ranking") hubRenderizarRanking(abaRankingAtual);
}

/* ---------- mesa ---------- */

function hubAdicionarJogador() {
  const input = document.getElementById("input-nome");
  GameNight.adicionarJogador(input.value);
  input.value = "";
  input.focus();
  hubRenderizarMesa();
}

function hubRemoverJogador(nome) {
  GameNight.removerJogador(nome);
  hubRenderizarMesa();
}

function hubRenderizarMesa() {
  const lista = document.getElementById("lista-mesa");
  const nomes = GameNight.jogadores();
  lista.innerHTML = "";

  if (nomes.length === 0) {
    lista.innerHTML = '<p class="mesa-vazia">Ninguém na mesa ainda.</p>';
  } else {
    nomes.forEach(nome => {
      const chip = document.createElement("button");
      chip.className = "chip-nome";
      chip.innerHTML = `${nome} <span class="x">×</span>`;
      chip.onclick = () => hubRemoverJogador(nome);
      lista.appendChild(chip);
    });
  }

  document.getElementById("chip-mesa").textContent =
    "👥 Jogadores" + (nomes.length ? " · " + nomes.length : "");
}

/* ---------- ranking ---------- */

function nomeDoJogo(chave) {
  const jogo = JOGOS.find(j => j.chave === chave);
  return jogo ? `${jogo.emoji} ${jogo.nome}` : chave;
}

function hubRenderizarRanking(aba) {
  abaRankingAtual = aba;

  // abas: Geral + um chip para cada jogo que já tem pontos
  const abas = document.getElementById("abas-ranking");
  abas.innerHTML = "";
  const opcoes = ["geral", ...GameNight.jogosComPontos()];
  opcoes.forEach(chave => {
    const chip = document.createElement("button");
    chip.className = "aba-ranking" + (chave === aba ? " ativa" : "");
    chip.textContent = chave === "geral" ? "🌟 Geral" : nomeDoJogo(chave);
    chip.onclick = () => hubRenderizarRanking(chave);
    abas.appendChild(chip);
  });

  // linhas do ranking
  const lista = document.getElementById("ranking-lista");
  lista.innerHTML = "";
  const dados = aba === "geral" ? GameNight.rankingGeral() : GameNight.rankingDoJogo(aba);

  if (dados.length === 0) {
    lista.innerHTML = '<p class="mesa-vazia">Sem pontos ainda. Joguem uma rodada!</p>';
    return;
  }

  const medalhas = ["🥇", "🥈", "🥉"];
  dados.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "ranking-row";
    row.innerHTML =
      `<span class="pos">${medalhas[i] || (i + 1) + "º"}</span>` +
      `<span class="nome">${item.nome}</span>` +
      `<span class="pts">${item.pontos} pt${Math.abs(item.pontos) === 1 ? "" : "s"}</span>`;
    lista.appendChild(row);
  });
}

function hubZerarRanking() {
  GameNight.zerarRanking();
  hubRenderizarRanking("geral");
}

/* ---------- início ---------- */

hubRenderizarMesa();
document.getElementById("input-nome").addEventListener("keydown", e => {
  if (e.key === "Enter") hubAdicionarJogador();
});
