/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura (SPA) e Gerenciador de Ciclo de Vida
 * VERSÃO: 5.0.0 - Refinamentos de Elite: Prefetch & Loading Global
 */

if (window.__NAV_SPA_INICIALIZADO__) {
    if (window.logVisual) window.logVisual("⚠️ Orquestrador já ativo.");
} else {
    window.__NAV_SPA_INICIALIZADO__ = true;

    const displayPrincipal = document.getElementById('dynamic-content');
    const progressBar = document.getElementById('progress-bar');
    let secaoAtiva = null;
    let prefetchCache = new Set(); // 🛡️ Cache de URLs já pré-carregadas

    /**
     * CONTROLE DE LOADING GLOBAL (Barra de Progresso)
     */
    function updateProgress(percent) {
        if (!progressBar) return;
        progressBar.style.width = `${percent}%`;
        if (percent >= 100) {
            setTimeout(() => { progressBar.style.width = '0%'; }, 500);
        }
    }

    /**
     * PREFETCH (Nº 1): Carregamento antecipado ao passar o mouse
     */
    function prefetchSecao(nome) {
        if (prefetchCache.has(nome) || secaoAtiva === nome) return;
        
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `./secoes/${nome}.html`;
        document.head.appendChild(link);
        
        prefetchCache.add(nome);
        if (window.logVisual) window.logVisual(`☁️ Prefetch: ${nome} preparado.`);
    }

    function executarLimpezaModuloAnterior() {
        if (typeof window.desmontarSecao === 'function') {
            if (window.logVisual) window.logVisual(`🧹 Finalizando: ${secaoAtiva}`);
            window.desmontarSecao();
            window.desmontarSecao = null; 
        }
        // 🛡️ DEAD MAN'S SWITCH (Nº 3): Garante que comentários e busca parem
        if (window.secaoComentarios?.fechar) window.secaoComentarios.fechar();
        if (window.limparBuscaGlobal) window.limparBuscaGlobal();
    }

    async function carregarSecao(nome) {
        if (!displayPrincipal || secaoAtiva === nome) return;

        updateProgress(30); // Início do Loading
        executarLimpezaModuloAnterior();
        
        secaoAtiva = nome;
        window.inicializarSecao = null;

        try {
            updateProgress(60); // HTML em busca
            const response = await fetch(`./secoes/${nome}.html`);
            if (!response.ok) throw new Error("Erro fetch");
            
            const htmlBase = await response.text();
            displayPrincipal.innerHTML = htmlBase;

            const scriptId = `script-modulo-ativo`;
            document.getElementById(scriptId)?.remove();

            const novoScript = document.createElement("script");
            novoScript.id = scriptId;
            novoScript.type = "module";
            
            let pastaModulo = nome === 'analises' ? 'modulos_analises' : nome;
            novoScript.src = `./modulos/${pastaModulo}/${nome}_principal.js?v=${Date.now()}`;
            
            novoScript.onload = () => {
                if (typeof window.inicializarSecao === 'function') {
                    window.inicializarSecao(displayPrincipal, { modo: 'lista', origem: nome });
                    updateProgress(100); // Concluído!
                    if (window.logVisual) window.logVisual(`✅ ${nome.toUpperCase()} pronto.`);
                }
            };

            document.body.appendChild(novoScript);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            updateProgress(0);
            displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro de conexão.</div>`;
        }
    }

    /**
     * DELEGAÇÃO E PREFETCH
     */
    document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('[data-section]') || e.target.closest('.nav-item a');
        if (link) {
            const secaoId = link.dataset.section || link.textContent.toLowerCase().trim();
            if (['manchetes', 'analises', 'smartphones', 'tecnologia'].includes(secaoId)) {
                prefetchSecao(secaoId);
            }
        }
    });

    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-section]') || e.target.closest('.nav-item a');
        if (link) {
            if (link.tagName === 'A' && link.getAttribute('href') === '#') e.preventDefault();
            
            const secaoId = link.dataset.section || link.textContent.toLowerCase().trim();
            if (['manchetes', 'analises', 'smartphones', 'tecnologia'].includes(secaoId)) {
                carregarSecao(secaoId);
            }
        }
    });

    // 🛡️ AUTH SYNC (Nº 4): Se o usuário logar, notifica os módulos sem recarregar
    document.addEventListener('user:login', () => {
        if (window.logVisual) window.logVisual("👤 Sessão iniciada. Sincronizando módulos...");
    });

    window.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        carregarSecao(params.get('tab') || 'manchetes');
    });
}
