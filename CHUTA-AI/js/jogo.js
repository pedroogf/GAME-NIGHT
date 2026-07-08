/* ============================================================
   CHUTA AÍ — LÓGICA DO JOGO
   ------------------------------------------------------------
   - Sorteia perguntas sem repetir até esgotar o baralho
   - Filtra por categoria ou joga com todas
   - Contador de perguntas restantes
   ============================================================ */

// ---------- Estado ----------
let categoriaAtual = "todas"; // "todas" ou o nome de uma categoria
let baralho = [];             // índices de PERGUNTAS ainda não usados
let perguntaAtual = null;

// ---------- Elementos ----------
const telaCategorias = document.getElementById("tela-categorias");
const telaJogo       = document.getElementById("tela-jogo");
const gradeCategorias = document.getElementById("grade-categorias");
const chipCategoria  = document.getElementById("chip-categoria");
const numRestantes   = document.getElementById("num-restantes");
const cartao         = document.getElementById("cartao");
const tagCategoria   = document.getElementById("tag-categoria");
const textoPergunta  = document.getElementById("texto-pergunta");
const painelResposta = document.getElementById("painel-resposta");
const valorResposta  = document.getElementById("valor-resposta");
const unidadeResposta = document.getElementById("unidade-resposta");
const textoCuriosidade = document.getElementById("texto-curiosidade");
const btnResposta    = document.getElementById("btn-resposta");
const btnNova        = document.getElementById("btn-nova");
const fimBaralho     = document.getElementById("fim-baralho");

// ---------- Montagem da grade de categorias ----------
CATEGORIAS.forEach(cat => {
  const btn = document.createElement("button");
  btn.className = "chip-cat";
  btn.innerHTML = `<span class="cat-emoji">${cat.emoji}</span><span>${cat.nome}</span>`;
  btn.onclick = () => iniciarJogo(cat.nome);
  gradeCategorias.appendChild(btn);
});

// ---------- Utilidades ----------
function embaralhar(lista) {
  // Fisher-Yates
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

function emojiDaCategoria(nome) {
  const cat = CATEGORIAS.find(c => c.nome === nome);
  return cat ? cat.emoji : "🎯";
}

function formatarNumero(n) {
  // 384400 -> "384.400" | 9.58 -> "9,58"
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

function montarBaralho() {
  baralho = [];
  PERGUNTAS.forEach((q, i) => {
    if (categoriaAtual === "todas" || q.c === categoriaAtual) baralho.push(i);
  });
  embaralhar(baralho);
}

function atualizarContador() {
  numRestantes.textContent = baralho.length;
}

// ---------- Fluxo do jogo ----------
function iniciarJogo(categoria) {
  categoriaAtual = categoria;
  montarBaralho();

  const rotulo = categoria === "todas"
    ? "🌀 Todas"
    : `${emojiDaCategoria(categoria)} ${categoria}`;
  chipCategoria.textContent = `${rotulo} · trocar`;

  // Estado inicial da tela de jogo
  perguntaAtual = null;
  tagCategoria.textContent = rotulo;
  textoPergunta.textContent = 'Toque em "Nova Pergunta" para começar!';
  painelResposta.classList.remove("visivel");
  btnResposta.disabled = true;
  fimBaralho.style.display = "none";
  btnNova.style.display = "";
  atualizarContador();

  telaCategorias.classList.remove("ativa");
  telaJogo.classList.add("ativa");
  window.scrollTo(0, 0);
}

function voltarCategorias() {
  telaJogo.classList.remove("ativa");
  telaCategorias.classList.add("ativa");
  window.scrollTo(0, 0);
}

function novaPergunta() {
  if (baralho.length === 0) {
    // Acabou o baralho: mostra aviso para reembaralhar
    fimBaralho.style.display = "";
    btnNova.style.display = "none";
    btnResposta.disabled = true;
    return;
  }

  const indice = baralho.pop();
  perguntaAtual = PERGUNTAS[indice];
  atualizarContador();

  // Preenche o cartão
  tagCategoria.textContent = `${emojiDaCategoria(perguntaAtual.c)} ${perguntaAtual.c}`;
  textoPergunta.textContent = perguntaAtual.p;
  painelResposta.classList.remove("visivel");
  btnResposta.disabled = false;

  // Reinicia a animação de troca
  cartao.classList.remove("trocando");
  void cartao.offsetWidth; // força o navegador a reiniciar a animação
  cartao.classList.add("trocando");
}

function mostrarResposta() {
  if (!perguntaAtual) return;

  valorResposta.textContent = formatarNumero(perguntaAtual.r);
  unidadeResposta.textContent = perguntaAtual.u;
  textoCuriosidade.textContent = perguntaAtual.d;
  painelResposta.classList.add("visivel");
  btnResposta.disabled = true;
}

function reiniciarBaralho() {
  montarBaralho();
  atualizarContador();
  fimBaralho.style.display = "none";
  btnNova.style.display = "";
  novaPergunta();
}
