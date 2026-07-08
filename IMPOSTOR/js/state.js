// Estado global do jogo
let state = {
  mode: null,
  numPlayers: 5,
  numImpostors: 1,
  selectedCategories: [],
  players: [],       // [{id, name}]
  assignments: {},   // id -> {role:'normal'|'impostor', word, hint, pairId}
  passOrder: [],
  passIndex: 0,
  pairs: []
};


// Utilitários genéricos
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }


function goToScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}


function nameOf(id){
  const p = state.players.find(p=>p.id===id);
  return p ? p.name : '???';
}
