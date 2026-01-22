/**
 * ARQUIVO: scripts/tema.js
 * PAPEL: Orquestrador de UI, Temas e Sincronização Cromática
 * VERSÃO: 9.0 - Suporte a Variáveis Dinâmicas e Router Sync
 */

(function() {
    /**
     * SISTEMA DE LOGS VISUAIS GLOBAIS
     * Útil para debug em mobile onde o console não é acessível.
     */
    window.logVisual = function(mensagem) {
        let container = document.getElementById('log-visual-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'log-visual-container';
            document.body.appendChild(container);
        }

        const entrada = document.createElement('div');
        entrada.className = 'log-entry';
        entrada.innerText = `> ${mensagem}`;
        container.prepend(entrada);

        setTimeout(() => {
            if (entrada.parentNode) entrada.remove();
        }, 5000);
    };

    const themeToggle = document.getElementById('mobileThemeToggle');

    /**
     * Alterna entre Light e Dark Mode
     * Ponto 7: Persistência de preferência
     */
    function alternarTema() {
        const isDark = document.body.classList.toggle('dark-mode');
        const modoAtivo = isDark ? 'dark' : 'light';
        
        localStorage.setItem('pref-theme', modoAtivo);
        
        // Dispara evento para que outros componentes (como gráficos) se ajustem
        window.dispatchEvent(new CustomEvent('ui:theme_changed', { detail: { theme: modoAtivo } }));
        
        if (window.logVisual) window.logVisual(`Modo ${modoAtivo} aplicado.`);
    }

    /**
     * Carrega a preferência salva ou respeita o sistema operacional
     */
    function inicializarTema() {
        const temaSalvo = localStorage.getItem('pref-theme');
        const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (temaSalvo === 'dark' || (!temaSalvo && prefereDark)) {
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.checked = true;
        }
    }

    /**
     * Lógica da Barra de Progresso e Botão Topo
     * Ponto 3: Feedback visual de leitura
     */
    function gerenciarScroll() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        const progressBar = document.getElementById("progress-bar");
        const btnTopo = document.getElementById("btn-voltar-topo");

        if (progressBar) {
            progressBar.style.width = scrolled + "%";
            // A cor da barra agora vem do --tema-cor definido no customizacao-abas.js
            progressBar.style.backgroundColor = 'var(--tema-cor, #8A2BE2)';
        }

        if (btnTopo) {
            btnTopo.style.display = winScroll > 300 ? "flex" : "none";
        }
    }

    // listeners
    if (themeToggle) {
        themeToggle.addEventListener('change', alternarTema);
    }

    window.addEventListener('scroll', gerenciarScroll, { passive: true });

    window.scrollToTop = function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Inicialização
    inicializarTema();
    if (window.logVisual) window.logVisual("Engine de UI v9.0 Ativa.");

})();
