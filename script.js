/* -------------------------
   Mindful Kids — script.js (Updated with Sound Visuals)
------------------------- */

/* ----- Helpers ----- */
function $(id){ return document.getElementById(id); }
function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/* ----- App State ----- */
let bubbleState = { running:false, animal:'bear', interval:null, phaseIndex:0, phaseTimeLeft:0 };
let boxState = { running:false, interval:null, phaseIndex:0, phaseTimeLeft:0, pausedPos:{left:20, top:20} };
let currentTheme = localStorage.getItem('kids_theme') || 'light';
let currentTab = 'mood';

/* ----- Animal Profiles ----- */
const animalProfiles = {
  bear:      {emoji: "🐻", inhale:4, hold:4, exhale:4, desc:"Slow deep breaths"},
  cat:       {emoji: "🐱", inhale:3, hold:0, exhale:3, desc:"Quiet breathing"},
  elephant:  {emoji: "🐘", inhale:5, hold:0, exhale:5, desc:"Long inhale & exhale"},
  turtle:    {emoji: "🐢", inhale:4, hold:2, exhale:6, desc:"Slow steady breaths"},
  bunny:     {emoji: "🐇", inhale:2, hold:0, exhale:4, desc:"Quick sniff in, long out"},
  lion:      {emoji: "🦁", inhale:3, hold:1, exhale:5, desc:"Strong inhale, long exhale"}
};

/* ----- Tabs ----- */
function showTab(tab){
  document.querySelectorAll('.tab-content').forEach(tc=> tc.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(tb=> tb.classList.remove('active'));
  $(tab).classList.add('active');
  document.querySelector(`.tab-btn[data-tab="${tab}"]`)?.classList.add('active');
  currentTab = tab;
}
function initTabs(){
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> showTab(btn.dataset.tab));
  });
}

/* ----- Animal Breathing ----- */
function initBubble(){
  const container = $('animalButtons');
  container.innerHTML='';
  Object.keys(animalProfiles).forEach(a=>{
    const btn = document.createElement('button');
    btn.textContent = animalProfiles[a].emoji;
    btn.title = capitalize(a) + ' — ' + animalProfiles[a].desc;
    btn.addEventListener('click', ()=> setBubbleAnimal(a));
    container.appendChild(btn);
  });

  $('bubbleStart').addEventListener('click', ()=> startBubble(animalProfiles[bubbleState.animal]));
  $('bubblePause').addEventListener('click', pauseBubble);
  setBubbleAnimal(bubbleState.animal);
}

function setBubbleAnimal(a){
  bubbleState.animal = a;
  $('bubbleAnimal').textContent = animalProfiles[a].emoji;
  if(bubbleState.running) startBubble(animalProfiles[a]);
}

function startBubble(profile){
  const inner = $('bubbleInner');
  const text = $('breathingText');

  if(bubbleState.interval) clearInterval(bubbleState.interval);

  const phases = [{type:'Inhale', sec:profile.inhale}];
  if(profile.hold>0) phases.push({type:'Hold', sec:profile.hold});
  phases.push({type:'Exhale', sec:profile.exhale});

  bubbleState.running = true;
  bubbleState.phaseIndex = 0;
  bubbleState.phaseTimeLeft = phases[0].sec;
  $('bubblePause').classList.remove('paused');

  text.textContent = `${phases[0].type}...`;
  animateBubblePhase(inner, phases[0].type);

  bubbleState.interval = setInterval(()=>{
    bubbleState.phaseTimeLeft--;
    if(bubbleState.phaseTimeLeft <= 0){
      bubbleState.phaseIndex = (bubbleState.phaseIndex + 1) % phases.length;
      bubbleState.phaseTimeLeft = phases[bubbleState.phaseIndex].sec;
      text.textContent = `${phases[bubbleState.phaseIndex].type}...`;
      animateBubblePhase(inner, phases[bubbleState.phaseIndex].type);
    }
  },1000);
}

function pauseBubble(){
  bubbleState.running = false;
  if(bubbleState.interval){ clearInterval(bubbleState.interval); bubbleState.interval = null; }
  $('breathingText').textContent = 'Paused';
  $('bubbleInner').style.transform = '';
  $('bubblePause').classList.add('paused');
}

function animateBubblePhase(el, phase){
  if(!el) return;
  el.style.transition = 'transform 1s ease-in-out';
  if(phase === 'Inhale' || phase === 'Hold') el.style.transform = 'scale(1.35)';
  else el.style.transform = 'scale(1.0)';
}

