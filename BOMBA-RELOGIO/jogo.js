/* ============================================================
   LÓGICA DO JOGO - Bomba-Relógio Etílica
   Depende de: categorias.js (GRUPOS_CATEGORIAS e PUNICOES)
   ============================================================ */

let jogoAtivo = false;
let tempoRestante;
let tempoTotal;
let loopJogo;
let proximoIntervalo;
let audioCtx = null; // Som gerado via código

// Tópico selecionado no menu. null = modo aleatório (todos os grupos ativos)
let grupoSelecionado = null;

// --- Elementos do menu ---
const telaMenu = document.getElementById('tela-menu');
const gradeTopicos = document.getElementById('grade-topicos');
const btnAleatorio = document.getElementById('btn-aleatorio');

// --- Elementos do jogo ---
const telaJogo = document.getElementById('tela-jogo');
const btnVoltar = document.getElementById('btn-voltar');
const tituloTopico = document.getElementById('titulo-topico');
const btnAcao = document.getElementById('btn-acao');
const txtCategoria = document.getElementById('categoria-texto');
const txtGrupo = document.getElementById('categoria-grupo');
const bombaVisual = document.getElementById('bomba-visual');
const boxPunicao = document.getElementById('punicao-box');

/* ================= MENU ================= */

// Monta a grade de tópicos a partir dos grupos ativos de categorias.js
function montarMenu() {
    gradeTopicos.innerHTML = '';
    GRUPOS_CATEGORIAS.forEach(function (grupo, indice) {
        if (!grupo.ativo || grupo.itens.length === 0) return;

        const card = document.createElement('div');
        card.className = 'card-topico';
        card.innerHTML =
            '<span class="emoji">' + grupo.emoji + '</span>' +
            '<span class="nome">' + grupo.nome + '</span>' +
            '<span class="qtd">' + grupo.itens.length + ' categorias</span>';

        card.addEventListener('click', function () {
            selecionarTopico(indice);
        });

        gradeTopicos.appendChild(card);
    });
}

// Escolhe um tópico específico e entra no jogo
function selecionarTopico(indice) {
    grupoSelecionado = indice;
    const grupo = GRUPOS_CATEGORIAS[indice];
    tituloTopico.innerText = grupo.emoji + ' ' + grupo.nome;
    abrirTelaJogo();
}

// Escolhe o modo aleatório (qualquer categoria) e entra no jogo
function selecionarAleatorio() {
    grupoSelecionado = null;
    tituloTopico.innerText = '🎲 Modo Aleatório';
    abrirTelaJogo();
}

function abrirTelaJogo() {
    telaMenu.classList.add('escondido');
    telaJogo.classList.remove('escondido');
    resetarTelaJogo();
}

function voltarAoMenu() {
    // Interrompe qualquer rodada em andamento
    jogoAtivo = false;
    clearTimeout(loopJogo);
    telaJogo.classList.add('escondido');
    telaMenu.classList.remove('escondido');
}

function resetarTelaJogo() {
    jogoAtivo = false;
    clearTimeout(loopJogo);
    boxPunicao.style.display = 'none';
    bombaVisual.className = '';
    bombaVisual.innerText = '💣';
    txtGrupo.innerText = '';
    txtCategoria.innerText = 'Toque em Iniciar para Jogar!';
    btnAcao.style.opacity = '1';
    btnAcao.disabled = false;
    btnAcao.innerText = 'INICIAR JOGO';
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

// Sorteia uma categoria respeitando o tópico escolhido no menu
function sortearCategoria() {
    let grupo;

    if (grupoSelecionado !== null) {
        // Tópico fixo escolhido no menu
        grupo = GRUPOS_CATEGORIAS[grupoSelecionado];
    } else {
        // Modo aleatório: sorteia entre todos os grupos ativos
        const gruposAtivos = GRUPOS_CATEGORIAS.filter(function (g) {
            return g.ativo && g.itens.length > 0;
        });
        grupo = gruposAtivos[Math.floor(Math.random() * gruposAtivos.length)];
    }

    const item = grupo.itens[Math.floor(Math.random() * grupo.itens.length)];
    return {
        grupo: grupo.emoji + ' ' + grupo.nome,
        categoria: item
    };
}

/* ================= JOGO ================= */

function gerenciarJogo() {
    iniciarAudio();
    if (!jogoAtivo) {
        comecarRodada();
    }
}

function comecarRodada() {
    jogoAtivo = true;
    boxPunicao.style.display = 'none';
    btnAcao.style.opacity = '0.5';
    btnAcao.disabled = true;
    btnAcao.innerText = 'PASSE O CELULAR!';

    // Sorteia grupo + categoria
    const sorteio = sortearCategoria();
    txtGrupo.innerText = sorteio.grupo;
    txtCategoria.innerText = sorteio.categoria;

    // Tempo aleatório entre 15 e 40 segundos
    tempoTotal = Math.floor(Math.random() * (40 - 15 + 1)) + 15;
    tempoRestante = tempoTotal;

    bombaVisual.className = '';
    bombaVisual.innerText = '💣';

    executarCiclo();
}

function executarCiclo() {
    if (!jogoAtivo) return;

    const porcentagemPassada = ((tempoTotal - tempoRestante) / tempoTotal) * 100;

    // Muda visual e som da bomba conforme o tempo passa
    if (porcentagemPassada > 75) {
        bombaVisual.className = 'perigo';
        tocarBipe(600, 0.08);
        proximoIntervalo = 250; // 4 bipes por segundo
    } else if (porcentagemPassada > 40) {
        bombaVisual.className = 'medio';
        tocarBipe(440, 0.1);
        proximoIntervalo = 500; // 2 bipes por segundo
    } else {
        bombaVisual.className = '';
        tocarBipe(350, 0.15);
        proximoIntervalo = 1000; // 1 bipe por segundo
    }

    tempoRestante -= (proximoIntervalo / 1000);

    if (tempoRestante <= 0) {
        explodirBomba();
    } else {
        loopJogo = setTimeout(executarCiclo, proximoIntervalo);
    }
}

function explodirBomba() {
    jogoAtivo = false;
    clearTimeout(loopJogo);

    bombaVisual.className = 'explodiu';
    bombaVisual.innerText = '💥';

    // Som de explosão
    tocarBipe(100, 0.8);
    tocarBipe(150, 0.5);

    // Sorteia punição
    const punicao = PUNICOES[Math.floor(Math.random() * PUNICOES.length)];
    boxPunicao.innerText = punicao;
    boxPunicao.style.display = 'block';

    txtGrupo.innerText = '';
    txtCategoria.innerText = 'BOOM! Você perdeu!';

    btnAcao.style.opacity = '1';
    btnAcao.disabled = false;
    btnAcao.innerText = 'JOGAR NOVAMENTE';
}

/* ================= LIGAÇÕES ================= */
btnAleatorio.addEventListener('click', selecionarAleatorio);
btnVoltar.addEventListener('click', voltarAoMenu);
btnAcao.addEventListener('click', gerenciarJogo);

// Monta o menu assim que a página carrega
montarMenu();
