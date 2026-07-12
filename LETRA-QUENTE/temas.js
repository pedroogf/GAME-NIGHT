/* ============================================================
   BANCO DE TEMAS - Letra Quente
   ------------------------------------------------------------
   Para adicionar um tema novo, copie um bloco { ... } e preencha:

     nome    → nome do tema (aparece no card e na rodada)
     emoji   → ícone do tema
     ativo   → true aparece no menu, false esconde
     excluir → letras que NÃO caem nesse tema (as impossíveis)

   As letras sorteadas vêm de LETRAS_BASE menos as excluídas.
   ============================================================ */

const LETRAS_BASE = "ABCDEFGHIJLMNOPQRSTUV".split("");

const TEMAS = [
    { nome: "Objetos",                emoji: "📦", ativo: true, excluir: [] },
    { nome: "Animais",                emoji: "🐾", ativo: true, excluir: [] },
    { nome: "Comidas",                emoji: "🍔", ativo: true, excluir: [] },
    { nome: "Bebidas",                emoji: "🍹", ativo: true, excluir: ["H", "N", "O"] },
    { nome: "Nomes de Pessoa",        emoji: "🧑", ativo: true, excluir: [] },
    { nome: "Cidades ou Países",      emoji: "🌍", ativo: true, excluir: [] },
    { nome: "Profissões",             emoji: "💼", ativo: true, excluir: [] },
    { nome: "Marcas",                 emoji: "🏷️", ativo: true, excluir: [] },
    { nome: "Filmes ou Séries",       emoji: "🎬", ativo: true, excluir: ["Q"] },
    { nome: "Cantores ou Bandas",     emoji: "🎵", ativo: true, excluir: ["Q"] },
    { nome: "Esportes ou Times",      emoji: "⚽", ativo: true, excluir: ["Q"] },
    { nome: "Roupas e Acessórios",    emoji: "👕", ativo: true, excluir: ["H", "U"] },
    { nome: "Coisas que Tem na Rua",  emoji: "🚦", ativo: true, excluir: [] },
    { nome: "Coisas de Festa",        emoji: "🎉", ativo: true, excluir: ["Q", "H", "U"] },
    { nome: "Personagens Famosos",    emoji: "🦸", ativo: true, excluir: ["Q"] },
    { nome: "Frutas ou Verduras",     emoji: "🍉", ativo: true, excluir: ["D", "H", "N", "O", "S", "V"] }

    // 👉 Novo tema? Adicione uma vírgula acima e cole um bloco aqui.
];

/* ============================================================
   PRENDAS - Quem estoura o tempo tira uma dessas (tema: bebida)
   ============================================================ */

const PRENDAS = [
    "Vire 2 goles!",
    "Vire 3 goles!",
    "Shot ou 5 goles: você escolhe!",
    "Beba 2 goles sem usar as mãos!",
    "Todo mundo manda 1 gole pra você. Beba todos!",
    "Escolha alguém pra virar 2 goles junto com você!",
    "Vire seu copo inteiro (ou 4 goles)!",
    "Beba 2 goles de olhos fechados!",
    "Beba 3 goles e conte um mico seu!",
    "Beba 1 gole pra cada letra do seu nome!",
    "Troque de copo com quem está à sua direita e beba 2 goles!",
    "Faça um brinde dramático e vire 2 goles!",
    "Beba 2 goles imitando alguém da roda!",
    "Deixe a pessoa à sua esquerda escolher quanto você bebe (máx. 4 goles)!",
    "Beba 2 goles e fale uma palavra do tema com a letra... agora sem pressão!",
    "Beba 1 gole em câmera lenta enquanto todos observam!",
    "Vire 2 goles e fique de castigo: fora da próxima rodada!",
    "Beba 2 goles e elogie o jogador que você acha que vai perder a próxima!"
];
