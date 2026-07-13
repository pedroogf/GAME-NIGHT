/* ============================================================
   MOTOR DE RECONHECIMENTO — DUVIDO
   ------------------------------------------------------------
   Funções puras, zero DOM, zero estado. É o coração do app:
   se isso falhar, o jogo não funciona. Testável em testes.html.
   ============================================================ */

/* ------------------------------------------------------------
   Normalização — a comparação roda sobre esta forma:
   minúsculas, sem acentos, sem pontuação/hífen/espaço,
   sem artigo inicial.
   "Coca-Cola" = "coca cola" = "cocacola"
   "O Boticário" = "boticario"
   ------------------------------------------------------------ */
function normalizar(texto) {
  let s = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");   // sem acentos (faixa U+0300–U+036F)
  s = s.replace(/[^a-z0-9]+/g, " ");    // pontuação, hífen etc. viram espaço
  s = s.trim().replace(/\s+/g, " ");
  s = s.replace(/^(o|a|os|as|um|uma|uns|umas|the) /, ""); // sem artigo inicial
  return s.replace(/ /g, "");           // sem espaços
}

/* Distância de Levenshtein clássica (strings curtas, DP simples) */
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let anterior = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const atual = [i];
    for (let j = 1; j <= n; j++) {
      atual[j] = Math.min(
        anterior[j] + 1,
        atual[j - 1] + 1,
        anterior[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    anterior = atual;
  }
  return anterior[n];
}

/* Todas as formas normalizadas de um item (resposta + aliases) */
function formasDoItem(item) {
  return [item.resposta, ...(item.aliases || [])]
    .map(normalizar)
    .filter(Boolean);
}

/* ------------------------------------------------------------
   Julgamento. Ordem de checagem:
     1. match exato normalizado
     2. match por alias (formasDoItem já inclui os aliases)
     3. fuzzy (Levenshtein ≤ 2 com 6+ letras, ≤ 1 abaixo) —
        nunca decide sozinho: vira a pergunta "você quis dizer…?"
     4. nada bateu → fora

   Retorna:
     null                              → entrada vazia, ignorar
     { tipo: "na-lista",    item }     → revelar + quem duvidou perde
     { tipo: "ja-revelado", item }     → ninguém perde vida
     { tipo: "fuzzy",       item }     → perguntar antes de julgar
     { tipo: "fora",        item: null } → quem falou perde
   ------------------------------------------------------------ */
function julgar(palavra, tema, reveladas) {
  const n = normalizar(palavra);
  if (!n) return null;

  // 1–2. exato em resposta ou alias
  for (const item of tema.itens) {
    if (formasDoItem(item).includes(n)) {
      return { tipo: reveladas.has(item.posicao) ? "ja-revelado" : "na-lista", item };
    }
  }

  // 3. fuzzy — erro de digitação não pode custar a vida de ninguém
  const limite = n.length >= 6 ? 2 : 1;
  let melhor = null;
  let melhorDist = Infinity;
  for (const item of tema.itens) {
    for (const forma of formasDoItem(item)) {
      const d = levenshtein(n, forma);
      if (d < melhorDist) {
        melhorDist = d;
        melhor = item;
      }
    }
  }
  if (melhor && melhorDist <= limite) {
    return { tipo: "fuzzy", item: melhor };
  }

  // 4. nada bateu
  return { tipo: "fora", item: null };
}
