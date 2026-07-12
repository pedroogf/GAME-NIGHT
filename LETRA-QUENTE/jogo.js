/* ============================================================
   LÓGICA DO JOGO - Letra Quente
   Depende de: temas.js (TEMAS, LETRAS_BASE e PRENDAS)
   ------------------------------------------------------------
   Rodada: sorteia tema + letra. O celular fica no centro.
   Falou uma palavra? Toca no círculo e o tempo reinicia pro
   próximo da roda. Estourou o tempo? Prenda de bebida — e a
   galera marca quem perdeu pra descontar no ranking.
   ============================================================ */

let rodadaAtiva = false;
let tempoPorJogador = 8;      // segundos (escolhido nos chips do menu)
let tempoRestante = 0;
let loopTimer = null;
let ultimoSegundo = 0;        // controla o bipe de cada segundo
let audioCtx = null;          // som gerado via código

// Tema selecionado no menu. null = modo aleatório (todos os ativos)
let temaSelecionado = null;

// Baralho de temas (sorteia sem repetir até esgotar) e letras recentes
let baralhoTemas = [];
let letrasRecentes = [];

// --- Elementos do menu ---
const telaMenu = document.getElementById('tela-menu');
const gradeTemas = document.getElementById('grade-temas');
const btnAleatorio = document.getElementById('btn-aleatorio');

// --- Elementos do jogo ---
const telaJogo = document.getElementById('tela-jogo');
const btnVoltar = document.getElementById('btn-voltar');
const tituloTema = document.getElementById('titulo-tema');
const btnAcao = document.getElementById('btn-acao');
const txtSorteioTema = document.getElementById('sorteio-tema');
const txtSorteioLetra = document.getElementById('sorteio-letra');
const areaToque = document.getElementById('area-toque');
const tempoNum = document.getElementById('tempo-num');
const dicaToque = document.getElementById('dica-toque');
const resultadoBox = document.getElementById('resultado-box');
const prendaBox = document.getElementById('prenda-box');
const quemPerdeuBox = document.getElementById('quem-perdeu');

/* ================= MENU ================= */

// Monta a grade de temas a partir dos ativos de temas.js
function montarMenu() {
    gradeTemas.innerHTML = '';
    TEMAS.forEach(function (tema, indice) {
        if (!tema.ativo) return;

        const card = document.createElement('div');
        card.className = 'card-tema';
        card.innerHTML =
            '<span class="emoji">' + tema.emoji + '</span>' +
            '<span class="nome">' + tema.nome + '</span>';

        card.addEventListener('click', function () {
            selecionarTema(indice);
        });

        gradeTemas.appendChild(card);
    });
}

function selecionarTema(indice) {
    temaSelecionado = indice;
    tituloTema.innerText = TEMAS[indice].emoji + ' ' + TEMAS[indice].nome;
    abrirTelaJogo();
}

function selecionarAleatorio() {
    temaSelecionado = null;
    tituloTema.innerText = '🎲 Modo Aleatório';
    abrirTelaJogo();
}

function abrirTelaJogo() {
    montarBaralhoTemas();
    telaMenu.classList.add('escondido');
    telaJogo.classList.remove('escondido');
    resetarTelaJogo();
}

function voltarAoMenu() {
    rodadaAtiva = false;
    clearInterval(loopTimer);
    telaJogo.classList.add('escondido');
    telaMenu.classList.remove('escondido');
}

function resetarTelaJogo() {
    rodadaAtiva = false;
    clearInterval(loopTimer);
    resultadoBox.classList.add('escondido');
    prendaBox.classList.add('escondido');
    quemPerdeuBox.classList.add('escondido');
    areaToque.className = '';
    tempoNum.innerText = '🔤';
    txtSorteioTema.innerText = 'Toque em Iniciar pra sortear!';
    txtSorteioLetra.innerText = '';
    dicaToque.style.visibility = 'hidden';
    btnAcao.style.opacity = '1';
    btnAcao.disabled = false;
    btnAcao.innerText = 'INICIAR RODADA';
}

/* ================= ÁUDIO ================= */

// Inicia o contexto de áudio (exigido pelos navegadores modernos)
function iniciarAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Gera um bipe eletrônico sem precisar de arquivos de som
function tocarBipe(frequencia, duracao) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = frequencia;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duracao);
    osc.stop(audioCtx.currentTime + duracao);
}

/* ================= SORTEIO ================= */

// Embaralha uma lista no lugar (Fisher-Yates)
function embaralharLista(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = lista[i];
        lista[i] = lista[j];
        lista[j] = tmp;
    }
}

// Baralho de temas conforme a escolha do menu (sem repetir até esgotar)
function montarBaralhoTemas() {
    baralhoTemas = temaSelecionado !== null
        ? [TEMAS[temaSelecionado]]
        : TEMAS.filter(function (t) { return t.ativo; }).slice();
    embaralharLista(baralhoTemas);
}

function sortearTema() {
    if (baralhoTemas.length === 0) montarBaralhoTemas();
    return baralhoTemas.pop();
}

// Sorteia uma letra válida pro tema, evitando as últimas usadas
function sortearLetra(tema) {
    const proibidas = tema.excluir || [];
    let validas = LETRAS_BASE.filter(function (l) {
        return proibidas.indexOf(l) === -1;
    });
    const frescas = validas.filter(function (l) {
        return letrasRecentes.indexOf(l) === -1;
    });
    if (frescas.length > 0) validas = frescas;

    const letra = validas[Math.floor(Math.random() * validas.length)];
    letrasRecentes.push(letra);
    if (letrasRecentes.length > 5) letrasRecentes.shift();
    return letra;
}

