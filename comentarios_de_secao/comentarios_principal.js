/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * PAPEL: Módulo de Comentários Integrado (Mesma Tela)
 * VERSÃO: 7.0 - Kill Switch de Sobreposição e Injeção em Container
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

// --- INICIALIZAÇÃO DA API GLOBAL ---
window.secaoComentarios = {
    abrir: (id) => {
        if (window.logVisual) window.logVisual(`[UI] Integrando comentários para: ${id}`);
        
        // 🛡️ MUDANÇA: Injetamos DENTRO do container de conteúdo, não no body
        Interface.injetarEstruturaModal(); 
        
        const modal = document.getElementById('modal-comentarios-global');
        if (modal) {
            configurarListenersLocais(modal);
            // 🛡️ O toggle agora apenas mostra/esconde a seção na mesma tela
            Funcoes.toggleComentarios(true, id);
            carregarComentariosRealTime(id);
        }
    },
    fechar: () => {
        if (window.logVisual) window.logVisual("[UI] Removendo seção de comentários da tela.");
        if (unsubscribeAtual) unsubscribeAtual();
        idConteudoAtual = null;
        
        if (Funcoes.toggleComentarios) {
            Funcoes.toggleComentarios(false);
        }
    },
    enviar: () => enviarComentario()
};

// Config Firebase (Preservado)
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
 * CONFIGURAÇÃO DE LISTENERS LOCAIS
 * 🛡️ Reforçado para cliques dentro da mesma página
 */
function configurarListenersLocais(modalElement) {
    if (!modalElement || modalElement.dataset.listenersAtivos === "true") return;

    modalElement.addEventListener('click', (e) => {
        const target = e.target;
        
        // Clique no botão fechar (X)
        const btnFechar = target.closest('.btn-close-comentarios') || target.closest('.modal-close-trigger');

        if (btnFechar) {
            e.preventDefault();
            e.stopPropagation(); 
            window.secaoComentarios.fechar();
            return;
        }

        // Clique no botão enviar
        if (target.closest('.btn-enviar-comentario') || target.closest('#btn-enviar-global')) {
            e.preventDefault();
            e.stopPropagation();
            window.secaoComentarios.enviar();
        }
    });

    const input = modalElement.querySelector('#input-novo-comentario');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.secaoComentarios.enviar();
        });
    }

    modalElement.dataset.listenersAtivos = "true";
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
    
    try {
        const colRef = collection(db, "analises", idConteudoAtual, "comentarios");
        await addDoc(colRef, {
            autor: nomeAutor,
            texto: texto,
            data: serverTimestamp()
        });
        input.value = ""; 
    } catch (error) {
        if (window.logVisual) window.logVisual("❌ Erro ao enviar.");
    }
}
