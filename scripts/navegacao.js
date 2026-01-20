/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura (SPA) e Integração de Busca
 * VERSÃO: 3.6.0 - Suporte a Gaveta de Busca e Filtro de Feed
 */

if (window.__NAV_SPA_INICIALIZADO__) {
    if (window.logVisual) window.logVisual("⚠️ Orquestrador já ativo. Evitando duplicação.");
} else {
    window.__NAV_SPA_INICIALIZADO__ = true;

    const displayPrincipal = document.getElementById('dynamic-content'); 
    let modalAberto = false; 

    function scrollTopo() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Listener de Busca: Quando o usuário digita, o SPA filtra o feed principal
     */
    window.addEventListener('busca:termo', (e) => {
        const termo = e.detail.termo;
        if (window.logVisual) window.logVisual(`SPA: Filtrando feed por "${termo}"`);
        
        // Se estivermos na seção de análises, avisamos o módulo para filtrar os cards
        const moduloAtivo = document.getElementById('script-modulo-ativo');
        if (moduloAtivo && typeof window.filtrarCardsPorBusca === 'function') {
            window.filtrarCardsPorBusca(termo);
        }
    });

    /**
     * Carrega dinamicamente o feed de uma seção
     */
    async function carregarSecao(nome) {
        if (!displayPrincipal) return;

        if (window.logVisual) window.logVisual(`🔄 Trocando para: ${nome.toUpperCase()}`);

        if (typeof window.fecharModalNoticia === 'function') {
            window.fecharModalNoticia();
        }

        displayPrincipal.innerHTML = `
            <div style="text-align: center; padding: 120px; color: var(--text-muted);">
                <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 24px; margin-bottom: 15px; color: var(--primary);"></i>
                <br><span style="font-weight:700; letter-spacing:1px;">SINCRONIZANDO ${nome.toUpperCase()}...</span>
            </div>`;
        
        try {
            window.inicializarSecao = null; 

            const response = await fetch(`./secoes/${nome}.html`);
            if (!response.ok) throw new Error(`Arquivo ${nome}.html não encontrado.`);
            
            const htmlBase = await response.text();
            displayPrincipal.innerHTML = htmlBase;

            const scriptId = `script-modulo-ativo`;
            const antigo = document.getElementById(scriptId);
            if (antigo) antigo.remove();

            const novoScript = document.createElement("script");
            novoScript.id = scriptId;
            novoScript.type = "module";
            
            let pastaModulo = nome;
            if (nome === 'analises') pastaModulo = 'modulos_analises';
            
            novoScript.src = `./modulos/${pastaModulo}/${nome}_principal.js?v=${Date.now()}`;
            
            novoScript.onload = () => {
                if (typeof window.inicializarSecao === 'function') {
                    const root = displayPrincipal.querySelector(`[data-root="${nome}"]`) || displayPrincipal;
                    window.inicializarSecao(root, { modo: 'lista', origem: nome });
                }
            };

            document.body.appendChild(novoScript);
            scrollTopo();

        } catch (err) {
            displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro ao carregar módulo.</div>`;
        }
    }

    /**
     * Delegação de Eventos Centralizada
     */
    document.addEventListener('click', (e) => {
        const target = e.target;

        // 🛡️ AJUSTE NA BLINDAGEM: Adicionado suporte para a gaveta de busca
        if (target.closest('[data-global-modal]') || 
            target.closest('#modal-comentarios-global') || 
            target.closest('#modal-noticia-global') ||
            target.closest('#search-suggestions-drawer')) { // ⬅️ Permite cliques na gaveta sem resetar o SPA
            return; 
        }

        const tag = target.closest('.filter-tag');
        const menuLink = target.closest('.nav-item a');

        if (tag || menuLink) {
            let secaoId;
            
            if (tag) {
                secaoId = tag.dataset.section || tag.textContent.toLowerCase().trim();
                document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
            } else if (menuLink && menuLink.getAttribute('href') === '#') {
                e.preventDefault();
                secaoId = menuLink.textContent.toLowerCase().trim();
            }

            if (secaoId) {
                const s = secaoId.replace('ã', 'a').replace('é', 'e'); // normalização simples
                if (['manchetes', 'analises', 'smartphones', 'tecnologia', 'entrevistas'].includes(s)) {
                    carregarSecao(s);
                }
            }
        }
    });

    window.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        const secaoInicial = params.get('tab') || 'manchetes';
        carregarSecao(secaoInicial);
    });

    window.carregarSecao = carregarSecao;
}
