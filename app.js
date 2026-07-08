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
