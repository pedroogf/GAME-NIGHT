/* ============================================================
   ANIMATIONS — transições de tela, flip da carta e avisos
   ------------------------------------------------------------
   Todas as animações são feitas em CSS; aqui só trocamos
   classes. Se o jogador desligar animações, o body recebe
   a classe "sem-animacao" e tudo acontece instantaneamente.
   ============================================================ */

/* Aplica (ou remove) o modo sem animações conforme a config */
function aplicarPreferenciasVisuais() {
  document.body.classList.toggle("sem-animacao", !config.animacoes);
  document.body.classList.toggle("tema-claro", config.temaClaro);
}

/* Troca de tela com fade/slide */
function irParaTela(id) {
  document.querySelectorAll(".screen").forEach(t => t.classList.remove("active"));
  const alvo = document.getElementById(id);
  alvo.classList.add("active");
  alvo.scrollTop = 0;
  window.scrollTo(0, 0);
}

/* Vira a carta (frente ↔ verso) */
function virarCarta(revelar) {
  document.getElementById("carta").classList.toggle("virada", revelar);
}

/* Balanço rápido — usado quando sai carta especial */
function tremerElemento(el) {
  el.classList.remove("tremer");
  void el.offsetWidth; // reinicia a animação
  el.classList.add("tremer");
}

/* Aviso rápido no rodapé (some sozinho) */
let toastTimer = null;
function mostrarToast(texto) {
  const el = document.getElementById("toast");
  el.textContent = texto;
  el.classList.add("visivel");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visivel"), 2600);
}
