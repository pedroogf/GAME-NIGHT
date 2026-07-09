/* ============================================================
   CARTAS ESPECIAIS — FAZ OU BEBE (80 cartas)
   ------------------------------------------------------------
   Aparecem aleatoriamente (~5% das rodadas), SEM substituir
   a carta principal — são um evento extra da rodada.

   Cada carta especial:
     id        → número único (1 a 80)
     tipo      → sempre "evento"
     titulo    → nome do evento
     descricao → o que acontece
     duracao   → em rodadas:
                   0 = efeito instantâneo (acontece e some)
                   N = regra ativa pelas próximas N rodadas
     efeito    → identificador em snake_case do tipo de evento

   ⚠️ O efeito "inverter_ordem" tem impacto mecânico no jogo
   (inverte o sentido da roda). Os demais efeitos são
   instruções que os próprios jogadores executam.
   ============================================================ */

const SPECIAL_CARDS = [
  { "id": 1,  "tipo": "evento", "titulo": "Saúde geral", "descricao": "Todo mundo bebe 1 gole. Sem choro e sem exceção.", "duracao": 0, "efeito": "todos_bebem" },
  { "id": 2,  "tipo": "evento", "titulo": "Brinde duplo", "descricao": "Todos bebem 2 goles após um brinde coletivo puxado pelo jogador da vez.", "duracao": 0, "efeito": "todos_bebem" },
  { "id": 3,  "tipo": "evento", "titulo": "Vizinho azarado", "descricao": "O jogador à DIREITA de quem tirou esta carta bebe 2 goles.", "duracao": 0, "efeito": "jogador_direita_bebe" },
  { "id": 4,  "tipo": "evento", "titulo": "Cortesia da esquerda", "descricao": "O jogador à ESQUERDA de quem tirou esta carta bebe 2 goles.", "duracao": 0, "efeito": "jogador_esquerda_bebe" },
  { "id": 5,  "tipo": "evento", "titulo": "Sanduíche", "descricao": "Os DOIS vizinhos do jogador da vez bebem 1 gole cada. Ele assiste sorrindo.", "duracao": 0, "efeito": "vizinhos_bebem" },
  { "id": 6,  "tipo": "evento", "titulo": "Look do dia", "descricao": "Quem estiver usando alguma peça preta bebe 1 gole. Moda tem preço.", "duracao": 0, "efeito": "condicao_bebe" },
  { "id": 7,  "tipo": "evento", "titulo": "Pés na areia", "descricao": "Quem estiver descalço ou de chinelo bebe 1 gole. Conforto se paga.", "duracao": 0, "efeito": "condicao_bebe" },
  { "id": 8,  "tipo": "evento", "titulo": "Atrasado paga", "descricao": "Quem chegou por último na festa bebe 2 goles. A pontualidade agradece.", "duracao": 0, "efeito": "condicao_bebe" },
  { "id": 9,  "tipo": "evento", "titulo": "Bateria vermelha", "descricao": "Quem estiver com menos de 30% de bateria no celular bebe 2 goles.", "duracao": 0, "efeito": "condicao_bebe" },
  { "id": 10, "tipo": "evento", "titulo": "Cabelo solto", "descricao": "Quem estiver de cabelo preso bebe 1. Se ninguém estiver, quem tem cabelo mais comprido bebe 1.", "duracao": 0, "efeito": "condicao_bebe" },
  { "id": 11, "tipo": "evento", "titulo": "Detox relâmpago", "descricao": "Todos largam o celular AGORA. O último a soltar bebe 2 goles.", "duracao": 0, "efeito": "ultimo_bebe" },
  { "id": 12, "tipo": "evento", "titulo": "Mão no alto", "descricao": "Todos levantam a mão AGORA. O último bebe 2 goles.", "duracao": 0, "efeito": "ultimo_bebe" },
  { "id": 13, "tipo": "evento", "titulo": "Chão é lava", "descricao": "Todos tiram os pés do chão AGORA (vale levantar as pernas). O último bebe 2.", "duracao": 0, "efeito": "ultimo_bebe" },
  { "id": 14, "tipo": "evento", "titulo": "Polegar ninja", "descricao": "Todos colocam o polegar na testa. O último a perceber e copiar bebe 2 goles.", "duracao": 0, "efeito": "ultimo_bebe" },
  { "id": 15, "tipo": "evento", "titulo": "Estátua geral", "descricao": "Todos congelam AGORA. O primeiro a se mexer ou rir bebe 2 goles. O jogador da vez fiscaliza.", "duracao": 0, "efeito": "primeiro_bebe" },
  { "id": 16, "tipo": "evento", "titulo": "Dedo do destino", "descricao": "O jogador da vez escolhe alguém para beber 2 goles. Poder é poder.", "duracao": 0, "efeito": "escolhe_quem_bebe" },
  { "id": 17, "tipo": "evento", "titulo": "Cupido reverso", "descricao": "O jogador da vez escolhe DUAS pessoas para brindar e beber 1 gole juntas.", "duracao": 0, "efeito": "escolhe_quem_bebe" },
  { "id": 18, "tipo": "evento", "titulo": "Chuva de goles", "descricao": "No 3, cada um aponta para alguém. Quem receber mais dedos bebe 2 goles.", "duracao": 0, "efeito": "votacao_grupo" },
  { "id": 19, "tipo": "evento", "titulo": "Eleição do sumido", "descricao": "Votação relâmpago: quem mais some do grupo? O eleito bebe 2 e promete melhorar.", "duracao": 0, "efeito": "votacao_grupo" },
  { "id": 20, "tipo": "evento", "titulo": "Prêmio de simpatia", "descricao": "Votação: quem está mais animado hoje? O eleito DISTRIBUI 3 goles como quiser.", "duracao": 0, "efeito": "votacao_grupo" },
  { "id": 21, "tipo": "evento", "titulo": "Marcha ré", "descricao": "O sentido do jogo inverteu! A ordem dos jogadores agora é ao contrário.", "duracao": 0, "efeito": "inverter_ordem" },
  { "id": 22, "tipo": "evento", "titulo": "Túnel do tempo", "descricao": "Inverteu de novo! O sentido da roda muda a partir de agora.", "duracao": 0, "efeito": "inverter_ordem" },
  { "id": 23, "tipo": "evento", "titulo": "Pulo do gato", "descricao": "O próximo jogador da ordem é PULADO nesta volta. Ele bebe 1 de consolação.", "duracao": 0, "efeito": "pular_jogador" },
  { "id": 24, "tipo": "evento", "titulo": "Cadeira ejetora", "descricao": "O jogador da vez pula a própria vez FUTURA: na próxima volta, passa direto. Aproveite o descanso.", "duracao": 0, "efeito": "pular_jogador" },
  { "id": 25, "tipo": "evento", "titulo": "Escudo mágico", "descricao": "O jogador da vez ganha PROTEÇÃO: pode ignorar o próximo desafio sem beber. Use com sabedoria.", "duracao": 0, "efeito": "protecao" },
  { "id": 26, "tipo": "evento", "titulo": "Colete salva-vidas", "descricao": "O jogador da vez ganha 1 passe livre: pode anular UM gole seu quando quiser, uma única vez.", "duracao": 0, "efeito": "protecao" },
  { "id": 27, "tipo": "evento", "titulo": "Imunidade diplomática", "descricao": "O jogador da vez fica IMUNE a cartas especiais pelas próximas 3 rodadas.", "duracao": 3, "efeito": "imunidade" },
  { "id": 28, "tipo": "evento", "titulo": "Guarda-chuva", "descricao": "O jogador da vez não participa de eventos TODOS BEBEM pelas próximas 3 rodadas.", "duracao": 3, "efeito": "imunidade" },
  { "id": 29, "tipo": "evento", "titulo": "Rodada dupla", "descricao": "O jogador da vez tira DUAS cartas nesta rodada e cumpre (ou bebe) as duas.", "duracao": 0, "efeito": "rodada_dupla" },
  { "id": 30, "tipo": "evento", "titulo": "Eco do desafio", "descricao": "O desafio desta rodada vale TAMBÉM para o jogador à esquerda. Os dois cumprem ou bebem.", "duracao": 0, "efeito": "rodada_dupla" },
  { "id": 31, "tipo": "evento", "titulo": "Dupla dinâmica", "descricao": "O jogador da vez escolhe um parceiro: os dois cumprem o desafio da rodada JUNTOS (ou bebem juntos).", "duracao": 0, "efeito": "desafio_dupla" },
  { "id": 32, "tipo": "evento", "titulo": "Sombra fiel", "descricao": "O jogador da vez escolhe uma sombra: a pessoa repete TODOS os desafios dele por 2 rodadas.", "duracao": 2, "efeito": "desafio_dupla" },
  { "id": 33, "tipo": "evento", "titulo": "Lei do silêncio", "descricao": "Proibido falar o NOME de qualquer jogador. Quem falar bebe 1 na hora.", "duracao": 3, "efeito": "palavra_proibida" },
  { "id": 34, "tipo": "evento", "titulo": "Palavra maldita: SIM", "descricao": "A palavra SIM está proibida. Quem falar bebe 1 gole imediatamente.", "duracao": 3, "efeito": "palavra_proibida" },
  { "id": 35, "tipo": "evento", "titulo": "Palavra maldita: NÃO", "descricao": "A palavra NÃO está proibida. Cada deslize custa 1 gole. Boa sorte discordando.", "duracao": 3, "efeito": "palavra_proibida" },
  { "id": 36, "tipo": "evento", "titulo": "Censura na bebida", "descricao": "Proibido falar BEBER, BEBIDA ou GOLE. Quem falar... bebe 1. A ironia é proposital.", "duracao": 3, "efeito": "palavra_proibida" },
  { "id": 37, "tipo": "evento", "titulo": "Zona séria", "descricao": "Quem RIR bebe 1 gole. Cada risada conta. Que vençam os mortos por dentro.", "duracao": 3, "efeito": "quem_rir_bebe" },
  { "id": 38, "tipo": "evento", "titulo": "Festival do deboche", "descricao": "Quem rir bebe 1, mas TODOS são obrigados a tentar fazer os outros rirem. Guerra declarada.", "duracao": 2, "efeito": "quem_rir_bebe" },
  { "id": 39, "tipo": "evento", "titulo": "Mão esquerda oficial", "descricao": "Todos só podem beber com a mão esquerda. Errou a mão? 1 gole extra (com a esquerda).", "duracao": 3, "efeito": "regra_temporaria" },
  { "id": 40, "tipo": "evento", "titulo": "Brinde obrigatório", "descricao": "Antes de qualquer gole, é obrigatório brindar com alguém. Bebeu sem brindar? Mais 1.", "duracao": 4, "efeito": "regra_temporaria" },
  { "id": 41, "tipo": "evento", "titulo": "Voz de dublagem", "descricao": "Todos devem falar com voz de dublagem de filme. Voz normal custa 1 gole.", "duracao": 2, "efeito": "regra_temporaria" },
  { "id": 42, "tipo": "evento", "titulo": "Tratamento de gala", "descricao": "Todos devem se chamar de EXCELÊNCIA. Esqueceu? 1 gole por deslize, excelência.", "duracao": 3, "efeito": "regra_temporaria" },
  { "id": 43, "tipo": "evento", "titulo": "Cotovelo fantasma", "descricao": "Proibido apoiar cotovelos na mesa. Cada apoio flagrado: 1 gole.", "duracao": 3, "efeito": "regra_temporaria" },
  { "id": 44, "tipo": "evento", "titulo": "Idioma universal", "descricao": "Proibido falar português com o jogador da vez: só gestos ou línguas inventadas com ele.", "duracao": 2, "efeito": "regra_temporaria" },
  { "id": 45, "tipo": "evento", "titulo": "Aplauso solene", "descricao": "Todo desafio cumprido deve ser aplaudido DE PÉ por todos. Quem ficar sentado bebe 1.", "duracao": 3, "efeito": "regra_temporaria" },
  { "id": 46, "tipo": "evento", "titulo": "Pergunta é lei", "descricao": "Só é permitido falar com o jogador da vez POR PERGUNTAS. Afirmou? Bebeu 1.", "duracao": 2, "efeito": "regra_temporaria" },
  { "id": 47, "tipo": "evento", "titulo": "Apelido oficial", "descricao": "O jogador da vez ganha um apelido escolhido pelo grupo. Chamá-lo pelo nome real custa 1 gole.", "duracao": 5, "efeito": "regra_temporaria" },
  { "id": 48, "tipo": "evento", "titulo": "DJ da rodada", "descricao": "O jogador da vez vira DJ: escolhe a música ambiente pelas próximas 3 rodadas. Reclamou da música? 1 gole.", "duracao": 3, "efeito": "regra_temporaria" },
  { "id": 49, "tipo": "evento", "titulo": "Imposto da sorte", "descricao": "O jogador da vez escolhe um SÓCIO: sempre que um beber, o outro bebe junto.", "duracao": 3, "efeito": "regra_temporaria" },
  { "id": 50, "tipo": "evento", "titulo": "Cerimônia do copo", "descricao": "Todos devem segurar o copo com as DUAS mãos, como cálice sagrado. Uma mão só? 1 gole.", "duracao": 3, "efeito": "regra_temporaria" },
  { "id": 51, "tipo": "evento", "titulo": "Troca de assentos", "descricao": "TODOS trocam de lugar agora (ordem sorteada na bagunça). A roda continua do jogador da vez.", "duracao": 0, "efeito": "troca_vez" },
  { "id": 52, "tipo": "evento", "titulo": "Sequestro de vez", "descricao": "O jogador da vez DOA a próxima vez dele para quem quiser. A pessoa joga duas rodadas seguidas.", "duracao": 0, "efeito": "troca_vez" },
  { "id": 53, "tipo": "evento", "titulo": "Leilão de vez", "descricao": "Quem se voluntariar primeiro assume a PRÓXIMA rodada no lugar do próximo jogador. Ninguém? Segue o jogo.", "duracao": 0, "efeito": "troca_vez" },
  { "id": 54, "tipo": "evento", "titulo": "Espelho de goles", "descricao": "Nesta rodada, se o jogador da vez beber, TODOS bebem metade (arredonda pra cima).", "duracao": 0, "efeito": "todos_bebem" },
  { "id": 55, "tipo": "evento", "titulo": "Cofrinho comunitário", "descricao": "Cada jogador contribui: todos bebem 1 gole em homenagem ao jogador da vez, que rege o brinde.", "duracao": 0, "efeito": "todos_bebem" },
  { "id": 56, "tipo": "evento", "titulo": "Bônus de coragem", "descricao": "BÔNUS: se o jogador da vez CUMPRIR o desafio desta rodada, ele distribui 3 goles como quiser.", "duracao": 0, "efeito": "bonus" },
  { "id": 57, "tipo": "evento", "titulo": "Dobro ou nada", "descricao": "BÔNUS arriscado: o desafio da rodada vale em dobro. Cumpriu: distribui 4 goles. Recusou: bebe em dobro.", "duracao": 0, "efeito": "bonus" },
  { "id": 58, "tipo": "evento", "titulo": "Seguro contra vexame", "descricao": "BÔNUS: o jogador da vez pode TROCAR a próxima carta dele uma vez, sem custo. Válido 1 uso.", "duracao": 0, "efeito": "bonus" },
  { "id": 59, "tipo": "evento", "titulo": "Poupança de goles", "descricao": "BÔNUS: o jogador da vez guarda 2 goles num cofre imaginário para mandar alguém beber quando quiser (1 uso).", "duracao": 0, "efeito": "bonus" },
  { "id": 60, "tipo": "evento", "titulo": "Perdão geral", "descricao": "BÔNUS coletivo: todos os castigos e regras ativas são CANCELADOS agora. Recomeço limpo.", "duracao": 0, "efeito": "bonus" },
  { "id": 61, "tipo": "evento", "titulo": "Multa por bocejo", "descricao": "Quem bocejar bebe 1. E sim, ler esta carta já deu vontade de bocejar. Fiscalização pesada.", "duracao": 3, "efeito": "punicao" },
  { "id": 62, "tipo": "evento", "titulo": "Taxa do celular", "descricao": "Quem mexer no celular sem ser exigido pelo jogo bebe 2. O jogo virou zona livre de scroll.", "duracao": 3, "efeito": "punicao" },
  { "id": 63, "tipo": "evento", "titulo": "Pé no chão", "descricao": "Quem cruzar as pernas bebe 1. Ninguém sabe por quê, mas a regra é a regra.", "duracao": 3, "efeito": "punicao" },
  { "id": 64, "tipo": "evento", "titulo": "Xingamento taxado", "descricao": "Cada palavrão custa 1 gole. O cofre do palavrão está aberto e a mesa fiscaliza com prazer.", "duracao": 3, "efeito": "punicao" },
  { "id": 65, "tipo": "evento", "titulo": "Interrupção proibida", "descricao": "Quem interromper alguém falando bebe 1. Educação em jogo, literalmente.", "duracao": 3, "efeito": "punicao" },
  { "id": 66, "tipo": "evento", "titulo": "Duelo relâmpago", "descricao": "O jogador da vez e o da frente jogam pedra, papel e tesoura AGORA. Perdedor bebe 2.", "duracao": 0, "efeito": "duelo_relampago" },
  { "id": 67, "tipo": "evento", "titulo": "Par ou ímpar geral", "descricao": "O jogador da vez joga par ou ímpar com o vizinho que escolher. Quem perder bebe 2.", "duracao": 0, "efeito": "duelo_relampago" },
  { "id": 68, "tipo": "evento", "titulo": "Encarada surpresa", "descricao": "O jogador da vez encara quem quiser: 10 segundos. Quem rir ou desviar bebe 2. Empate: os dois bebem 1.", "duracao": 0, "efeito": "duelo_relampago" },
  { "id": 69, "tipo": "evento", "titulo": "Hora do conselho", "descricao": "Cada jogador dá um conselho de 5 segundos ao jogador da vez. Ele escolhe o pior e o autor bebe 2.", "duracao": 0, "efeito": "votacao_grupo" },
  { "id": 70, "tipo": "evento", "titulo": "Confraria do brinde", "descricao": "Brinde temático: o jogador da vez escolhe o tema (ex: aos boletos!) e todos brindam e bebem 1.", "duracao": 0, "efeito": "todos_bebem" },
  { "id": 71, "tipo": "evento", "titulo": "Modo espelho", "descricao": "Todos devem imitar a POSTURA do jogador da vez até a próxima rodada. Ele pode dificultar à vontade.", "duracao": 1, "efeito": "regra_temporaria" },
  { "id": 72, "tipo": "evento", "titulo": "Cala a boca oficial", "descricao": "O jogador da vez fica em silêncio TOTAL por 1 rodada. Só gestos. Falou, bebeu 2.", "duracao": 1, "efeito": "punicao" },
  { "id": 73, "tipo": "evento", "titulo": "Trono do rei", "descricao": "O jogador da vez vira REI por 2 rodadas: pode dar 1 ordem boba por rodada (dentro das regras da casa). Desobedecer custa 2 goles.", "duracao": 2, "efeito": "regra_temporaria" },
  { "id": 74, "tipo": "evento", "titulo": "Inflação de goles", "descricao": "TODOS os goles valem +1 pelas próximas 3 rodadas. A economia do copo está em crise.", "duracao": 3, "efeito": "regra_temporaria" },
  { "id": 75, "tipo": "evento", "titulo": "Deflação de goles", "descricao": "Alívio: TODOS os goles valem -1 (mínimo 1) pelas próximas 3 rodadas. O mercado agradece.", "duracao": 3, "efeito": "regra_temporaria" },
  { "id": 76, "tipo": "evento", "titulo": "Amigo invisível", "descricao": "Cada um vira responsável pelo copo do vizinho da direita por 2 rodadas: se ele beber, você anuncia dramaticamente.", "duracao": 2, "efeito": "regra_temporaria" },
  { "id": 77, "tipo": "evento", "titulo": "Loteria instantânea", "descricao": "O jogador da vez fala um número de 1 a 5. Todos mostram dedos no 3: quem coincidir com ele bebe 1.", "duracao": 0, "efeito": "sorte_grupo" },
  { "id": 78, "tipo": "evento", "titulo": "Onda do brinde", "descricao": "Começando no jogador da vez, cada um brinda com o próximo em sequência (efeito dominó). Quem quebrar a onda bebe 2.", "duracao": 0, "efeito": "sorte_grupo" },
  { "id": 79, "tipo": "evento", "titulo": "Voto de casal", "descricao": "Votação: qual dupla da mesa daria o melhor duo de reality? A dupla eleita brinda e bebe 1 junta.", "duracao": 0, "efeito": "votacao_grupo" },
  { "id": 80, "tipo": "evento", "titulo": "Gran finale", "descricao": "Momento raro: TODOS levantam, brindam ao grupo e bebem 1. Alguém tira uma foto para registrar. Obrigatório sorrir.", "duracao": 0, "efeito": "todos_bebem" }
];
