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

// Baralho de categorias: sorteia sem repetir até esgotar
let baralhoCategorias = [];

// Ritmo da bomba: faixa de duração (em segundos) de cada rodada
const RITMOS = {
    rapido: { min: 10, max: 20 },
    normal: { min: 15, max: 40 },
    zen:    { min: 30, max: 60 }
};
let ritmoAtual = 'normal';

// Falso alarme: chance de a bomba "engasgar" e voltar por alguns segundos
const CHANCE_FALSO_ALARME = 0.15;
let falsoAlarmePendente = false;

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
    montarBaralho(); // baralho novo a cada troca de tópico
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
    travarChipsRitmo(false);
    document.getElementById('quem-explodiu').style.display = 'none';
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

// Embaralha uma lista no lugar (Fisher-Yates)
function embaralharLista(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = lista[i];
        lista[i] = lista[j];
        lista[j] = tmp;
    }
}

// Monta o baralho conforme o tópico escolhido (sem repetição até esgotar)
function montarBaralho() {
    baralhoCategorias = [];

    const grupos = grupoSelecionado !== null
        ? [GRUPOS_CATEGORIAS[grupoSelecionado]]
        : GRUPOS_CATEGORIAS.filter(function (g) {
            return g.ativo && g.itens.length > 0;
        });

    grupos.forEach(function (grupo) {
        grupo.itens.forEach(function (item) {
            baralhoCategorias.push({
                grupo: grupo.emoji + ' ' + grupo.nome,
                categoria: item
            });
        });
    });

    embaralharLista(baralhoCategorias);
}

// Tira a próxima categoria do baralho (reembaralha quando esgota)
function sortearCategoria() {
    if (baralhoCategorias.length === 0) montarBaralho();
    return baralhoCategorias.pop();
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
    document.getElementById('quem-explodiu').style.display = 'none';
    btnAcao.style.opacity = '0.5';
    btnAcao.disabled = true;
    btnAcao.innerText = 'PASSE O CELULAR!';

    travarChipsRitmo(true);

    // Sorteia grupo + categoria
    const sorteio = sortearCategoria();
    txtGrupo.innerText = sorteio.grupo;
    txtCategoria.innerText = sorteio.categoria;

    // Tempo aleatório dentro da faixa do ritmo escolhido
    const ritmo = RITMOS[ritmoAtual];
    tempoTotal = Math.floor(Math.random() * (ritmo.max - ritmo.min + 1)) + ritmo.min;
    tempoRestante = tempoTotal;

    // Sorteia se esta rodada terá um falso alarme no fim
    falsoAlarmePendente = Math.random() < CHANCE_FALSO_ALARME;

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
        if (falsoAlarmePendente) {
            dispararFalsoAlarme();
        } else {
            explodirBomba();
        }
    } else {
        loopJogo = setTimeout(executarCiclo, proximoIntervalo);
    }
}

// A bomba "engasga": silêncio de suspense... e volta por mais alguns segundos
function dispararFalsoAlarme() {
    falsoAlarmePendente = false;

    bombaVisual.className = '';
    bombaVisual.innerText = '💣';
    tocarBipe(180, 0.35); // tic abafado, como se tivesse falhado

    loopJogo = setTimeout(function () {
        if (!jogoAtivo) return;
        // Retoma direto no pânico por mais 2 a 4 segundos
        tempoRestante = Math.floor(Math.random() * 3) + 2;
        tempoTotal = tempoRestante * 5; // força o visual/som de perigo
        executarCiclo();
    }, 1200);
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
    travarChipsRitmo(false);
    mostrarQuemExplodiu();
}

// Se a mesa do Game Night tem gente, pergunta quem segurava a bomba
// e desconta 1 ponto no ranking do azarado
function mostrarQuemExplodiu() {
    const box = document.getElementById('quem-explodiu');
    const nomes = (typeof GameNight !== 'undefined') ? GameNight.jogadores() : [];
    box.innerHTML = '';
    if (nomes.length === 0) { box.style.display = 'none'; return; }

    const rotulo = document.createElement('div');
    rotulo.className = 'quem-rotulo';
    rotulo.innerText = '💥 Quem tava segurando? (−1 ponto no ranking)';
    box.appendChild(rotulo);

    const linha = document.createElement('div');
    linha.className = 'quem-chips';
    nomes.forEach(function (nome) {
        const chip = document.createElement('button');
        chip.className = 'chip-ritmo';
        chip.innerText = nome;
        chip.addEventListener('click', function () {
            GameNight.adicionarPontos('bomba', nome, -1);
            box.innerHTML = '<div class="quem-rotulo">💥 ' + nome + ' levou −1 ponto no ranking!</div>';
        });
        linha.appendChild(chip);
    });
    box.appendChild(linha);
    box.style.display = 'block';
}

/* ================= RITMO ================= */

function travarChipsRitmo(travar) {
    document.querySelectorAll('.chip-ritmo').forEach(function (chip) {
        chip.disabled = travar;
    });
}

function selecionarRitmo(chip) {
    if (jogoAtivo) return;
    ritmoAtual = chip.dataset.ritmo;
    document.querySelectorAll('.chip-ritmo').forEach(function (c) {
        c.classList.toggle('selecionado', c === chip);
    });
}

/* ================= LIGAÇÕES ================= */
btnAleatorio.addEventListener('click', selecionarAleatorio);
btnVoltar.addEventListener('click', voltarAoMenu);
btnAcao.addEventListener('click', gerenciarJogo);
document.querySelectorAll('.chip-ritmo').forEach(function (chip) {
    chip.addEventListener('click', function () { selecionarRitmo(chip); });
});

// Monta o menu assim que a página carrega
montarMenu();
