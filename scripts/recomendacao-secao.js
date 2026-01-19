/* ======================================================
   AniGeekNews – Enterprise Section System v7.2
   • INTEGRADO: Orquestrador SPA (navegacao.js)
   • Títulos de Sessão Clicáveis (Categorias Pai)
   • Notificações Toast Profissionais (Sem Alert)
   • Controle de Foco (Teclado não abre sozinho)
   • Design Harmônico
====================================================== */

(function(){

const CONFIG = {
  MAX_TABS: 12,
  KEYS: {
    ORDER: 'ag_v7_order',
    MODE:  'ag_v7_mode', // 'dynamic' ou 'fixed'
    STATS: 'ag_v7_stats'
  }
};

/* ===========================
   BANCO DE DADOS (COM IDs NAS SESSÕES)
=========================== */
const CATALOGO = [
  {
    sessao: "MANCHETES",
    id: 'manchetes', 
    cor: "#FF4500", 
    itens: [
      { id: 'destaques', label: 'Destaques do Dia' },
      { id: 'ultimas', label: 'Últimas Notícias' },
      { id: 'trending', label: 'Trending / Em Alta' },
      { id: 'exclusivos', label: 'Exclusivos' },
      { id: 'urgente', label: 'Urgente' },
      { id: 'maislidas', label: 'Mais Lidas' },
      { id: 'editorpick', label: 'Editor’s Pick' }
    ]
  },
  {
    sessao: "ANÁLISES",
    id: 'analises',
    cor: "#8A2BE2",
    itens: [
      { id: 'opiniao', label: 'Opinião' },
      { id: 'critica', label: 'Crítica Técnica' },
      { id: 'analisemercado', label: 'Análise de Mercado' },
      { id: 'comparativos', label: 'Comparativos' },
      { id: 'teorias', label: 'Teorias' },
      { id: 'explicacoes', label: 'Explicações' },
      { id: 'impacto', label: 'Impacto na Indústria' }
    ]
  },
  {
    sessao: "ENTREVISTAS",
    id: 'entrevistas',
    cor: "#20B2AA",
    itens: [
      { id: 'devs', label: 'Desenvolvedores' },
      { id: 'criadores', label: 'Criadores de Conteúdo' },
      { id: 'atores', label: 'Atores / Dubladores' },
      { id: 'influencers', label: 'Influencers' },
      { id: 'pro_industria', label: 'Profissionais' },
      { id: 'comunidade_ent', label: 'Comunidade' }
    ]
  },
  {
    sessao: "LANÇAMENTOS",
    id: 'lancamentos',
    cor: "#32CD32",
    itens: [
      { id: 'lanc_jogos', label: 'Jogos' },
      { id: 'lanc_animes', label: 'Animes' },
      { id: 'lanc_filmes', label: 'Filmes' },
      { id: 'lanc_series', label: 'Séries' },
      { id: 'lanc_tech', label: 'Tecnologia' },
      { id: 'lanc_mangas', label: 'Mangás / HQs' },
      { id: 'datas', label: 'Datas Confirmadas' },
      { id: 'rumores', label: 'Rumores' }
    ]
  },
  {
    sessao: "REVIEWS",
    id: 'reviews',
    cor: "#FFD700",
    itens: [
      { id: 'rev_jogos', label: 'Jogos' },
      { id: 'rev_animes', label: 'Animes' },
      { id: 'rev_filmes', label: 'Filmes' },
      { id: 'rev_series', label: 'Séries' },
      { id: 'rev_tech', label: 'Tecnologia' },
      { id: 'rev_geek', label: 'Produtos Geek' },
      { id: 'rev_eventos', label: 'Eventos' },
      { id: 'rev_stream', label: 'Streaming' }
    ]
  },
  {
    sessao: "TRAILERS",
    id: 'trailers',
    cor: "#DC143C",
    itens: [
      { id: 'tr_jogos', label: 'Jogos' },
      { id: 'tr_animes', label: 'Animes' },
      { id: 'tr_filmes', label: 'Filmes' },
      { id: 'tr_series', label: 'Séries' },
      { id: 'tr_teasers', label: 'Teasers' },
      { id: 'tr_oficiais', label: 'Trailers Oficiais' },
      { id: 'tr_gameplay', label: 'Gameplay Reveal' }
    ]
  },
  {
    sessao: "STREAMING",
    id: 'streaming',
    cor: "#00BFFF",
    itens: [
      { id: 'st_netflix', label: 'Netflix' },
      { id: 'st_prime', label: 'Prime Video' },
      { id: 'st_disney', label: 'Disney+' },
      { id: 'st_hbo', label: 'HBO Max' },
      { id: 'st_crunchy', label: 'Crunchyroll' },
      { id: 'st_star', label: 'Star+' },
      { id: 'st_apple', label: 'Apple TV+' },
      { id: 'st_semana', label: 'Lançamentos da Semana' }
    ]
  },
  {
    sessao: "PODCAST",
    id: 'podcast',
    cor: "#9370DB",
    itens: [
      { id: 'pod_recentes', label: 'Episódios Recentes' },
      { id: 'pod_geek', label: 'Temas Geek' },
      { id: 'pod_games', label: 'Games' },
      { id: 'pod_tech', label: 'Tecnologia' },
      { id: 'pod_pop', label: 'Cultura Pop' },
      { id: 'pod_ent', label: 'Entrevistas' },
      { id: 'pod_back', label: 'Bastidores' }
    ]
  },
  {
    sessao: "FUTEBOL",
    id: 'futebol',
    cor: "#2E8B57",
    itens: [
      { id: 'fut_news', label: 'Notícias' },
      { id: 'fut_analise', label: 'Análises' },
      { id: 'fut_mercado', label: 'Mercado da Bola' },
      { id: 'fut_opiniao', label: 'Opinião' },
      { id: 'fut_estat', label: 'Estatísticas' },
      { id: 'fut_inter', label: 'Futebol Internacional' },
      { id: 'fut_nacional', label: 'Futebol Nacional' }
    ]
  },
  {
    sessao: "TECNOLOGIA",
    id: 'tecnologia',
    cor: "#4682B4",
    itens: [
      { id: 'smartphones', label: 'Smartphones' },
      { id: 'tech_hard', label: 'Hardware' },
      { id: 'tech_soft', label: 'Software' },
      { id: 'tech_ai', label: 'Inteligência Artificial' },
      { id: 'tech_gamestech', label: 'Games Tech' },
      { id: 'tech_sec', label: 'Segurança Digital' },
      { id: 'tech_inov', label: 'Inovação' },
      { id: 'tech_start', label: 'Startups' }
    ]
  },
  {
    sessao: "COSPLAY",
    id: 'cosplay',
    cor: "#FF69B4",
    itens: [
      { id: 'cosp_dest', label: 'Destaques' },
      { id: 'cosp_event', label: 'Eventos' },
      { id: 'cosp_ent', label: 'Entrevistas' },
      { id: 'cosp_guias', label: 'Guias' },
      { id: 'cosp_com', label: 'Comunidade' },
      { id: 'cosp_fotos', label: 'Fotos' }
    ]
  },
  {
    sessao: "EVENTOS",
    id: 'eventos',
    cor: "#FF8C00",
    itens: [
      { id: 'evt_feiras', label: 'Feiras Geek' },
      { id: 'evt_camp', label: 'Campeonatos' },
      { id: 'evt_conv', label: 'Convenções' },
      { id: 'evt_lanc', label: 'Lançamentos Presenciais' },
      { id: 'evt_cal', label: 'Calendário' },
      { id: 'evt_live', label: 'Cobertura Ao Vivo' }
    ]
  },
  {
    sessao: "ESPORTS",
    id: 'esports',
    cor: "#00008B",
    itens: [
      { id: 'esp_camp', label: 'Campeonatos' },
      { id: 'esp_times', label: 'Times' },
      { id: 'esp_jog', label: 'Jogadores' },
      { id: 'esp_res', label: 'Resultados' },
      { id: 'esp_ana', label: 'Análises' },
      { id: 'esp_agd', label: 'Agenda' }
    ]
  },
  {
    sessao: "CINEMA",
    id: 'cinema',
    cor: "#8B0000",
    itens: [
      { id: 'cine_news', label: 'Notícias' },
      { id: 'cine_lanc', label: 'Lançamentos' },
      { id: 'cine_rev', label: 'Reviews' },
      { id: 'cine_bilh', label: 'Bilheteria' },
      { id: 'cine_bast', label: 'Bastidores' },
      { id: 'cine_prem', label: 'Premiações' }
    ]
  },
  {
    sessao: "TV & SÉRIES",
    id: 'tv',
    cor: "#483D8B",
    itens: [
      { id: 'tv_news', label: 'Notícias' },
      { id: 'tv_lanc', label: 'Lançamentos' },
      { id: 'tv_rev', label: 'Reviews' },
      { id: 'tv_renov', label: 'Renovadas / Canceladas' },
      { id: 'tv_eps', label: 'Episódios' },
      { id: 'tv_bast', label: 'Bastidores' }
    ]
  },
  {
    sessao: "COMUNIDADE",
    id: 'comunidade',
    cor: "#2F4F4F",
    itens: [
      { id: 'com_op', label: 'Opinião do Leitor' },
      { id: 'com_enq', label: 'Enquetes' },
      { id: 'com_dest', label: 'Comentários em Destaque' },
      { id: 'com_fan', label: 'Fanarts' },
      { id: 'com_teo', label: 'Teorias da Comunidade' }
    ]
  },
  {
    sessao: "RANKING",
    id: 'ranking',
    cor: "#B8860B",
    itens: [
      { id: 'rank_jogos', label: 'Melhores Jogos' },
      { id: 'rank_animes', label: 'Melhores Animes' },
      { id: 'rank_filmes', label: 'Melhores Filmes' },
      { id: 'rank_series', label: 'Top Séries' },
      { id: 'rank_ano', label: 'Rankings do Ano' },
      { id: 'rank_voto', label: 'Votação do Público' }
    ]
  }
];

/* ===========================
   CSS INJETADO (PRESERVADO)
=========================== */
const styles = `
  #ag-drawer {
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    overflow: hidden;
    max-height: 0;
    transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
    opacity: 0;
    width: 100%;
    position: absolute;
    left: 0;
    z-index: 1000;
    box-shadow: 0 15px 30px rgba(0,0,0,0.08);
  }
  
  body.dark-mode #ag-drawer { background: #141414; border-color: #333; box-shadow: 0 15px 30px rgba(0,0,0,0.5); }
  #ag-drawer.open { max-height: 85vh; opacity: 1; }
  .ag-drawer-scroll { max-height: 85vh; overflow-y: auto; padding: 30px 20px; scrollbar-width: thin; }

  .ag-drawer-header {
    display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; max-width: 1200px;
    position: sticky; top: -30px; z-index: 100; margin: -30px auto 30px auto; padding: 25px 0;
    background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05); transition: background 0.3s ease;
  }
  body.dark-mode .ag-drawer-header { background: rgba(20, 20, 20, 0.85); border-color: rgba(255, 255, 255, 0.08); }

  .ag-search-wrapper { position: relative; flex: 1; min-width: 280px; }
  .ag-search-icon-svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; fill: #999; pointer-events: none; }
  .ag-search-input { width: 100%; padding: 11px 15px 11px 45px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.1); background: rgba(0,0,0,0.04); font-size: 14px; font-weight: 500; outline: none; transition: all 0.3s ease; }
  body.dark-mode .ag-search-input { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #fff; }

  .ag-mode-group { background: rgba(0,0,0,0.05); padding: 4px; border-radius: 10px; display: flex; }
  body.dark-mode .ag-mode-group { background: rgba(255,255,255,0.08); }
  .ag-mode-btn { padding: 8px 16px; border: none; background: transparent; border-radius: 7px; font-size: 11px; font-weight: 800; color: #888; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
  .ag-mode-btn.active { background: #fff; color: #000; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
  body.dark-mode .ag-mode-btn.active { background: #333; color: #fff; }

  .ag-section-block { margin-bottom: 35px; max-width: 1200px; margin-left: auto; margin-right: auto; }
  .ag-section-header-btn { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; background: transparent; border: none; padding: 5px 0; cursor: pointer; width: fit-content; transition: 0.2s; }
  .ag-section-text { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #333; }
  body.dark-mode .ag-section-text { color: #fff; }
  .ag-section-header-btn.is-active .ag-section-text { color: var(--primary-color, #e50914); text-decoration: underline; text-underline-offset: 4px; }
  .ag-section-marker { width: 10px; height: 10px; border-radius: 3px; }

  .ag-grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .ag-card { position: relative; background: #f9f9f9; border: 1px solid transparent; border-radius: 6px; padding: 12px 10px; font-size: 13px; font-weight: 500; color: #444; text-align: center; cursor: pointer; transition: all 0.2s ease; height: 100%; display: flex; align-items: center; justify-content: center; }
  body.dark-mode .ag-card { background: #1e1e1e; color: #ccc; }
  .ag-card.is-selected { background: #fff; border-color: var(--primary-color, #e50914); color: var(--primary-color, #e50914); box-shadow: inset 0 0 0 1px var(--primary-color, #e50914); font-weight: 700; }
  .ag-card-action { position: absolute; top: 3px; right: 4px; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; border-radius: 50%; opacity: 0.6; }

  #ag-toast-container { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 99999; pointer-events: none; display: flex; flex-direction: column; gap: 10px; }
  .ag-toast { background: rgba(30, 30, 30, 0.95); color: #fff; padding: 12px 24px; border-radius: 50px; font-size: 13px; font-weight: 600; box-shadow: 0 5px 15px rgba(0,0,0,0.3); opacity: 0; transform: translateY(20px); animation: agSlideUp 0.3s forwards; }

  #filterScroller { display: flex; align-items: center; position: relative; gap: 8px; overflow-x: auto; scrollbar-width: none; }
  #filterScroller::-webkit-scrollbar { display: none; }
  .filter-tag.cfg-btn { position: sticky; right: 0 !important; z-index: 99; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px); min-width: 48px; height: 34px; margin-left: auto; border: none; border-left: 1px solid rgba(0, 0, 0, 0.05); cursor: pointer; font-size: 18px; }
  body.dark-mode .filter-tag.cfg-btn { background: rgba(20, 20, 20, 0.9); border-left: 1px solid rgba(255, 255, 255, 0.1); }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

/* ===========================
   SISTEMA DE TOAST
=========================== */
function showToast(message, type = 'normal') {
  let container = document.getElementById('ag-toast-container');
  if(!container) {
    container = document.createElement('div');
    container.id = 'ag-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `ag-toast ${type}`;
  toast.innerHTML = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'agFadeOut 0.3s forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
}

/* ===========================
   LÓGICA CORE
=========================== */
function load(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } }
function save(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
function getMode(){ return load(CONFIG.KEYS.MODE, 'dynamic'); }
function setMode(m){ save(CONFIG.KEYS.MODE, m); renderDrawer(); }

function getOrder(){
  const saved = load(CONFIG.KEYS.ORDER, null);
  return saved || ['manchetes', 'analises', 'entrevistas'];
}

function findItem(id){
  for(let sec of CATALOGO){
    if(sec.id === id) return { id: sec.id, label: sec.sessao };
    const item = sec.itens.find(i => i.id === id);
    if(item) return item;
  }
  return null;
}

function track(id){
  if(getMode() !== 'dynamic') return;
  const stats = load(CONFIG.KEYS.STATS, {});
  stats[id] = (stats[id] || 0) + 1;
  save(CONFIG.KEYS.STATS, stats);
  const order = getOrder();
  order.sort((a,b) => (stats[b]||0) - (stats[a]||0));
  save(CONFIG.KEYS.ORDER, order);
}

/* ===========================
   RENDERIZAÇÃO BARRA HORIZONTAL (EDITADA PARA SPA)
=========================== */
function renderBar(){
  const bar = document.getElementById('filterScroller');
  if(!bar) return;

  let drawer = document.getElementById('ag-drawer');
  if(!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'ag-drawer';
    bar.parentNode.insertBefore(drawer, bar.nextSibling);
  }

  const order = getOrder();
  bar.innerHTML = '';

  order.forEach(id => {
    const item = findItem(id);
    if(!item) return;

    const btn = document.createElement('button');
    btn.className = 'filter-tag';
    btn.dataset.section = id; // IMPORTANTE para o navegacao.js
    btn.textContent = item.label;

    btn.onclick = () => {
      document.querySelectorAll('#filterScroller .filter-tag').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      track(id);
      document.getElementById('ag-drawer').classList.remove('open');
      
      // INTEGRAÇÃO SPA: Carrega a seção no container dinâmico
      if(window.carregarSecao) {
          // Se for um sub-item (ex: 'opiniao'), carrega o pai ('analises')
          const secaoPai = CATALOGO.find(s => s.itens.some(i => i.id === id) || s.id === id);
          window.carregarSecao(secaoPai ? secaoPai.id : id);
      } else {
          console.log("SPA Link:", id);
      }
    };
    bar.appendChild(btn);
  });

  const cfg = document.createElement('button');
  cfg.className = 'filter-tag cfg-btn';
  cfg.innerHTML = '<i class="fa-solid fa-gear"></i>'; 
  cfg.onclick = toggleDrawer;
  bar.appendChild(cfg);
}

/* ===========================
   GAVETA (DRAWER)
=========================== */
function toggleDrawer(){
  const drawer = document.getElementById('ag-drawer');
  if(!drawer) return;
  if(drawer.classList.contains('open')) drawer.classList.remove('open');
  else { renderDrawer(); drawer.classList.add('open'); }
}

function renderDrawer(filterText = ""){
  const drawer = document.getElementById('ag-drawer');
  const currentOrder = getOrder();
  const currentMode = getMode();
  const searchIcon = `<svg class="ag-search-icon-svg" viewBox="0 0 24 24"><path d="M21.71 20.29l-5.01-5.01C17.54 13.68 18 11.91 18 10c0-4.41-3.59-8-8-8S2 5.59 2 10s3.59 8 8 8c1.91 0 3.68-.46 5.28-1.3l5.01 5.01c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41z"/></svg>`;

  drawer.innerHTML = `
    <div class="ag-drawer-scroll">
      <div class="ag-drawer-header">
        <div class="ag-search-wrapper">
          ${searchIcon}
          <input type="text" class="ag-search-input" id="ag-search-input" placeholder="Pesquisar..." value="${filterText}">
        </div>
        <div class="ag-mode-group">
          <button id="btn-fixo" class="ag-mode-btn ${currentMode==='fixed'?'active':''}">Fixo</button>
          <button id="btn-dinamico" class="ag-mode-btn ${currentMode==='dynamic'?'active':''}">Automático</button>
        </div>
      </div>
      <div id="ag-catalog-container"></div>
      <div style="text-align:center; padding-top:20px; font-size:12px; color:#888;">
        ${currentOrder.length} de ${CONFIG.MAX_TABS} abas ativas
      </div>
    </div>
  `;

  const container = document.getElementById('ag-catalog-container');
  const term = filterText.toLowerCase();

  CATALOGO.forEach(sec => {
    const itensFiltrados = sec.itens.filter(i => i.label.toLowerCase().includes(term));
    const sessaoMatch = sec.sessao.toLowerCase().includes(term);
    if(term !== "" && !sessaoMatch && itensFiltrados.length === 0) return;
    
    const isCatSelected = currentOrder.includes(sec.id);
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'ag-section-block';
    sectionDiv.innerHTML = `
      <button class="ag-section-header-btn ${isCatSelected ? 'is-active' : ''}">
        <div class="ag-section-marker" style="background:${sec.cor}"></div>
        <span class="ag-section-text">${sec.sessao} ${isCatSelected ? (currentMode==='dynamic'?'✕':'•••') : ''}</span>
      </button>
      <div class="ag-grid-container"></div>
    `;
    
    sectionDiv.querySelector('.ag-section-header-btn').onclick = () => {
        if(isCatSelected && currentMode === 'fixed') handleAction(sec.id, sec.sessao);
        else toggleItem(sec.id, sec.sessao);
    };

    const grid = sectionDiv.querySelector('.ag-grid-container');
    (sessaoMatch ? sec.itens : itensFiltrados).forEach(item => {
      const isSelected = currentOrder.includes(item.id);
      const card = document.createElement('div');
      card.className = `ag-card ${isSelected ? 'is-selected' : ''}`;
      card.innerHTML = `${item.label} ${isSelected ? `<div class="ag-card-action" data-id="${item.id}" data-action="true">${currentMode==='dynamic'?'✕':'•••'}</div>` : ''}`;
      card.onclick = (e) => {
        if(e.target.dataset.action || e.target.parentNode.dataset.action) {
          e.stopPropagation(); handleAction(item.id, item.label);
        } else toggleItem(item.id, item.label);
      };
      grid.appendChild(card);
    });
    container.appendChild(sectionDiv);
  });

  document.getElementById('ag-search-input').oninput = (e) => renderDrawer(e.target.value);
  document.getElementById('btn-fixo').onclick = () => setMode('fixed');
  document.getElementById('btn-dinamico').onclick = () => setMode('dynamic');
}

/* ===========================
   AÇÕES & NOTIFICAÇÕES
=========================== */
function toggleItem(id, label){
  let order = getOrder();
  if(order.includes(id)){
    order = order.filter(x => x !== id);
    showToast(`Removido: <b>${label}</b>`);
  } else {
    if(order.length >= CONFIG.MAX_TABS) { showToast(`Limite atingido!`, 'error'); return; }
    order.push(id);
    showToast(`Adicionado: <b>${label}</b>`, 'success');
  }
  save(CONFIG.KEYS.ORDER, order);
  renderBar();
  renderDrawer(document.getElementById('ag-search-input').value);
}

function handleAction(id, label){
  const mode = getMode();
  let order = getOrder();
  if(mode === 'dynamic') {
    order = order.filter(x => x !== id);
    save(CONFIG.KEYS.ORDER, order);
    renderBar(); renderDrawer();
  } else {
    const currentIndex = order.indexOf(id);
    const newPos = prompt(`Mover "${label}" para qual posição? (1-${order.length})`, currentIndex + 1);
    if(newPos){
      const targetIndex = parseInt(newPos) - 1;
      if(!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < order.length) {
        order.splice(currentIndex, 1);
        order.splice(targetIndex, 0, id);
        save(CONFIG.KEYS.ORDER, order);
        renderBar(); renderDrawer();
      }
    }
  }
}

/* Inicialização */
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderBar);
else renderBar();

})();
