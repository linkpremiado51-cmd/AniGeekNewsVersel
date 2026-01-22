/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador Dinâmico Universal (SPA) com Sincronização Cromática
 * VERSÃO: 9.0 - Integração com Engine de Temas e Customização de Abas
 */

if (window.__NAV_SPA_INICIALIZADO__) {
    if (window.logVisual) window.logVisual("⚠️ Orquestrador já ativo.");
} else {
    window.__NAV_SPA_INICIALIZADO__ = true;

    window.appNavigationState = {
        secaoAtiva: null,
        isTransitioning: false,
        prefetchCache: new Set(),
        historico: []
    };

    const DOM = {
        display: document.getElementById('dynamic-content'),
        progress: document.getElementById('progress-bar')
    };

    const log = (msg) => window.logVisual ? window.logVisual(`[Router]: ${msg}`) : console.log(`[Nav]: ${msg}`);

    function updateProgress(percent) {
        if (!DOM.progress) return;
        DOM.progress.style.width = `${percent}%`;
        if (percent >= 100) {
            setTimeout(() => { DOM.progress.style.width = '0%'; }, 500);
        }
    }

    /**
     * LIMPEZA E RESET CROMÁTICO (Ponto 6)
     */
    function executarLimpezaModuloAnterior() {
        if (typeof window.desmontarSecao === 'function') {
            log(`Limpar: ${window.appNavigationState.secaoAtiva}`);
            window.desmontarSecao();
            window.desmontarSecao = null; 
            window.inicializarSecao = null;
        }
        
        if (window.secaoComentarios?.fechar) window.secaoComentarios.fechar();
        
        // Resetamos a cor para a base geek (roxo) antes de carregar a nova para evitar "flash" de cor errada
        document.documentElement.style.setProperty('--tema-cor', '#8A2BE2');
    }

    /**
     * CORE: CARREGAMENTO DE MÓDULOS
     */
    async function carregarSecao(nome) {
        if (!DOM.display || window.appNavigationState.secaoAtiva === nome || window.appNavigationState.isTransitioning) return;

        window.appNavigationState.isTransitioning = true;
        updateProgress(30); 
        
        executarLimpezaModuloAnterior();
        
        const secaoAnterior = window.appNavigationState.secaoAtiva;
        window.appNavigationState.secaoAtiva = nome;

        try {
            updateProgress(60); 
            
            // 1. Sincroniza a Cor da Aba ANTES de mostrar o conteúdo (Ponto 3)
            // Se a função de aplicarCorTema existir no customizacao-abas.js, chamamos ela
            if (window.aplicarCorTema) {
                window.aplicarCorTema(nome);
            }

            // 2. Busca o HTML
            const response = await fetch(`./${nome}.html`); // Removido prefixo /secoes/ para alinhar com sua estrutura
            if (!response.ok) throw new Error(`Módulo ${nome} não localizado.`);
            
            const htmlBase = await response.text();
            DOM.display.innerHTML = htmlBase;

            // 3. Injeção do Script do Módulo
            const scriptId = `script-modulo-ativo`;
            document.getElementById(scriptId)?.remove();

            const novoScript = document.createElement("script");
            novoScript.id = scriptId;
            novoScript.type = "module";
            
            // Mapeamento inteligente de pastas (Ponto 10)
            const pastasEspeciais = ['analises', 'futebol', 'arte', 'politica'];
            let pastaModulo = pastasEspeciais.includes(nome) ? `modulos_${nome}` : nome;
                
            novoScript.src = `./modulos/${pastaModulo}/${nome}_principal.js?v=${Date.now()}`;
            
            novoScript.onload = () => {
                if (typeof window.inicializarSecao === 'function') {
                    window.inicializarSecao(DOM.display, { 
                        modo: 'lista', 
                        origem: nome,
                        veioDe: secaoAnterior 
                    });
                    updateProgress(100);
                    log(`✅ ${nome.toUpperCase()} pronto.`);
                }
                window.appNavigationState.isTransitioning = false;
            };

            document.body.appendChild(novoScript);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            window.appNavigationState.isTransitioning = false;
            updateProgress(0);
            console.error("Erro SPA:", err);
            DOM.display.innerHTML = `
                <div style="text-align:center; padding:100px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; color:red;"></i>
                    <h3>Erro ao carregar seção</h3>
                    <p>${err.message}</p>
                    <button onclick="window.location.reload()">Reiniciar</button>
                </div>`;
        }
    }

    /**
     * API DE NAVEGAÇÃO
     */
    window.router = {
        irPara: (nome) => carregarSecao(nome),
        getAtual: () => window.appNavigationState.secaoAtiva,
        prefetch: (nome) => {
            if (window.appNavigationState.prefetchCache.has(nome)) return;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = `./${nome}.html`;
            document.head.appendChild(link);
            window.appNavigationState.prefetchCache.add(nome);
        }
    };

    /**
     * DELEGAÇÃO DE EVENTOS
     */
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-section]');
        if (link) {
            e.preventDefault();
            const secaoId = link.dataset.section;
            carregarSecao(secaoId);
        }
    });

    document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('[data-section]');
        if (link) {
            window.router.prefetch(link.dataset.section);
        }
    });

    /**
     * INICIALIZAÇÃO
     */
    window.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        // Prioriza a URL, senão carrega 'analises' por padrão
        carregarSecao(params.get('tab') || 'analises');
    });
}