/* ================= RODADA ================= */

function comecarRodada() {
    iniciarAudio();
    if (rodadaAtiva) return;

    rodadaAtiva = true;
    resultadoBox.classList.add('escondido');
    prendaBox.classList.add('escondido');
    quemPerdeuBox.classList.add('escondido');
    btnAcao.style.opacity = '0.5';
    btnAcao.disabled = true;
    btnAcao.innerText = 'RODADA ROLANDO...';
    dicaToque.style.visibility = 'visible';
    travarChipsTempo(true);

    // Sorteia tema + letra
    const tema = sortearTema();
    const letra = sortearLetra(tema);
    txtSorteioTema.innerText = tema.emoji + ' ' + tema.nome;
    txtSorteioLetra.innerText = 'com a letra ' + letra;

    reiniciarTempo();
    tocarBipe(500, 0.15);

    clearInterval(loopTimer);
    loopTimer = setInterval(executarCiclo, 100);
}

function reiniciarTempo() {
    tempoRestante = tempoPorJogador;
    ultimoSegundo = Math.ceil(tempoRestante);
    atualizarVisualTempo();
}

function atualizarVisualTempo() {
    tempoNum.innerText = Math.max(0, Math.ceil(tempoRestante));
    if (tempoRestante <= 3) {
        areaToque.className = 'perigo';
    } else if (tempoRestante <= tempoPorJogador / 2) {
        areaToque.className = 'medio';
    } else {
        areaToque.className = 'ativo';
    }
}

function executarCiclo() {
    if (!rodadaAtiva) return;

    tempoRestante -= 0.1;

    // Um bipe a cada segundo cheio (mais agudo no desespero)
    const segundoAtual = Math.ceil(tempoRestante);
    if (segundoAtual < ultimoSegundo && segundoAtual > 0) {
        ultimoSegundo = segundoAtual;
        tocarBipe(segundoAtual <= 3 ? 700 : 400, 0.08);
    }

    if (tempoRestante <= 0) {
        perderRodada();
    } else {
        atualizarVisualTempo();
    }
}

// Toque no círculo: falou a palavra, o tempo reinicia pro próximo
function tocarNaTela() {
    if (!rodadaAtiva) return;
    reiniciarTempo();
    tocarBipe(550, 0.1);
}

/* ---------- fim da rodada ---------- */

function perderRodada() {
    rodadaAtiva = false;
    clearInterval(loopTimer);

    areaToque.className = 'explodiu';
    tempoNum.innerText = '⏰';
    dicaToque.style.visibility = 'hidden';
    tocarBipe(120, 0.7);
    tocarBipe(90, 0.9);

    resultadoBox.innerHTML = '⏰ Tempo esgotado!';
    resultadoBox.classList.remove('escondido');

    // Sorteia a prenda de bebida
    const prenda = PRENDAS[Math.floor(Math.random() * PRENDAS.length)];
    prendaBox.innerText = '🍻 ' + prenda;
    prendaBox.classList.remove('escondido');

    mostrarQuemPerdeu();

    btnAcao.style.opacity = '1';
    btnAcao.disabled = false;
    btnAcao.innerText = 'PRÓXIMA RODADA';
    travarChipsTempo(false);
}

// Se a mesa do Game Night tem gente, pergunta quem perdeu
// e desconta 1 ponto no ranking do azarado
function mostrarQuemPerdeu() {
    const nomes = (typeof GameNight !== 'undefined') ? GameNight.jogadores() : [];
    quemPerdeuBox.innerHTML = '';
    if (nomes.length === 0) return;

    const rotulo = document.createElement('div');
    rotulo.className = 'quem-rotulo';
    rotulo.innerText = '⏰ Quem perdeu? (−1 ponto no ranking)';
    quemPerdeuBox.appendChild(rotulo);

    const linha = document.createElement('div');
    linha.className = 'quem-chips';
    nomes.forEach(function (nome) {
        const chip = document.createElement('button');
        chip.className = 'chip-nome';
        chip.innerText = nome;
        chip.addEventListener('click', function () {
            GameNight.adicionarPontos('letra-quente', nome, -1);
            quemPerdeuBox.innerHTML = '<div class="quem-rotulo">🍻 ' + nome + ' perdeu e levou −1 ponto no ranking!</div>';
        });
        linha.appendChild(chip);
    });
    quemPerdeuBox.appendChild(linha);
    quemPerdeuBox.classList.remove('escondido');
}

/* ================= TEMPO POR JOGADOR (chips) ================= */

function travarChipsTempo(travar) {
    document.querySelectorAll('.chip-tempo').forEach(function (chip) {
        chip.disabled = travar;
    });
}

function selecionarTempo(chip) {
    if (rodadaAtiva) return;
    tempoPorJogador = parseInt(chip.dataset.tempo, 10);
    document.querySelectorAll('.chip-tempo').forEach(function (c) {
        c.classList.toggle('selecionado', c === chip);
    });
}

/* ================= LIGAÇÕES ================= */

btnAleatorio.addEventListener('click', selecionarAleatorio);
btnVoltar.addEventListener('click', voltarAoMenu);
btnAcao.addEventListener('click', comecarRodada);

// pointerdown responde mais rápido que click (importante no calor do jogo)
areaToque.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    tocarNaTela();
});

document.querySelectorAll('.chip-tempo').forEach(function (chip) {
    chip.addEventListener('click', function () { selecionarTempo(chip); });
});

// Monta o menu assim que a página carrega
montarMenu();
