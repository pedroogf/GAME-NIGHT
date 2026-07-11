/* ============================================================
   GAME NIGHT — Mesa global e ranking compartilhado
   ------------------------------------------------------------
   Usado pelo hub e pelos jogos (via <script src="../ranking.js">).
   Guarda tudo no localStorage do site:
     - gamenight_jogadores : nomes da mesa (fluem para os jogos)
     - gamenight_pontos    : { chaveDoJogo: { nome: pontos } }

   Cada jogo soma pontos com a própria chave (ex.: 'green-gole').
   O ranking geral é a soma dos pontos de todos os jogos.
   ============================================================ */

const GameNight = (function () {
  const CHAVE_JOGADORES = 'gamenight_jogadores';
  const CHAVE_PONTOS = 'gamenight_pontos';

  function lerJson(chave, padrao) {
    try {
      const valor = JSON.parse(localStorage.getItem(chave));
      return (valor === null || valor === undefined) ? padrao : valor;
    } catch (e) {
      return padrao;
    }
  }

  /* ---------- mesa (jogadores) ---------- */

  function jogadores() {
    const lista = lerJson(CHAVE_JOGADORES, []);
    return Array.isArray(lista) ? lista : [];
  }

  function salvarJogadores(lista) {
    localStorage.setItem(CHAVE_JOGADORES, JSON.stringify(lista));
  }

  function adicionarJogador(nome) {
    nome = String(nome || '').trim();
    if (!nome) return false;
    const lista = jogadores();
    if (lista.some(j => j.toLowerCase() === nome.toLowerCase())) return false;
    lista.push(nome);
    salvarJogadores(lista);
    return true;
  }

  function removerJogador(nome) {
    salvarJogadores(jogadores().filter(j => j !== nome));
  }

  /* ---------- pontos ---------- */

  function pontos() {
    const dados = lerJson(CHAVE_PONTOS, {});
    return (dados && typeof dados === 'object' && !Array.isArray(dados)) ? dados : {};
  }

  function adicionarPontos(jogo, nome, qtd) {
    if (!jogo || !nome || !qtd) return;
    const dados = pontos();
    if (!dados[jogo]) dados[jogo] = {};
    dados[jogo][nome] = (dados[jogo][nome] || 0) + qtd;
    localStorage.setItem(CHAVE_PONTOS, JSON.stringify(dados));
  }

  function ordenar(mapa) {
    return Object.keys(mapa)
      .map(nome => ({ nome: nome, pontos: mapa[nome] }))
      .sort((a, b) => b.pontos - a.pontos);
  }

  function rankingDoJogo(jogo) {
    return ordenar(pontos()[jogo] || {});
  }

  function rankingGeral() {
    const soma = {};
    const dados = pontos();
    Object.keys(dados).forEach(jogo => {
      Object.keys(dados[jogo]).forEach(nome => {
        soma[nome] = (soma[nome] || 0) + dados[jogo][nome];
      });
    });
    return ordenar(soma);
  }

  function jogosComPontos() {
    const dados = pontos();
    return Object.keys(dados).filter(j => Object.keys(dados[j]).length > 0);
  }

  function zerarRanking() {
    localStorage.removeItem(CHAVE_PONTOS);
  }

  return {
    jogadores, salvarJogadores, adicionarJogador, removerJogador,
    adicionarPontos, rankingDoJogo, rankingGeral, jogosComPontos, zerarRanking
  };
})();
