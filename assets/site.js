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
    const MAILTO='info@sgresourcesinc.com';
    function summary(){
      const v=n=>(f.elements[n]&&f.elements[n].value||'').trim();
      const svc=(f.querySelector('input[name=service]:checked')||{}).value||'';
      return ['Service: '+svc,'Name: '+v('fullname'),'Email: '+v('email'),'Phone / WhatsApp: '+v('phone'),'Destination: '+v('dest'),'','Details:',v('msg')].join('\n');
    }
    function show(ok,msg){sent.hidden=false;sent.className=ok?'sent':'sent err';sent.textContent=msg}
    f.addEventListener('submit',async e=>{
      e.preventDefault();
      const nm=f.elements.fullname,em=f.elements.email;
      if(!nm.value.trim()||!/^\S+@\S+\.\S+$/.test(em.value.trim())){
        show(false,'Enter your name and a valid email address so we can reply.');
        (!nm.value.trim()?nm:em).focus();return;
      }
      if(f.elements._gotcha&&f.elements._gotcha.value)return; // spam bot
      const endpoint=f.dataset.endpoint;
      const btn=f.querySelector('button[type=submit]');
      if(!endpoint){
        // no form service configured yet: hand the request to the visitor's email app
        location.href='mailto:'+MAILTO+'?subject='+encodeURIComponent('Website quote request')+'&body='+encodeURIComponent(summary());
        show(true,"Your email app should open with your request filled in. If it doesn't, email us at "+MAILTO+" or use WhatsApp.");
        return;
      }
      btn.disabled=true;const label=btn.textContent;btn.textContent='Sending…';
      try{
        const r=await fetch(endpoint,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}});
        if(!r.ok)throw new Error(r.status);
        f.reset();waText();
        show(true,"Thanks, your request was sent. We'll reply by email.");
      }catch(_){
        show(false,"Your request couldn't be sent. Please try again, email us at "+MAILTO+", or message us on WhatsApp.");
      }finally{btn.disabled=false;btn.textContent=label}
    });
  }

})();
