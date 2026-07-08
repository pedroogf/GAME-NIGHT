/* ============================================================
   LISTA DE JOGOS
   ------------------------------------------------------------
   Para adicionar um jogo novo, copie um bloco { ... } abaixo
   e preencha os campos:

     emoji     → ícone do jogo (um emoji)
     nome      → nome que aparece no card
     descricao → uma frase curta explicando o jogo
     jogadores → texto do "selo" (ex.: "3+ jogadores")
     cor       → cor de destaque do card (código hex)
     link      → caminho da pasta do jogo (o index.html dela)

   Depois é só salvar. O menu se monta sozinho.
   ============================================================ */

const JOGOS = [
  {
    emoji: "💣",
    nome: "Bomba de Categorias",
    descricao: "Passe o celular e responda rápido antes que a bomba exploda!",
    jogadores: "3+ jogadores",
    cor: "#FF4D6D",
    link: "BOMBA-RELOGIO/index.html"
  },
  {
    emoji: "🕵️",
    nome: "Impostor",
    descricao: "Todos sabem a palavra secreta — menos o impostor. Descubra quem é!",
    jogadores: "3+ jogadores",
    cor: "#E7C15C",
    link: "IMPOSTOR/index.html"
  }

  // 👉 Novo jogo? Adicione uma vírgula acima e cole um bloco aqui.
];
