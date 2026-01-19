/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * PAPEL: Módulo de Análises Profundas
 * VERSÃO: 4.2 - INTEGRADO COM BUSCA GLOBAL (EVENT-DRIVEN)
 */

import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

let todasAsAnalisesLocais = [];
let analisesFiltradas = []; // Nova variável para busca
let noticiasExibidasCount = 5;
let termoBuscaAtivo = ""; // Cache do termo atual

// Fallback para log caso a função global não exista
const log = (msg) => window.logVisual ? window.logVisual(msg) : console.log(`[Análises]: ${msg}`);

// --- CONTRATO DE INICIALIZAÇÃO (Exigido pelo navegacao.js) ---
window.inicializarSecao = function(containerRoot, contexto) {
    log(`Módulo Análises iniciado em modo: ${contexto.modo}`);
    
    // Inicia a sincronização e escutas de eventos
    iniciarIntegracao();
    configurarEscutaBusca(); // Ativa a integração com scripts/busca.js
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
            log(`Fim da lista.`);
        } else {
            noticiasExibidasCount += 5;
            atualizarInterface();
        }
    }
};

/**
 * INTEGRAÇÃO COM BUSCA GLOBAL (scripts/busca.js)
 */
function configurarEscutaBusca() {
    // Escuta termo de busca
    window.addEventListener('busca:termo', (e) => {
        termoBuscaAtivo = e.detail.termo.toLowerCase();
        processarFiltro();
    });

    // Escuta comando de limpar
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
            (n.conteudo && n.conteudo.toLowerCase().includes(termoBuscaAtivo))
        );
    }
    
    // Resetamos a paginação ao buscar para mostrar os primeiros resultados
    noticiasExibidasCount = 5; 
    atualizarInterface();
}

/**
 * Delegação de Eventos
 */
document.addEventListener('click', (e) => {
    const btnMais = e.target.closest('#btn-carregar-mais');
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
    // Se houver busca ativa, renderiza a lista filtrada, senão a lista completa
    const dadosParaExibir = termoBuscaAtivo ? analisesFiltradas : todasAsAnalisesLocais;
    
    Interface.renderizarNoticias(dadosParaExibir, noticiasExibidasCount);
    Interface.renderizarBotaoPaginacao();
}

function iniciarIntegracao() {
    const filtrarEAtualizar = () => {
        if (window.noticiasFirebase) {
            todasAsAnalisesLocais = window.noticiasFirebase
                .filter(n => n.origem === 'analises')
                .sort((a, b) => (b.data || 0) - (a.data || 0));
            
            // Se houver uma busca em andamento quando os dados chegarem, re-filtra
            if (termoBuscaAtivo) processarFiltro();
            else atualizarInterface();
        }
    };

    if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
        filtrarEAtualizar();
    }

    window.addEventListener('firebase:data_updated', filtrarEAtualizar);
    
    const checkData = setInterval(() => {
        if (todasAsAnalisesLocais.length === 0 && window.noticiasFirebase?.length > 0) {
            filtrarEAtualizar();
            clearInterval(checkData);
        }
    }, 500);
    setTimeout(() => clearInterval(checkData), 5000);
}

async function carregarBlocoEditorial() {
    const tituloEl = document.getElementById('capa-titulo');
    if (tituloEl) tituloEl.textContent = "Análises Profundas";
    
    const descEl = document.getElementById('capa-descricao');
    if (descEl) descEl.textContent = "Críticas técnicas, teorias e opiniões sobre os maiores lançamentos.";
}

log("Módulo de Análises Pronto e Integrado com Busca.");
