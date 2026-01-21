/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador Dinâmico Universal (Corrigido)
 * VERSÃO: 6.1.0 - Correção de Caminhos e Suporte a Novos Módulos
 */

if (window.__NAV_SPA_INICIALIZADO__) {
    if (window.logVisual) window.logVisual("⚠️ Orquestrador já ativo.");
} else {
    window.__NAV_SPA_INICIALIZADO__ = true;

    const displayPrincipal = document.getElementById('dynamic-content');
    const progressBar = document.getElementById('progress-bar');
    let secaoAtiva = null;
    let prefetchCache = new Set();

    function updateProgress(percent) {
        if (!progressBar) return;
        progressBar.style.width = `${percent}%`;
        if (percent >= 100) {
            setTimeout(() => { progressBar.style.width = '0%'; }, 500);
        }
    }

    function prefetchSecao(nome) {
        if (prefetchCache.has(nome) || secaoAtiva === nome) return;
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `./secoes/${nome}.html`;
        document.head.appendChild(link);
        prefetchCache.add(nome);
    }

    function executarLimpezaModuloAnterior() {
        if (typeof window.desmontarSecao === 'function') {
            window.desmontarSecao();
            window.desmontarSecao = null; 
        }
        if (window.secaoComentarios?.fechar) window.secaoComentarios.fechar();
        if (window.limparBuscaGlobal) window.limparBuscaGlobal();
    }

    async function carregarSecao(nome) {
        if (!displayPrincipal || secaoAtiva === nome) return;

        updateProgress(30);
        executarLimpezaModuloAnterior();
        
        secaoAtiva = nome;
        window.inicializarSecao = null;

        try {
            updateProgress(60);
            // ✅ Mantendo seu padrão original: HTMLs ficam na pasta /secoes/
            const response = await fetch(`./secoes/${nome}.html`);
            if (!response.ok) throw new Error("Erro fetch HTML");
            
            const htmlBase = await response.text();
            displayPrincipal.innerHTML = htmlBase;

            const scriptId = `script-modulo-ativo`;
            document.getElementById(scriptId)?.remove();

            const novoScript = document.createElement("script");
            novoScript.id = scriptId;
            novoScript.type = "module";
            
            // ✅ Lógica inteligente para as pastas de script
            // Se for analises ou futebol, usa modulos_xxx, se não, usa o próprio nome
            let pastaModulo = (nome === 'analises' || nome === 'futebol') ? `modulos_${nome}` : nome;
            novoScript.src = `./modulos/${pastaModulo}/${nome}_principal.js?v=${Date.now()}`;
            
            novoScript.onload = () => {
                if (typeof window.inicializarSecao === 'function') {
                    window.inicializarSecao(displayPrincipal, { modo: 'lista', origem: nome });
                    updateProgress(100);
                    if (window.logVisual) window.logVisual(`✅ ${nome.toUpperCase()} pronto.`);
                }
            };

            document.body.appendChild(novoScript);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            updateProgress(0);
            console.error("Erro de Navegação:", err);
            displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro de conexão ao carregar ${nome}.</div>`;
        }
    }

    // Gerenciador de cliques universal (Aceita qualquer data-section)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-section]') || e.target.closest('.nav-item a');
        if (link) {
            const secaoId = link.dataset.section || link.textContent.toLowerCase().trim();
            // Lista extendida automaticamente
            if (secaoId) {
                if (link.tagName === 'A' && link.getAttribute('href') === '#') e.preventDefault();
                carregarSecao(secaoId);
            }
        }
    });

    document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('[data-section]') || e.target.closest('.nav-item a');
        if (link) {
            const secaoId = link.dataset.section || link.textContent.toLowerCase().trim();
            if (secaoId) prefetchSecao(secaoId);
        }
    });

    window.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        carregarSecao(params.get('tab') || 'manchetes');
    });
}
