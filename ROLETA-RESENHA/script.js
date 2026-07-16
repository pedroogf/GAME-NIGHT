/* ============================================================
   ROLETA DA RESENHA
   ------------------------------------------------------------
   Jogo de festa: duas roletas (pessoa + cor) definem quem fala
   o quê sobre quem. Sem dependências — HTML/CSS/JS puros.

   Organização do arquivo:
     1. Bancos de conteúdo (cores, frases, eventos, prendas...)
     2. Estado e persistência (localStorage)
     3. Utilidades (sorteio ponderado, toast, modais, navegação)
     4. Sons e vibração
     5. Jogadores (cadastro)
     6. Configurações (telas de setup)
     7. Roletas (canvas + animação de giro)
     8. Partida (rodadas, resultado, cronômetro, efeitos)
     9. Resumo final
    10. Inicialização
   ============================================================ */

'use strict';

/* ============================================================
   1. BANCOS DE CONTEÚDO
   ============================================================ */

const CORES = {
    azul:     { nome: 'Elogio',      icone: '💙', hex: '#3b82f6', base: 20, texto: '#fff' },
    vermelho: { nome: 'Crítica',     icone: '🔥', hex: '#ef4444', base: 15, texto: '#fff' },
    verde:    { nome: 'História',    icone: '📖', hex: '#22c55e', base: 12, texto: '#fff' },
    amarelo:  { nome: 'Pergunta',    icone: '❓', hex: '#eab308', base: 12, texto: '#3a2c00' },
    roxo:     { nome: 'Imitação',    icone: '🎭', hex: '#8b5cf6', base: 10, texto: '#fff' },
    laranja:  { nome: 'Comparação',  icone: '⚖️', hex: '#f97316', base: 10, texto: '#fff' },
    rosa:     { nome: 'Dupla',       icone: '👯', hex: '#ec4899', base: 7,  texto: '#fff' },
    branco:   { nome: 'Sinceridade', icone: '🤍', hex: '#e5e7eb', base: 7,  texto: '#1f2937' },
    preto:    { nome: 'Caos',        icone: '🌪️', hex: '#1f2937', base: 5,  texto: '#fff' },
    arcoiris: { nome: 'Coringa',     icone: '🌈', hex: 'arcoiris', base: 2, texto: '#fff' }
};

const DESCRICAO_CORES = {
    azul: 'Fale uma qualidade verdadeira da pessoa sorteada.',
    vermelho: 'Fale um defeito, mania irritante ou algo que ela poderia melhorar (na brincadeira!).',
    verde: 'Conte uma história engraçada, vergonhosa ou inesquecível envolvendo a pessoa.',
    amarelo: 'Faça uma pergunta pra pessoa sorteada. Ela responde ou paga a consequência.',
    roxo: 'Imite por 15 segundos o jeito de falar, rir, andar ou reagir da pessoa.',
    laranja: 'Compare a pessoa com um personagem, famoso, animal, comida ou objeto — e explique.',
    rosa: 'A pessoa sorteada escolhe um par: os dois respondem juntos a uma pergunta de amizade.',
    branco: 'Fale algo verdadeiro que sempre quis dizer pra essa pessoa.',
    preto: 'Um evento especial aleatório acontece com o grupo!',
    arcoiris: 'Coringa: escolha qualquer função ou crie uma regra temporária pra partida.'
};

const FRASES = {
    azul: [
        'Fale uma qualidade dessa pessoa.',
        'Diga algo que você admira nela.',
        'Conte por que essa pessoa é importante para o grupo.',
        'Fale algo que essa pessoa faz melhor que todo mundo.',
        'Diga qual é o maior ponto forte dela.',
        'Conte uma boa lembrança envolvendo essa pessoa.',
        'Diga um talento escondido que essa pessoa tem.',
        'Fale sobre um momento em que essa pessoa te ajudou.',
        'Diga o que torna essa pessoa única na roda.',
        'Elogie o senso de humor dela com um exemplo.',
        'Diga algo que você aprendeu com essa pessoa.',
        'Fale por que vale a pena ter essa pessoa por perto.',
        'Diga qual conquista dela mais te orgulha.',
        'Conte a primeira coisa boa que você notou nela.',
        'Diga em que situação essa pessoa é a melhor companhia.',
        'Fale uma característica dela que você queria ter.',
        'Diga por que essa pessoa deixa a festa melhor.',
        'Elogie o gosto dela pra alguma coisa: música, comida, estilo...',
        'Diga um motivo pelo qual você confia nessa pessoa.',
        'Conte o dia em que essa pessoa mais te surpreendeu positivamente.'
    ],
    vermelho: [
        'Fale uma mania irritante dessa pessoa.',
        'Diga algo que ela poderia melhorar.',
        'Conte qual foi sua primeira impressão (nada a ver) sobre ela.',
        'Fale um defeito engraçado dessa pessoa.',
        'Diga em qual situação ela costuma ser difícil de aguentar.',
        'Conte uma atitude dela que irrita o grupo.',
        'Diga um hábito dela que você nunca entendeu.',
        'Fale sobre a pior mania dela no celular ou nas redes sociais.',
        'Diga algo que ela sempre promete e nunca cumpre.',
        'Conte um mico leve que ela vive pagando.',
        'Diga em que ela é a pessoa mais enrolada do grupo.',
        'Fale um gosto duvidoso dessa pessoa: música, comida, série...',
        'Diga qual é o defeito dela na hora de marcar rolê.',
        'Conte o que ela faz que deixa todo mundo esperando.',
        'Diga qual é a desculpa mais usada por essa pessoa.',
        'Fale sobre a teimosia dela com um exemplo.',
        'Diga algo que ela exagera demais quando conta histórias.',
        'Fale um costume dela que rende piada no grupo.',
        'Diga em qual assunto ela acha que entende, mas não entende.',
        'Conte a mancada mais recente que ela deu com você (leve!).'
    ],
    verde: [
        'Conte uma história engraçada envolvendo essa pessoa.',
        'Conte o momento mais vergonhoso que vocês viveram juntos.',
        'Conte como vocês se conheceram, com detalhes.',
        'Conte uma história dessa pessoa que ninguém aqui conhece.',
        'Conte a maior aventura que já viveu com ela.',
        'Conte um perrengue que vocês passaram juntos.',
        'Conte a vez em que essa pessoa mais te fez rir.',
        'Conte uma história de festa envolvendo essa pessoa.',
        'Conte um plano de vocês que deu completamente errado.',
        'Conte uma viagem ou rolê inesquecível com essa pessoa.',
        'Conte a maior coincidência que já viveu com ela.',
        'Conte uma vez em que vocês quase se meteram em confusão.',
        'Conte uma história antiga dessa pessoa que ela queria esquecer.',
        'Conte a situação mais aleatória que já viveu com ela.',
        'Conte um bastidor de uma história famosa de vocês dois.'
    ],
    amarelo: [
        'Faça uma pergunta que sempre quis fazer pra essa pessoa.',
        'Faça uma pergunta sobre a vida amorosa dela (com respeito!).',
        'Pergunte sobre um rolê ou festa do passado.',
        'Faça uma pergunta do tipo “o que você faria se...”.',
        'Pergunte qual foi a maior mentira que ela já contou.',
        'Pergunte algo sobre a infância dela.',
        'Faça uma pergunta sobre os gostos musicais dela.',
        'Pergunte o que ela faria com 1 milhão de reais hoje.',
        'Pergunte qual foi o maior mico da vida dela.',
        'Faça uma pergunta de “isto ou aquilo” difícil de escolher.',
        'Pergunte um segredo leve que ela possa contar agora.',
        'Pergunte de quem da roda ela roubaria uma característica.',
        'Pergunte qual hábito dela mesma ela mudaria.',
        'Pergunte qual foi a pior compra que ela já fez.',
        'Faça qualquer pergunta — ou sorteie uma sugestão abaixo!'
    ],
    roxo: [
        'Imite o jeito de falar dessa pessoa por 15 segundos.',
        'Imite a risada dela até o grupo aprovar.',
        'Imite como ela dança na festa.',
        'Imite essa pessoa chegando atrasada e se explicando.',
        'Imite como ela reage quando está com fome.',
        'Imite essa pessoa mandando áudio no grupo.',
        'Imite a cara que ela faz quando discorda de algo.',
        'Imite como ela conta uma história empolgada.',
        'Imite essa pessoa tirando selfie.',
        'Imite o jeito dela andar entrando na festa.',
        'Imite essa pessoa brava no trânsito (ou na fila).',
        'Imite como ela flerta (ou tenta flertar).',
        'Imite essa pessoa acordando de ressaca.',
        'Imite o bordão ou a frase mais repetida dela.',
        'Imite essa pessoa torcendo (ou reclamando) num jogo.'
    ],
    laranja: [
        'Compare essa pessoa com um animal e explique.',
        'Compare essa pessoa com um personagem de filme ou série.',
        'Compare essa pessoa com uma comida e justifique.',
        'Compare essa pessoa com um famoso.',
        'Compare essa pessoa com uma música.',
        'Compare essa pessoa com um objeto da casa.',
        'Compare essa pessoa com um meme.',
        'Compare essa pessoa com um app de celular.',
        'Compare essa pessoa com uma bebida e explique.',
        'Compare essa pessoa com um professor que você já teve.',
        'Compare essa pessoa com um clima: sol, chuva, furacão...',
        'Compare essa pessoa com um carro e justifique.',
        'Compare essa pessoa com um desenho animado.',
        'Compare essa pessoa com um emoji e explique.',
        'Compare essa pessoa com um lugar do mundo.'
    ],
    rosa: [
        'A pessoa sorteada escolhe um par — a dupla responde à pergunta juntos!',
        'Monte a dupla: a pessoa sorteada chama alguém da roda pra responder com ela.',
        'Dupla da rodada! Escolha seu parceiro e respondam a pergunta em voz alta.',
        'A pessoa sorteada escolhe com quem tem mais história pra responder junto.',
        'Escolha alguém que você conhece bem: a pergunta vale pros dois.',
        'Chame pra dupla a pessoa com quem você mais combina.',
        'Escolha um par e respondam a pergunta um sobre o outro.',
        'A pessoa sorteada escolhe a dupla — e os dois não podem discordar na resposta!',
        'Monte a dupla com quem você confiaria um segredo.',
        'Escolha um parceiro: cada um responde a pergunta e o grupo compara.',
        'Chame alguém que você quase nunca escolhe pra fazer dupla.',
        'Escolha a pessoa mais parecida com você pra responder junto.',
        'Escolha a pessoa mais diferente de você — rende o dobro de risada.',
        'A dupla deve responder a pergunta ao mesmo tempo, em 3, 2, 1...',
        'Escolha seu par de confiança e respondam com sinceridade total.'
    ],
    branco: [
        'Fale algo verdadeiro que sempre quis dizer pra essa pessoa.',
        'Diga um “obrigado” que você ficou devendo a ela.',
        'Fale uma verdade leve que nunca teve coragem de falar.',
        'Diga o que você realmente pensou quando a conheceu.',
        'Conte algo que você admira nela, mas nunca disse em voz alta.',
        'Diga um conselho sincero pra essa pessoa.',
        'Fale sobre um momento em que ela fez diferença pra você.',
        'Diga algo que você sente falta de fazer com essa pessoa.',
        'Fale com sinceridade: o que mudou nela nos últimos tempos?',
        'Diga uma coisa que você defenderia nessa pessoa pra qualquer um.',
        'Conte um pedido de desculpas que você deve a ela (mesmo pequeno).',
        'Diga por que a amizade de vocês vale a pena.',
        'Fale uma expectativa que você tem pro futuro dela.',
        'Diga o que falaria se ela estivesse indo embora da cidade amanhã.',
        'Termine a frase com sinceridade: “Eu nunca te disse, mas...”.'
    ],
    preto: [
        'Todos apontam ao mesmo tempo: quem é mais provável de ficar rico primeiro?',
        'Todos apontam: quem é mais provável de dormir na festa?',
        'Todos apontam: quem demoraria mais pra responder um “socorro” no grupo?',
        'A pessoa sorteada escolhe alguém da roda pra cumprir um desafio criado na hora.',
        'Todos apontam: quem é o mais dramático da roda?',
        'A pessoa sorteada vira jurada: dá nota de 0 a 10 pra sua última resposta.',
        'Rodada relâmpago: você tem 10 segundos pra elogiar 3 pessoas diferentes!',
        'Todos trocam de lugar! O último a sentar cumpre a consequência.',
        'Vale tudo: o grupo faz UMA pergunta pra você, e você tem que responder.',
        'Todos apontam: quem mente melhor da roda?',
        'A pessoa à sua direita decide sua tarefa desta rodada.',
        'Faça uma declaração dramática (estilo novela) pra pessoa sorteada.',
        'Todos apontam: quem chegaria atrasado no próprio casamento?',
        'A pessoa sorteada imita você por 10 segundos!',
        'Diga o nome de todos da roda em menos de 10 segundos — errou, paga a consequência.',
        'Todos apontam: quem gastaria o salário inteiro em besteira numa semana?',
        'Rodada do silêncio: quem falar primeiro nos próximos 30 segundos paga a consequência.',
        'O grupo cria um novo apelido pra você, válido até o fim do jogo.',
        'Todos apontam: quem seria preso por falar demais?',
        'Elogie a pessoa da roda que você menos conhece.',
        'A pessoa sorteada conta a melhor fofoca (leve!) que sabe sobre você.',
        'Estátua! O último a congelar cumpre a consequência.',
        'Todos cumprem a consequência da rodada juntos!',
        'O grupo escolhe qual será a função desta rodada: elogio, crítica, história...',
        'Troque de lugar com a pessoa sorteada até o fim da partida.',
        'Escolha duas pessoas para responderem juntas uma pergunta sua.',
        'O último a levantar a mão cumpre a consequência!',
        'O sentido da rodada foi INVERTIDO! Agora a ordem gira ao contrário. 🔄',
        'Sorte grande: o jogador da vez joga DE NOVO na próxima rodada! 🎰',
        'A próxima rodada vale O DOBRO — consequência em dobro! 💥'
    ],
    arcoiris: [
        'Ninguém pode falar a palavra “não” até a sua próxima vez.',
        'Quem mexer no celular sem necessidade cumpre a consequência.',
        'Todos devem te chamar de “chefe” até o fim da partida.',
        'Antes de responder qualquer coisa, o jogador deve bater uma palma.',
        'Proibido apontar com o dedo — só com o cotovelo.',
        'Todos devem falar sussurrando na próxima rodada.',
        'Quem rir na próxima rodada cumpre a consequência.',
        'Todo mundo responde com sotaque até a sua próxima vez.',
        'Proibido falar o nome de qualquer pessoa da roda — só apelidos.',
        'Quem cruzar os braços cumpre a consequência.',
        'Antes de beber ou pontuar, é obrigatório fazer um brinde dramático.',
        'Todos devem terminar as frases com “...e é isso”.',
        'A palavra “eu” está proibida até a sua próxima vez.',
        'Todo mundo deve aplaudir qualquer resposta, boa ou ruim.',
        'Proibido dizer “tipo” e “mano” — quem falar cumpre a consequência.',
        'Só pode falar quem estiver com a mão levantada.',
        'Todos devem te imitar quando você espreguiçar. Use com sabedoria.',
        'A cada rodada, alguém deve elogiar a playlist da festa.',
        'Quem bocejar cumpre a consequência (e agora todo mundo vai reparar).',
        'Você define a regra! Crie uma regra temporária pro grupo.'
    ]
};

