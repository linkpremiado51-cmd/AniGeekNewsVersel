/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura (SPA) e Navegação via Modal
 * VERSÃO: 3.3 - Tratamento de Erros e Reset de Estado
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
        console.error("Erro: Container 'dynamic-content' não encontrado no index.");
        return;
    }

    // Garantia SPA: Fecha modais e libera scroll ao trocar de aba
    if (typeof window.fecharModalNoticia === 'function') {
        window.fecharModalNoticia();
    }

    // Feedback visual de carregamento
    displayPrincipal.innerHTML = `
        <div style="text-align: center; padding: 120px; color: var(--text-muted); opacity: 0.5;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
            <br>SINCRONIZANDO MÓDULO ${nome.toUpperCase()}...
        </div>`;
    
    try {
        window.inicializarSecao = null; 

        // 1. Busca o Shell HTML da seção
        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error(`Estrutura da seção ${nome} não encontrada.`);
        
        const htmlBase = await response.text();
        displayPrincipal.innerHTML = htmlBase;

        // 2. Limpeza de Scripts de Módulo Anteriores
        const scriptId = `script-modulo-ativo`;
        const antigo = document.getElementById(scriptId);
        if (antigo) antigo.remove();

        // 3. Injeção do Módulo JS com mapeamento de caminhos
        const novoScript = document.createElement("script");
        novoScript.id = scriptId;
        novoScript.type = "module";
        
        // Mapeamento dinâmico: Se for analises, usa a pasta modulos_analises, senão usa o padrão
        const pastaModulo = (nome === 'analises') ? `modulos_${nome}` : nome;
        novoScript.src = `./modulos/${pastaModulo}/${nome}_principal.js?v=${Date.now()}`;
        
        novoScript.onload = () => {
            if (typeof window.inicializarSecao === 'function') {
                const root = displayPrincipal.querySelector(`[data-root="${nome}"]`) || displayPrincipal;
                window.inicializarSecao(root, { modo: 'lista', origem: nome });
                console.log(`✅ Módulo ${nome} iniciado.`);
            }
        };

        novoScript.onerror = () => {
            console.error(`Falha ao carregar o script em: ${novoScript.src}`);
            throw new Error(`Script do módulo ${nome} não encontrado.`);
        };

        document.body.appendChild(novoScript);
        scrollTopo();

    } catch (err) {
        console.error(`❌ Erro SPA:`, err);
        displayPrincipal.innerHTML = `
            <div style="text-align:center; padding:100px; color: var(--text-main);">
                <i class="fa-solid fa-ghost" style="font-size: 40px; margin-bottom:15px; opacity:0.3;"></i><br>
                O módulo <strong>${nome}</strong> ainda está sendo configurado.
            </div>`;
    }
}

/**
 * Delegação de Eventos para Filtros e Menu
 */
document.addEventListener('click', (e) => {
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

        if (secaoId) carregarSecao(secaoId);
    }
});

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    // Tenta carregar a seção inicial
    const params = new URLSearchParams(window.location.search);
    const secaoInicial = params.get('tab') || 'manchetes';
    carregarSecao(secaoInicial);
});

window.carregarSecao = carregarSecao;
