/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * PAPEL: Módulo Global Autônomo de Comentários
 * VERSÃO: 6.3 - Produção (Sem Alertas) + Injeção no Body
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

// --- INICIALIZAÇÃO DA API GLOBAL ---
window.secaoComentarios = {
    abrir: (id) => {
        if (window.logVisual) window.logVisual(`[API] Abrindo modal para: ${id}`);
        
        let modal = document.getElementById('modal-comentarios-global');
        if (!modal) {
            Interface.injetarEstruturaModal();
            modal = document.getElementById('modal-comentarios-global');
            configurarListenersLocais(modal);
        }
        
        Funcoes.toggleComentarios(true, id);
        carregarComentariosRealTime(id);
    },
    fechar: () => {
        if (window.logVisual) window.logVisual("[API] Fechando modal.");
        if (unsubscribeAtual) unsubscribeAtual();
        idConteudoAtual = null;
        
        if (Funcoes.toggleComentarios) {
            Funcoes.toggleComentarios(false);
        }
    },
    enviar: () => enviarComentario()
};

const firebaseConfig = {
    apiKey: "AIzaSyBC_ad4X9OwCHKvcG_pNQkKEl76Zw2tu6o",
    authDomain: "anigeeknews.firebaseapp.com",
    projectId: "anigeeknews",
    storageBucket: "anigeeknews.firebasestorage.app",
    messagingSenderId: "769322939926",
    appId: "1:769322939926:web:6eb91a96a3f74670882737"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let unsubscribeAtual = null;
let idConteudoAtual = null;

/**
 * CONFIGURAÇÃO DE LISTENERS LOCAIS (Isolamento de Eventos)
 */
function configurarListenersLocais(modalElement) {
    if (!modalElement) return;

    modalElement.addEventListener('click', (e) => {
        const target = e.target;
        
        // Identifica botões de fechar ou clique no overlay (fundo escuro)
        const fecharAcionado = target.closest('.modal-close-trigger') || 
                               target.closest('#btn-fechar-comentarios') ||
                               target.classList.contains('modal-comentarios-overlay');

        if (fecharAcionado) {
            e.preventDefault();
            e.stopPropagation(); // Impede o "borbulhamento" para o orquestrador SPA
            window.secaoComentarios.fechar();
            return;
        }

        // Identifica clique no botão de enviar
        if (target.closest('#btn-enviar-comentario') || target.closest('#btn-enviar-global')) {
            e.preventDefault();
            e.stopPropagation();
            window.secaoComentarios.enviar();
        }
    });

    // Listener para o campo de texto
    const input = modalElement.querySelector('#input-novo-comentario');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.secaoComentarios.enviar();
            }
        });
    }
}

async function carregarComentariosRealTime(idConteudo) {
    if (unsubscribeAtual) unsubscribeAtual();
    idConteudoAtual = idConteudo;

    const colRef = collection(db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    unsubscribeAtual = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        Interface.renderizarListaComentarios(comentarios);
    }, (error) => {
        if (window.logVisual) window.logVisual("❌ Erro Firebase: " + error.code);
    });
}

async function enviarComentario() {
    const input = document.getElementById('input-novo-comentario');
    if (!input || !input.value.trim() || !idConteudoAtual) return;

    const texto = input.value.trim();
    const nomeAutor = window.AniGeekUser?.nome || "Leitor Geek";
    input.value = ""; 

    try {
        const colRef = collection(db, "analises", idConteudoAtual, "comentarios");
        await addDoc(colRef, {
            autor: nomeAutor,
            texto: texto,
            data: serverTimestamp()
        });
    } catch (error) {
        if (window.logVisual) window.logVisual("❌ Erro ao enviar.");
    }
}

// Injeção inicial em Body para garantir contexto global
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Interface.injetarEstruturaModal();
        const modal = document.getElementById('modal-comentarios-global');
        configurarListenersLocais(modal);
    });
} else {
    Interface.injetarEstruturaModal();
    const modal = document.getElementById('modal-comentarios-global');
    configurarListenersLocais(modal);
}
