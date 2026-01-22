/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador Dinâmico Universal (SPA)
 * VERSÃO: 6.3.0 - Inicialização Sincronizada com Firebase (BUG FIX)
 */

if (window.__NAV_SPA_INICIALIZADO__) {
    if (window.logVisual) window.logVisual("⚠️ Orquestrador já ativo.");
} else {
    window.__NAV_SPA_INICIALIZADO__ = true;

    const displayPrincipal = document.getElementById('dynamic-content');
    const progressBar = document.getElementById('progress-bar');
    let secaoAtiva = null;
    let prefetchCache = new Set();
    let inicializacaoDisparada = false; // 🛡️ trava de inicialização

    /**
     * CONTROLE DE LOADING GLOBAL
     */
    function updateProgress(percent) {
        if (!progressBar) return;
        progressBar.style.width = `${percent}%`;
        if (percent >= 100) {
            setTimeout(() => { progressBar.style.width = '0%'; }, 500);
        }
    }

    /**
     * PREFETCH DE SEÇÕES
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

    /**
     * LIMPEZA DO MÓDULO ANTERIOR
     */
    function executarLimpezaModuloAnterior() {
        if (typeof window.desmontarSecao === 'function') {
            if (window.logVisual) window.logVisual(`🧹 Finalizando: ${secaoAtiva}`);
            window.desmontarSecao();
            window.desmontarSecao = null;
        }

        if (window.secaoComentarios?.fechar) window.secaoComentarios.fechar();
        if (window.limparBuscaGlobal) window.limparBuscaGlobal();
    }

    /**
     * CARREGAMENTO DE SEÇÃO
     */
    async function carregarSecao(nome) {
        if (!displayPrincipal || secaoAtiva === nome) return;

        updateProgress(30);
        executarLimpezaModuloAnterior();

        secaoAtiva = nome;
        window.inicializarSecao = null;

        try {
            updateProgress(60);

            const response = await fetch(`./secoes/${nome}.html`);
            if (!response.ok) throw new Error(`Módulo ${nome} não encontrado.`);

            const htmlBase = await response.text();
            displayPrincipal.innerHTML = htmlBase;

            const scriptId = 'script-modulo-ativo';
            document.getElementById(scriptId)?.remove();

            const novoScript = document.createElement('script');
            novoScript.id = scriptId;
            novoScript.type = 'module';

            const pastaModulo =
                (nome === 'analises' || nome === 'futebol' || nome === 'arte' || nome === 'politica')
                    ? `modulos_${nome}`
                    : nome;

            novoScript.src = `./modulos/${pastaModulo}/${nome}_principal.js?v=${Date.now()}`;

            novoScript.onload = () => {
                if (typeof window.inicializarSecao === 'function') {
                    window.inicializarSecao(displayPrincipal, {
                        modo: 'lista',
                        origem: nome
                    });
                    updateProgress(100);
                    if (window.logVisual) window.logVisual(`✅ ${nome.toUpperCase()} pronto.`);
                }
            };

            document.body.appendChild(novoScript);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            updateProgress(0);
            console.error('Erro de Navegação:', err);
            displayPrincipal.innerHTML =
                `<div style="text-align:center; padding:100px;">
                    Erro ao carregar a seção: ${nome}
                </div>`;
        }
    }

    /**
     * CLIQUES DE NAVEGAÇÃO
     */
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-section]') || e.target.closest('.nav-item a');
        if (!link) return;

        const secaoId = link.dataset.section || link.textContent.toLowerCase().trim();
        if (!secaoId) return;

        if (link.tagName === 'A' && link.getAttribute('href') === '#') {
            e.preventDefault();
        }

        carregarSecao(secaoId);
    });

    /**
     * PREFETCH AO PASSAR O MOUSE
     */
    document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('[data-section]') || e.target.closest('.nav-item a');
        if (!link) return;

        const secaoId = link.dataset.section || link.textContent.toLowerCase().trim();
        if (secaoId) prefetchSecao(secaoId);
    });

    /**
     * 🚀 INICIALIZAÇÃO CORRETA (AGUARDA FIREBASE)
     */
    window.addEventListener('firebase:data_updated', () => {
        if (inicializacaoDisparada) return;
        inicializacaoDisparada = true;

        const params = new URLSearchParams(window.location.search);
        const secaoInicial = params.get('tab') || 'analises';

        if (window.logVisual) {
            window.logVisual(`🚀 Inicialização SPA após Firebase: ${secaoInicial}`);
        }

        carregarSecao(secaoInicial);
    });
}
