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
    link: "BOMBA-RELOGIO/index.html",
    chave: "bomba"
  },
  {
    emoji: "🕵️",
    nome: "Impostor",
    descricao: "Todos sabem a palavra secreta — menos o impostor. Descubra quem é!",
    jogadores: "3+ jogadores",
    cor: "#E7C15C",
    link: "IMPOSTOR/index.html",
    chave: "impostor"
  },
  {
    emoji: "🃏",
    nome: "Sueca",
    descricao: "Sorteie uma carta do baralho e cumpra a regra. Sem repetição!",
    jogadores: "2+ jogadores",
    cor: "#C62839",
    link: "SUECA/index.html",
    chave: "sueca"
  },
  {
    emoji: "💸",
    nome: "Green ou Gole",
    descricao: "Aposte nos desafios da roda: deu green ou alguém bebe!",
    jogadores: "3+ jogadores",
    cor: "#22E584",
    link: "GREEN-GOLE/index.html",
    chave: "green-gole"
  },
  {
    emoji: "🎯",
    nome: "Chuta Aí",
    descricao: "Perguntas curiosas de números: quem chutar mais perto vence!",
    jogadores: "2+ jogadores",
    cor: "#4EA8FF",
    link: "CHUTA-AI/index.html",
    chave: "chuta-ai"
  },
  {
    emoji: "🍻",
    nome: "Faz ou Bebe",
    descricao: "Tire uma carta e escolha: encara o desafio ou bebe os goles!",
    jogadores: "2+ jogadores",
    cor: "#F97316",
    link: "FAZ-OU-BEBE/index.html",
    chave: "faz-ou-bebe"
  }

  // 👉 Novo jogo? Adicione uma vírgula acima e cole um bloco aqui.
];