// Índices de eventos do preto com efeito mecânico (regras especiais)
const EFEITOS_PRETO = { 27: 'inverter', 28: 'denovo', 29: 'dobro' };

const PERGUNTAS_AMARELO = [
    'Qual foi a última mentira que você contou?',
    'Qual é o seu maior medo bobo?',
    'Se pudesse trocar de vida com alguém da roda por um dia, quem seria?',
    'Qual foi o pior encontro da sua vida?',
    'Qual música você ouve escondido?',
    'Qual foi a coisa mais impulsiva que você já fez?',
    'O que você faria se ganhasse na loteria amanhã?',
    'Qual mania sua você acha charmosa, mas todo mundo acha irritante?',
    'Qual foi o maior perrengue que você já passou em festa?',
    'Quem da roda você ligaria pra te tirar da cadeia?',
    'Qual é o seu talento mais inútil?',
    'Qual foi a pior desculpa que você já inventou pra faltar num rolê?',
    'O que você já fez de mais corajoso (ou mais burro)?',
    'Qual apelido você já teve e odeia?',
    'Qual é a sua teoria da conspiração favorita?',
    'Se sua vida fosse um filme, qual seria o título?',
    'Qual foi a última coisa que você pesquisou no celular?',
    'Qual hábito você jura que vai largar todo ano?',
    'Qual é a comida que você finge que gosta?',
    'Qual foi o elogio mais estranho que você já recebeu?'
];

const PERGUNTAS_ROSA = [
    'Qual foi o melhor rolê que vocês dois já viveram juntos?',
    'O que um mais admira no outro?',
    'Qual seria o nome da dupla de vocês e por quê?',
    'Se abrissem um negócio juntos, o que seria?',
    'Qual foi a maior treta (já resolvida) entre vocês?',
    'O que vocês dois têm em comum que ninguém imagina?',
    'Quem dos dois é mais ciumento com amizade?',
    'Qual viagem vocês fariam juntos amanhã se pudessem?',
    'Qual foi a primeira impressão que um teve do outro?',
    'Quem dos dois manda mais áudio? Defendam-se.',
    'Se um precisasse de álibi, o outro toparia? Pra quê?',
    'Qual música é a cara da amizade de vocês?',
    'Quem dos dois é mais dramático? Provem com exemplos.',
    'O que um faria pelo outro que não faria por mais ninguém?',
    'Qual hábito do outro cada um adotaria?',
    'Num apocalipse zumbi, qual seria a função de cada um?',
    'Quem dos dois demora mais pra responder mensagem?',
    'Qual segredo (leve) um já guardou do outro?',
    'Se trocassem de vida por um dia, o que fariam primeiro?',
    'Qual conselho um daria pro outro hoje, na frente de todos?'
];

