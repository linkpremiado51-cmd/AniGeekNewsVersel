/**
 * ARQUIVO: comentarios_de_secao/comentarios_interface.js
 * PAPEL: Gerador de Interface Dinâmica para o Módulo de Comentários
 * VERSÃO: 6.1 - Fix de Performance (Sem Blur)
 */

export function injetarEstruturaModal() {
    if (document.getElementById('modal-comentarios-global')) return;

    // 🛡️ Adicionado style="backdrop-filter: none" direto no ID para matar o embaçado
    const modalHTML = `
        <div id="modal-comentarios-global" class="modal-comentarios-overlay" data-global-modal="true" style="backdrop-filter: none !important; -webkit-backdrop-filter: none !important;">
            <div class="modal-comentarios-content" data-global-modal="true">
                <div class="comentarios-header" data-global-modal="true">
                    <div class="header-label" data-global-modal="true">
                        <i class="fa-solid fa-circle-nodes" style="color: #8A2BE2;"></i>
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
                        <i class="fa-solid fa-spinner fa-spin" style="color:#8A2BE2; font-size:1.8rem;"></i>
                        <p style="margin-top:15px; opacity:0.6; font-size:11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Sincronizando mensagens...</p>
                    </div>
                </div>

                <div class="comentarios-footer" data-global-modal="true">
                    <div class="input-container-global" data-global-modal="true">
                        <input type="text" id="input-novo-comentario" placeholder="Escreva algo interessante..." autocomplete="off" data-global-modal="true">
                        <button id="btn-enviar-global" class="btn-enviar-comentario" data-global-modal="true">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (window.logVisual) window.logVisual("Interface: Modal injetado sem Blur.");
}

// ... restante das funções criarBalao e renderizar (mantidas)
