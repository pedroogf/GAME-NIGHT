/* ============================================================
   SUECA — Lógica do jogo
   ------------------------------------------------------------
   Simula um baralho de 52 cartas sem repetição. A cada
   sorteio a carta é removida do baralho; quando ele acaba,
   o botão passa a recriar (embaralhar) o baralho.
   ============================================================ */

/* ---------- Dados do baralho ---------- */

// Naipes: símbolo + cor usada na frente da carta
const NAIPES = [
    { simbolo: "♠", cor: "preto" },
    { simbolo: "♥", cor: "vermelho" },
    { simbolo: "♦", cor: "vermelho" },
    { simbolo: "♣", cor: "preto" }
];

// Valores na ordem clássica (A, 2..10, J, Q, K)
const VALORES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Regra de cada valor (igual para todos os naipes)
const REGRAS = {
    "A":  "Pa Pi Pow",
    "2":  "Duas pessoas bebem.",
    "3":  "Três pessoas bebem.",
    "4":  "Fui na feira.",
    "5":  "CPM.",
    "6":  "Patinho.",
    "7":  "Jogo do Pi do 3.",
    "8":  "Palavra-regra.",
    "9":  "Crie uma regra.",
    "10": "Terceiro à direita bebe.",
    "J":  "A pessoa que tirou bebe.",
    "Q":  "Mulheres bebem.",
    "K":  "Homens bebem."
};

// Tempo da animação de flip (deve bater com o transition do CSS)
const DURACAO_FLIP = 600;

/* ---------- Estado ---------- */

let baralho = [];      // cartas ainda não sorteadas
let historico = [];    // últimas cartas sorteadas (máx. 5)
let animando = false;  // trava o botão durante a animação

/* ---------- Elementos da página ---------- */

const elContador      = document.getElementById("contador");
const elCartaInner    = document.getElementById("carta-inner");
const elFrente        = document.querySelector(".carta-frente");
const elValorTopo     = document.getElementById("canto-valor-topo");
const elNaipeTopo     = document.getElementById("canto-naipe-topo");
const elValorBase     = document.getElementById("canto-valor-base");
const elNaipeBase     = document.getElementById("canto-naipe-base");
const elNaipeCentral  = document.getElementById("naipe-central");
const elRegraTexto    = document.getElementById("regra-texto");
const elBtn           = document.getElementById("btn-sortear");
const elHistorico     = document.getElementById("historico-lista");

/* ---------- Funções do baralho ---------- */

// Cria as 52 cartas (13 valores × 4 naipes)
function criarBaralho() {
    baralho = [];
    for (const naipe of NAIPES) {
        for (const valor of VALORES) {
            baralho.push({ valor, naipe });
        }
    }
}

// Sorteia (e remove) uma carta aleatória do baralho
function sortearCarta() {
    const indice = Math.floor(Math.random() * baralho.length);
    return baralho.splice(indice, 1)[0];
}

/* ---------- Funções de interface ---------- */

// Atualiza o contador de cartas restantes
function atualizarContador() {
    const n = baralho.length;
    elContador.textContent =
        n === 1 ? "1 carta no baralho" : `${n} cartas no baralho`;
}

// Preenche a frente da carta com valor, naipe e cor
function mostrarCarta(carta) {
    const { valor, naipe } = carta;

    elValorTopo.textContent = valor;
    elValorBase.textContent = valor;
    elNaipeTopo.textContent = naipe.simbolo;
    elNaipeBase.textContent = naipe.simbolo;
    elNaipeCentral.textContent = naipe.simbolo;

    elFrente.classList.remove("naipe-preto", "naipe-vermelho");
    elFrente.classList.add(`naipe-${naipe.cor}`);
}

// Mostra a regra da carta com destaque
function mostrarRegra(carta) {
    elRegraTexto.textContent = REGRAS[carta.valor];
    elRegraTexto.classList.add("revelada");
}

// Adiciona a carta ao histórico (mantém só as 5 últimas)
function adicionarAoHistorico(carta) {
    historico.unshift(carta);
    if (historico.length > 5) historico.pop();

    elHistorico.innerHTML = "";
    for (const c of historico) {
        const chip = document.createElement("span");
        chip.className = `historico-carta naipe-${c.naipe.cor}`;
        chip.textContent = `${c.valor}${c.naipe.simbolo}`;
        elHistorico.appendChild(chip);
    }
}

// Configura o botão para o modo "fim de baralho"
function modoEmbaralhar() {
    elBtn.textContent = "Embaralhar Novamente";
    elBtn.classList.add("embaralhar");
}

// Volta o botão ao modo normal de sorteio
function modoSortear() {
    elBtn.textContent = "Sortear Carta";
    elBtn.classList.remove("embaralhar");
}

/* ---------- Fluxo principal ---------- */

// Sorteia uma carta com a animação de flip
function jogar() {
    if (animando || baralho.length === 0) return;
    animando = true;
    elBtn.disabled = true;

    // Esconde a regra anterior durante o giro
    elRegraTexto.classList.remove("revelada");
    elRegraTexto.textContent = "...";

    // Se a carta está revelada, primeiro volta ao verso
    const jaVirada = elCartaInner.classList.contains("virada");
    if (jaVirada) elCartaInner.classList.remove("virada");

    // Espera o giro de volta antes de trocar o conteúdo
    setTimeout(() => {
        const carta = sortearCarta();

        mostrarCarta(carta);
        elCartaInner.classList.add("virada"); // gira e revela

        // Ao fim do flip, mostra regra, histórico e libera o botão
        setTimeout(() => {
            mostrarRegra(carta);
            adicionarAoHistorico(carta);
            atualizarContador();

            if (baralho.length === 0) {
                modoEmbaralhar();
            }

            animando = false;
            elBtn.disabled = false;
        }, DURACAO_FLIP);

    }, jaVirada ? DURACAO_FLIP : 50);
}

// Recria o baralho e reseta a interface
function embaralhar() {
    criarBaralho();
    atualizarContador();
    modoSortear();

    // Vira a carta de volta para o verso
    elCartaInner.classList.remove("virada");
    elRegraTexto.classList.remove("revelada");
    elRegraTexto.textContent = "Baralho embaralhado! Boa sorte 🍀";
}

// Um único botão decide entre sortear ou embaralhar
elBtn.addEventListener("click", () => {
    if (baralho.length === 0 && !animando) {
        embaralhar();
    } else {
        jogar();
    }
});

/* ---------- Início ---------- */
criarBaralho();
atualizarContador();
