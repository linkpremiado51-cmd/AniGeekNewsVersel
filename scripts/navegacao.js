/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador de Infraestrutura e Navegação (SPA)
 * VERSÃO: 2.0 - Final Blindada (Módulos, Histórico e Validações)
 */

const displayPrincipal = document.getElementById('conteudo_de_destaque');

/**
 * Função Utilitária para Scroll Suave
 */
function scrollTopo() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Carrega dinamicamente o feed de uma seção orquestrando CSS, HTML e Módulo JS.
 */
async function carregarSecao(nome) {
    if (!displayPrincipal) return;

    // Feedback visual de carregamento
    displayPrincipal.innerHTML = `
        <div style="text-align: center; padding: 120px; color: var(--text-muted); opacity: 0.5;">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
            <br>SINCRONIZANDO MÓDULO...
        </div>`;
    
    try {
        // 1. Limpa o contrato anterior para garantir isolamento
        window.inicializarSecao = null;

        // 2. Gerencia o CSS do Módulo (Isolamento Visual)
        gerenciarCSSDoModulo(nome);

        // 3. Carrega o HTML base (Shell) da seção
        const response = await fetch(`./secoes/${nome}.html`);
        if (!response.ok) throw new Error("Estrutura da seção não encontrada.");
        
        const htmlBase = await response.text();
        displayPrincipal.innerHTML = htmlBase;

        // 4. Importa e Inicializa o Script do Módulo
        const scriptId = `script-modulo-ativo`;
        document.getElementById(scriptId)?.remove(); 

        const novoScript = document.createElement("script");
        novoScript.id = scriptId;
        novoScript.type = "module";
        novoScript.src = `./modulos/modulos_${nome}/${nome}_principal.js?v=${Date.now()}`;
        
        novoScript.onload = () => {
            // 5. Executa o contrato de inicialização com Verificação de Contêiner
            if (typeof window.inicializarSecao === 'function') {
                const root = displayPrincipal.querySelector(`[data-root="${nome}"]`) || displayPrincipal;
                
                if (!root.hasAttribute('data-root')) {
                    console.warn(`Módulo ${nome} não possui data-root explícito no HTML. Usando fallback.`);
                }

                window.inicializarSecao(root, { modo: 'lista', origem: nome });
            } else {
                console.error(`Contrato falhou: window.inicializarSecao não definida em ${nome}`);
            }
        };

        document.body.appendChild(novoScript);
        scrollTopo();

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

    // Validação de Segurança (Correção 1)
    if (!item || !item.id) {
        console.error('abrirNoticiaUnica chamado com item inválido:', item);
        return;
    }

    const origem = item.origem || 'manchetes';

    // Atualização de URL/Histórico para Deep Linking (Correção 2)
    const url = new URL(window.location);
    url.searchParams.set('id', item.id);
    window.history.pushState({ id: item.id }, '', url);

    try {
        window.inicializarSecao = null; 
        gerenciarCSSDoModulo(origem);

        displayPrincipal.innerHTML = `
            <div class="foco-noticia-wrapper" style="animation: fadeIn 0.4s ease; max-width: var(--container-w); margin: 0 auto; padding: 20px;">
                <div class="barra-ferramentas-foco" style="display: flex; justify-content: flex-start; padding-bottom: 20px; border-bottom: 1px dashed var(--border); margin-bottom: 30px;">
                    <button onclick="window.voltarParaLista()" class="btn-voltar-estilizado" style="background: none; border: 1px solid var(--text-main); color: var(--text-main); padding: 8px 18px; font-size: 10px; font-weight: 800; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; text-transform: uppercase;">
                        <i class="fa-solid fa-chevron-left" style="font-size: 14px;"></i> 
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
        scriptModulo.src = `./modulos/modulos_${origem}/${origem}_principal.js?v=${Date.now()}`;

        scriptModulo.onload = () => {
            if (typeof window.inicializarSecao === 'function') {
                const root = document.getElementById('container-principal-foco');
                window.inicializarSecao(root, { modo: 'foco', item: item });
            }
        };

        document.body.appendChild(scriptModulo);
        scrollTopo();

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
 * Retorna para a listagem da seção ativa e limpa URL
 */
window.voltarParaLista = function() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);

    const tagAtiva = document.querySelector('.filter-tag.active');
    const secaoDestino = tagAtiva ? tagAtiva.dataset.section : 'manchetes';
    
    carregarSecao(secaoDestino);
};

/**
 * Sincronização com botões Voltar / Avançar do navegador (POPSTATE)
 */
window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id && window.noticiasFirebase) {
        const item = window.noticiasFirebase.find(n => n.id === id);
        if (item) {
            abrirNoticiaUnica(item);
            return;
        }
    }

    const tagAtiva = document.querySelector('.filter-tag.active');
    const secao = tagAtiva ? tagAtiva.dataset.section : 'manchetes';
    carregarSecao(secao);
});

/**
 * Delegação de Eventos para Filtros
 */
document.addEventListener('click', (e) => {
    const tag = e.target.closest('.filter-tag');
    if (tag) {
        document.querySelectorAll('.filter-tag.active').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        carregarSecao(tag.dataset.section);
    }
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

// Exposição global
window.carregarSecao = carregarSecao;
window.abrirNoticiaUnica = abrirNoticiaUnica;
