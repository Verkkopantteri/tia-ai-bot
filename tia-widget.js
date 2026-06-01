(function () {
  // ── Config from script tag: <script src="tia-widget.js" data-key="sk-..." data-api="/api/chat"></script>
  const _script = document.currentScript;
  const TIA_API_KEY  = (_script && _script.getAttribute('data-key'))  || '';
  const TIA_API_URL  = (_script && _script.getAttribute('data-api'))  || 'https://api.anthropic.com/v1/messages';

  const TIA_SYSTEM = `You are TIA, an AI assistant for TIA AI.
You help businesses add an AI chatbot to their website.
Plans: S 69€/mo, M 99€/mo, L 199€/mo, XL 499€/mo. Setup in 48h.
Custom branding: 100€ one-time. Powered by Anthropic Claude.
Keep answers short — 2–3 sentences max.`;

  // ── Inject CSS ──────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
*,*::before,*::after{box-sizing:border-box;}
#tia-root{position:fixed;bottom:28px;right:28px;z-index:9000;width:52px;height:52px;}
#tia-bubble{
  position:absolute;bottom:0;right:0;z-index:9001;
  width:52px;height:52px;border-radius:50%;
  background:#09090b;border:1px solid rgba(255,255,255,0.09);
  box-shadow:0 8px 32px rgba(0,0,0,0.4);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;transform-origin:center center;
  animation:tiaBubbleIn .55s cubic-bezier(0.34,1.56,0.64,1) both;
  transition:box-shadow .2s;
}
#tia-bubble:hover{box-shadow:0 12px 40px rgba(0,0,0,0.6);}
#tia-bubble.bubble-hidden{opacity:0;transform:scale(0.7);pointer-events:none;transition:opacity .25s ease,transform .25s ease;}
#tia-bubble:not(.bubble-hidden){opacity:1;transform:scale(1);transition:opacity .35s cubic-bezier(0.34,1.56,0.64,1),transform .4s cubic-bezier(0.34,1.56,0.64,1);}
#tia-bubble svg{width:22px;height:22px;stroke:rgba(232,232,232,0.9);fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;}
#tia-green-dot{position:absolute;top:0;right:0;width:12px;height:12px;border-radius:50%;background:#34d399;border:2px solid #09090b;animation:tiaPulse 2s ease-in-out infinite;transition:opacity .3s ease,transform .3s ease;}
#tia-green-dot.dot-gone{opacity:0;transform:scale(0);pointer-events:none;animation:none;}
@keyframes tiaBubbleIn{from{opacity:0;transform:scale(0.6);}to{opacity:1;transform:scale(1);}}
@keyframes tiaPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(.88);}}

#tia-panel{
  position:absolute;bottom:0;right:0;z-index:9002;
  width:320px;height:420px;border-radius:20px;overflow:hidden;
  background:#09090b;border:1px solid rgba(255,255,255,0.09);
  box-shadow:0 8px 40px rgba(0,0,0,0.45);
  display:flex;flex-direction:column;transform-origin:bottom right;
  opacity:0;transform:scale(0.88) translateY(8px);pointer-events:none;
  transition:opacity .28s ease,transform .35s cubic-bezier(0.34,1.26,0.64,1);
}
#tia-panel.panel-open{opacity:1;transform:scale(1) translateY(0);pointer-events:all;}