/* ----- Box Breathing ----- */
const boxPhases = [
  { side:'top', type:'Inhale', sec:4 },
  { side:'right', type:'Hold', sec:4 },
  { side:'bottom', type:'Exhale', sec:4 },
  { side:'left', type:'Hold', sec:4 }
];

function initBoxBreathing(){
  $('boxStart').addEventListener('click', startBox);
  $('boxPause').addEventListener('click', pauseBox);
  setBoxAnimal('🐢');
  resetBoxLine();
}

function setBoxAnimal(a){ $('boxAnimal').textContent = a; }

function startBox(){
  if(boxState.interval) clearInterval(boxState.interval);

  boxState.running = true;
  boxState.phaseIndex = 0;
  boxState.phaseTimeLeft = boxPhases[0].sec;
  $('boxPause').classList.remove('box-stop');

  const dot = $('boxAnimal');

  dot.style.left = '20px';
  dot.style.top = '20px';
  boxState.pausedPos = { left:20, top:20 };
  resetBoxLine();

  updateBox();
  boxState.interval = setInterval(boxTick, 1000);
}

function pauseBox(){
  boxState.running = false;
  if(boxState.interval) clearInterval(boxState.interval);
  $('boxText').textContent = 'Stopped';
  $('boxPause').classList.add('box-stop');

  const dot = $('boxAnimal');
  boxState.pausedPos = { left: parseInt(dot.style.left), top: parseInt(dot.style.top) };
  resetBoxLine();
}

function boxTick(){
  if(!boxState.running) return;
  boxState.phaseTimeLeft--;
  if(boxState.phaseTimeLeft <=0){
    boxState.phaseIndex = (boxState.phaseIndex+1)%boxPhases.length;
    boxState.phaseTimeLeft = boxPhases[boxState.phaseIndex].sec;
    updateBox();
  }
}

function updateBox(){
  const phase = boxPhases[boxState.phaseIndex];
  $('boxText').textContent = phase.type + '...';
  animateBoxDot(phase);
  animateBoxLine(phase);
}

function animateBoxDot(phase){
  const dot = $('boxAnimal');
  const offset = 20;
  const length = 220;
  let startX = parseInt(dot.style.left), startY = parseInt(dot.style.top);
  let endX = startX, endY = startY;

  switch(phase.side){
    case 'top':    endX = offset+length; endY = offset; break;
    case 'right':  endX = offset+length; endY = offset+length; break;
    case 'bottom': endX = offset; endY = offset+length; break;
    case 'left':   endX = offset; endY = offset; break;
  }

  dot.animate([{left:startX+'px', top:startY+'px'}, {left:endX+'px', top:endY+'px'}],
              {duration:phase.sec*1000, fill:'forwards'});

  dot.style.left = endX+'px';
  dot.style.top = endY+'px';
}

function resetBoxLine(){
  const line = $('boxLine');
  line.setAttribute('x1','20'); line.setAttribute('y1','20');
  line.setAttribute('x2','20'); line.setAttribute('y2','20');
}

function animateBoxLine(phase){
  const line = $('boxLine');
  const offset=20; const length=220;
  switch(phase.side){
    case 'top': line.setAttribute('x1',offset); line.setAttribute('y1',offset);
                line.setAttribute('x2',offset+length); line.setAttribute('y2',offset); break;
    case 'right': line.setAttribute('x1',offset+length); line.setAttribute('y1',offset);
                  line.setAttribute('x2',offset+length); line.setAttribute('y2',offset+length); break;
    case 'bottom': line.setAttribute('x1',offset+length); line.setAttribute('y1',offset+length);
                   line.setAttribute('x2',offset); line.setAttribute('y2',offset+length); break;
    case 'left': line.setAttribute('x1',offset); line.setAttribute('y1',offset+length);
                 line.setAttribute('x2',offset); line.setAttribute('y2',offset); break;
  }
}

/* ----- Mood Check-in ----- */
const moodMessages = {
  happy:"Yay! Keep sharing your sunshine! ☀️",
  okay:"It's okay to feel okay — try a deep breath 🌬️",
  sad:"I'm sorry to hear that. 3 slow breaths might help 💛",
  angry:"Let's cool down together. Breathe slowly 🫧",
  tired:"You deserve rest. Close your eyes for 5 seconds 😴",
  excited:"Woohoo! Share your energy! 🎉",
  anxious:"Take a slow breath and relax 🧘‍♂️"
};