const PRENDAS = [
    'Imite um famoso até alguém adivinhar quem é.',
    'Faça uma pose escolhida pelo grupo e segure por 10 segundos.',
    'Conte uma situação vergonhosa que já viveu.',
    'Fale com sotaque até a sua próxima vez.',
    'Fique uma rodada inteira sem falar a palavra escolhida pelo grupo.',
    'Dance por 10 segundos sem música.',
    'Cante o trecho de uma música escolhida pelo grupo.',
    'Faça uma propaganda improvisada de um objeto próximo.',
    'Deixe o grupo escolher seu apelido até o fim do jogo.',
    'Conte uma piada — se ninguém rir, conte outra.',
    'Declame o refrão de uma música como se fosse poesia.',
    'Fale tudo cantando na próxima rodada.',
    'Faça 5 polichinelos contando em voz alta.',
    'Imite um animal até alguém adivinhar qual é.',
    'Elogie exageradamente a pessoa à sua esquerda por 15 segundos.',
    'Fale o alfabeto de trás pra frente (valendo risada).',
    'Faça sua melhor cara de foto 3x4 e mantenha por 10 segundos.',
    'Conte como foi seu dia usando apenas mímica.',
    'Invente uma palavra nova e use numa frase convincente.',
    'Faça uma previsão de horóscopo improvisada pra alguém da roda.',
    'Narre os próximos 30 segundos do jogo como locutor de futebol.',
    'Peça desculpas dramáticas a um objeto que você já quebrou.',
    'Faça sua melhor dancinha de rede social.',
    'Diga “bom dia” como se estivesse: muito bravo, muito feliz e chorando.',
    'Escolha alguém pra fazer uma dublagem em dupla de 15 segundos.',
    'Fique de estátua por 20 segundos enquanto o grupo tenta te fazer rir.',
    'Invente um slogan pra festa de hoje.',
    'Descreva a pessoa à sua direita como um documentário de natureza.',
    'Fale seu nome completo de trás pra frente em menos de 10 segundos.',
    'Mande um “oi, sumido(a)” em voz alta pro grupo, com interpretação.'
];

// Goles-base por cor no modo Roleta do Caos (com bebida)
const GOLES_CAOS = {
    azul: 1, vermelho: 3, verde: 1, amarelo: 2, roxo: 2,
    laranja: 1, rosa: 2, branco: 1, preto: 3, arcoiris: 2
};

const DIFICULDADES = { leve: 80, resenha: 65, pesado: 45, caos: 25 };

/* ============================================================
   2. ESTADO E PERSISTÊNCIA
   ============================================================ */

const CHAVE_JOGADORES = 'rr_jogadores';
const CHAVE_CONFIG = 'rr_config';
const CHAVE_PARTIDA = 'rr_partida';

const CONFIG_PADRAO = {
    modo: 'classico',          // 'classico' | 'caos'
    bebida: 'sem',             // 'com' | 'sem' | 'conversa'
    shot: 'shot',              // 'shot' | '1' | '2' | '3'
    consequenciaSem: 'prendas',// 'pontos' | 'prendas' | 'desafios' | 'rodada'
    intensidade: 'media',      // 'leve' | 'media' | 'pesada'
    dificuldade: 'resenha',    // presets ou 'custom'
    customAzul: 65,
    coresAtivas: Object.keys(CORES).reduce(function (acc, c) { acc[c] = true; return acc; }, {}),
    caosCrescente: false,
    rodadas: 15,               // 0 = infinita
    cronometro: false,
    tempo: 15,                 // 0 = sem limite
    sons: true,
    vibracao: true,
    animacoes: true,
    repetirAlvo: false,
    direitoResposta: true,
    regrasEspeciais: true,
    permitirPular: true
};

let jogadores = [];
let config = {};

// Estado da partida em andamento
let partida = null;
let girando = false;
let cronometroId = null;
let snapshotAnterior = null; // para "voltar uma rodada"

function lerJson(chave, padrao) {
    try {
        const v = JSON.parse(localStorage.getItem(chave));
        return (v === null || v === undefined) ? padrao : v;
    } catch (e) {
        return padrao;
    }
}

function salvarJogadores() { localStorage.setItem(CHAVE_JOGADORES, JSON.stringify(jogadores)); }
function salvarConfig() { localStorage.setItem(CHAVE_CONFIG, JSON.stringify(config)); }

function salvarPartida() {
    if (partida) localStorage.setItem(CHAVE_PARTIDA, JSON.stringify(partida));
}

function apagarPartidaSalva() {
    localStorage.removeItem(CHAVE_PARTIDA);
    partida = null;
    const btn = document.getElementById('btn-continuar-partida');
    if (btn) btn.hidden = true;
}

function carregarDados() {
    jogadores = lerJson(CHAVE_JOGADORES, []);
    if (!Array.isArray(jogadores)) jogadores = [];

    // Mesa global do Game Night preenche a lista na primeira vez
    if (jogadores.length === 0 && typeof GameNight !== 'undefined') {
        jogadores = GameNight.jogadores().slice(0, 20);
    }

    const salva = lerJson(CHAVE_CONFIG, {});
    config = Object.assign({}, CONFIG_PADRAO, salva);
    config.coresAtivas = Object.assign({}, CONFIG_PADRAO.coresAtivas, salva.coresAtivas || {});
}

/* ============================================================
   3. UTILIDADES
   ============================================================ */

function $(id) { return document.getElementById(id); }

function mod360(x) { return ((x % 360) + 360) % 360; }

function aleatorio(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

function embaralhar(lista) {
    const arr = lista.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
}

// Sorteio ponderado: itens = [{valor, peso}]
function sorteioPonderado(itens) {
    let total = 0;
    for (let i = 0; i < itens.length; i++) total += itens[i].peso;
    let r = Math.random() * total;
    for (let i = 0; i < itens.length; i++) {
        r -= itens[i].peso;
        if (r <= 0) return itens[i].valor;
    }
    return itens[itens.length - 1].valor;
}

let toastId = null;
function mostrarToast(msg, ms) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('visivel');
    clearTimeout(toastId);
    toastId = setTimeout(function () { t.classList.remove('visivel'); }, ms || 2600);
}

/* ---------- navegação entre telas ---------- */

function irPara(idTela) {
    document.querySelectorAll('.tela').forEach(function (t) { t.classList.remove('ativa'); });
    $(idTela).classList.add('ativa');
    window.scrollTo(0, 0);

    if (idTela === 'tela-dificuldade') prepararTelaDificuldade();
    if (idTela === 'tela-revisao') montarRevisao();
}

/* ---------- modal de confirmação ---------- */

let confirmarCallback = null;
function abrirConfirmacao(titulo, texto, aoConfirmar) {
    $('conf-titulo').textContent = titulo;
    $('conf-texto').textContent = texto;
    confirmarCallback = aoConfirmar;
    $('modal-confirmar').hidden = false;
    $('btn-conf-sim').focus();
}

/* ============================================================
   4. SONS E VIBRAÇÃO
   ============================================================ */

let audioCtx = null;

function obterAudio() {
    if (!config.sons) return null;
    if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function tocar(freq, duracao, tipo, volume) {
    const ctx = obterAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tipo || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume || 0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duracao);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duracao);
}

function somTick() { tocar(700, 0.04, 'square', 0.035); }
function somResultado() { tocar(523, 0.15, 'sine', 0.1); setTimeout(function () { tocar(784, 0.25, 'sine', 0.1); }, 130); }
function somBeep() { tocar(880, 0.12, 'sine', 0.09); }
function somFim() { tocar(196, 0.45, 'sawtooth', 0.09); }

function vibrar(padrao) {
    if (config.vibracao && 'vibrate' in navigator) {
        try { navigator.vibrate(padrao); } catch (e) { /* sem suporte */ }
    }
}

/* ============================================================
   5. JOGADORES
   ============================================================ */

function renderizarJogadores() {
    const ul = $('lista-jogadores');
    ul.innerHTML = '';

    jogadores.forEach(function (nome, i) {
        const li = document.createElement('li');

        const span = document.createElement('span');
        span.className = 'nome';
        span.textContent = (i + 1) + '. ' + nome;

        const btnEditar = document.createElement('button');
        btnEditar.textContent = '✏️';
        btnEditar.setAttribute('aria-label', 'Editar ' + nome);
        btnEditar.addEventListener('click', function () { editarJogador(li, i); });

        const btnRemover = document.createElement('button');
        btnRemover.textContent = '🗑️';
        btnRemover.setAttribute('aria-label', 'Remover ' + nome);
        btnRemover.addEventListener('click', function () {
            jogadores.splice(i, 1);
            salvarJogadores();
            renderizarJogadores();
        });

        li.appendChild(span);
        li.appendChild(btnEditar);
        li.appendChild(btnRemover);
        ul.appendChild(li);
    });

    $('qtd-jogadores').textContent = jogadores.length + (jogadores.length === 1 ? ' jogador' : ' jogadores') +
        (jogadores.length < 3 ? ' — faltam ' + (3 - jogadores.length) : '');
    $('btn-continuar-jogadores').disabled = jogadores.length < 3;
}

function editarJogador(li, indice) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 18;
    input.value = jogadores[indice];
    input.setAttribute('aria-label', 'Novo nome');

    const btnOk = document.createElement('button');
    btnOk.textContent = '✔️';
    btnOk.setAttribute('aria-label', 'Salvar nome');

    function confirmar() {
        const novo = input.value.trim();
        if (!novo) { mostrarToast('O nome não pode ficar vazio.'); return; }
        const repetido = jogadores.some(function (j, k) {
            return k !== indice && j.toLowerCase() === novo.toLowerCase();
        });
        if (repetido) { mostrarToast('Já existe alguém com esse nome!'); return; }
        jogadores[indice] = novo;
        salvarJogadores();
        renderizarJogadores();
    }

    btnOk.addEventListener('click', confirmar);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); confirmar(); }
        if (e.key === 'Escape') renderizarJogadores();
    });

    li.innerHTML = '';
    li.appendChild(input);
    li.appendChild(btnOk);
    input.focus();
    input.select();
}

