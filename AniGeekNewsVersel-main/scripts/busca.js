/**
 * ARQUIVO: scripts/busca.js
 * PAPEL: Infraestrutura de Busca Global (Event-Driven)
 * VERSÃO: 7.0 - Contrato de Eventos e Integração com Router
 * * 📌 DEPENDÊNCIAS IMPLÍCITAS (Ponto 8):
 * - DOM: #input-busca-global
 * - DOM: #search-results-surface (Opcional)
 * - DOM: #search-suggestions-drawer (Opcional)
 * - Global: window.logVisual (Feedback)
 */

// 1. CONTRATO DE EVENTOS (Ponto 2)
// Isso garante que analises_principal.js e futebol_principal.js escutem o mesmo idioma
const EVENTS = {
    BUSCA_TERMO: 'busca:termo',
    BUSCA_LIMPAR: 'busca:limpar'
};

// 2. ESTADO INTERNO (Ponto 3)
const state = {
    timeout: null,
    termoAtual: "",
    isInitialized: false
};

// Cache de Elementos DOM
const DOM = {
    input: document.getElementById('input-busca-global'),
    surface: document.getElementById('search-results-surface'),
    drawer: document.getElementById('search-suggestions-drawer')
};

const log = (msg) => window.logVisual ? window.logVisual(`[Busca]: ${msg}`) : console.log(`[Busca]: ${msg}`);

/**
 * INICIALIZAÇÃO (Ponto 4)
 */
function inicializarBusca() {
    if (state.isInitialized || !DOM.input) return;

    DOM.input.addEventListener('input', handleInput);
    document.addEventListener('click', handleClickFora);

    state.isInitialized = true;
    log("Serviço de busca ativo.");
}

/**
 * LÓGICA DE INPUT (Debounce e Disparo)
 */
function handleInput(e) {
    clearTimeout(state.timeout);

    const termo = e.target.value.toLowerCase().trim();
    state.termoAtual = termo;

    // Caso 1: Busca vazia -> Limpa tudo
    if (!termo) {
        fecharInterfacesVisuais();
        dispararEvento(EVENTS.BUSCA_LIMPAR);
        return;
    }

    // Caso 2: Digitando -> Aguarda (Debounce)
    state.timeout = setTimeout(() => {
        log(`Disparando termo: "${termo}"`);
        dispararEvento(EVENTS.BUSCA_TERMO, { termo });
    }, 350);
}

/**
 * UTILITÁRIO DE DISPARO (Ponto 10)
 * Centraliza a emissão para garantir o formato do payload
 */
function dispararEvento(nomeEvento, dados = null) {
    const payload = dados ? { detail: dados } : undefined;
    window.dispatchEvent(new CustomEvent(nomeEvento, payload));
}

/**
 * GESTÃO DE UI
 */
function fecharInterfacesVisuais() {
    if (DOM.surface) {
        DOM.surface.innerHTML = '';
        DOM.surface.style.display = 'none';
    }
    if (DOM.drawer) {
        DOM.drawer.innerHTML = '';
        DOM.drawer.classList.remove('active');
    }
}

function handleClickFora(e) {
    // Fecha sugestões se clicar fora do input ou da gaveta
    const clicouNoInput = DOM.input.contains(e.target);
    const clicouNaGaveta = DOM.drawer?.contains(e.target);

    if (!clicouNoInput && !clicouNaGaveta) {
        if (DOM.drawer) DOM.drawer.classList.remove('active');
    }
}

/**
 * CAPACIDADE EXPOSTA (Ponto 10)
 * Esta função é chamada pelo Router (navegacao.js) ao trocar de aba
 */
window.limparBuscaGlobal = function () {
    if (!DOM.input) return;
    
    // Limpa visualmente
    DOM.input.value = '';
    state.termoAtual = '';
    
    // Limpa interfaces
    fecharInterfacesVisuais();
    
    // Avisa o sistema (reset de estado dos módulos)
    dispararEvento(EVENTS.BUSCA_LIMPAR);
};

// Inicialização automática (Singleton)
inicializarBusca();
