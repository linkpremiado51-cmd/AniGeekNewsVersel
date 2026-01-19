/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * PAPEL: Módulo de Análises Profundas
 * VERSÃO: 4.0 - Integrado ao Orquestrador SPA
 */

import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

let todasAsAnalisesLocais = [];
let noticiasExibidasCount = 5;

// --- CONTRATO DE INICIALIZAÇÃO (Exigido pelo navegacao.js) ---
window.inicializarSecao = function(containerRoot, contexto) {
    window.logVisual(`Módulo Análises iniciado em modo: ${contexto.modo}`);
    
    // Inicia a sincronização usando os dados globais ou escutando o Firebase
    iniciarIntegracao();
    carregarBlocoEditorial();
};

/**
 * Interface de Ações do Módulo
 */
window.analises = {
    ...Funcoes,
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) window.abrirModalNoticia(noticia);
    },
    toggleComentarios: (abrir, id = null) => {
        if (window.secaoComentarios && typeof window.secaoComentarios.abrir === 'function') {
            if (abrir) window.secaoComentarios.abrir(id);
            else window.secaoComentarios.fechar();
        }
    },
    carregarMaisNovo: () => {
        const totalNoBanco = todasAsAnalisesLocais.length;
        if (noticiasExibidasCount >= totalNoBanco) {
            window.logVisual(`Fim da lista.`);
        } else {
            noticiasExibidasCount += 5;
            atualizarInterface();
        }
    }
};

/**
 * Delegação de Eventos para elementos injetados dinamicamente
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
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    Interface.renderizarBotaoPaginacao();
}

/**
 * Sincronização Inteligente:
 * Prioriza o cache global do config-firebase.js para velocidade
 */
function iniciarIntegracao() {
    const filtrarEAtualizar = () => {
        if (window.noticiasFirebase) {
            todasAsAnalisesLocais = window.noticiasFirebase
                .filter(n => n.origem === 'analises')
                .sort((a, b) => (b.data || 0) - (a.data || 0));
            
            atualizarInterface();
        }
    };

    // Se os dados já existem no cache global, carrega imediatamente
    if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
        filtrarEAtualizar();
    }

    // Fica atento a novas atualizações que chegarem no Firebase global
    window.addEventListener('firebase:data_updated', filtrarEAtualizar);
}

// O bloco editorial pode ser buscado via fetch direto ou via instância global se preferir
async function carregarBlocoEditorial() {
    // Nota: Recomendo usar o db exportado do config-firebase para evitar inicialização dupla
    // Por hora, mantemos a lógica de visual apenas para o título
    const tituloEl = document.getElementById('capa-titulo');
    if (tituloEl) tituloEl.textContent = "Análises Profundas";
}

window.logVisual("Módulo de Análises Pronto para SPA.");
