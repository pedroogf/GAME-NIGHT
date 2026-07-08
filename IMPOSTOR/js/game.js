// Lógica da rodada: sorteio de papéis, distribuição, debate e revelação

function generatePlayers(){
  state.players = [];
  for(let i=0;i<state.numPlayers;i++){
    state.players.push({ id: 'p'+i, name: 'Jogador ' + (i+1) });
  }
}


function buildWordPool(){
  let pool = [];
  state.selectedCategories.forEach(key=>{
    CATEGORIES[key].words.forEach(w=> pool.push({
      word: w.word,
      hint: w.hint || "Dica confidencial para o debate...",
      cat: key
    }));
  });
  return pool;
}


function assignRound(){
  state.assignments = {};
  state.pairs = [];


  const ids = state.players.map(p=>p.id);
  const shuffledIds = shuffle(ids);
  const impostorIds = shuffledIds.slice(0, state.numImpostors);
  const normalIds = shuffledIds.slice(state.numImpostors);


  if(state.mode === 'classic'){
    const pool = buildWordPool();
    const chosen = pick(pool);
    normalIds.forEach(id=>{
      state.assignments[id] = { role:'normal', word: chosen.word, hint:null, pairId:null };
    });
    impostorIds.forEach(id=>{
      state.assignments[id] = { role:'impostor', word:null, hint: state.hintsEnabled ? chosen.hint : null, pairId:null };
    });
  } else {
    // Modo Dupla
    const pairsCount = normalIds.length / 2;
    const pool = shuffle(buildWordPool());

    const chosenEntries = [];
    for(let i=0;i<pairsCount;i++){
      chosenEntries.push(pool[i % pool.length]);
    }
    const shuffledNormals = shuffle(normalIds);
    for(let i=0;i<pairsCount;i++){
      const a = shuffledNormals[i*2];
      const b = shuffledNormals[i*2+1];
      const { word: w } = chosenEntries[i];
      state.assignments[a] = { role:'normal', word:w, hint:null, pairId:b };
      state.assignments[b] = { role:'normal', word:w, hint:null, pairId:a };
      state.pairs.push([a,b,w]);
    }

    impostorIds.forEach(id=>{
      const target = pick(chosenEntries);
      state.assignments[id] = { role:'impostor', word:null, hint: state.hintsEnabled ? target.hint : null, pairId:null };
    });
  }
}


function startDistribution(){
  generatePlayers();
  assignRound();
  state.passOrder = state.players.map(p=>p.id);
  state.passIndex = 0;
  renderProgressDots('progress-dots', state.passOrder.length, 0);
  showPassScreenFor(0);
  goToScreen('screen-pass');
}


function renderProgressDots(containerId, total, currentIdx){
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  for(let i=0;i<total;i++){
    const d = document.createElement('div');
    d.className = 'dot' + (i < currentIdx ? ' done' : (i===currentIdx ? ' current' : ''));
    el.appendChild(d);
  }
}


function showPassScreenFor(idx){
  const board = document.getElementById('board');
  board.classList.remove('flipped');
  const id = state.passOrder[idx];
  const player = state.players.find(p=>p.id===id);

  document.getElementById('pass-player-name').textContent = player.name;

  const btn = document.getElementById('pass-action-btn');
  btn.textContent = 'Sou eu, revelar';
  btn.disabled = false;
  btn.dataset.stage = 'reveal';


  const a = state.assignments[id];
  const backEl = document.getElementById('board-back');
  const roleEl = document.getElementById('board-role');
  const wordEl = document.getElementById('board-word');
  const hintEl = document.getElementById('board-hint');
  const remEl = document.getElementById('board-reminder');


  if(a.role === 'impostor'){
    backEl.classList.add('is-impostor');
    roleEl.textContent = 'Você é o IMPOSTOR';
    wordEl.textContent = '???';
    hintEl.innerHTML = a.hint
      ? 'Sua dica:<br><strong style="color:var(--text); font-size: 16.5px;">"' + a.hint + '"</strong>'
      : 'Você não recebeu nenhuma dica desta vez!';
    remEl.textContent = state.mode === 'dupla'
      ? 'Fique atento ao papo dos outros e tente se infiltrar numa dupla!'
      : 'Sua missão: Use a dica e tente se disfarçar e blefar na hora do debate!';
  } else {
    backEl.classList.remove('is-impostor');
    roleEl.textContent = 'Sua palavra secreta';
    wordEl.textContent = a.word;
    hintEl.textContent = '';
    remEl.textContent = state.mode === 'dupla'
      ? 'Converse dando pequenas pistas para descobrir quem tem a mesma palavra que você.'
      : 'Deixe pistas sutis de que você tem a palavra real, sem falá-la diretamente!';
  }
  renderProgressDots('progress-dots', state.passOrder.length, idx);
}


function handleBoardTap(){
  const board = document.getElementById('board');
  const btn = document.getElementById('pass-action-btn');
  if(btn.disabled) return;


  if(btn.dataset.stage === 'reveal'){
    // Vira o cartão e muda o botão para esconder
    board.classList.add('flipped');
    btn.dataset.stage = 'hide';
    btn.textContent = 'Entendi, esconder';
  } else {
    // Esconde o cartão e vai pro próximo!
    btn.disabled = true;
    board.classList.remove('flipped');


    let advanced = false;
    const doAdvance = () => {
      if(advanced) return;
      advanced = true;
      board.removeEventListener('transitionend', onEnd);
      clearTimeout(fallback);
      advancePass();
      btn.disabled = false;
    };
    const onEnd = (e) => { if(e.target === board && e.propertyName === 'transform') doAdvance(); };
    board.addEventListener('transitionend', onEnd);
    const fallback = setTimeout(doAdvance, 700);
  }
}


