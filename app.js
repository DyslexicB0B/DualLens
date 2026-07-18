
const stories = window.DUALLENS_STORIES || [];
const grid = document.getElementById('storyGrid');
const modal = document.getElementById('storyModal');
const detail = document.getElementById('storyDetail');

function renderStories(category='All'){
  const filtered = category === 'All' ? stories : stories.filter(s => s.category === category);
  grid.innerHTML = filtered.map(s => `
    <article class="story-card" data-story="${s.id}" tabindex="0">
      <div class="card-top"><span class="category">${s.category}</span><span class="time">${s.timestamp}</span></div>
      <h3>${s.headline}</h3>
      <p class="dek">${s.dek}</p>
      <div class="lens-preview">
        <div class="lens left"><strong>LEFT LENS</strong><br>${s.left[0].title}</div>
        <div class="lens right"><strong>RIGHT LENS</strong><br>${s.right[0].title}</div>
      </div>
      <div class="divergence">
        <div class="divergence-label"><span>Narrative divergence</span><strong>${s.divergence}%</strong></div>
        <div class="bar"><i style="width:${s.divergence}%"></i></div>
      </div>
    </article>`).join('');
  document.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('click', () => openStory(card.dataset.story));
    card.addEventListener('keydown', e => { if(e.key === 'Enter') openStory(card.dataset.story); });
  });
}
function points(items){ return items.map(p => `<div class="point"><h3>${p.title}</h3><p>${p.body}</p></div>`).join(''); }
function openStory(id){
  const s = stories.find(x => x.id === id);
  if(!s) return;
  detail.innerHTML = `
    <div class="detail">
      <header class="detail-header">
        <span class="eyebrow">${s.category} · ${s.timestamp}</span>
        <h1>${s.headline}</h1>
        <p>${s.dek}</p>
      </header>
      <div class="what-happened"><strong>What happened</strong>${s.summary}</div>
      <div class="perspective-grid">
        <section class="perspective-column left"><h2>Left perspective</h2>${points(s.left)}</section>
        <section class="common-column"><h2>Common ground</h2>${s.common.map(f=>`<div class="fact">✓ ${f}</div>`).join('')}</section>
        <section class="perspective-column right"><h2>Right perspective</h2>${points(s.right)}</section>
      </div>
      <section class="headlines">
        <h2>Headline comparison</h2>
        ${s.headlines.map(h=>`<div class="headline-row"><strong>${h.source}</strong><span>${h.text}</span></div>`).join('')}
      </section>
    </div>`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape') closeModal()});
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); renderStories(btn.dataset.category);
}));
renderStories();