function adicionarJogador() {
    const campo = $('campo-nome');
    const nome = campo.value.trim();

    if (!nome) { mostrarToast('Digite um nome antes de adicionar.'); return; }
    if (jogadores.length >= 20) { mostrarToast('Máximo de 20 jogadores atingido!'); return; }
    if (jogadores.some(function (j) { return j.toLowerCase() === nome.toLowerCase(); })) {
        mostrarToast('Esse nome já está na lista!');
        return;
    }

    jogadores.push(nome);
    salvarJogadores();
    renderizarJogadores();
    campo.value = '';
    campo.focus();
}

/* ============================================================
   6. CONFIGURAÇÕES (telas de setup)
   ============================================================ */

// Marca o chip selecionado dentro de um grupo
function selecionarChip(grupo, seletor, valor, atributo) {
    grupo.querySelectorAll(seletor).forEach(function (chip) {
        const ativo = chip.dataset[atributo] === String(valor);
        chip.classList.toggle('selecionado', ativo);
        chip.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
}

function ligarGrupoChips(idGrupo, seletor, atributo, aoEscolher) {
    const grupo = $(idGrupo);
    grupo.addEventListener('click', function (e) {
        const chip = e.target.closest(seletor);
        if (!chip) return;
        aoEscolher(chip.dataset[atributo]);
        selecionarChip(grupo, seletor, chip.dataset[atributo], atributo);
    });
}

function atualizarTelaModo() {
    document.querySelectorAll('.card-modo').forEach(function (card) {
        const ativo = card.dataset.modo === config.modo;
        card.classList.toggle('selecionado', ativo);
        card.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });
}

function atualizarTelaBebida() {
    selecionarChip($('chips-bebida'), '.chip-bebida', config.bebida, 'bebida');
    selecionarChip($('chips-shot'), '.chip-shot', config.shot, 'shot');
    selecionarChip($('chips-sem'), '.chip-sem', config.consequenciaSem, 'sem');
    selecionarChip($('chips-int'), '.chip-int', config.intensidade, 'int');
    $('box-com-bebida').hidden = config.bebida !== 'com';
    $('box-sem-bebida').hidden = config.bebida !== 'sem';
    $('box-intensidade').hidden = config.bebida === 'conversa';
}

function atualizarSliderCustom() {
    const azul = config.customAzul;
    $('slider-azul').value = azul;
    $('pct-azul').textContent = azul + '%';
    $('pct-vermelho').textContent = (100 - azul) + '%';
    $('barra-azul').style.width = azul + '%';
}

function prepararTelaDificuldade() {
    const classico = config.modo === 'classico';
    $('bloco-classico').hidden = !classico;
    $('bloco-caos').hidden = classico;
    $('titulo-dificuldade').textContent = classico ? '⚖️ Dificuldade' : '🎨 Cores da roleta';

    if (classico) {
        selecionarChip($('chips-dif'), '.chip-dif', config.dificuldade, 'dif');
        $('box-personalizado').hidden = config.dificuldade !== 'custom';
        atualizarSliderCustom();
    } else {
        montarGradeCores();
    }
    $('toggle-caos-crescente').checked = config.caosCrescente;
}

function montarGradeCores() {
    const grade = $('grade-cores');
    grade.innerHTML = '';
    const probs = probabilidadesCaos(0);

    Object.keys(CORES).forEach(function (chave) {
        const cor = CORES[chave];
        const btn = document.createElement('button');
        btn.className = 'chip-cor-toggle' + (config.coresAtivas[chave] ? '' : ' desativada');
        btn.setAttribute('aria-pressed', config.coresAtivas[chave] ? 'true' : 'false');
        btn.setAttribute('aria-label', cor.nome + (config.coresAtivas[chave] ? ' ativada' : ' desativada'));

        const bolinha = document.createElement('span');
        bolinha.className = 'bolinha';
        bolinha.style.background = chave === 'arcoiris'
            ? 'linear-gradient(135deg,#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7)'
            : cor.hex;

        const nome = document.createElement('span');
        nome.className = 'nome-cor';
        nome.textContent = cor.icone + ' ' + cor.nome;

        const pct = document.createElement('span');
        pct.className = 'pct';
        pct.textContent = config.coresAtivas[chave] ? Math.round(probs[chave] * 100) + '%' : '—';

        btn.appendChild(bolinha);
        btn.appendChild(nome);
        btn.appendChild(pct);

        btn.addEventListener('click', function () {
            const ativas = Object.keys(config.coresAtivas).filter(function (c) { return config.coresAtivas[c]; });
            if (config.coresAtivas[chave] && ativas.length <= 2) {
                mostrarToast('Deixe pelo menos 2 cores ativas!');
                return;
            }
            config.coresAtivas[chave] = !config.coresAtivas[chave];
            salvarConfig();
            montarGradeCores();
        });

        grade.appendChild(btn);
    });
}

/* ---------- probabilidades ---------- */

// Nível de caos: sobe 1 a cada 5 rodadas (máx. 5) quando "caos crescente" está ativo
function nivelCaos(rodada) {
    if (!config.caosCrescente) return 0;
    return Math.min(5, Math.max(0, Math.floor((rodada - 1) / 5)));
}

function probabilidadeAzulClassico(rodada) {
    let azul = config.dificuldade === 'custom' ? config.customAzul : DIFICULDADES[config.dificuldade];
    azul = Math.max(10, azul - 5 * nivelCaos(rodada));
    return azul / 100;
}

// Retorna {cor: fração 0..1} normalizado só com as cores ativas
function probabilidadesCaos(rodada) {
    const nivel = nivelCaos(rodada || 0);
    const mult = 1 + 0.18 * nivel;
    const pesos = {};
    let total = 0;

    Object.keys(CORES).forEach(function (chave) {
        if (!config.coresAtivas[chave]) return;
        let p = CORES[chave].base;
        if (chave === 'vermelho' || chave === 'preto' || chave === 'arcoiris') p *= mult;
        pesos[chave] = p;
        total += p;
    });

    Object.keys(pesos).forEach(function (chave) { pesos[chave] /= total; });
    return pesos;
}

// Segmentos [{chave, fracao}] para a roleta de cores da rodada atual
function segmentosCores(rodada) {
    if (config.modo === 'classico') {
        const azul = probabilidadeAzulClassico(rodada);
        return [
            { chave: 'azul', fracao: azul },
            { chave: 'vermelho', fracao: 1 - azul }
        ];
    }
    const probs = probabilidadesCaos(rodada);
    return Object.keys(probs).map(function (chave) {
        return { chave: chave, fracao: probs[chave] };
    });
}

/* ---------- revisão ---------- */

const ROTULOS = {
    modo: { classico: '🔵🔴 Azul ou Vermelho', caos: '🌈 Roleta do Caos' },
    bebida: { com: '🍺 Com bebida', sem: '🎯 Sem bebida', conversa: '💬 Só conversa' },
    sem: { pontos: '🏆 Pontos', prendas: '🎭 Prendas', desafios: '🔥 Desafios', rodada: '⏭️ Perde rodada' },
    int: { leve: '😌 Leve', media: '🙂 Média', pesada: '😈 Pesada' },
    dif: { leve: '😌 Leve', resenha: '😄 Resenha', pesado: '🔥 Pesado', caos: '💀 Caos', custom: '🎛️ Personalizado' },
    shot: { shot: 'Shot 🥃', 1: '1 gole', 2: '2 goles', 3: '3 goles' }
};

function linhaResumo(rotulo, valor) {
    return '<div class="linha-resumo"><span>' + rotulo + '</span><b>' + valor + '</b></div>';
}

function montarRevisao() {
    let html = '';
    html += linhaResumo('Jogadores', jogadores.length);
    html += linhaResumo('Modo', ROTULOS.modo[config.modo]);
    html += linhaResumo('Consequências', ROTULOS.bebida[config.bebida]);

    if (config.bebida === 'com') html += linhaResumo('Vermelho vale', ROTULOS.shot[config.shot]);
    if (config.bebida === 'sem') html += linhaResumo('Tipo', ROTULOS.sem[config.consequenciaSem]);
    if (config.bebida !== 'conversa') html += linhaResumo('Intensidade', ROTULOS.int[config.intensidade]);

    if (config.modo === 'classico') {
        const azul = config.dificuldade === 'custom' ? config.customAzul : DIFICULDADES[config.dificuldade];
        html += linhaResumo('Dificuldade', ROTULOS.dif[config.dificuldade] + ' (' + azul + '/' + (100 - azul) + ')');
    } else {
        const ativas = Object.keys(config.coresAtivas).filter(function (c) { return config.coresAtivas[c]; });
        html += linhaResumo('Cores ativas', ativas.length + ' de 10');
    }

    html += linhaResumo('Rodadas', config.rodadas === 0 ? '∞ Infinita' : config.rodadas);
    html += linhaResumo('Cronômetro', config.cronometro ? (config.tempo === 0 ? 'Sem limite' : config.tempo + 's') : 'Desligado');
    html += linhaResumo('Caos crescente', config.caosCrescente ? 'Ligado 🌪️' : 'Desligado');
    html += linhaResumo('Repetir alvo', config.repetirAlvo ? 'Sim' : 'Não');
    html += linhaResumo('Pular rodada', config.permitirPular ? 'Permitido' : 'Bloqueado');

    $('resumo-config').innerHTML = html;
    atualizarOrdemRevisao();
}

let ordemPartida = [];

function atualizarOrdemRevisao() {
    if (ordemPartida.length !== jogadores.length ||
        !ordemPartida.every(function (n) { return jogadores.indexOf(n) !== -1; })) {
        ordemPartida = jogadores.slice();
    }
    $('ordem-revisao').innerHTML = ordemPartida.map(function (n, i) {
        return (i + 1) + '. <b>' + escaparHtml(n) + '</b>';
    }).join(' → ');
}

function escaparHtml(txt) {
    const div = document.createElement('div');
    div.textContent = txt;
    return div.innerHTML;
}

/* ============================================================
   7. ROLETAS (canvas + giro)
   ============================================================ */

// Paleta para os segmentos da roleta de jogadores
const PALETA_JOGADORES = ['#8b5cf6', '#ec4899', '#3b82f6', '#22c55e', '#f97316', '#eab308', '#14b8a6', '#ef4444'];
const ARCO_IRIS = ['#f43f5e', '#f59e0b', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];

const roletaJogadores = { canvas: null, segmentos: [], rotacao: 0, idxPonteiro: -1 };
const roletaCores = { canvas: null, segmentos: [], rotacao: 0, idxPonteiro: -1 };

function prepararCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const tam = 300;
    canvas.width = tam * dpr;
    canvas.height = tam * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
}

/*
 * Desenha uma roleta. segmentos = [{rotulo, cor, fracao, textoCor, arcoiris}]
 * Ângulos em frações de volta a partir do topo, sentido horário.
 */
function desenharRoleta(rol, segmentos) {
    const ctx = prepararCanvas(rol.canvas);
    const cx = 150, cy = 150, raio = 148;

    // Garante fração mínima visível sem alterar as probabilidades reais
    const MIN = 0.035;
    let soma = 0;
    const visiveis = segmentos.map(function (s) {
        const f = Math.max(s.fracao, MIN);
        soma += f;
        return f;
    });

    let inicio = 0;
    rol.segmentos = segmentos.map(function (s, i) {
        const fracao = visiveis[i] / soma;
        const seg = { rotulo: s.rotulo, cor: s.cor, textoCor: s.textoCor, arcoiris: s.arcoiris, de: inicio, ate: inicio + fracao, dado: s.dado };
        inicio += fracao;
        return seg;
    });

    ctx.clearRect(0, 0, 300, 300);

    rol.segmentos.forEach(function (seg) {
        const a0 = -Math.PI / 2 + seg.de * 2 * Math.PI;
        const a1 = -Math.PI / 2 + seg.ate * 2 * Math.PI;

        if (seg.arcoiris) {
            // Arco-íris: faixas coloridas dentro do segmento
            const passo = (a1 - a0) / ARCO_IRIS.length;
            ARCO_IRIS.forEach(function (corFaixa, k) {
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, raio, a0 + passo * k, a0 + passo * (k + 1));
                ctx.closePath();
                ctx.fillStyle = corFaixa;
                ctx.fill();
            });
        } else {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, raio, a0, a1);
            ctx.closePath();
            ctx.fillStyle = seg.cor;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, raio, a0, a1);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(13,10,31,0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Rótulo ao longo do raio
        if (seg.rotulo) {
            const meio = (a0 + a1) / 2;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(meio);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const larguraSeg = (seg.ate - seg.de) * 2 * Math.PI * raio;
            ctx.font = '600 ' + Math.max(10, Math.min(17, larguraSeg * 0.32)) + 'px "Segoe UI", sans-serif';
            ctx.fillStyle = seg.textoCor || '#fff';
            ctx.fillText(seg.rotulo, raio - 12, 0);
            ctx.restore();
        }
    });

    // Miolo
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#171130';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    rol.canvas.style.transform = 'rotate(' + rol.rotacao + 'deg)';
}