.tia-header{background:rgba(13,13,15,0.97);border-bottom:1px solid rgba(255,255,255,0.09);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.tia-header-left{display:flex;align-items:center;gap:10px;}
.tia-avatar{width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.09);background:#232325;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
.tia-avatar img{width:100%;height:100%;object-fit:contain;padding:3px;}
.tia-name-row{display:flex;align-items:center;gap:6px;}
.tia-name{font-size:14px;font-weight:600;color:rgba(232,232,232,0.95);}
.tia-header-dot{width:6px;height:6px;border-radius:50%;background:#34d399;animation:tiaPulse 2s ease-in-out infinite;}
.tia-ctrl{display:flex;align-items:center;justify-content:flex-end;cursor:pointer;padding:12px 16px;margin:-12px -16px;gap:10px;user-select:none;-webkit-tap-highlight-color:transparent;}
.tia-ctrl-inner{display:flex;align-items:center;gap:10px;opacity:0.3;pointer-events:none;}
.tia-ctrl-dash{width:12px;height:2px;background:rgba(232,232,232,0.95);border-radius:999px;}
.tia-ctrl-circle{width:12px;height:12px;border-radius:50%;border:1px solid rgba(232,232,232,0.95);}

.tia-messages{flex:1;overflow-y:auto;padding:12px 12px 0;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.12) rgba(255,255,255,0.04);}
.tia-messages::-webkit-scrollbar{width:4px;}
.tia-messages::-webkit-scrollbar-track{background:rgba(255,255,255,0.04);}
.tia-messages::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:2px;}
.tia-msg-row{display:flex;gap:6px;animation:tiaMsgIn .28s cubic-bezier(0.16,1,0.3,1) both;}
.tia-msg-row.user{flex-direction:row-reverse;}
@keyframes tiaMsgIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
.tia-msg-av{width:20px;height:20px;border-radius:50%;background:#232325;border:1px solid rgba(255,255,255,0.09);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;margin-top:2px;}
.tia-msg-av img{width:100%;height:100%;object-fit:contain;padding:2px;}
.tia-bubble-text{max-width:82%;padding:6px 10px;font-size:11px;line-height:1.6;border:1px solid rgba(255,255,255,0.09);background:#232325;color:rgba(232,232,232,0.95);}
.tia-msg-row.bot  .tia-bubble-text{border-radius:2px 10px 10px 10px;}
.tia-msg-row.user .tia-bubble-text{border-radius:10px 10px 2px 10px;background:#2c2c30;}
.tia-typing{display:flex;gap:4px;align-items:center;padding:8px 10px;background:#232325;border:1px solid rgba(255,255,255,0.09);border-radius:2px 10px 10px 10px;}
.tia-typing span{display:block;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.22);animation:tiaDot 1s ease-in-out infinite;}
.tia-typing span:nth-child(2){animation-delay:.18s;}
.tia-typing span:nth-child(3){animation-delay:.36s;}
@keyframes tiaDot{0%,100%{opacity:.35;transform:translateY(0);}50%{opacity:1;transform:translateY(-3px);}}

.tia-chips{padding:6px 12px 8px;display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0;}
.tia-chip{font-size:10px;color:rgba(255,255,255,0.45);border:1px solid rgba(255,255,255,0.09);background:rgba(20,20,24,0.85);padding:4px 10px;border-radius:999px;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,color .15s,opacity .18s,transform .18s;}
.tia-chip:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.18);color:rgba(255,255,255,0.75);}
.tia-chip.removing{opacity:0;transform:scale(0.8);pointer-events:none;}

.tia-input-wrap{background:rgba(13,13,15,0.97);border-top:1px solid rgba(255,255,255,0.09);padding:10px 12px;flex-shrink:0;}
.tia-input-inner{display:flex;align-items:center;gap:8px;background:#1e1e22;border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:7px 12px;}
.tia-input{flex:1;background:transparent;border:none;outline:none;font-size:11px;color:rgba(232,232,232,0.95);font-family:inherit;}
.tia-input::placeholder{color:rgba(255,255,255,0.22);}
.tia-send-btn{width:24px;height:24px;border-radius:8px;background:#232325;border:1px solid rgba(255,255,255,0.09);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0;padding:0;}
.tia-send-btn:hover{background:rgba(255,255,255,0.1);}

.tia-footer{background:rgba(13,13,15,0.97);padding:6px 0 8px;display:flex;align-items:center;justify-content:center;gap:4px;flex-shrink:0;}
.tia-footer a{display:flex;align-items:center;gap:4px;text-decoration:none;}
.tia-footer-label{font-size:9px;letter-spacing:.04em;color:rgba(255,255,255,0.22);}
.tia-footer img{height:8px;opacity:.5;filter:brightness(2);transition:opacity .15s;}
.tia-footer a:hover img{opacity:.8;}
  `;
  document.head.appendChild(style);

  // ── Inject HTML ─────────────────────────────────────────────────────────────
  const root = document.createElement('div');
  root.id = 'tia-root';
  root.innerHTML = `
    <div id="tia-panel" role="dialog" aria-label="TIA AI chat">
      <div class="tia-header">
        <div class="tia-header-left">
          <div class="tia-avatar">
            <img src="https://6a1d4cd40bc623d413b1bf9a.imgix.net/logo/logo-white.png" alt="TIA" onerror="this.style.display='none'"/>
          </div>
          <div class="tia-name-row">
            <span class="tia-name">TIA</span>
            <div class="tia-header-dot"></div>
          </div>
        </div>
        <div class="tia-ctrl" id="tia-close-btn" title="Close">
          <div class="tia-ctrl-inner">
            <div class="tia-ctrl-dash"></div>
            <div class="tia-ctrl-circle"></div>
          </div>
        </div>
      </div>
      <div class="tia-messages" id="tia-messages"></div>
      <div class="tia-chips" id="tia-chips">
        <span class="tia-chip" data-chip="AI deployment">AI deployment</span>
        <span class="tia-chip" data-chip="Pricing">Pricing</span>
        <span class="tia-chip" data-chip="Book a demo">Book a demo</span>
      </div>
      <div class="tia-input-wrap">
        <div class="tia-input-inner">
          <input class="tia-input" id="tia-input" type="text" placeholder="Send a message…" autocomplete="off"/>
          <button class="tia-send-btn" id="tia-send-btn" aria-label="Send">
            <svg viewBox="0 0 10 16" fill="none" style="width:8px;height:13px;">
              <polyline points="2,1 9,8 2,15" stroke="rgba(255,255,255,0.6)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="tia-footer">
        <span class="tia-footer-label">Powered by</span>
        <a href="https://tia.ai" target="_blank" rel="noopener" aria-label="TIA AI">
          <img src="https://6a1d4cd40bc623d413b1bf9a.imgix.net/logo/tia.ai.png" alt="TIA AI"/>
        </a>
      </div>
    </div>
    <div id="tia-bubble" aria-label="Open TIA chat">
      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <div id="tia-green-dot"></div>
    </div>
  `;
  document.body.appendChild(root);

  // ── State & refs ─────────────────────────────────────────────────────────────
  const panel  = document.getElementById('tia-panel');
  const bubble = document.getElementById('tia-bubble');
  const tiaHistory = [];
  let tiaIsOpen = false;
  let tiaEverOpened = false;

  // ── Event listeners ──────────────────────────────────────────────────────────
  bubble.addEventListener('click', tiaOpen);
  document.getElementById('tia-close-btn').addEventListener('click', tiaClose);
  document.getElementById('tia-send-btn').addEventListener('click', tiaSend);
  document.getElementById('tia-input').addEventListener('keydown', e => { if (e.key === 'Enter') tiaSend(); });
  document.getElementById('tia-chips').addEventListener('click', e => {
    const chip = e.target.closest('.tia-chip');
    if (chip) tiaChip(chip, chip.getAttribute('data-chip'));
  });

  // ── Core functions ───────────────────────────────────────────────────────────
  function tiaOpen() {
    if (tiaIsOpen) return;
    tiaIsOpen = true;
    panel.classList.add('panel-open');
    bubble.classList.add('bubble-hidden');
    if (!tiaEverOpened) {
      tiaEverOpened = true;
      document.getElementById('tia-green-dot').classList.add('dot-gone');
      setTimeout(() => tiaAddBotMessage("Hey! I'm TIA, your AI assistant. How can I help you today?"), 420);
    }
    setTimeout(() => document.getElementById('tia-input').focus(), 380);
  }

  function tiaClose() {
    if (!tiaIsOpen) return;
    tiaIsOpen = false;
    panel.classList.remove('panel-open');
    setTimeout(() => bubble.classList.remove('bubble-hidden'), 80);
  }

  function tiaChip(el, text) {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 200);
    document.getElementById('tia-input').value = text;
    tiaSend();
  }

  async function tiaSend() {
    const inp = document.getElementById('tia-input');
    const text = inp.value.trim();
    if (!text) return;
    inp.value = '';
    tiaAddUserMessage(text);
    tiaHistory.push({ role: 'user', content: text });
    const typing = tiaAddTyping();
    let reply;
    if (!TIA_API_KEY) {
      await tiaSleep(900);
      reply = tiaDemoReply(text);
    } else {
      reply = await tiaCallApi();
    }
    typing.remove();
    tiaAddBotMessage(reply);
    tiaHistory.push({ role: 'assistant', content: reply });
  }

  async function tiaCallApi() {
    try {
      const isProxy = TIA_API_URL !== 'https://api.anthropic.com/v1/messages';
      const headers = { 'Content-Type': 'application/json' };
      if (!isProxy) {
        headers['x-api-key'] = TIA_API_KEY;
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
      }
      const res = await fetch(TIA_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: TIA_SYSTEM,
          messages: tiaHistory,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.content?.[0]?.text ?? 'Sorry, something went wrong.';
    } catch (e) {
      return "Sorry, I can't connect right now. Please try again in a moment.";
    }
  }

  function tiaDemoReply(text) {
    const t = text.toLowerCase();
    if (t.includes('pric') || t.includes('plan') || t.includes('cost') || t.includes('€'))
      return "We offer four plans: S (69€/mo), M (99€/mo), L (199€/mo), and XL (499€/mo). All include setup within 48 hours. Custom branding is a one-time 100€ add-on.";
    if (t.includes('demo') || t.includes('book'))
      return "Absolutely! Leave your email and we'll reach out within 24 hours to schedule a personalised demo.";
    if (t.includes('deploy') || t.includes('ai deploy'))
      return "We handle everything — training TIA on your content, embedding it on your site, and ongoing updates. You're live in 48 hours.";
    return "Thanks for reaching out! Would you like to know more about pricing, setup, or book a demo?";
  }

  function tiaAddUserMessage(text) {
    const msgs = document.getElementById('tia-messages');
    const row = document.createElement('div');
    row.className = 'tia-msg-row user';
    row.innerHTML = `<div class="tia-bubble-text">${tiaEsc(text)}</div>`;
    msgs.appendChild(row);
    tiaScroll();
  }

  function tiaAddBotMessage(text) {
    const msgs = document.getElementById('tia-messages');
    const row = document.createElement('div');
    row.className = 'tia-msg-row bot';
    const av = document.createElement('div');
    av.className = 'tia-msg-av';
    av.innerHTML = `<img src="https://6a1d4cd40bc623d413b1bf9a.imgix.net/logo/logo-white.png" alt="" onerror="this.style.display='none'"/>`;
    const bbl = document.createElement('div');
    bbl.className = 'tia-bubble-text';
    row.appendChild(av);
    row.appendChild(bbl);
    msgs.appendChild(row);
    tiaTypeText(bbl, text);
    tiaScroll();
    return row;
  }

  function tiaAddTyping() {
    const msgs = document.getElementById('tia-messages');
    const row = document.createElement('div');
    row.className = 'tia-msg-row bot';
    const av = document.createElement('div');
    av.className = 'tia-msg-av';
    av.innerHTML = `<img src="https://6a1d4cd40bc623d413b1bf9a.imgix.net/logo/logo-white.png" alt="" onerror="this.style.display='none'"/>`;
    const td = document.createElement('div');
    td.className = 'tia-typing';
    td.innerHTML = '<span></span><span></span><span></span>';
    row.appendChild(av);
    row.appendChild(td);
    msgs.appendChild(row);
    tiaScroll();
    return row;
  }

  function tiaTypeText(el, text, speed = 18) {
    let i = 0; el.textContent = '';
    const id = setInterval(() => {
      el.textContent += text[i++];
      tiaScroll();
      if (i >= text.length) clearInterval(id);
    }, speed);
  }

  function tiaScroll() {
    const m = document.getElementById('tia-messages');
    requestAnimationFrame(() => { m.scrollTop = m.scrollHeight; });
  }
  function tiaSleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  function tiaEsc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
})();
