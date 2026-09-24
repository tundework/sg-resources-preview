(function(){
  const $=id=>document.getElementById(id);
  const WA_NUMBER='12818399567';

  // mobile menu
  const mb=$('menuBtn'),nl=$('navlinks');
  if(mb&&nl){
    mb.addEventListener('click',()=>{const o=nl.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
    nl.addEventListener('click',e=>{if(e.target.tagName==='A'){nl.classList.remove('open');mb.setAttribute('aria-expanded','false')}});
  }

  // service tabs (homepage)
  const tabs=[...document.querySelectorAll('.tab')];
  function select(t,focus){
    tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;$(x.getAttribute('aria-controls')).hidden=!on});
    if(focus)t.focus();
  }
  tabs.forEach((t,i)=>{
    t.addEventListener('click',()=>select(t));
    t.addEventListener('keydown',e=>{
      let j=null;
      if(e.key==='ArrowDown'||e.key==='ArrowRight')j=(i+1)%tabs.length;
      if(e.key==='ArrowUp'||e.key==='ArrowLeft')j=(i-1+tabs.length)%tabs.length;
      if(e.key==='Home')j=0;if(e.key==='End')j=tabs.length-1;
      if(j!==null){e.preventDefault();select(tabs[j],true)}
    });
  });

  // quote form service preselect: in-page buttons, or ?service= from another page
  const SERVICES={freight:'Freight forwarding',vehicles:'Vehicles & titles',procurement:'Procurement & sourcing',warehousing:'Warehousing',construction:'Construction',other:'Marketing & other services'};
  function pick(val){const r=document.querySelector('#svcSeg input[value="'+val+'"]');if(r){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}))}}
  document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>pick(a.dataset.service)));
  try{const k=new URLSearchParams(location.search).get('service');if(k&&SERVICES[k])pick(SERVICES[k])}catch(_){}

  // copy buttons
  document.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',async()=>{
    const v=b.dataset.copy,orig=b.textContent;
    try{await navigator.clipboard.writeText(v);b.textContent='Copied ✓';setTimeout(()=>b.textContent=orig,1400)}
    catch(_){const r=document.createRange();r.selectNodeContents(b);const s=getSelection();s.removeAllRanges();s.addRange(r)}
  }));

  // local clocks + Houston open/closed status (Mon–Fri 9–6, Sat by appointment)
  function houstonNow(){
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'short',hour:'numeric',hour12:false}).formatToParts(new Date());
    const g=t=>(parts.find(p=>p.type===t)||{}).value;
    return {day:g('weekday'),hour:parseInt(g('hour'),10)%24};
  }
  function tick(){
    document.querySelectorAll('.clock').forEach(c=>{
      try{c.textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:c.dataset.tz}).format(new Date())}catch(_){}
    });
    document.querySelectorAll('.open-status').forEach(el=>{
      try{
        const {day,hour}=houstonNow();
        const weekday=['Mon','Tue','Wed','Thu','Fri'].includes(day);
        let txt,state;
        if(weekday&&hour>=9&&hour<18){txt='Open now · until 6 pm';state='open'}
        else if(day==='Sat'){txt='Saturday · by appointment';state='appt'}
        else{txt='Closed now · opens Mon–Fri 9 am';state='closed'}
        el.textContent=txt;el.dataset.state=state;
      }catch(_){}
    });
  }
  tick();setInterval(tick,30000);

  // quote form
  const f=$('quoteForm'),sent=$('sent'),waSend=$('waSend');
  if(f){
    function waText(){
      const v=n=>(f.elements[n]&&f.elements[n].value||'').trim();
      const svc=(f.querySelector('input[name=service]:checked')||{}).value||'';
      const lines=["Hello SG Resources, I'd like a quote.","Service: "+svc];
      if(v('dest'))lines.push("Destination: "+v('dest'));
      if(v('msg'))lines.push("Details: "+v('msg'));
      if(v('fullname'))lines.push("Name: "+v('fullname'));
      if(v('email'))lines.push("Email: "+v('email'));
      if(waSend)waSend.href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(lines.join('\n'));
    }
    f.addEventListener('input',waText);f.addEventListener('change',waText);waText();
    f.addEventListener('submit',e=>{
      e.preventDefault();
      const nm=f.elements.fullname,em=f.elements.email;
      sent.hidden=false;
      if(!nm.value.trim()||!/^\S+@\S+\.\S+$/.test(em.value.trim())){
        sent.className='sent err';
        sent.textContent='Enter your name and a valid email address so we can reply.';
        (!nm.value.trim()?nm:em).focus();return;
      }
      sent.className='sent';
      sent.textContent='Preview only: nothing was sent. On the live site, this request would go to info@sgresourcesinc.com.';
    });
  }

  // redesign notes drawer
  const nb=$('notesBtn'),nd=$('notes'),nc=$('notesClose');
  if(nb&&nd&&nc){
    function setNotes(o){nd.hidden=!o;nb.setAttribute('aria-expanded',o);(o?nc:nb).focus()}
    nb.addEventListener('click',()=>setNotes(nd.hidden));
    const on=$('openNotes');if(on)on.addEventListener('click',()=>setNotes(true));
    nc.addEventListener('click',()=>setNotes(false));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nd.hidden)setNotes(false)});
  }
})();
