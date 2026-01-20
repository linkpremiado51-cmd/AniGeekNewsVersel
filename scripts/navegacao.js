/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura (SPA)
 * VERSÃO: 3.7 - Fim do loop de carregamento e proteção de eventos
 */

const displayPrincipal = document.getElementById('dynamic-content'); 
let secaoAtiva = ""; // Trava para evitar recarregamento da mesma aba

function scrollTopo() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Carrega a seção apenas se for diferente da atual
 */
async function carregarSecao(nome) {
    if (!displayPrincipal || nome === secaoAtiva) return;
    
    secaoAtiva = nome;
    if (window.logVisual) window.logVisual(`🔄 Trocando para: ${nome.toUpperCase()}`);

    // Fecha modais abertos antes da transição
    if (typeof window.fecharModalNoticia === 'function') window.fecharModalNoticia();
    if (window.secaoComentarios?.fechar) window.secaoComentarios.fechar();

    displayPrincipal.innerHTML = `
        <div style="text-align: center; padding: 120px; color: var(--text-muted);">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 24px; margin-bottom: 15px; color: var(--primary);"></i>
            <br><span style="font-weight:700; letter-spacing:1px;">SINCRONIZANDO...</span>
        </div>`;
    
    try {
        window.inicializarSecao = null; 
        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error("Falha no fetch");
        
        const htmlBase = await response.text();
        displayPrincipal.innerHTML = htmlBase;

        const antigo = document.getElementById('script-modulo-ativo');
        if (antigo) antigo.remove();

        const novoScript = document.createElement("script");
        novoScript.id = 'script-modulo-ativo';
        novoScript.type = "module";
        
        let pastaModulo = (nome === 'analises') ? 'modulos_analises' : nome;
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
        displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro ao carregar conteúdo.</div>`;
    }
}

/**
 * Escutador de cliques otimizado
 */
document.addEventListener('click', (e) => {
    // 1. Ignora completamente se o clique for dentro de qualquer modal
    if (e.target.closest('#modal-comentarios-global') || e.target.closest('#modal-noticia-global')) {
        return; 
    }

    const tag = e.target.closest('.filter-tag');
    const menuLink = e.target.closest('.nav-item a');
    const btnAba = e.target.closest('.btn-aba-geek'); // Adicionado caso use essa classe nos botões vermelhos

    const elementoAlvo = tag || menuLink || btnAba;

    if (elementoAlvo) {
        let secaoId = elementoAlvo.dataset.section || elementoAlvo.textContent.toLowerCase().trim();
        
        // Se for link de menu com href, previne o padrão
        if (menuLink && menuLink.getAttribute('href') === '#') e.preventDefault();

        if (secaoId) {
            // Limpeza de string para bater com o arquivo físico
            const nomeLimpo = secaoId.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
            
            // Só dispara se for uma das seções conhecidas
            const permitidas = ['manchetes', 'analises', 'smartphones', 'tecnologia'];
            if (permitidas.includes(nomeLimpo)) {
                carregarSecao(nomeLimpo);
            }
        }
    }
}, true); // UseCapture para detectar antes de outros scripts

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const secaoInicial = params.get('tab') || 'manchetes';
    // Timeout pequeno para garantir que o Firebase/DOM estejam prontos
    setTimeout(() => carregarSecao(secaoInicial), 100);
});

window.carregarSecao = carregarSecao;
