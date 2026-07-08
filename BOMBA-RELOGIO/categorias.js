/* ============================================================
   BANCO DE CATEGORIAS - Bomba-Relógio Etílica
   ------------------------------------------------------------
   Para adicionar/remover categorias, basta editar as listas
   dentro de cada grupo abaixo. Cada grupo pode ser ligado ou
   desligado mudando "ativo: true" para "ativo: false".

   Como funciona:
   - Cada grupo tem um "nome", um "emoji" e uma lista "itens".
   - O jogo junta automaticamente todos os grupos com ativo: true.
   ============================================================ */

const GRUPOS_CATEGORIAS = [
    {
        nome: "Bebida & Balada",
        emoji: "🍺",
        ativo: true,
        itens: [
            "Marcas de Cerveja",
            "Tipos de Drinks / Coquetéis",
            "Coisas que dão ressaca",
            "Mentiras que se fala na balada",
            "Marcas de Vodka ou Whisky",
            "Motivos para você já estar bêbado",
            "Coisas que rolam num after",
            "Sabores de energético",
            "Frases de quem bebeu demais"
        ]
    },
    {
        nome: "Cultura Pop & TV",
        emoji: "🎬",
        ativo: true,
        itens: [
            "Séries da Netflix",
            "Heróis da Marvel ou DC",
            "Filmes de terror",
            "Desenhos animados antigos",
            "Personagens da Disney",
            "Realities da TV brasileira",
            "Novelas famosas",
            "Vilões de filme",
            "Franquias de cinema",
            "Programas de auditório"
        ]
    },
    {
        nome: "Música",
        emoji: "🎵",
        ativo: true,
        itens: [
            "Cantores ou bandas de Axé/Pagode dos anos 90",
            "Bandas de Rock Nacional",
            "Cantores de Sertanejo",
            "Músicas de Funk",
            "Bandas internacionais",
            "Cantores de MPB",
            "Hits do verão",
            "Músicas que tocam em casamento",
            "Rappers brasileiros"
        ]
    },
    {
        nome: "Comida & Bebida",
        emoji: "🍕",
        ativo: true,
        itens: [
            "Sabores de pizza",
            "Comidas de boteco",
            "Frutas",
            "Doces de festa junina",
            "Marcas de salgadinho",
            "Comidas que dão gases",
            "Recheios de coxinha (ou pastel)",
            "Comidas típicas do Nordeste",
            "Coisas que se come no café da manhã"
        ]
    },
    {
        nome: "Geografia & Mundo",
        emoji: "🌎",
        ativo: true,
        itens: [
            "Países que começam com a letra 'A'",
            "Capitais do Brasil",
            "Estados brasileiros",
            "Pontos turísticos famosos",
            "Praias do Brasil",
            "Cidades que você quer conhecer",
            "Países da Europa",
            "Rios ou lagos famosos"
        ]
    },
    {
        nome: "Esportes",
        emoji: "⚽",
        ativo: true,
        itens: [
            "Times que já foram rebaixados no Brasileirão",
            "Jogadores de futebol famosos",
            "Esportes olímpicos",
            "Times de futebol europeus",
            "Coisas que um juiz faz",
            "Modalidades de luta",
            "Seleções que já ganharam a Copa"
        ]
    },
    {
        nome: "Adulto & Picante",
        emoji: "🔥",
        ativo: true,
        itens: [
            "Palavrões ou Xingamentos",
            "Coisas que você encontra num motel",
            "Motivos para terminar um namoro",
            "Cantadas ruins",
            "Apelidos carinhosos para o crush",
            "Coisas que se fala no primeiro encontro",
            "Fetiches (sem julgamento!)",
            "Desculpas depois da traição",
            "Partes do corpo"
        ]
    },
    {
        nome: "Dia a Dia",
        emoji: "🏠",
        ativo: true,
        itens: [
            "Desculpas para faltar ao trabalho",
            "Nomes de cachorro cafonas",
            "Aplicativos que você tem no celular",
            "Coisas que você esquece de fazer",
            "Objetos que existem numa cozinha",
            "Profissões",
            "Coisas que dão na sua avó de presente",
            "Marcas de carro",
            "Coisas que juntam sujeira em casa"
        ]
    },
    {
        nome: "Aleatório & Divertido",
        emoji: "🎲",
        ativo: true,
        itens: [
            "Coisas verdes",
            "Coisas redondas",
            "Coisas que voam",
            "Super-poderes que você queria ter",
            "Coisas que assustam",
            "Animais perigosos",
            "Coisas que existem no céu",
            "Palavras que rimam com 'amor'",
            "Coisas frias"
        ]
    }
];

const PUNICOES = [
    "Beba 2 goles!",
    "Beba 3 goles!",
    "Escolha alguém para beber 3 goles com você!",
    "Vire o copo!",
    "Pague 1 gole para cada pessoa da mesa.",
    "Tome um shot (se tiver) ou 4 goles!",
    "Fique 1 rodada sem falar. Se falar, beba!",
    "Imite um animal antes de beber 2 goles.",
    "Conte um segredo ou beba 4 goles.",
    "A pessoa à sua direita escolhe sua bebida!",
    "Beba com o braço cruzado com alguém.",
    "Dance por 10 segundos e depois beba 2 goles."
];

/* Junta todas as categorias dos grupos ativos numa lista única. */
function montarListaCategorias() {
    const lista = [];
    GRUPOS_CATEGORIAS.forEach(function (grupo) {
        if (grupo.ativo) {
            grupo.itens.forEach(function (item) {
                lista.push(item);
            });
        }
    });
    return lista;
}
