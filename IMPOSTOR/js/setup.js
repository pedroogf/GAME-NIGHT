// Seleção de modo e tela de configuração

function selectMode(mode){
  state.mode = mode;
  state.numPlayers = mode === 'dupla' ? 5 : 3;
  state.numImpostors = 1;
  state.selectedCategories = [];


  document.getElementById('setup-eyebrow').textContent = mode === 'dupla' ? 'Modo: Encontre sua Dupla' : 'Modo: Clássico';
  document.getElementById('setup-title').textContent = 'Quem vai jogar?';


  renderCategoryGrid();
  document.getElementById('players-val').textContent = state.numPlayers;
  document.getElementById('impostors-val').textContent = state.numImpostors;
  validateSetup();
  goToScreen('screen-setup');
}


function renderCategoryGrid(){
  const grid = document.getElementById('cat-grid');
  grid.innerHTML = '';
  Object.entries(CATEGORIES).forEach(([key, cat])=>{
    const chip = document.createElement('div');
    chip.className = 'cat-chip';
    chip.textContent = cat.label;
    chip.onclick = ()=>{
      const idx = state.selectedCategories.indexOf(key);
      if(idx>-1){ state.selectedCategories.splice(idx,1); chip.classList.remove('on'); }
      else{ state.selectedCategories.push(key); chip.classList.add('on'); }
      validateSetup();
    };
    grid.appendChild(chip);
  });
}


function minPlayers(){ return state.mode === 'dupla' ? 5 : 3; }


function changePlayers(delta){
  const next = state.numPlayers + delta;
  if(next < minPlayers() || next > 30) return;
  state.numPlayers = next;
  document.getElementById('players-val').textContent = next;
  validateSetup();
}


function changeImpostors(delta){
  const next = state.numImpostors + delta;
  if(next < 1 || next > state.numPlayers - 2) return;
  state.numImpostors = next;
  document.getElementById('impostors-val').textContent = next;
  validateSetup();
}


function validateSetup(){
  const warnEl = document.getElementById('impostor-warn');
  const continueBtn = document.getElementById('setup-continue');
  let msg = '';
  let valid = true;


  if(state.numImpostors > state.numPlayers - 2){
    state.numImpostors = Math.max(1, state.numPlayers - 2);
    document.getElementById('impostors-val').textContent = state.numImpostors;
  }


  if(state.mode === 'dupla'){
    const rest = state.numPlayers - state.numImpostors;
    if(rest < 2 || rest % 2 !== 0){
      valid = false;
      let suggestion = null;
      for(let i=state.numImpostors; i>=1; i--){
        const r = state.numPlayers - i;
        if(r>=2 && r%2===0){ suggestion = i; break; }
      }
      if(suggestion === null){
        for(let i=state.numImpostors+1; i<=state.numPlayers-2; i++){
          const r = state.numPlayers - i;
          if(r>=2 && r%2===0){ suggestion = i; break; }
        }
      }
      msg = `Com ${state.numPlayers} jogadores e ${state.numImpostors} impostor(es) sobram ${rest}, e não dá pra formar duplas certinhas. `;
      msg += suggestion ? `Tente ${suggestion} impostor(es).` : `Ajuste o número de jogadores.`;
    } else {
      msg = `${rest/2} duplas serão formadas ✅`;
      warnEl.style.color = 'var(--green)';
    }
  }


  if(state.selectedCategories.length === 0){
    valid = false;
    if(!msg) msg = 'Escolha ao menos 1 categoria.';
  }


  warnEl.textContent = msg;
  if(state.mode==='dupla' && valid) warnEl.style.color = 'var(--green)'; else warnEl.style.color = 'var(--red)';
  continueBtn.disabled = !valid;
}