function initMood(){
  const container = $('moodCards');
  container.innerHTML='';
  Object.keys(moodMessages).forEach(m=>{
    const card=document.createElement('div');
    card.className='mood-card';
    card.dataset.mood=m;
    card.textContent=m==='happy'?'😄': m==='okay'?'😐': m==='sad'?'😢': m==='angry'?'😡': m==='tired'?'😴': m==='excited'?'🤩':'😰';
    card.title = capitalize(m);
    card.addEventListener('click', ()=>{
      $('moodMessage').textContent=moodMessages[m];
      card.animate([{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:300});
    });
    container.appendChild(card);
  });
}

/* ----- Calm Sounds with Visuals ----- */
let currentAudio = null;
let currentVisualInterval = null;
const visualContainer = document.createElement('div');
visualContainer.style.position='fixed';
visualContainer.style.top='0';
visualContainer.style.left='0';
visualContainer.style.width='100%';
visualContainer.style.height='100%';
visualContainer.style.pointerEvents='none';
visualContainer.style.zIndex='0';
document.body.appendChild(visualContainer);

function initSounds(){
  const sounds = { 
    rain: 'rain.mp3', 
    forest: 'forest.mp3', 
    wave: 'waves.mp3', 
    chimes: 'chimes.mp3' 
  };

  const colors = { rain:'#74c0fc', forest:'#4caf50', wave:'#00bcd4', chimes:'#ffb74d' };

  document.querySelectorAll('.sound-card').forEach(btn=>{
    btn.style.backgroundColor = colors[btn.dataset.sound];
    btn.addEventListener('click', ()=>{
      stopCurrentAudio();
      currentAudio = new Audio(sounds[btn.dataset.sound]);
      currentAudio.loop = true;
      currentAudio.play().catch(()=>{});
      startVisual(btn.dataset.sound);
    });
  });

  $('stopSounds').addEventListener('click', ()=>{
    stopCurrentAudio();
  });
}

function stopCurrentAudio(){
  if(currentAudio){ currentAudio.pause(); currentAudio.currentTime=0; currentAudio=null; }
  stopVisual();
}

/* ----- Visual Animations ----- */
function startVisual(type){
  stopVisual();
  visualContainer.innerHTML = '';
  if(type==='rain') currentVisualInterval = setInterval(spawnRain, 200);
  if(type==='forest') currentVisualInterval = setInterval(spawnLeaves, 400);
  if(type==='wave') currentVisualInterval = setInterval(spawnWave, 600);
  if(type==='chimes') currentVisualInterval = setInterval(spawnNotes, 500);
}
function stopVisual(){ if(currentVisualInterval) clearInterval(currentVisualInterval); currentVisualInterval=null; visualContainer.innerHTML=''; }
function spawnRain(){ spawnEmoji('💧', 10, 20, 2000); }
function spawnLeaves(){ spawnEmoji('🍃', 20, 40, 4000, true); }
function spawnWave(){ spawnEmoji('🌊', 30, 60, 4000, false, true); }
function spawnNotes(){ spawnEmoji('🎵', 24, 40, 3000, false, true, true); }

function spawnEmoji(emoji, minSize, maxSize, duration, rotate=false, rise=false, scale=false){
  const el = document.createElement('div');
  el.textContent = emoji;
  el.style.position='absolute';
  el.style.left = Math.random()*100+'%';
  el.style.top = rise ? '100%' : '-30px';
  el.style.fontSize = (minSize + Math.random()*(maxSize-minSize))+'px';
  el.style.opacity = 0.8;
  visualContainer.appendChild(el);
  let endY = rise ? '-100vh' : '110vh';
  let transform = `translateY(${endY})`;
  if(rotate) transform += ` rotate(${Math.random()*360}deg)`;
  if(scale) transform += ' scale(1.5)';
  el.animate([{transform:'translateY(0)'},{transform}],{duration:duration, easing:'ease-in-out', fill:'forwards'});
  setTimeout(()=> el.remove(), duration);
}

/* ----- Mindful Stories ----- */
const stories = {
  cloud:{icon: '🧘',title:'Relax Your Body', text:'Close your eyes and relax your body. Go from bottom to top: the soles of your feet, calves, thighs, lower abdomen, diaphragm, lungs, back, neck, face, forehead. Concentrate on every part of your body and relax your whole body in the end. Keep resting in your relaxation for 5-10 minutes.'},
  forest:{icon: '🚀',title:'Space Travel', text:'Close your eyes. Imagine that you can space travel just like that: rising from where you are and seeing the whole place from above. Actually, you can go so high that you can see the limits of the city, the country, the Earth. Everything gets smaller as you go higher. When you feel good, stop right there. Look at the place where you just were. How does everything look from up there? How do you feel now, from a distance? Stay in your space position for 5-10 minutes and then come down.'},
  beach:{icon: '🏵',title:'Pay Attention for Breathing', text:'Close your eyes and breathe normally. Start watching your breathing like it was a movie. What part are you breathing with: chest, your diaphragm or your whole body? Do you take short or long, deep breaths? Is your breathing smooth? How does it feel like? Is it hard or does it flow freely? Do this for a moment and then breathe deeply and with intention for 5-10 minutes.'},
  mountain:{icon: '🏕',title:'A Journey to your Favorite Place ', text:'Close your eyes and imagine yourself in your favorite place. It can be any place, anywhere you feel good and calm. When you get there, look around for a bit. Who are the people there? What do you see, smell, taste, hear, feel? What kind of details emerge? Live the place with your whole body.'},
  nightSky:{icon: '🫡',title:'Do it in Slow Down', text:'When you feel stressed, try doing something in slow motion. When you do this, you will notice you\'re concentrating on it more intensely.'},
  candy:{icon: '🪅',title:'Give Yourself Mind Candy', text:'Give yourself a thought treat - just like you would a piece of cake at a party. What is the most delicious, happy thought you can think of? What thought makes you smile? Bring that thought into your mind and breathe in it for 5-10 minutes.'},
 bird:{icon: '🦤',title:'Imagine You\'re a Bird', text:'Close your eyes. Imagine you have wings and the ability to fly. A bird, if you will. Take to your wings and fly off: see your situation from above, the same situation you just left. Let the wind under your wings, soar freely across the sky: feel the freedom and the wind and pay attention to other feelings you might have. Do this for 5-10 minutes.'}
};

function initStories(){
  const grid = $('storyGrid'); grid.innerHTML='';
  const colors = ['#5a8de0','#50b875','#ff7788','#e3e35f','#d7bde2', '#7163e0', '#e3b991'];
  Object.keys(stories).forEach((k,i)=>{
    const s = stories[k]; const btn=document.createElement('button'); btn.className='story-btn';
    btn.style.backgroundColor=colors[i%colors.length]; btn.style.fontSize='22px';
    btn.style.width='180px'; btn.style.height='120px'; btn.style.margin='10px';
    btn.style.borderRadius='15px'; btn.style.color='white'; btn.style.fontWeight='bold';
    btn.style.boxShadow='3px 3px 10px rgba(0,0,0,0.2)'; btn.style.cursor='pointer';
    btn.textContent = s.icon+' '+s.title; btn.addEventListener('click',()=>openStory(k));
    grid.appendChild(btn);
  });
  const closeBtn=$('closeStory'); closeBtn.style.fontSize='20px';
  closeBtn.style.padding='10px 20px'; closeBtn.style.borderRadius='12px';
  closeBtn.style.cursor='pointer'; closeBtn.style.backgroundColor='#f44336';
  closeBtn.style.color='white'; closeBtn.addEventListener('click',closeStory);
}

function openStory(k){ const s=stories[k]; $('storyTitle').textContent=s.title; $('storyText').textContent=s.text; $('storyModal').classList.add('show'); }
function closeStory(){ $('storyModal').classList.remove('show'); }

/* ----- Themes ----- */
function initThemes(){ const themes=['light','forest','ocean','sunset']; const container=$('themeButtons'); container.innerHTML=''; themes.forEach(t=>{ const btn=document.createElement('button'); btn.style.backgroundColor=getThemeColor(t); btn.title=capitalize(t); btn.addEventListener('click',()=>applyTheme(t)); container.appendChild(btn); }); }
function getThemeColor(name){ switch(name){ case 'light': return '#c2f0ff'; case 'forest': return '#50b875'; case 'ocean': return '#1492e6'; case 'sunset': return '#ff7788'; default: return '#c2f0ff'; } }
function applyTheme(t){ document.body.className = t; localStorage.setItem('kids_theme', t); }

/* ----- Init App ----- */
document.addEventListener('DOMContentLoaded', ()=>{
  document.body.className = currentTheme;
  initTabs(); initBubble(); initMood(); initSounds();
  initStories(); initThemes(); initBoxBreathing(); showTab('mood');
});
