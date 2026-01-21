/**
 * ARQUIVO: scripts/auth.js
 * PAPEL: Gerenciador de Estado Global (User & Auth)
 * VERSÃO: 2.0.0 - Fonte da Verdade para a SPA
 */

(function () {

    // 🛡️ Inicializa o Estado Global se não existir
    window.AniGeek = window.AniGeek || {};

    /**
     * Tenta recuperar o usuário do LocalStorage para manter a sessão
     */
    function recuperarSessao() {
        const userSalvo = localStorage.getItem('anigeek_user');
        if (userSalvo) {
            try {
                window.AniGeekUser = JSON.parse(userSalvo);
            } catch (e) {
                console.error("Erro ao processar sessão salva.");
                window.AniGeekUser = null;
            }
        }
    }

    function renderUsuarioDeslogado() {
        const areaUsuario = document.getElementById('area-usuario');
        if (!areaUsuario) return;

        areaUsuario.innerHTML = `
            <a href="acesso.html" class="link-login">
                <i class="fa-solid fa-user-plus"></i> Entrar / Criar conta
            </a>
        `;
    }

    function renderUsuarioLogado(user) {
        const areaUsuario = document.getElementById('area-usuario');
        if (!areaUsuario) return;

        const nome = user.nome || user.email?.split('@')[0] || 'Usuário';

        areaUsuario.innerHTML = `
            <div class="usuario-logado">
                <div class="usuario-info">
                    <span class="usuario-nome">${nome}</span>
                </div>
                <button class="logout-btn" id="btnLogout" title="Sair da conta">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            </div>
        `;

        document.getElementById('btnLogout')?.addEventListener('click', () => {
            window.AniGeekLogout();
        });
    }

    /**
     * API GLOBAL DE LOGOUT
     * Centraliza a limpeza para que todos os módulos saibam que o user saiu.
     */
    window.AniGeekLogout = function() {
        if (window.logVisual) window.logVisual("Encerrando sessão...");
        
        localStorage.removeItem('anigeek_user');
        window.AniGeekUser = null;
        
        // Dispara evento para outros módulos reagirem (ex: limpar área de comentários)
        document.dispatchEvent(new CustomEvent('user:logout'));
    };

    function aplicarEstadoInicial() {
        recuperarSessao();
        if (window.AniGeekUser) {
            renderUsuarioLogado(window.AniGeekUser);
        } else {
            renderUsuarioDeslogado();
        }
    }

    // --- ESCUTADORES DE EVENTOS DE ESTADO ---

    document.addEventListener('user:login', (e) => {
        const user = e.detail;
        window.AniGeekUser = user;
        localStorage.setItem('anigeek_user', JSON.stringify(user));
        renderUsuarioLogado(user);
    });

    document.addEventListener('user:logout', () => {
        renderUsuarioDeslogado();
    });

    // Inicia o estado assim que o DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', aplicarEstadoInicial);
    } else {
        aplicarEstadoInicial();
    }

})();
