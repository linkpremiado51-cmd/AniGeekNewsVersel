/**
 * ARQUIVO: comentarios_de_secao/comentarios_interface.js
 * PAPEL: Renderização e Injeção de UI de Comentários
 * VERSÃO: 9.0 - Injeção Dinâmica Multicontainer (Context-Aware)
 * * 📌 DEPENDÊNCIAS IMPLÍCITAS (Ponto 8):
 * - CSS: comentarios_estilo.css (Estilização dos balões)
 * - DOM: #comentarios-secao-integrada (Análises) ou #comentarios-futebol-integrada (Futebol)
 */

/**
 * Injeta a estrutura básica no container alvo da seção ativa
 * (Ponto 9 - Respeita a estrutura lógica do módulo pai)
 */
export function injetarEstruturaModal() {
    // 1. Tenta encontrar o container baseado na seção ativa (Ponto 3)
    // Buscamos primeiro por Análises, depois por Futebol
    const containerAlvo = document.getElementById('comentarios-secao-integrada') || 
                         document.getElementById('comentarios-futebol-integrada');
    
    if (!containerAlvo) {
        console.warn("[Interface Comentários] Nenhum container de integração localizado no DOM.");
        return;
    }

    // Ponto 6: Evita reinjeção se o modal já existir no container
    if (containerAlvo.querySelector('#modal-comentarios-global')) return;

    const modalHTML = `
        <div id="modal-comentarios-global" class="modal-comentarios-overlay" data-global-modal="true">
            <div class="modal-comentarios-content" data-global-modal="true">
                <div class="comentarios-header" data-global-modal="true">
                    <div class="header-label" data-global-modal="true">
                        <i class="fa-solid fa-circle-nodes" style="color: var(--tema-cor, #8A2BE2);"></i>
                        <div style="display: flex; flex-direction: column; margin-left: 10px;" data-global-modal="true">
                            <span id="comentarios-titulo-principal" style="font-weight:900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Comunidade</span>
                            <small id="comentarios-subtitulo" style="opacity:0.6; font-size:10px; font-weight: 600;">Discussão em tempo real</small>
                        </div>
                    </div>
                    <button id="btn-fechar-comentarios" class="btn-close-comentarios modal-close-trigger" aria-label="Fechar" data-global-modal="true">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div id="lista-comentarios-fluxo" class="comentarios-body" data-global-modal="true">
                    <div class="loader-comentarios" style="text-align:center; padding:60px 20px;" data-global-modal="true">
                        <i class="fa-solid fa-spinner fa-spin" style="color:var(--tema-cor, #8A2BE2); font-size:1.8rem;"></i>
                        <p style="margin-top:15px; opacity:0.6; font-size:11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Sincronizando mensagens...</p>
                    </div>
                </div>

                <div class="comentarios-footer" data-global-modal="true">
                    <div class="modal-comentarios-input-area" data-global-modal="true">
                        <div class="input-container-global" data-global-modal="true">
                            <input type="text" id="input-novo-comentario" placeholder="Escreva algo interessante..." autocomplete="off" data-global-modal="true">
                            <button id="btn-enviar-global" class="btn-enviar-comentario" data-global-modal="true">
                                <i class="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Injeção limpa sem destruir outros elementos do container
    containerAlvo.innerHTML = modalHTML;
    
    if (window.logVisual) window.logVisual("Interface: Canal de mensagens injetado no container.");
}

/**
 * Cria o balão de comentário (Ponto 9 - HTML Semântico)
 */
export function criarBalaoComentario(autor, texto) {
    const nomeExibicao = autor || "Leitor Geek";
    const letra = nomeExibicao.charAt(0).toUpperCase();
    
    return `
        <div class="comentario-item" data-global-modal="true">
            <div class="comentario-avatar" data-global-modal="true">
                ${letra}
            </div>
            <div class="comentario-texto-wrapper" data-global-modal="true">
                <strong class="comentario-autor" data-global-modal="true">${nomeExibicao}</strong>
                <p class="comentario-texto" data-global-modal="true">${texto}</p>
            </div>
        </div>
    `;
}

/**
 * Renderiza a lista completa
 */
export function renderizarListaComentarios(comentarios) {
    const listaContainer = document.getElementById('lista-comentarios-fluxo');
    if (!listaContainer) return;

    if (!comentarios || comentarios.length === 0) {
        listaContainer.innerHTML = `
            <div class="vazio-comentarios" style="text-align:center; padding:80px 20px; opacity:0.3;" data-global-modal="true">
                <i class="fa-solid fa-comments-slash" style="font-size:3rem; margin-bottom:15px; display:block;"></i>
                <p style="font-size:0.9rem; font-weight:800; text-transform: uppercase; letter-spacing: 1px;">Silêncio no set...<br>Seja o primeiro a comentar!</p>
            </div>`;
        return;
    }

    listaContainer.innerHTML = comentarios
        .map(c => criarBalaoComentario(c.autor, c.texto))
        .join('');

    // Scroll Suave (Ponto 3 - UX)
    // Verificamos se o container ainda existe após o micro-delay do Firebase
    requestAnimationFrame(() => {
        const checkContainer = document.getElementById('lista-comentarios-fluxo');
        if (checkContainer) {
            checkContainer.scrollTo({ 
                top: checkContainer.scrollHeight, 
                behavior: 'smooth' 
            });
        }
    });
}