function advancePass(){
  state.passIndex++;
  if(state.passIndex >= state.passOrder.length){
    goToDebate();
  } else {
    showPassScreenFor(state.passIndex);
  }
}


function goToDebate(){
  const title = document.getElementById('debate-title');
  const instr = document.getElementById('debate-instr');
  const roster = document.getElementById('debate-roster');
  const contBtn = document.getElementById('debate-continue-btn');


  roster.innerHTML = '';
  state.players.forEach(p=>{
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = p.name;
    roster.appendChild(chip);
  });


  if(state.mode === 'classic'){
    title.textContent = 'Hora do debate';
    instr.textContent = 'Conversem, façam perguntas livres e deem dicas sobre a palavra secreta. O impostor deve fingir e mentir para sobreviver. Quando todos concordarem em votar e apontar o suspeito ao vivo, cliquem abaixo!';
  } else {
    title.textContent = 'Encontre sua dupla';
    instr.textContent = 'Conversem de forma livre para tentar reconhecer a sua dupla através de pistas sutis. O impostor deve prestar atenção nas conversas e se enfiar no meio fingindo ter a palavra de alguém! Quando todos apontarem suas duplas ao vivo, cliquem para ver o resultado!';
  }

  contBtn.onclick = () => finishGame();

  goToScreen('screen-debate');
}


function finishGame(){
  const list = document.getElementById('reveal-list');
  const summary = document.getElementById('reveal-summary');
  list.innerHTML = '';


  const impostors = state.players.filter(p=>state.assignments[p.id].role==='impostor');


  if(state.mode === 'classic'){
    const normalWord = state.players.find(p=>state.assignments[p.id].role==='normal') ? state.assignments[state.players.find(p=>state.assignments[p.id].role==='normal').id].word : '';
    summary.innerHTML = `<div class="big">${impostors.length>1?'Os impostores eram':'O impostor era'}</div>
      <div style="margin-top:6px; font-size:16px; font-weight: 700; color:var(--red);">${impostors.map(p=>p.name).join(', ')}</div>
      <div style="margin-top:10px; font-size:14px; color:var(--text-dim);">A palavra secreta era: <strong style="color:var(--gold)">${normalWord}</strong></div>`;


    state.players.forEach(p=>{
      const a = state.assignments[p.id];
      const row = document.createElement('div');
      row.className = 'reveal-row' + (a.role==='impostor' ? ' impostor' : '');
      row.innerHTML = `
        <div class="rr-top">
          <div class="rr-name">${p.name}</div>
          <div class="rr-role">${a.role==='impostor' ? '🎭 Impostor' : 'Jogador'}</div>
        </div>
        <div class="rr-detail">${a.role==='impostor' ? (a.hint ? 'A dica rápida que recebeu foi:<br><strong style="color:var(--gold)">"' + a.hint + '"</strong>' : 'Não recebeu nenhuma dica.') : 'Palavra secreta: <strong style="color:var(--gold)">' + a.word + '</strong>'}</div>
      `;
      list.appendChild(row);
    });
  } else {
    // Modo Dupla
    summary.innerHTML = `<div class="big">Duplas Reveladas!</div>
      <div style="margin-top:8px; font-size:14px; color:var(--text-dim);">
        ${impostors.length>1?'Os impostores eram':'O impostor era'}: <strong style="color:var(--red)">${impostors.map(i=>i.name).join(', ')}</strong>
      </div>`;


    const revealedIds = new Set();
    const orderedPlayers = [];

    state.pairs.forEach(([idA, idB]) => {
        orderedPlayers.push(state.players.find(p => p.id === idA));
        orderedPlayers.push(state.players.find(p => p.id === idB));
        revealedIds.add(idA);
        revealedIds.add(idB);
    });

    state.players.forEach(p => {
        if(!revealedIds.has(p.id)) orderedPlayers.push(p);
    });


    orderedPlayers.forEach(p=>{
      const a = state.assignments[p.id];
      const row = document.createElement('div');

      if(a.role==='impostor'){
        row.classList.add('reveal-row','impostor');
        row.innerHTML = `
          <div class="rr-top">
            <div class="rr-name">${p.name}</div>
            <div class="rr-role">🎭 Impostor</div>
          </div>
          <div class="rr-detail">${a.hint ? 'A dica recebida foi:<br><strong style="color:var(--red)">"' + a.hint + '"</strong>' : 'Não recebeu nenhuma dica.'}</div>
        `;
      } else {
        row.className = 'reveal-row';
        row.innerHTML = `
          <div class="rr-top">
            <div class="rr-name">${p.name}</div>
            <div class="rr-role">Jogador</div>
          </div>
          <div class="rr-detail">Palavra: <strong style="color:var(--gold)">${a.word}</strong><br>Sua dupla verdadeira era o(a) <strong style="color:var(--gold)">${nameOf(a.pairId)}</strong>.</div>
        `;
      }
      list.appendChild(row);
    });
  }


  goToScreen('screen-reveal');
}


function newRoundSamePlayers(){
  startDistribution();
}


function restartFull(){
  state = {
    mode: null, numPlayers:5, numImpostors:1, hintsEnabled:true, selectedCategories:[],
    players:[], assignments:{}, passOrder:[], passIndex:0, pairs:[]
  };
  goToScreen('screen-mode');
}
