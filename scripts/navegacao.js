/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura (SPA) e Navegação via Modal
 * VERSÃO: 3.2 - Ajustado para Novo Index e Shell de Seções
 */

// AJUSTE: Agora busca o container correto definido no seu index.html
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

    // Feedback visual de carregamento
    displayPrincipal.innerHTML = `
        <div style="text-align: center; padding: 120px; color: var(--text-muted); opacity: 0.5;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
            <br>SINCRONIZANDO MÓDULO ${nome.toUpperCase()}...
        </div>`;
    
    try {
        window.inicializarSecao = null; // Reseta o contrato para o próximo módulo
        gerenciarCSSDoModulo(nome);

        // 1. Busca o Shell HTML da seção
        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error(`Estrutura da seção ${nome} não encontrada.`);
        
        const htmlBase = await response.text();
        displayPrincipal.innerHTML = htmlBase;

        // 2. Remove script anterior para evitar duplicidade
        const scriptId = `script-modulo-ativo`;
        document.getElementById(scriptId)?.remove(); 

        // 3. Cria e injeta o novo script do módulo
        const novoScript = document.createElement("script");
        novoScript.id = scriptId;
        novoScript.type = "module";
        // Caminho padrão conforme sua árvore de pastas
        novoScript.src = `./modulos/modulos_${nome}/${nome}_principal.js?v=${Date.now()}`;
        
        novoScript.onload = () => {
            // Verifica se o módulo exportou a função de inicialização
            if (typeof window.inicializarSecao === 'function') {
                // Procura o data-root dentro do HTML recém injetado
                const root = displayPrincipal.querySelector(`[data-root="${nome}"]`) || displayPrincipal;
                window.inicializarSecao(root, { modo: 'lista', origem: nome });
                console.log(`✅ Módulo ${nome} iniciado com sucesso.`);
            } else {
                console.warn(`⚠️ Módulo ${nome} carregado, mas window.inicializarSecao não foi definida.`);
            }
        };

        document.body.appendChild(novoScript);
        scrollTopo();

    } catch (err) {
        console.error(`❌ Erro ao orquestrar seção ${nome}:`, err);
        displayPrincipal.innerHTML = `
            <div style="text-align:center; padding:100px; color: #ff4444;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 30px;"></i><br>
                Módulo <strong>${nome}</strong> temporariamente indisponível.
            </div>`;
    }
}

// ... (Restante das funções: abrirNoticiaUnica, verificarEstadoURL, etc permanecem iguais)

/**
 * Delegação de Eventos para Filtros de Navegação
 * Ajustado para capturar cliques nos IDs de categoria vindos do novo sistema de abas
 */
document.addEventListener('click', (e) => {
    const tag = e.target.closest('.filter-tag');
    if (tag) {
        // Se a tag tiver um id de seção (dataset.section ou o próprio ID de navegação)
        const secaoId = tag.dataset.section || tag.textContent.toLowerCase().trim();
        
        // Limpa ativos e marca o novo
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        
        carregarSecao(secaoId);
    }
});

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
    // Carrega manchetes por padrão ao abrir
    carregarSecao('manchetes');
    verificarEstadoURL();
});

window.carregarSecao = carregarSecao;
