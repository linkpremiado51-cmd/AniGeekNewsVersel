/**
 * ARQUIVO: scripts/auth.js
 * PAPEL: Gerenciador de Identidade e Sessão (Singleton)
 * VERSÃO: 3.0 - API Unificada e Eventos Padronizados
 * * 📌 DEPENDÊNCIAS IMPLÍCITAS (Ponto 8):
 * - DOM: #area-usuario (Container para renderizar info do usuário)
 * - LocalStorage: 'anigeek_user' (Persistência)
 * - Global: window.logVisual (Opcional - Log)
 */

// 1. CONTRATO DE EVENTOS (Ponto 2)
// Define a linguagem oficial de autenticação para todo o sistema
const EVENTS = {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    STATE_CHANGE: 'auth:state_changed' // Novo: para reações genéricas de UI
};

// 2. ESTADO CRÍTICO (Ponto 7)
const state = {
    user: null,
    isInitialized: false
};

const DOM = {
    areaUsuario: null // Será capturado no init
};

const log = (msg) => window.logVisual ? window.logVisual(`[Auth]: ${msg}`) : console.log(`[Auth]: ${msg}`);

/**
 * INICIALIZAÇÃO
 */
function inicializarAuth() {
    if (state.isInitialized) return;

    DOM.areaUsuario = document.getElementById('area-usuario');
    
    // Tenta recuperar sessão salva
    recuperarSessao();
    
    // Configura escutas globais (para login via modal ou outras fontes)
    document.addEventListener(EVENTS.LOGIN, (e) => window.auth.login(e.detail));
    document.addEventListener(EVENTS.LOGOUT, () => window.auth.logout());
    
    state.isInitialized = true;
    log("Sistema de identidade pronto.");
}

/**
 * LÓGICA DE SESSÃO
 */
function recuperarSessao() {
    const userSalvo = localStorage.getItem('anigeek_user');
    if (userSalvo) {
        try {
            const user = JSON.parse(userSalvo);
            atualizarEstado(user);
        } catch (e) {
            console.error("[Auth] Sessão corrompida. Limpando.", e);
            window.auth.logout();
        }
    } else {
        renderizarInterface(null);
    }
}

function atualizarEstado(user) {
    state.user = user;
    
    // 🛡️ Mantém compatibilidade legada (se outros scripts usarem essa var direta)
    window.AniGeekUser = user; 
    
    if (user) {
        localStorage.setItem('anigeek_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('anigeek_user');
    }

    renderizarInterface(user);
}

/**
 * RENDERIZAÇÃO DE UI
 */
function renderizarInterface(user) {
    // Se o DOM ainda não existe (ex: carregamento muito rápido), tenta buscar novamente
    if (!DOM.areaUsuario) DOM.areaUsuario = document.getElementById('area-usuario');
    if (!DOM.areaUsuario) return;

    if (!user) {
        // Estado: Deslogado
        DOM.areaUsuario.innerHTML = `
            <a href="acesso.html" class="link-login">
                <i class="fa-solid fa-user-plus"></i> Entrar
            </a>
        `;
    } else {
        // Estado: Logado
        const nomeExibicao = user.nome || user.email?.split('@')[0] || 'Visitante';
        
        DOM.areaUsuario.innerHTML = `
            <div class="usuario-logado">
                <div class="usuario-info">
                    <span class="usuario-nome">${nomeExibicao}</span>
                </div>
                <button class="logout-btn" id="btn-auth-logout" title="Sair da conta">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            </div>
        `;

        // Bind do botão de logout recém-criado
        document.getElementById('btn-auth-logout')?.addEventListener('click', () => {
            window.auth.logout();
        });
    }
}

/**
 * CAPACIDADES EXPOSTAS (Ponto 10)
 * A única forma oficial de interagir com a autenticação
 */
window.auth = {
    // Realiza o login, salva estado e notifica o sistema
    login: (userData) => {
        log(`Usuário autenticado: ${userData.email}`);
        atualizarEstado(userData);
        // Dispara evento apenas se não foi um evento que originou a chamada (evita loop)
        // Mas como é setters, vamos garantir que a UI global saiba
        window.dispatchEvent(new CustomEvent(EVENTS.STATE_CHANGE, { detail: userData }));
    },

    // Realiza logout, limpa estado e notifica
    logout: () => {
        log("Encerrando sessão.");
        atualizarEstado(null);
        window.dispatchEvent(new CustomEvent(EVENTS.LOGOUT)); // Notifica módulos (ex: Comentários)
    },

    // Getters seguros
    getUser: () => state.user,
    isLogged: () => !!state.user
};

// Inicialização automática ao carregar o script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAuth);
} else {
    inicializarAuth();
}
