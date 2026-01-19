/* scripts/tema.js */

/**
 * SISTEMA DE LOGS VISUAIS GLOBAIS
 * Esta função cria mensagens temporárias na tela para debug em dispositivos móveis.
 */
window.logVisual = function(mensagem) {
    let container = document.getElementById('log-visual-container');
    
    // Se o container não existir (definido no geral.css), cria ele dinamicamente
    if (!container) {
        container = document.createElement('div');
        container.id = 'log-visual-container';
        document.body.appendChild(container);
    }

    const entrada = document.createElement('div');
    entrada.className = 'log-entry';
    entrada.innerText = `> ${mensagem}`;
    
    // Adiciona no topo do container
    container.prepend(entrada);

    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (entrada.parentNode) {
            entrada.remove();
        }
    }, 5000);
};

// Seleção dos elementos de alternância de tema
const themeToggle = document.getElementById('mobileThemeToggle');

// Função para aplicar o tema e salvar a preferência
function alternarTema() {
    document.body.classList.toggle('dark-mode');
    
    // Salva a escolha do usuário no navegador
    const modoAtivo = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('pref-theme', modoAtivo);
    
    if (window.logVisual) window.logVisual(`Tema alterado para: ${modoAtivo}`);
}

// Escuta o clique no interruptor (toggle)
if (themeToggle) {
    themeToggle.addEventListener('change', alternarTema);
}

// Verifica se o usuário já tinha uma preferência salva ao carregar a página
function carregarTemaPreferido() {
    const temaSalvo = localStorage.getItem('pref-theme');
    
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    }
}

// Lógica da Barra de Progresso no topo (Scrolled)
window.onscroll = function() {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = (winScroll / height) * 100;
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
        progressBar.style.width = scrolled + "%";
    }
};

// Lógica do botão de voltar ao topo
window.scrollToTop = function() {
    window.scrollTo({top: 0, behavior: 'smooth'});
};

// Inicializa o tema e avisa o sistema
carregarTemaPreferido();
if (window.logVisual) window.logVisual("Sistema de UI Inicializado.");
