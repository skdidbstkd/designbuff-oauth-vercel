
document.getElementById('cta').addEventListener('click', function(){ document.getElementById('consultForm').scrollIntoView({behavior:'smooth'}); });
document.getElementById('hero-cta').addEventListener('click', function(){ document.getElementById('consultForm').scrollIntoView({behavior:'smooth'}); });

document.getElementById('consultForm').addEventListener('submit', function(e){
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  let items = [];
  // collect checkboxes
  form.querySelectorAll('input[name="items"]:checked').forEach(ch => items.push(ch.value));
  const body = [
    '성함: ' + (data.get('name')||''),
    '연락처: ' + (data.get('phone')||''),
    '주소: ' + (data.get('address')||''),
    '희망품목: ' + items.join(', '),
    '예산: ' + (data.get('budget')||''),
    '희망일: ' + (data.get('date')||''),
    '요청사항:\n' + (data.get('notes')||'')
  ].join('\n');
  const subject = encodeURIComponent('상담신청 - 한샘 리하우스 디자인버프');
  const mailto = 'mailto:skdidbstkd@gmail.com' + '?subject=' + subject + '&body=' + encodeURIComponent(body);
  window.location.href = mailto;
});
// simple slideshow loop
let idx=0;
const slides = document.querySelectorAll('.slide');
slides.forEach((s,i)=> s.style.transform = `translateX(${i*100}%)`);
setInterval(()=>{
  idx = (idx+1)%slides.length;
  slides.forEach((s,i)=> s.style.transform = `translateX(${(i-idx)*100}%)`);
},3500);
