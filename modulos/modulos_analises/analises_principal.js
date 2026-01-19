/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * PAPEL: Módulo de Análises Profundas
 * VERSÃO: 4.3 - Correção de Paginação e Integração de Busca
 */

import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

let todasAsAnalisesLocais = [];
let analisesFiltradas = []; 
let noticiasExibidasCount = 5;
let termoBuscaAtivo = ""; 

// Fallback para log
const log = (msg) => window.logVisual ? window.logVisual(msg) : console.log(`[Análises]: ${msg}`);

// --- CONTRATO DE INICIALIZAÇÃO ---
window.inicializarSecao = function(containerRoot, contexto) {
    log(`Módulo Análises iniciado.`);
    
    iniciarIntegracao();
    configurarEscutaBusca(); 
    carregarBlocoEditorial();
};

/**
 * Interface de Ações do Módulo
 */
window.analises = {
    ...Funcoes,
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            window.abrirModalNoticia({
                ...noticia,
                lista: todasAsAnalisesLocais 
            });
        }
    },
    toggleComentarios: (abrir, id = null) => {
        if (window.secaoComentarios && typeof window.secaoComentarios.abrir === 'function') {
            if (abrir) window.secaoComentarios.abrir(id);
            else window.secaoComentarios.fechar();
        }
    },
    carregarMaisNovo: () => {
        const listaAtual = termoBuscaAtivo ? analisesFiltradas : todasAsAnalisesLocais;
        const totalDisponivel = listaAtual.length;
        
        if (noticiasExibidasCount >= totalDisponivel) {
            log(`Fim dos resultados.`);
        } else {
            noticiasExibidasCount += 5;
            atualizarInterface();
            log(`Mostrando mais 5...`);
        }
    }
};

/**
 * INTEGRAÇÃO COM BUSCA GLOBAL
 */
function configurarEscutaBusca() {
    window.addEventListener('busca:termo', (e) => {
        termoBuscaAtivo = e.detail.termo.toLowerCase();
        log(`Busca detectada: ${termoBuscaAtivo}`);
        processarFiltro();
    });

    window.addEventListener('busca:limpar', () => {
        termoBuscaAtivo = "";
        processarFiltro();
    });
}

function processarFiltro() {
    if (!termoBuscaAtivo) {
        analisesFiltradas = [];
    } else {
        analisesFiltradas = todasAsAnalisesLocais.filter(n => 
            (n.titulo && n.titulo.toLowerCase().includes(termoBuscaAtivo)) ||
            (n.subtitulo && n.subtitulo.toLowerCase().includes(termoBuscaAtivo)) ||
            (n.categoria && n.categoria.toLowerCase().includes(termoBuscaAtivo))
        );
    }
    
    noticiasExibidasCount = 5; 
    atualizarInterface();
}

/**
 * Delegação de Eventos (Ajustada para os novos IDs)
 */
document.addEventListener('click', (e) => {
    // Escuta tanto o ID antigo quanto a nova classe de paginação
    const btnMais = e.target.closest('#btn-carregar-mais') || e.target.closest('.btn-paginacao-geek');
    if (btnMais) {
        e.preventDefault();
        window.analises.carregarMaisNovo();
    }

    const triggerComentarios = e.target.closest('.comments-trigger-bar');
    if (triggerComentarios) {
        const artigo = triggerComentarios.closest('article');
        const idNoticia = artigo ? artigo.id.replace('artigo-', '') : null;
        if (idNoticia) window.analises.toggleComentarios(true, idNoticia);
    }
});

function atualizarInterface() {
    const dadosParaExibir = termoBuscaAtivo ? analisesFiltradas : todasAsAnalisesLocais;
    
    // Passa os dados para a interface renderizar nos containers corretos
    Interface.renderizarNoticias(dadosParaExibir, noticiasExibidasCount);
    Interface.renderizarBotaoPaginacao(dadosParaExibir.length, noticiasExibidasCount);
}

function iniciarIntegracao() {
    const filtrarEAtualizar = () => {
        if (window.noticiasFirebase) {
            todasAsAnalisesLocais = window.noticiasFirebase
                .filter(n => n.origem === 'analises')
                .sort((a, b) => (b.data || 0) - (a.data || 0));
            
            if (termoBuscaAtivo) processarFiltro();
            else atualizarInterface();
        }
    };

    if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
        filtrarEAtualizar();
    }

    window.addEventListener('firebase:data_updated', filtrarEAtualizar);
}

async function carregarBlocoEditorial() {
    const tituloEl = document.getElementById('capa-titulo');
    if (tituloEl) tituloEl.textContent = "Análises Profundas";
    
    const descEl = document.getElementById('capa-descricao');
    if (descEl) descEl.textContent = "Críticas técnicas e opiniões sobre os maiores lançamentos.";
}

log("Módulo de Análises Sincronizado.");
