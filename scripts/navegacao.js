/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura e Navegação (Modelo Modular)
 * ARQUITETO: Revisado para garantir Contrato de Janela e Delegação de Eventos.
 */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * Carrega dinamicamente o feed de uma seção orquestrando CSS, HTML e Módulo JS.
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    // Feedback visual padrão do sistema
    displayPrincipal.innerHTML = `
        <div style="text-align: center; padding: 120px; color: var(--text-muted); opacity: 0.5;">
            <i class="fa-solid fa-sync fa-spin" style="font-size: 2rem; margin-bottom: 15px; display: block;"></i>
            <span>SINCRONIZANDO MÓDULO...</span>
        </div>`;
    
    try {
        // 1. Limpa o contrato anterior para evitar execução de lixo de memória
        window.inicializarSecao = null;

        // 2. Gerencia o CSS do Módulo (Isolamento Visual)
        gerenciarCSSDoModulo(nome);

        // 3. Carrega o HTML base (Shell) da seção
        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error("Estrutura da seção não encontrada.");
        
        const htmlBase = await response.text();
        displayPrincipal.innerHTML = htmlBase;

        // 4. Injeta o Script do Módulo (Encapsulamento via type="module")
        const scriptId = `script-modulo-ativo`;
        document.getElementById(scriptId)?.remove(); 

        const novoScript = document.createElement("script");
        novoScript.id = scriptId;
        novoScript.type = "module";
        // Adicionamos um timestamp para evitar cache agressivo durante o desenvolvimento
        novoScript.src = `./modulos/modulos_${nome}/${nome}_principal.js?v=${new Date().getTime()}`;
        
        novoScript.onload = () => {
            /**
             * CONTRATO OBRIGATÓRIO: O módulo DEVE expor window.inicializarSecao.
             * Passamos o rootElement e o contexto da navegação.
             */
            if (typeof window.inicializarSecao === 'function') {
                const root = displayPrincipal.querySelector(`[data-root="${nome}"]`) || displayPrincipal;
                window.inicializarSecao(root, { modo: 'lista', origem: nome });
            } else {
                console.error(`ERRO DE CONTRATO: O módulo ${nome} não expôs window.inicializarSecao.`);
            }
        };

        document.body.appendChild(novoScript);
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error(`Erro na orquestração:`, err);
        displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">Erro: Módulo ${nome} indisponível no momento.</div>`;
    }
}

/**
 * Abre a notícia em visualização de foco, reutilizando o módulo de origem.
 */
async function abrirNoticiaUnica(item) {
    if (!displayPrincipal) return;
    const origem = item.origem || 'manchetes';

    try {
        window.inicializarSecao = null;
        gerenciarCSSDoModulo(origem);

        displayPrincipal.innerHTML = `
            <div class="foco-noticia-wrapper" style="animation: fadeIn 0.4s ease; max-width: var(--container-w); margin: 0 auto; padding: 20px;">
                <div class="barra-ferramentas-foco" style="display: flex; justify-content: flex-start; padding-bottom: 20px; border-bottom: 1px dashed var(--border); margin-bottom: 30px;">
                    <button onclick="window.voltarParaLista()" class="btn-voltar-estilizado">
                        <i class="fa-solid fa-chevron-left"></i> 
                        <span>Voltar para ${origem.toUpperCase()}</span>
                    </button>
                </div>
                <div id="container-principal-foco" data-root="${origem}">
                    <p style="text-align:center; padding:50px; color:var(--text-muted);">Preparando leitura...</p>
                </div>
            </div>
        `;

        const scriptId = `script-modulo-ativo`;
        document.getElementById(scriptId)?.remove();

        const scriptModulo = document.createElement("script");
        scriptModulo.id = scriptId;
        scriptModulo.type = "module";
        scriptModulo.src = `./modulos/modulos_${origem}/${origem}_principal.js`;

        scriptModulo.onload = () => {
            if (typeof window.inicializarSecao === 'function') {
                const root = document.getElementById('container-principal-foco');
                // CONTRATO: Modo Foco envia o item específico para renderização única
                window.inicializarSecao(root, { modo: 'foco', item: item });
            }
        };

        document.body.appendChild(scriptModulo);
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error("Falha na ponte de renderização de foco:", err);
    }
}

/**
 * Troca o CSS da página de forma atômica
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
 * Link Compartilhado: Polling seguro para sincronização com Firebase Global
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
 * Gerenciamento de URL e histórico
 */
window.voltarParaLista = function() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);

    const tagAtiva = document.querySelector('.filter-tag.active');
    const secaoDestino = tagAtiva ? tagAtiva.dataset.section : 'manchetes';
    carregarSecao(secaoDestino);
};

// --- DELEGAÇÃO DE EVENTOS (Correção Arquetural) ---
document.addEventListener('click', (e) => {
    const tag = e.target.closest('.filter-tag');
    if (tag) {
        document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    }
});

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
        verificarLinkCompartilhado();
    } else {
        carregarSecao('manchetes');
    }
});

// Exportação de segurança
window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
