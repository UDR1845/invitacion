const data = window.INVITATION;
let index = 0, playing = false, touchX = 0;
const scene = document.querySelector('#scene');
const image = document.querySelector('#sceneImage');
const content = document.querySelector('#sceneContent');
const counter = document.querySelector('#counter');
const bar = document.querySelector('#progressBar');
const audio = document.querySelector('#music');
const soundBtn = document.querySelector('#soundBtn');
const soundIcon = document.querySelector('#soundIcon');
const soundLabel = document.querySelector('#soundLabel');

function interpolate(value) {
  return value.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? `{${key}}`);
}
function prepareHtml(html) {
  return html.replace(/\{(\w+)\}/g, (_, key) => data[key] ?? `{${key}}`);
}
async function render() {
  const item = data.scenes[index];
  scene.className = `scene scene-enter scene-${item.style || 'default'}`;
  image.style.backgroundImage = `url("assets/${item.image}")`;
  content.innerHTML = '<div class="loading-scene">✧</div>';
  try {
    const response = await fetch(item.file);
    if (!response.ok) throw new Error(`No se pudo cargar ${item.file}`);
    content.innerHTML = prepareHtml(await response.text());
  } catch (error) {
    content.innerHTML = `<article class="editorial-card"><p class="eyebrow">INVITACIÓN</p><h1 class="script-title">No se pudo cargar esta pantalla</h1><p>Abre el proyecto con Live Server y revisa ${item.file}.</p></article>`;
    console.error(error);
  }
  content.querySelectorAll('[data-text]').forEach(el => {
    const key = el.dataset.text;
    if (data[key] !== undefined) el.textContent = data[key];
  });
  content.querySelectorAll('[data-decor]').forEach(img => {
    img.addEventListener('error', () => img.remove());
  });
  counter.textContent = `${String(index + 1).padStart(2,'0')} / ${String(data.scenes.length).padStart(2,'0')}`;
  bar.style.width = `${(index + 1) / data.scenes.length * 100}%`;
  document.querySelector('#prevBtn').disabled = index === 0;
  document.querySelector('#nextBtn').textContent = index === data.scenes.length - 1 ? '↻' : '›';
}
function next() { index = index === data.scenes.length - 1 ? 0 : index + 1; render(); }
function prev() { index = Math.max(0, index - 1); render(); }
document.querySelector('#nextBtn').addEventListener('click', next);
document.querySelector('#prevBtn').addEventListener('click', prev);
soundBtn.addEventListener('click', async () => {
  if (!playing) {
    try { await audio.play(); playing = true; soundIcon.textContent = '♫'; soundLabel.textContent = 'Música activada'; }
    catch { soundLabel.textContent = 'Pulsa para reproducir'; }
  } else { audio.pause(); playing = false; soundIcon.textContent = '♪'; soundLabel.textContent = 'Activar música'; }
});
document.addEventListener('keydown', e => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });
scene.addEventListener('touchstart', e => touchX = e.changedTouches[0].screenX, {passive:true});
scene.addEventListener('touchend', e => { const dx = e.changedTouches[0].screenX - touchX; if (Math.abs(dx) > 55) dx < 0 ? next() : prev(); }, {passive:true});
render();
