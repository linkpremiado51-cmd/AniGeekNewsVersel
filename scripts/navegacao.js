/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura e Navegação
 * MUDANÇA: Migração de Extração de Scripts para Carregamento de Módulos
 */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * Carrega dinamicamente o feed de uma seção usando o novo modelo de módulos
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    // Feedback visual de carregamento
    displayPrincipal.innerHTML = '<div style="text-align: center; padding: 120px; color: var(--text-muted); opacity: 0.5;">SINCRONIZANDO MÓDULO...</div>';
    
    try {
        // 1. Gerencia o CSS do Módulo
        gerenciarCSSDoModulo(nome);

        // 2. Carrega o HTML base (Shell) da seção
        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error("Estrutura da seção não encontrada.");
        
        const htmlBase = await response.text();
        displayPrincipal.innerHTML = htmlBase;

        // 3. Importa e Inicializa o Script do Módulo
        const scriptId = `script-modulo-${nome}`;
        document.getElementById(scriptId)?.remove(); // Limpa instância anterior

        const novoScript = document.createElement("script");
        novoScript.id = scriptId;
        novoScript.type = "module";
        novoScript.src = `./modulos/modulos_${nome}/${nome}_principal.js`;
        
        novoScript.onload = () => {
            // 4. Executa o contrato de inicialização
            if (typeof window.inicializarSecao === 'function') {
                const root = displayPrincipal.querySelector(`[data-root="${nome}"]`) || displayPrincipal;
                window.inicializarSecao(root, { modo: 'lista' });
            }
        };

        document.body.appendChild(novoScript);
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error(`Erro ao orquestrar seção ${nome}:`, err);
        displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro: Módulo ${nome} indisponível.</div>`;
    }
}

/**
 * Abre a notícia em página cheia, consumindo a inteligência do módulo correspondente.
 */
async function abrirNoticiaUnica(item) {
    if (!displayPrincipal) return;

    const origem = item.origem || 'manchetes';

    try {
        // 1. Carrega o CSS do Módulo
        gerenciarCSSDoModulo(origem);

        // 2. Prepara o layout de foco (Fundo branco/escuro com botão voltar)
        displayPrincipal.innerHTML = `
            <div class="foco-noticia-wrapper" style="animation: fadeIn 0.4s ease; max-width: var(--container-w); margin: 0 auto; padding: 20px;">
                <div class="barra-ferramentas-foco" style="display: flex; justify-content: flex-start; padding-bottom: 20px; border-bottom: 1px dashed var(--border); margin-bottom: 30px;">
                    <button onclick="window.voltarParaLista()" class="btn-voltar-estilizado" style="background: none; border: 1px solid var(--text-main); color: var(--text-main); padding: 8px 18px; font-size: 10px; font-weight: 800; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; text-transform: uppercase;">
                        <i class="fa-solid fa-chevron-left" style="font-size: 14px;"></i> 
                        <span>Voltar para ${origem.toUpperCase()}</span>
                    </button>
                </div>
                <div id="container-principal" data-root="${origem}">
                    <p style="text-align:center; padding:50px; color:var(--text-muted);">Preparando leitura...</p>
                </div>
            </div>
        `;

        // 3. Carrega o Módulo para renderizar apenas este item
        const scriptId = `script-modulo-${origem}`;
        document.getElementById(scriptId)?.remove();

        const scriptModulo = document.createElement("script");
        scriptModulo.id = scriptId;
        scriptModulo.type = "module";
        scriptModulo.src = `./modulos/modulos_${origem}/${origem}_principal.js`;

        scriptModulo.onload = () => {
            if (typeof window.inicializarSecao === 'function') {
                const root = document.getElementById('container-principal');
                // Passamos o item no contexto para o módulo saber que é "Foco Único"
                window.inicializarSecao(root, { modo: 'foco', item: item });
            }
        };

        document.body.appendChild(scriptModulo);
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error("Erro na ponte de foco:", err);
    }
}

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
function verificarLinkCompartilhado() {
    const params = new URLSearchParams(window.location.search);
    const idNoticia = params.get('id');

    if (idNoticia) {
        const checkData = setInterval(() => {
            if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
                const item = window.noticiasFirebase.find(n => n.id === idNoticia);
                if (item) {
                    if (typeof window.abrirModalNoticia === 'function') {
                        window.abrirModalNoticia(item);
                        carregarSecao('manchetes');
                    } else {
                        abrirNoticiaUnica(item);
                    }
                } else {
                    carregarSecao('manchetes');
                }
                clearInterval(checkData);
            }
        }, 100);
        setTimeout(() => clearInterval(checkData), 5000);
    }
}

/**
 * Retorna para a listagem da seção ativa
 */
window.voltarParaLista = function() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);

    const tagAtiva = document.querySelector('.filter-tag.active');
    const secaoDestino = tagAtiva ? tagAtiva.dataset.section : 'manchetes';
    
    carregarSecao(secaoDestino);
};

// Eventos de Filtros
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    });
});

window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
};

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
        verificarLinkCompartilhado();
    } else {
        carregarSecao('manchetes');
    }
});

window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
