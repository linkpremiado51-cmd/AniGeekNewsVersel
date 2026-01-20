/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * PAPEL: Módulo de Análises Profundas
 * VERSÃO: 4.4 - Limpeza de Listeners e Proteção de Modal Global
 */

import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

let todasAsAnalisesLocais = [];
let analisesFiltradas = []; 
let noticiasExibidasCount = 5;
let termoBuscaAtivo = ""; 

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
    // 🛡️ Ajustado para usar apenas a API global do secaoComentarios
    toggleComentarios: (abrir, id = null) => {
        if (window.secaoComentarios) {
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
        }
    }
};

/**
 * INTEGRAÇÃO COM BUSCA GLOBAL
 */
function configurarEscutaBusca() {
    window.addEventListener('busca:termo', (e) => {
        termoBuscaAtivo = e.detail.termo.toLowerCase();
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
            (n.subtitulo && n.subtitulo.toLowerCase().includes(termoBuscaAtivo))
        );
    }
    noticiasExibidasCount = 5; 
    atualizarInterface();
}

/**
 * DELEGAÇÃO DE EVENTOS LOCALIZADA
 * 🛡️ Protegido contra conflitos com o Modal Global
 */
document.addEventListener('click', (e) => {
    const target = e.target;

    // 1. Botão Carregar Mais
    const btnMais = target.closest('.btn-paginacao-geek');
    if (btnMais) {
        e.preventDefault();
        window.analises.carregarMaisNovo();
        return;
    }

    // 2. Abrir Comentários (Apenas se NÃO estiver clicando dentro do modal)
    if (target.closest('.comments-trigger-bar') && !target.closest('[data-global-modal="true"]')) {
        const artigo = target.closest('article');
        const idNoticia = artigo ? artigo.id.replace('artigo-', '') : null;
        if (idNoticia) {
            log(`Abrindo comentários para ${idNoticia}`);
            window.analises.toggleComentarios(true, idNoticia);
        }
    }
});

function atualizarInterface() {
    const dadosParaExibir = termoBuscaAtivo ? analisesFiltradas : todasAsAnalisesLocais;
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
    if (window.noticiasFirebase && window.noticiasFirebase.length > 0) filtrarEAtualizar();
    window.addEventListener('firebase:data_updated', filtrarEAtualizar);
}

async function carregarBlocoEditorial() {
    const tituloEl = document.getElementById('capa-titulo');
    if (tituloEl) tituloEl.textContent = "Análises Profundas";
}
