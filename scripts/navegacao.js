/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura (SPA) e Navegação via Modal
 * VERSÃO: 3.6 - Correção de Navegação e Proteção de Modal
 */

const displayPrincipal = document.getElementById('dynamic-content'); 
let modalAberto = false; 

function scrollTopo() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Carrega dinamicamente o feed de uma seção (HTML + CSS + Módulo JS).
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) {
        if (window.logVisual) window.logVisual("❌ Erro: Container principal ausente.");
        return;
    }

    if (window.logVisual) window.logVisual(`🔄 Trocando para: ${nome.toUpperCase()}`);

    // Garantia SPA: Fecha modais ao trocar de aba
    if (typeof window.fecharModalNoticia === 'function') {
        window.fecharModalNoticia();
    }

    // Fecha modal de comentários se estiver aberto ao trocar de aba
    if (window.secaoComentarios && window.secaoComentarios.fechar) {
        window.secaoComentarios.fechar();
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
                if (window.logVisual) window.logVisual(`✅ Módulo ${nome} carregado.`);
            }
        };

        novoScript.onerror = () => {
            if (window.logVisual) window.logVisual(`❌ Erro ao carregar script de ${nome}.`);
        };

        document.body.appendChild(novoScript);
        scrollTopo();

    } catch (err) {
        console.error(`❌ Erro SPA:`, err);
        displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro ao carregar o módulo.</div>`;
    }
}

/**
 * Delegação de Eventos para Filtros e Menu
 */
document.addEventListener('click', (e) => {
    // 🛡️ PROTEÇÃO: Se o clique for dentro do modal de comentários, não faz nada aqui.
    if (e.target.closest('#modal-comentarios-global')) return;

    const tag = e.target.closest('.filter-tag');
    const menuLink = e.target.closest('.nav-item a');

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
            // Normalização: Remove acentos e espaços para bater com os nomes dos arquivos
            const nomeLimpo = secaoId.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            carregarSecao(nomeLimpo);
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const secaoInicial = params.get('tab') || 'manchetes';
    carregarSecao(secaoInicial);
});

window.carregarSecao = carregarSecao;