function desenharRoletaJogadores() {
    const nomes = partida ? partida.ordem : jogadores;
    const segs = nomes.map(function (nome, i) {
        let rotulo = nome.length > 9 ? nome.slice(0, 8) + '…' : nome;
        if (nomes.length > 14) rotulo = nome.slice(0, 5);
        return {
            rotulo: rotulo,
            cor: PALETA_JOGADORES[i % PALETA_JOGADORES.length],
            fracao: 1 / nomes.length,
            textoCor: '#fff',
            dado: nome
        };
    });
    desenharRoleta(roletaJogadores, segs);
}

function desenharRoletaCores(rodada) {
    const segs = segmentosCores(rodada).map(function (s) {
        const cor = CORES[s.chave];
        return {
            rotulo: cor.icone,
            cor: cor.hex === 'arcoiris' ? '#a855f7' : cor.hex,
            fracao: s.fracao,
            textoCor: cor.texto,
            arcoiris: cor.hex === 'arcoiris',
            dado: s.chave
        };
    });
    desenharRoleta(roletaCores, segs);
}

function animacoesAtivas() {
    return config.animacoes && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/*
 * Gira a roleta até o segmento cujo `dado` === valorAlvo.
 * O resultado já foi sorteado (ponderado); a animação só o exibe.
 */
function girarRoletaAte(rol, valorAlvo, duracao, aoTerminar) {
    let idx = -1;
    for (let i = 0; i < rol.segmentos.length; i++) {
        if (rol.segmentos[i].dado === valorAlvo) { idx = i; break; }
    }
    if (idx === -1) idx = 0;

    const seg = rol.segmentos[idx];
    const centro = (seg.de + seg.ate) / 2 * 360;
    const desvio = (Math.random() - 0.5) * (seg.ate - seg.de) * 360 * 0.6;
    const alvoAngulo = centro + desvio;

    const inicioRot = rol.rotacao;
    const voltas = 3 + Math.floor(Math.random() * 3);
    const destino = inicioRot + voltas * 360 + mod360(-alvoAngulo - inicioRot);

    if (!animacoesAtivas()) {
        rol.rotacao = destino;
        rol.canvas.style.transform = 'rotate(' + rol.rotacao + 'deg)';
        setTimeout(aoTerminar, 250);
        return;
    }

    const inicioT = performance.now();

    function quadro(agora) {
        const t = Math.min(1, (agora - inicioT) / duracao);
        const suave = 1 - Math.pow(1 - t, 4); // easeOutQuart: desacelera no fim
        rol.rotacao = inicioRot + (destino - inicioRot) * suave;
        rol.canvas.style.transform = 'rotate(' + rol.rotacao + 'deg)';

        // Tique quando o segmento sob o ponteiro muda
        const posTopo = mod360(-rol.rotacao) / 360;
        let idxAtual = 0;
        for (let i = 0; i < rol.segmentos.length; i++) {
            if (posTopo >= rol.segmentos[i].de && posTopo < rol.segmentos[i].ate) { idxAtual = i; break; }
        }
        if (idxAtual !== rol.idxPonteiro) {
            rol.idxPonteiro = idxAtual;
            somTick();
        }

        if (t < 1) requestAnimationFrame(quadro);
        else aoTerminar();
    }

    requestAnimationFrame(quadro);
}

/* ============================================================
   8. PARTIDA
   ============================================================ */

function novaPartidaBase() {
    return {
        config: config,
        ordem: ordemPartida.slice(),
        idx: 0,               // índice do jogador da vez
        rodada: 1,            // rodada atual (a que vai ser jogada)
        completas: 0,         // rodadas concluídas
        sentido: 1,
        vezesAlvo: {},        // quantas vezes cada um foi sorteado
        ultimoAlvo: null,
        contCores: {},
        eventosEspeciais: 0,
        pontos: {},
        pulados: [],          // quem perde a próxima vez
        valeDobro: false,
        jogaDeNovo: false,
        nivelCaosAtual: 0
    };
}

function iniciarPartida() {
    if (jogadores.length < 3) {
        mostrarToast('Adicione pelo menos 3 jogadores primeiro!');
        irPara('tela-jogadores');
        return;
    }
    partida = novaPartidaBase();
    partida.ordem.forEach(function (n) {
        partida.vezesAlvo[n] = 0;
        partida.pontos[n] = 0;
    });
    snapshotAnterior = null;
    salvarPartida();
    entrarNaPartida();
}

function entrarNaPartida() {
    config = Object.assign({}, CONFIG_PADRAO, partida.config);
    document.body.classList.toggle('sem-animacoes', !config.animacoes);
    girando = false;
    $('btn-girar').disabled = false;
    roletaJogadores.rotacao = 0;
    roletaCores.rotacao = 0;
    desenharRoletaJogadores();
    desenharRoletaCores(partida.rodada);
    atualizarPainelPartida();
    irPara('tela-jogo');
}

function jogadorDaVez() { return partida.ordem[partida.idx]; }

function atualizarPainelPartida() {
    const total = config.rodadas;
    $('info-rodada').textContent = total === 0
        ? 'Rodada ' + partida.rodada + ' · ∞'
        : 'Rodada ' + partida.rodada + ' de ' + total;

    $('fill-progresso').style.width = total === 0
        ? '100%'
        : Math.min(100, (partida.completas / total) * 100) + '%';

    $('nome-da-vez').textContent = jogadorDaVez();

    const faixa = $('faixa-ordem');
    faixa.innerHTML = '';
    partida.ordem.forEach(function (nome, i) {
        const pill = document.createElement('span');
        pill.className = 'pill' + (i === partida.idx ? ' atual' : '');
        pill.textContent = nome;
        faixa.appendChild(pill);
    });
}

/* ---------- sorteios da rodada ---------- */

function sortearAlvo() {
    const vez = jogadorDaVez();
    let candidatos = partida.ordem.filter(function (n) { return n !== vez; });

    // Evita repetir o último alvo, se a config não permitir e houver alternativa
    if (!config.repetirAlvo && partida.ultimoAlvo && candidatos.length > 1) {
        const semUltimo = candidatos.filter(function (n) { return n !== partida.ultimoAlvo; });
        if (semUltimo.length > 0) candidatos = semUltimo;
    }

    // Balanceamento: quem foi menos sorteado tem peso maior
    const itens = candidatos.map(function (n) {
        return { valor: n, peso: 1 / (1 + (partida.vezesAlvo[n] || 0)) };
    });
    return sorteioPonderado(itens);
}

function sortearCor() {
    const segs = segmentosCores(partida.rodada);
    return sorteioPonderado(segs.map(function (s) {
        return { valor: s.chave, peso: s.fracao };
    }));
}

/* ---------- giro ---------- */

let rodadaAtual = null; // {alvo, cor, extraTipo, efeito, desfecho}

function girar() {
    if (girando || !partida) return;
    girando = true;
    $('btn-girar').disabled = true;

    // Aviso de caos crescente
    const nivel = nivelCaos(partida.rodada);
    if (nivel > partida.nivelCaosAtual) {
        partida.nivelCaosAtual = nivel;
        mostrarToast('🌪️ O caos aumentou! Nível ' + nivel + ' — cuidado com o vermelho...');
        desenharRoletaCores(partida.rodada);
    }

    // Snapshot para permitir voltar esta rodada
    snapshotAnterior = JSON.stringify(partida);

    const alvo = sortearAlvo();
    const cor = sortearCor();
    rodadaAtual = { alvo: alvo, cor: cor, desfecho: null, efeito: null };

    vibrar(30);

    let prontas = 0;
    function umaParou() {
        prontas++;
        if (prontas === 2) {
            girando = false;
            mostrarResultado();
        }
    }

    girarRoletaAte(roletaJogadores, alvo, 3200 + Math.random() * 500, umaParou);
    girarRoletaAte(roletaCores, cor, 4000 + Math.random() * 600, umaParou);
}

/* ---------- resultado ---------- */

function fatorIntensidade() {
    if (config.intensidade === 'leve') return 0.5;
    if (config.intensidade === 'pesada') return 2;
    return 1;
}

function golesTexto(qtd) {
    let n = Math.max(1, Math.round(qtd * fatorIntensidade()));
    if (rodadaAtual && partida.valeDobro) n *= 2;
    return n + (n === 1 ? ' gole' : ' goles');
}

function pontosGanhos() {
    return 2 * (partida.valeDobro ? 2 : 1);
}

function textoConsequencia(cor) {
    const vez = jogadorDaVez();

    if (config.bebida === 'conversa') return '💬 Sem consequências — o pagamento é a resenha!';

    if (config.bebida === 'com') {
        if (config.modo === 'classico') {
            if (cor === 'azul') return '🍺 ' + vez + ' bebe ' + golesTexto(1) + '.';
            const shot = config.shot === 'shot'
                ? (partida.valeDobro ? '2 shots 🥃🥃' : '1 shot 🥃')
                : golesTexto(parseInt(config.shot, 10));
            return '🥃 ' + vez + ' toma ' + shot + '.';
        }
        if (cor === 'rosa') return '🍺 Se a dupla não responder: os dois bebem ' + golesTexto(GOLES_CAOS.rosa) + ' cada.';
        if (cor === 'arcoiris') return '🍺 Quem quebrar a regra bebe ' + golesTexto(GOLES_CAOS.arcoiris) + '.';
        if (cor === 'amarelo') return '🍺 Se a pessoa não responder: ela bebe ' + golesTexto(GOLES_CAOS.amarelo) + '.';
        return '🍺 Se não cumprir (ou o grupo reprovar): ' + golesTexto(GOLES_CAOS[cor] || 1) + '.';
    }

    // Sem bebida
    if (config.consequenciaSem === 'pontos') {
        return '🏆 Cumpriu: +' + pontosGanhos() + ' pontos pra ' + vez + '. Recusou ou estourou o tempo: nada.';
    }
    if (config.consequenciaSem === 'rodada') {
        return '⏭️ Se recusar: ' + vez + ' perde a próxima rodada.';
    }
    const rotulo = config.consequenciaSem === 'desafios' ? 'um desafio' : 'uma prenda';
    return '🎭 Se recusar: paga ' + rotulo + ' — toque em “Sortear desafio”!';
}

function precisaExtra(cor) {
    return cor === 'amarelo' || cor === 'rosa' || cor === 'preto' || cor === 'arcoiris';
}

function sortearExtra() {
    if (!rodadaAtual) return;
    const cor = rodadaAtual.cor;
    const extra = $('res-extra');

    if (cor === 'preto') {
        const idx = indicesEventosPermitidos()[Math.floor(Math.random() * indicesEventosPermitidos().length)];
        rodadaAtual.efeito = EFEITOS_PRETO[idx] || null;
        extra.textContent = '🌪️ Evento: ' + FRASES.preto[idx];
    } else if (cor === 'amarelo') {
        extra.textContent = '💡 Sugestão de pergunta: ' + aleatorio(PERGUNTAS_AMARELO);
    } else if (cor === 'rosa') {
        extra.textContent = '👯 Pergunta da dupla: ' + aleatorio(PERGUNTAS_ROSA);
    } else if (cor === 'arcoiris') {
        extra.textContent = '🌈 Sugestão de regra: ' + aleatorio(FRASES.arcoiris);
    } else {
        extra.textContent = '🎭 Prenda: ' + aleatorio(PRENDAS);
    }
    extra.hidden = false;
}

function indicesEventosPermitidos() {
    const idxs = [];
    for (let i = 0; i < FRASES.preto.length; i++) {
        if (!config.regrasEspeciais && EFEITOS_PRETO[i]) continue;
        idxs.push(i);
    }
    return idxs;
}

function mostrarResultado() {
    const cor = rodadaAtual.cor;
    const info = CORES[cor];

    somResultado();
    vibrar([60, 40, 100]);

    const chip = $('res-cor-chip');
    chip.textContent = info.icone + ' ' + info.nome;
    chip.classList.toggle('arcoiris', cor === 'arcoiris');
    if (cor !== 'arcoiris') {
        chip.style.background = info.hex;
        chip.style.color = info.texto;
    } else {
        chip.style.background = '';
        chip.style.color = '#fff';
    }

    $('res-pessoa').textContent = rodadaAtual.alvo;
    $('res-instrucao').textContent = aleatorio(FRASES[cor]);

    const extra = $('res-extra');
    extra.hidden = true;
    extra.textContent = '';
    rodadaAtual.efeito = null;

    if (cor === 'preto') sortearExtra(); // evento do caos já aparece sorteado

    const mostraBotaoExtra = precisaExtra(cor) ||
        (config.bebida === 'sem' && (config.consequenciaSem === 'prendas' || config.consequenciaSem === 'desafios'));
    $('btn-sortear-extra').hidden = !mostraBotaoExtra;

    let consequencia = textoConsequencia(cor);
    if (partida.valeDobro) consequencia = '💥 RODADA VALENDO DOBRO! ' + consequencia;
    $('res-consequencia').textContent = consequencia;

    const aviso = $('res-aviso');
    if (cor === 'vermelho') {
        aviso.textContent = config.direitoResposta
            ? '🗣️ Direito de resposta ativado: ' + rodadaAtual.alvo + ' pode rebater! Lembre: é brincadeira — nada de assuntos sensíveis.'
            : '🤝 Lembre: crítica na brincadeira — nada de aparência ou assuntos sensíveis.';
        aviso.hidden = false;
    } else {
        aviso.hidden = true;
    }

    $('btn-pular').hidden = !config.permitirPular;
    $('btn-cumprido').disabled = false;
    $('btn-pular').disabled = false;
    $('btn-proxima').disabled = true;

    $('painel-resultado').hidden = false;
    iniciarCronometro();
}

/* ---------- cronômetro ---------- */

function pararCronometro() {
    clearInterval(cronometroId);
    cronometroId = null;
    $('crono').classList.remove('urgente');
}

function iniciarCronometro() {
    const caixa = $('crono');
    pararCronometro();

    if (!config.cronometro || config.tempo === 0) {
        caixa.hidden = true;
        return;
    }

    let restante = config.tempo;
    caixa.hidden = false;
    $('crono-num').textContent = restante;

    cronometroId = setInterval(function () {
        restante--;
        $('crono-num').textContent = Math.max(0, restante);

        if (restante <= 5 && restante > 0) {
            caixa.classList.add('urgente');
            somBeep();
            vibrar(50);
        }

        if (restante <= 0) {
            pararCronometro();
            tempoEsgotado();
        }
    }, 1000);
}

function tempoEsgotado() {
    if (!rodadaAtual || rodadaAtual.desfecho) return;
    somFim();
    vibrar([150, 80, 150]);
    registrarDesfecho('tempo');

    let msg = '⏰ Tempo esgotado! ';
    if (config.bebida === 'com') msg += jogadorDaVez() + ' paga a consequência: ' + golesTexto(2) + '!';
    else if (config.bebida === 'sem' && config.consequenciaSem === 'pontos') msg += 'Ninguém pontua nesta rodada.';
    else if (config.bebida === 'sem' && config.consequenciaSem === 'rodada') msg += jogadorDaVez() + ' perde a próxima rodada!';
    else if (config.bebida === 'sem') msg += jogadorDaVez() + ' paga uma prenda — sorteie no botão!';
    else msg += 'Passou da hora — próxima rodada!';
    mostrarToast(msg, 3500);
}

/* ---------- desfecho da rodada ---------- */

function registrarDesfecho(tipo) {
    if (!rodadaAtual || rodadaAtual.desfecho) return;
    rodadaAtual.desfecho = tipo;
    pararCronometro();

    $('btn-cumprido').disabled = true;
    $('btn-pular').disabled = true;
    $('btn-proxima').disabled = false;
    $('btn-proxima').focus();

    if (tipo === 'cumprido') {
        if (config.bebida === 'sem' && config.consequenciaSem === 'pontos') {
            partida.pontos[jogadorDaVez()] = (partida.pontos[jogadorDaVez()] || 0) + pontosGanhos();
            mostrarToast('🏆 +' + pontosGanhos() + ' pontos pra ' + jogadorDaVez() + '!');
        }
        // Efeitos do preto só valem se o desafio foi cumprido
        aplicarEfeito(rodadaAtual.efeito);
    }
    if (tipo === 'pulado') {
        if (config.bebida === 'sem' && config.consequenciaSem === 'rodada') {
            if (partida.pulados.indexOf(jogadorDaVez()) === -1) partida.pulados.push(jogadorDaVez());
            mostrarToast('⏭️ ' + jogadorDaVez() + ' pulou e perde a próxima rodada!');
        }
    }
    if (tipo === 'tempo' && config.bebida === 'sem' && config.consequenciaSem === 'rodada') {
        if (partida.pulados.indexOf(jogadorDaVez()) === -1) partida.pulados.push(jogadorDaVez());
    }
}

function aplicarEfeito(efeito) {
    if (!efeito) return;
    if (efeito === 'inverter') {
        partida.sentido *= -1;
        mostrarToast('🔄 Sentido da rodada invertido!');
    }
    if (efeito === 'denovo') {
        partida.jogaDeNovo = true;
        mostrarToast('🎰 ' + jogadorDaVez() + ' joga de novo na próxima!');
    }
    if (efeito === 'dobro') {
        partida.valeDobro = true;
        mostrarToast('💥 A próxima rodada vale o dobro!');
    }
}

function proximaRodada() {
    if (!rodadaAtual || !rodadaAtual.desfecho) return;

    // Consome o "vale dobro" usado nesta rodada (foi ativado em rodada anterior)
    if (partida.valeDobro && rodadaAtual.efeito !== 'dobro') partida.valeDobro = false;

    // Estatísticas
    partida.vezesAlvo[rodadaAtual.alvo] = (partida.vezesAlvo[rodadaAtual.alvo] || 0) + 1;
    partida.ultimoAlvo = rodadaAtual.alvo;
    partida.contCores[rodadaAtual.cor] = (partida.contCores[rodadaAtual.cor] || 0) + 1;
    if (rodadaAtual.cor === 'preto') partida.eventosEspeciais++;
    partida.completas++;

    $('painel-resultado').hidden = true;
    rodadaAtual = null;

    // Fim de partida?
    if (config.rodadas !== 0 && partida.completas >= config.rodadas) {
        encerrarPartida();
        return;
    }

    // Avança o jogador da vez
    if (partida.jogaDeNovo) {
        partida.jogaDeNovo = false;
    } else {
        avancarJogador();
    }

    partida.rodada++;
    desenharRoletaCores(partida.rodada);
    atualizarPainelPartida();
    salvarPartida();
    $('btn-girar').disabled = false;
}

function avancarJogador() {
    let tentativas = 0;
    do {
        partida.idx = (partida.idx + partida.sentido + partida.ordem.length) % partida.ordem.length;
        tentativas++;
        const nome = jogadorDaVez();
        const posPulado = partida.pulados.indexOf(nome);
        if (posPulado !== -1) {
            partida.pulados.splice(posPulado, 1);
            mostrarToast('⏭️ ' + nome + ' perdeu a vez desta rodada!');
            continue;
        }
        break;
    } while (tentativas < partida.ordem.length + 1);
}

function voltarUmaRodada() {
    if (!snapshotAnterior) {
        mostrarToast('Não há rodada para desfazer.');
        return;
    }
    partida = JSON.parse(snapshotAnterior);
    snapshotAnterior = null;
    rodadaAtual = null;
    pararCronometro();
    $('painel-resultado').hidden = true;
    $('modal-pausa').hidden = true;
    salvarPartida();
    desenharRoletaCores(partida.rodada);
    atualizarPainelPartida();
    $('btn-girar').disabled = false;
    mostrarToast('↩️ Voltamos uma rodada!');
}

/* ---------- regras rápidas ---------- */

function montarRegrasRapidas() {
    const ul = $('conteudo-regras');
    ul.innerHTML = '';
    const chaves = config.modo === 'classico'
        ? ['azul', 'vermelho']
        : Object.keys(CORES).filter(function (c) { return config.coresAtivas[c]; });

    chaves.forEach(function (chave) {
        const cor = CORES[chave];
        const li = document.createElement('li');

        const bolinha = document.createElement('span');
        bolinha.className = 'bolinha';
        bolinha.style.background = chave === 'arcoiris'
            ? 'linear-gradient(135deg,#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7)'
            : cor.hex;

        const texto = document.createElement('span');
        texto.innerHTML = '<b>' + cor.icone + ' ' + cor.nome + ':</b> ' + DESCRICAO_CORES[chave];

        li.appendChild(bolinha);
        li.appendChild(texto);
        ul.appendChild(li);
    });
}

/* ============================================================
   9. RESUMO FINAL
   ============================================================ */

function encerrarPartida() {
    pararCronometro();
    $('painel-resultado').hidden = true;
    $('modal-pausa').hidden = true;
    montarResumoFinal();
    apagarPartidaSalvaMasGuardarStats();
    irPara('tela-resumo');
}

let ultimaPartidaStats = null;

function apagarPartidaSalvaMasGuardarStats() {
    ultimaPartidaStats = partida;
    localStorage.removeItem(CHAVE_PARTIDA);
    partida = null;
    $('btn-continuar-partida').hidden = true;
}

function montarResumoFinal() {
    const p = partida;
    const cont = $('resumo-stats');
    let html = '';

    // Mais e menos sorteado
    const nomes = p.ordem.slice();
    nomes.sort(function (a, b) { return (p.vezesAlvo[b] || 0) - (p.vezesAlvo[a] || 0); });
    const mais = nomes[0];
    const menos = nomes[nomes.length - 1];

    html += '<div class="card"><h3>📊 A resenha em números</h3>';
    html += '<div class="stat-linha"><span>Rodadas jogadas</span><b>' + p.completas + '</b></div>';
    html += '<div class="stat-linha"><span>🎯 Mais sorteado</span><b>' + escaparHtml(mais) + ' (' + (p.vezesAlvo[mais] || 0) + 'x)</b></div>';
    html += '<div class="stat-linha"><span>🍀 Menos sorteado</span><b>' + escaparHtml(menos) + ' (' + (p.vezesAlvo[menos] || 0) + 'x)</b></div>';
    if (p.eventosEspeciais > 0) {
        html += '<div class="stat-linha"><span>🌪️ Eventos do caos</span><b>' + p.eventosEspeciais + '</b></div>';
    }
    html += '</div>';

    // Cores sorteadas
    const coresUsadas = Object.keys(p.contCores);
    if (coresUsadas.length > 0) {
        const maxCor = Math.max.apply(null, coresUsadas.map(function (c) { return p.contCores[c]; }));
        html += '<div class="card"><h3>🎨 Cores da noite</h3>';
        coresUsadas.sort(function (a, b) { return p.contCores[b] - p.contCores[a]; });
        coresUsadas.forEach(function (c) {
            const cor = CORES[c];
            const fundo = cor.hex === 'arcoiris' ? 'linear-gradient(90deg,#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7)' : cor.hex;
            html += '<div class="stat-linha" style="display:block">' +
                '<div style="display:flex;justify-content:space-between"><span>' + cor.icone + ' ' + cor.nome + '</span><b>' + p.contCores[c] + 'x</b></div>' +
                '<div class="mini-barra" style="width:' + Math.round((p.contCores[c] / maxCor) * 100) + '%;background:' + fundo + '"></div>' +
                '</div>';
        });
        html += '</div>';
    }

    // Pontuação (só no modo pontos)
    const cfg = p.config;
    if (cfg.bebida === 'sem' && cfg.consequenciaSem === 'pontos') {
        const ranking = p.ordem.slice().sort(function (a, b) { return (p.pontos[b] || 0) - (p.pontos[a] || 0); });
        html += '<div class="card"><h3>🏆 Placar final</h3>';
        ranking.forEach(function (nome, i) {
            const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + 'º';
            html += '<div class="stat-linha"><span>' + medalha + ' ' + escaparHtml(nome) + '</span><b>' + (p.pontos[nome] || 0) + ' pts</b></div>';
        });
        html += '</div>';

        // Alimenta o ranking geral do Game Night
        if (typeof GameNight !== 'undefined') {
            p.ordem.forEach(function (nome) {
                if (p.pontos[nome] > 0) GameNight.adicionarPontos('roleta-resenha', nome, p.pontos[nome]);
            });
        }
    }

    cont.innerHTML = html;
}

/* ============================================================
   10. INICIALIZAÇÃO
   ============================================================ */

function montarListaComoJogar() {
    const ul = $('lista-cores-como');
    ul.innerHTML = '';
    Object.keys(CORES).forEach(function (chave) {
        const cor = CORES[chave];
        const li = document.createElement('li');

        const bolinha = document.createElement('span');
        bolinha.className = 'bolinha';
        bolinha.style.background = chave === 'arcoiris'
            ? 'linear-gradient(135deg,#f43f5e,#f59e0b,#22c55e,#3b82f6,#a855f7)'
            : cor.hex;

        const texto = document.createElement('span');
        texto.innerHTML = '<b>' + cor.icone + ' ' + cor.nome + ':</b> ' + DESCRICAO_CORES[chave];

        li.appendChild(bolinha);
        li.appendChild(texto);
        ul.appendChild(li);
    });
}

function sincronizarTelasComConfig() {
    atualizarTelaModo();
    atualizarTelaBebida();
    selecionarChip($('chips-rodadas'), '.chip-rodadas', config.rodadas, 'rodadas');
    selecionarChip($('chips-tempo'), '.chip-tempo', config.tempo, 'tempo');
    $('toggle-cronometro').checked = config.cronometro;
    $('toggle-sons').checked = config.sons;
    $('toggle-vibracao').checked = config.vibracao;
    $('toggle-animacoes').checked = config.animacoes;
    $('toggle-repetir').checked = config.repetirAlvo;
    $('toggle-direito').checked = config.direitoResposta;
    $('toggle-regras').checked = config.regrasEspeciais;
    $('toggle-pular').checked = config.permitirPular;
    document.body.classList.toggle('sem-animacoes', !config.animacoes);
}

function ligarEventos() {
    // Navegação básica (botões "voltar")
    document.querySelectorAll('.btn-voltar').forEach(function (btn) {
        btn.addEventListener('click', function () { irPara(btn.dataset.volta); });
    });

    // Tela inicial
    $('btn-jogar').addEventListener('click', function () { irPara('tela-jogadores'); });
    $('btn-como').addEventListener('click', function () { irPara('tela-como'); });
    $('btn-config-inicio').addEventListener('click', function () {
        $('btn-voltar-avancadas').dataset.volta = 'tela-inicio';
        irPara('tela-avancadas');
    });
    $('btn-continuar-partida').addEventListener('click', function () {
        const salva = lerJson(CHAVE_PARTIDA, null);
        if (!salva || !salva.ordem || salva.ordem.length < 3) {
            mostrarToast('Não encontrei uma partida salva válida.');
            apagarPartidaSalva();
            return;
        }
        partida = salva;
        snapshotAnterior = null;
        entrarNaPartida();
        mostrarToast('▶️ Partida restaurada — bora continuar!');
    });

    // Jogadores
    $('form-jogador').addEventListener('submit', function (e) {
        e.preventDefault();
        adicionarJogador();
    });
    $('btn-limpar-jogadores').addEventListener('click', function () {
        if (jogadores.length === 0) return;
        abrirConfirmacao('Apagar todos?', 'Todos os nomes da lista serão removidos.', function () {
            jogadores = [];
            salvarJogadores();
            renderizarJogadores();
        });
    });
    $('btn-continuar-jogadores').addEventListener('click', function () {
        ordemPartida = jogadores.slice();
        irPara('tela-modo');
    });

    // Modo
    document.querySelectorAll('.card-modo').forEach(function (card) {
        card.addEventListener('click', function () {
            config.modo = card.dataset.modo;
            salvarConfig();
            atualizarTelaModo();
        });
    });
    $('btn-continuar-modo').addEventListener('click', function () { irPara('tela-bebida'); });

    // Bebida
    ligarGrupoChips('chips-bebida', '.chip-bebida', 'bebida', function (v) {
        config.bebida = v;
        salvarConfig();
        atualizarTelaBebida();
    });
    ligarGrupoChips('chips-shot', '.chip-shot', 'shot', function (v) { config.shot = v; salvarConfig(); });
    ligarGrupoChips('chips-sem', '.chip-sem', 'sem', function (v) { config.consequenciaSem = v; salvarConfig(); });
    ligarGrupoChips('chips-int', '.chip-int', 'int', function (v) { config.intensidade = v; salvarConfig(); });
    $('btn-continuar-bebida').addEventListener('click', function () { irPara('tela-dificuldade'); });

    // Dificuldade
    ligarGrupoChips('chips-dif', '.chip-dif', 'dif', function (v) {
        config.dificuldade = v;
        salvarConfig();
        $('box-personalizado').hidden = v !== 'custom';
    });
    $('slider-azul').addEventListener('input', function () {
        config.customAzul = parseInt(this.value, 10);
        salvarConfig();
        atualizarSliderCustom();
    });
    $('toggle-caos-crescente').addEventListener('change', function () {
        config.caosCrescente = this.checked;
        salvarConfig();
    });
    $('btn-continuar-dificuldade').addEventListener('click', function () {
        $('btn-voltar-avancadas').dataset.volta = 'tela-dificuldade';
        irPara('tela-avancadas');
    });

    // Avançadas
    ligarGrupoChips('chips-rodadas', '.chip-rodadas', 'rodadas', function (v) {
        config.rodadas = parseInt(v, 10);
        salvarConfig();
    });
    ligarGrupoChips('chips-tempo', '.chip-tempo', 'tempo', function (v) {
        config.tempo = parseInt(v, 10);
        salvarConfig();
    });

    const toggles = {
        'toggle-cronometro': 'cronometro',
        'toggle-sons': 'sons',
        'toggle-vibracao': 'vibracao',
        'toggle-animacoes': 'animacoes',
        'toggle-repetir': 'repetirAlvo',
        'toggle-direito': 'direitoResposta',
        'toggle-regras': 'regrasEspeciais',
        'toggle-pular': 'permitirPular'
    };
    Object.keys(toggles).forEach(function (id) {
        $(id).addEventListener('change', function () {
            config[toggles[id]] = this.checked;
            salvarConfig();
            if (id === 'toggle-animacoes') document.body.classList.toggle('sem-animacoes', !this.checked);
        });
    });

    $('btn-continuar-avancadas').addEventListener('click', function () {
        if (jogadores.length < 3) {
            mostrarToast('Adicione pelo menos 3 jogadores primeiro!');
            irPara('tela-jogadores');
            return;
        }
        irPara('tela-revisao');
    });

    // Revisão
    $('btn-embaralhar').addEventListener('click', function () {
        ordemPartida = embaralhar(ordemPartida.length ? ordemPartida : jogadores);
        atualizarOrdemRevisao();
        mostrarToast('🔀 Ordem embaralhada!');
    });
    $('btn-comecar').addEventListener('click', iniciarPartida);

    // Partida
    $('btn-girar').addEventListener('click', girar);
    $('btn-pausar').addEventListener('click', function () {
        if (girando) return;
        salvarPartida();
        $('modal-pausa').hidden = false;
    });
    $('btn-continuar-pausa').addEventListener('click', function () { $('modal-pausa').hidden = true; });
    $('btn-voltar-rodada').addEventListener('click', voltarUmaRodada);
    $('btn-regras-jogo').addEventListener('click', function () {
        montarRegrasRapidas();
        $('modal-regras').hidden = false;
    });
    $('btn-regras-pausa').addEventListener('click', function () {
        montarRegrasRapidas();
        $('modal-regras').hidden = false;
    });
    $('btn-fechar-regras').addEventListener('click', function () { $('modal-regras').hidden = true; });

    function pedirEncerramento() {
        abrirConfirmacao('Encerrar partida?', 'A partida termina agora e mostramos o resumo da resenha.', encerrarPartida);
    }
    $('btn-encerrar').addEventListener('click', pedirEncerramento);
    $('btn-encerrar-pausa').addEventListener('click', pedirEncerramento);

    // Resultado
    $('btn-cumprido').addEventListener('click', function () { registrarDesfecho('cumprido'); });
    $('btn-pular').addEventListener('click', function () { registrarDesfecho('pulado'); });
    $('btn-proxima').addEventListener('click', proximaRodada);
    $('btn-sortear-extra').addEventListener('click', sortearExtra);

    // Resumo final
    $('btn-denovo').addEventListener('click', function () {
        if (ultimaPartidaStats) ordemPartida = ultimaPartidaStats.ordem.slice();
        iniciarPartida();
    });
    $('btn-nova-config').addEventListener('click', function () { irPara('tela-modo'); });
    $('btn-voltar-inicio').addEventListener('click', function () { irPara('tela-inicio'); });

    // Confirmação genérica
    $('btn-conf-sim').addEventListener('click', function () {
        $('modal-confirmar').hidden = true;
        if (confirmarCallback) confirmarCallback();
        confirmarCallback = null;
    });
    $('btn-conf-nao').addEventListener('click', function () {
        $('modal-confirmar').hidden = true;
        confirmarCallback = null;
    });

    // Fechar modais com Escape (exceto o resultado, que exige decisão)
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        $('modal-regras').hidden = true;
        if (!$('modal-confirmar').hidden) {
            $('modal-confirmar').hidden = true;
            confirmarCallback = null;
        }
    });

    // Redesenha as roletas se a janela mudar de tamanho durante a partida
    window.addEventListener('resize', function () {
        if (partida && !girando) {
            desenharRoletaJogadores();
            desenharRoletaCores(partida.rodada);
        }
    });
}

function iniciar() {
    carregarDados();

    roletaJogadores.canvas = $('canvas-jogadores');
    roletaCores.canvas = $('canvas-cores');

    montarListaComoJogar();
    renderizarJogadores();
    sincronizarTelasComConfig();
    ligarEventos();

    // Oferece retomar partida interrompida
    const salva = lerJson(CHAVE_PARTIDA, null);
    if (salva && salva.ordem && salva.ordem.length >= 3) {
        $('btn-continuar-partida').hidden = false;
    }

    // Marca para testes automatizados que o app subiu sem erros
    document.documentElement.setAttribute('data-app-pronto', '1');
}

window.addEventListener('error', function () {
    document.documentElement.setAttribute('data-app-erro', '1');
});

document.addEventListener('DOMContentLoaded', iniciar);
