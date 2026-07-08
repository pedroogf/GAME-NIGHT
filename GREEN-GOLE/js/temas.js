/* ============================================================
   GREEN OU GOLE — TEMAS E DESAFIOS
   ------------------------------------------------------------
   Para adicionar um desafio novo, é só colar uma frase nova
   na lista do tema. Para criar um tema novo, copie um bloco
   inteiro { nome, emoji, mercados, desafios } e registre-o
   em TEMAS, depois crie o botão dele no index.html.
   ============================================================ */

const TEMAS = {

  futebol: {
    nome: "Futebol",
    emoji: "⚽",
    mercados: [
      "Mercado de Craques",
      "Rodada da Várzea",
      "Prorrogação Maldita",
      "Zona do Rebaixamento",
      "Mata-mata do Boteco"
    ],
    desafios: [
      "Citar 4 times da Liga MX em menos de 10 segundos.",
      "Citar 5 times da MLS sem gaguejar.",
      "Citar todos os times paulistas da Série A sem respirar.",
      "Falar 5 campeões diferentes da Champions League em 10 segundos.",
      "Citar 6 jogadores da Seleção Penta de 2002.",
      "Imitar a comemoração de um jogador famoso até a roda adivinhar quem é.",
      "Citar 3 clubes em que o Neymar já jogou, em 5 segundos.",
      "Narrar um gol imaginário por 15 segundos sem pausar e sem rir.",
      "Citar 3 estádios brasileiros e as cidades deles.",
      "Falar 5 seleções africanas que já jogaram Copa do Mundo.",
      "Citar 4 goleiros brasileiros históricos em 10 segundos.",
      "Falar 3 jogadores que atuaram no Real Madrid E no Barcelona.",
      "Imitar um narrador de futebol até alguém adivinhar quem é.",
      "Falar o placar de 2 finais de Copa do Mundo (com os anos).",
      "Citar 5 camisas 10 históricas do futebol em 10 segundos.",
      "Citar 4 técnicos que já treinaram a Seleção Brasileira.",
      "Falar 6 times da Premier League em 8 segundos.",
      "Cantar um grito de torcida completo sem errar a letra.",
      "Citar 5 países que já sediaram Copa do Mundo.",
      "Falar 4 artilheiros de Copas do Mundo.",
      "Citar 3 times italianos e 3 alemães em 12 segundos.",
      "Explicar a regra do impedimento em 15 segundos sem enrolar.",
      "Citar 3 ídolos do seu maior rival (sem chorar).",
      "Falar 3 apelidos de seleções e dizer de quais países são.",
      "Citar 5 brasileiros que jogam na Europa atualmente.",
      "Fazer 5 embaixadinhas com uma bolinha de papel."
    ]
  },

  resenha: {
    nome: "Resenha",
    emoji: "🍻",
    mercados: [
      "Mercado do Mico",
      "Rodada da Vergonha",
      "Zona do Improviso",
      "Liga dos Aleatórios",
      "Campeonato da Resenha"
    ],
    desafios: [
      "Equilibrar um copo vazio na cabeça por 10 segundos.",
      "Acertar 3 bolinhas de papel dentro de um copo a 2 passos de distância.",
      "Falar o alfabeto de trás pra frente até a letra P sem errar.",
      "Imitar um animal (sem fazer o som óbvio) até a roda adivinhar.",
      "Falar 10 nomes de pessoa com a letra J em 15 segundos.",
      "Fazer 10 polichinelos contando em espanhol.",
      "Contar uma piada — se ninguém rir, pipocou.",
      "Ficar 30 segundos sem piscar, encarando o juiz.",
      "Falar 'o rato roeu a roupa do rei de Roma' 3 vezes rápido sem errar.",
      "Dançar por 15 segundos sem música e sem rir.",
      "Fazer a roda inteira rir em 20 segundos usando só mímica.",
      "Citar 5 marcas de cerveja em 8 segundos.",
      "Fazer uma declaração de amor dramática para o objeto mais próximo.",
      "Sustentar uma nota cantando 'aaaa' por 10 segundos sem falhar.",
      "Falar 'um prato de trigo para três tigres tristes' 3 vezes seguidas.",
      "De olhos fechados, adivinhar quem falou 'oi' (a roda escolhe em silêncio).",
      "Encarar a pessoa à sua frente por 15 segundos sem rir.",
      "Contar de 1 até 20 pulando todos os múltiplos de 3.",
      "Imitar alguém da roda até adivinharem quem é.",
      "Falar 8 frutas em 10 segundos sem repetir nenhuma.",
      "Aguentar 20 segundos na posição de prancha.",
      "Falar por 20 segundos, sem pausar, sobre um assunto que a roda escolher.",
      "Girar 5 vezes no lugar e depois andar em linha reta.",
      "Dizer o nome completo de 3 pessoas da roda sem errar.",
      "Soletrar 'otorrinolaringologista' sem errar.",
      "Inventar uma rima na hora com o nome de alguém da roda."
    ]
  }

};

/* Possíveis alvos do desafio (sorteados a cada rodada) */
const ALVOS = [
  "Você (quem apertou o botão)",
  "A pessoa à sua direita",
  "A pessoa à sua esquerda",
  "Quem está na sua frente",
  "A pessoa mais nova da roda",
  "A pessoa mais velha da roda",
  "O dono do celular",
  "Quem bebeu por último",
  "Quem riu por último"
];

/* Frases de resultado (sorteadas) */
const FRASES_GREEN = [
  "O alvo amassou! 🔥",
  "Cravou! Tá voando!",
  "Fez parecer fácil!",
  "Que fase! Bateu no gordo!",
  "Green dos green!"
];

const FRASES_RED = [
  "Pipocou na hora H!",
  "Deu ruim, torcida foi ao chão!",
  "Bola na arquibancada!",
  "Perdeu feio, perdeu rude!",
  "Red doloroso!"
];
