(function() {
  // Configuration
  
  const API_URL = window.AskHRConfig?.apiUrl || 'http://localhost:8000';
  const PRIMARY_COLOR = window.AskHRConfig?.color || '#4f46e5';

  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    #askhr-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, ${PRIMARY_COLOR}, #7c3aed);
      border-radius: 18px;
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      box-shadow: 0 8px 30px rgba(79,70,229,0.3);
      border: none;
      transition: all 0.3s;
      animation: askhr-pulse 2s infinite;
    }
    #askhr-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 40px rgba(79,70,229,0.4);
    }
    @keyframes askhr-pulse {
      0%, 100% { box-shadow: 0 8px 30px rgba(79,70,229,0.3); }
      50% { box-shadow: 0 8px 40px rgba(79,70,229,0.5); }
    }
    #askhr-panel {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 380px;
      height: 560px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      z-index: 999999;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Inter', system-ui, sans-serif;
      animation: askhr-slideUp 0.3s ease;
    }
    #askhr-panel.open { display: flex; }
    @keyframes askhr-slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #askhr-header {
      background: linear-gradient(135deg, ${PRIMARY_COLOR}, #7c3aed);
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #askhr-header h3 { font-size: 15px; font-weight: 600; margin:0; }
    #askhr-header p { font-size: 11px; opacity: 0.8; margin:2px 0 0 0; }
    #askhr-close {
      width: 30px; height: 30px;
      border-radius: 8px;
      border: none;
      background: rgba(255,255,255,0.15);
      color: white;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #askhr-close:hover { background: rgba(255,255,255,0.25); }
    #askhr-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .askhr-msg {
      display: flex;
      gap: 8px;
      max-width: 85%;
      font-size: 13px;
      line-height: 1.5;
    }
    .askhr-msg.bot { align-self: flex-start; }
    .askhr-msg.user { align-self: flex-end; flex-direction: row-reverse; }
    .askhr-msg .avatar {
      width: 28px; height: 28px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; flex-shrink: 0;
    }
    .askhr-msg.bot .avatar { background: #eef2ff; color: ${PRIMARY_COLOR}; }
    .askhr-msg.user .avatar { background: ${PRIMARY_COLOR}; color: white; }
    .askhr-msg .bubble {
      padding: 10px 14px;
      border-radius: 14px;
    }
    .askhr-msg.bot .bubble {
      background: white;
      border: 1px solid #e2e8f0;
      border-top-left-radius: 4px;
      color: #334155;
    }
    .askhr-msg.user .bubble {
      background: linear-gradient(135deg, ${PRIMARY_COLOR}, #7c3aed);
      color: white;
      border-top-right-radius: 4px;
    }
    #askhr-input-area {
      padding: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      background: white;
    }
    #askhr-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      font-size: 13px;
      outline: none;
      font-family: inherit;
    }
    #askhr-input:focus { border-color: ${PRIMARY_COLOR}; }
    #askhr-send {
      width: 38px; height: 38px;
      background: linear-gradient(135deg, ${PRIMARY_COLOR}, #7c3aed);
      border: none;
      border-radius: 12px;
      color: white;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #askhr-send:disabled { opacity: 0.5; cursor: not-allowed; }
    #askhr-login {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
      text-align: center;
    }
    #askhr-login h3 { color: #1e293b; margin-bottom: 6px; }
    #askhr-login p { color: #94a3b8; font-size: 12px; margin-bottom: 16px; }
    #askhr-login input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      font-size: 13px;
      outline: none;
      margin-bottom: 10px;
      font-family: inherit;
    }
    #askhr-login button {
      width: 100%;
      padding: 10px;
      background: linear-gradient(135deg, ${PRIMARY_COLOR}, #7c3aed);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .askhr-dot-flashing { display: flex; gap: 4px; padding: 10px 14px; }
    .askhr-dot-flashing span {
      width: 6px; height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: askhr-dot 1.4s infinite;
    }
    .askhr-dot-flashing span:nth-child(2) { animation-delay: 0.2s; }
    .askhr-dot-flashing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes askhr-dot {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    @media (max-width: 480px) {
      #askhr-panel { width: calc(100vw - 32px); right: 16px; height: 500px; }
      #askhr-bubble { right: 16px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);

  // Create elements
  const bubble = document.createElement('button');
  bubble.id = 'askhr-bubble';
  bubble.innerHTML = '💬';
  document.body.appendChild(bubble);

  const panel = document.createElement('div');
  panel.id = 'askhr-panel';
  panel.innerHTML = `
    <div id="askhr-header">
      <div>
        <h3>🤖 HR Assistant</h3>
        <p>Online · Quick answers</p>
      </div>
      <button id="askhr-close">✕</button>
    </div>
    <div id="askhr-login">
      <h3>👋 Welcome!</h3>
      <p>Enter your company email to start</p>
      <input type="email" id="askhr-email" placeholder="you@company.com">
      <button id="askhr-start">Start Chat</button>
    </div>
    <div id="askhr-messages" style="display:none;"></div>
    <div id="askhr-input-area" style="display:none;">
      <input type="text" id="askhr-input" placeholder="Ask a question...">
      <button id="askhr-send">➤</button>
    </div>
  `;
  document.body.appendChild(panel);

  // State
  let email = '';
  let loading = false;

  // Event listeners
  bubble.addEventListener('click', () => panel.classList.add('open'));
  document.getElementById('askhr-close').addEventListener('click', () => panel.classList.remove('open'));

  // Login
  document.getElementById('askhr-start').addEventListener('click', async () => {
    email = document.getElementById('askhr-email').value.trim();
    if (!email) return alert('Please enter your email');
    
    document.getElementById('askhr-login').style.display = 'none';
    document.getElementById('askhr-messages').style.display = 'flex';
    document.getElementById('askhr-input-area').style.display = 'flex';
    
    addMessage('bot', `👋 Hello! Ask me about company policies, leaves, WFH, etc.`);
  });

  // Send message
  const sendMsg = async () => {
    const input = document.getElementById('askhr-input');
    const text = input.value.trim();
    if (!text || loading) return;
    
    addMessage('user', text);
    input.value = '';
    loading = true;
    
    // Show typing
    const msgContainer = document.getElementById('askhr-messages');
    const typing = document.createElement('div');
    typing.className = 'askhr-msg bot';
    typing.innerHTML = '<div class="avatar">🤖</div><div class="bubble"><div class="askhr-dot-flashing"><span></span><span></span><span></span></div></div>';
    msgContainer.appendChild(typing);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    try {
      const res = await fetch(`${API_URL}/api/chatbot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_email: email, question: text })
      });
      const data = await res.json();
      typing.remove();
      addMessage('bot', data.answer || 'Sorry, try again.');
    } catch {
      typing.remove();
      addMessage('bot', '❌ Connection error.');
    }
    loading = false;
  };

  document.getElementById('askhr-send').addEventListener('click', sendMsg);
  document.getElementById('askhr-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMsg();
  });

  function addMessage(type, text) {
    const msgContainer = document.getElementById('askhr-messages');
    const div = document.createElement('div');
    div.className = `askhr-msg ${type}`;
    div.innerHTML = `
      <div class="avatar">${type === 'bot' ? '🤖' : '👤'}</div>
      <div class="bubble">${text}</div>
    `;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
})();