/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura (SPA) e Navegação via Modal
 * VERSÃO: 3.1 - Blindagem contra reabertura e padronização de contrato
 */

const displayPrincipal = document.getElementById('conteudo_de_destaque');
let modalAberto = false; // Controle de estado para blindagem (Ajuste 2)

/**
 * Função Utilitária para Scroll Suave
 */
function scrollTopo() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Carrega dinamicamente o feed de uma seção (HTML + CSS + Módulo JS).
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    displayPrincipal.innerHTML = `
        <div style="text-align: center; padding: 120px; color: var(--text-muted); opacity: 0.5;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
            <br>SINCRONIZANDO MÓDULO...
        </div>`;
    
    try {
        window.inicializarSecao = null;
        gerenciarCSSDoModulo(nome);

        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error("Estrutura da seção não encontrada.");
        
        const htmlBase = await response.text();
        displayPrincipal.innerHTML = htmlBase;

        const scriptId = `script-modulo-ativo`;
        document.getElementById(scriptId)?.remove(); 

        const novoScript = document.createElement("script");
        novoScript.id = scriptId;
        novoScript.type = "module";
        novoScript.src = `./modulos/modulos_${nome}/${nome}_principal.js?v=${Date.now()}`;
        
        novoScript.onload = () => {
            if (typeof window.inicializarSecao === 'function') {
                const root = displayPrincipal.querySelector(`[data-root="${nome}"]`) || displayPrincipal;
                window.inicializarSecao(root, { modo: 'lista', origem: nome });
            }
        };

        document.body.appendChild(novoScript);
        scrollTopo();

    } catch (err) {
        console.error(`Erro ao orquestrar seção ${nome}:`, err);
        displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Módulo ${nome} indisponível.</div>`;
    }
}

/**
 * Ponte para abrir notícia. 100% centralizado no Modal.
 */
window.abrirNoticiaUnica = function(item) {
    if (!item || !item.id || modalAberto) return; // Blindagem contra reabertura dupla

    modalAberto = true;

    // 1. Atualiza a URL (Deep Linking)
    const url = new URL(window.location);
    url.searchParams.set('id', item.id);
    window.history.pushState({ id: item.id }, '', url);

    // 2. Aciona o Modal
    if (typeof window.abrirModalNoticia === 'function') {
        window.abrirModalNoticia(item);
    } else {
        console.error("ERRO: modal-manager.js não carregado.");
        modalAberto = false;
    }
};

/**
 * Hook para ser chamado pelo modal-manager.js ao fechar
 */
window.notificarModalFechado = function() {
    modalAberto = false;
};

/**
 * Gerencia o carregamento de CSS de forma modular
 */
function gerenciarCSSDoModulo(nome) {
    const cssId = 'css-modulo-dinamico';
    document.getElementById(cssId)?.remove();

    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = `./modulos/modulos_${nome}/${nome}_estilo.css`;
    document.head.appendChild(link);
}

/**
 * Vigia de URL para Links Compartilhados
 */
function verificarEstadoURL() {
    const params = new URLSearchParams(window.location.search);
    const idNoticia = params.get('id');

    if (idNoticia) {
        const checkData = setInterval(() => {
            if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
                const item = window.noticiasFirebase.find(n => n.id === idNoticia);
                if (item && typeof window.abrirModalNoticia === 'function') {
                    window.abrirModalNoticia(item);
                    modalAberto = true;
                } else {
                    console.warn('Notícia não encontrada para o ID:', idNoticia); // Fallback UX (Ajuste 3)
                }
                clearInterval(checkData);
            }
        }, 100);
        setTimeout(() => clearInterval(checkData), 5000);
    }
}

/**
 * Sincronização com botões Voltar / Avançar (POPSTATE)
 */
window.addEventListener('popstate', (event) => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // Se voltar e não tiver ID, fecha o modal se estiver aberto (Padronização Ajuste 1)
    if (!id && typeof window.fecharModalNoticia === 'function') {
        window.fecharModalNoticia();
        return;
    }

    // Se tiver ID, abre o modal correspondente
    if (id && window.noticiasFirebase) {
        const item = window.noticiasFirebase.find(n => n.id === id);
        if (item) {
            window.abrirModalNoticia(item);
            modalAberto = true;
        }
    }
});

/**
 * Delegação de Eventos para Filtros de Navegação
 */
document.addEventListener('click', (e) => {
    const tag = e.target.closest('.filter-tag');
    if (tag) {
        document.querySelectorAll('.filter-tag.active').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    }
});

/**
 * Utilitário para Menu Mobile
 */
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
};

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
    carregarSecao('manchetes');
    verificarEstadoURL();
});

// Exposição Global
window.carregarSecao = carregarSecao;
