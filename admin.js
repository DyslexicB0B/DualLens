
function parsePoints(value){
  return value.split('\n').filter(Boolean).map(line=>{
    const [title,...rest]=line.split('|');
    return {title:(title||'').trim(),body:rest.join('|').trim()};
  });
}
function buildStory(){
  return {
    id:document.getElementById('storyId').value.trim() || 'new-story',
    category:document.getElementById('category').value,
    headline:document.getElementById('headline').value.trim(),
    dek:document.getElementById('dek').value.trim(),
    timestamp:document.getElementById('timestamp').value.trim(),
    divergence:Number(document.getElementById('divergence').value || 50),
    summary:document.getElementById('summary').value.trim(),
    left:parsePoints(document.getElementById('left').value),
    right:parsePoints(document.getElementById('right').value),
    common:document.getElementById('common').value.split('\n').filter(Boolean).map(x=>x.trim()),
    headlines:[]
  };
}
document.getElementById('previewJson').addEventListener('click',()=>{
  const out=document.getElementById('output'); out.style.display='block'; out.textContent=JSON.stringify(buildStory(),null,2);
});
document.getElementById('downloadStory').addEventListener('click',()=>{
  const story=buildStory(); const blob=new Blob([JSON.stringify(story,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${story.id}.json`; a.click(); URL.revokeObjectURL(a.href);
});
