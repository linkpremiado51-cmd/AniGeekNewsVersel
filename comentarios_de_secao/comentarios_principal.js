/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * PAPEL: Módulo de Comentários Integrado (Mesma Tela)
 * VERSÃO: 9.0 - Elite Auth-Sync & Auto-Re-render
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

let unsubscribeAtual = null;
let idConteudoAtual = null;
let app, db;

// --- INICIALIZAÇÃO DA API GLOBAL ---
window.secaoComentarios = {
    abrir: (id) => {
        if (!id) return;
        idConteudoAtual = id; // 🛡️ Armazena o ID atual para re-renderizações de Auth
        
        if (window.logVisual) window.logVisual(`[UI] Integrando comentários para: ${id}`);
        
        if (unsubscribeAtual) {
            unsubscribeAtual();
            unsubscribeAtual = null;
        }

        Interface.injetarEstruturaModal(); 
        
        const modal = document.getElementById('modal-comentarios-global');
        if (modal) {
            configurarListenersLocais(modal);
            Funcoes.toggleComentarios(true, id);
            carregarComentariosRealTime(id);
            
            // 🛡️ REFINAMENTO ELITE: Sincroniza a interface com o estado do usuário na abertura
            atualizarInterfaceAuth();
        }
    },
    fechar: () => {
        if (unsubscribeAtual) {
            if (window.logVisual) window.logVisual("[Firebase] Encerrando escuta de comentários.");
            unsubscribeAtual();
            unsubscribeAtual = null;
        }
        idConteudoAtual = null;
        if (Funcoes.toggleComentarios) Funcoes.toggleComentarios(false);
    },
    enviar: () => enviarComentario()
};

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBC_ad4X9OwCHKvcG_pNQkKEl76Zw2tu6o",
    authDomain: "anigeeknews.firebaseapp.com",
    projectId: "anigeeknews",
    storageBucket: "anigeeknews.firebasestorage.app",
    messagingSenderId: "769322939926",
    appId: "1:769322939926:web:6eb91a96a3f74670882737"
};

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.error("[Comentários] Erro Firebase:", e);
}

/**
 * 🛡️ REFINAMENTO ELITE: ATUALIZAÇÃO DE INTERFACE POR AUTH
 * Garante que o campo de comentário mude de estado se o user logar/deslogar
 */
function atualizarInterfaceAuth() {
    const containerAcao = document.querySelector('.modal-comentarios-input-area');
    if (!containerAcao) return;

    if (window.AniGeekUser) {
        containerAcao.classList.remove('user-deslogado');
        const input = document.getElementById('input-novo-comentario');
        if (input) input.placeholder = `Comentar como ${window.AniGeekUser.nome || 'Geek'}...`;
    } else {
        containerAcao.classList.add('user-deslogado');
        const input = document.getElementById('input-novo-comentario');
        if (input) input.placeholder = "Faça login para comentar...";
    }
}

/**
 * ESCUTADORES DE EVENTOS GLOBAIS (AUTH SYNC)
 */
document.addEventListener('user:login', () => {
    if (idConteudoAtual) {
        if (window.logVisual) window.logVisual("🔄 Comentários: Sincronizando novo usuário.");
        atualizarInterfaceAuth();
    }
});

document.addEventListener('user:logout', () => {
    if (idConteudoAtual) {
        atualizarInterfaceAuth();
    }
});

function configurarListenersLocais(modalElement) {
    if (!modalElement || modalElement.dataset.listenersAtivos === "true") return;

    modalElement.addEventListener('click', (e) => {
        const target = e.target;
        const btnFechar = target.closest('.btn-close-comentarios') || target.closest('.modal-close-trigger');

        if (btnFechar) {
            e.preventDefault();
            window.secaoComentarios.fechar();
            return;
        }

        if (target.closest('.btn-enviar-comentario')) {
            e.preventDefault();
            window.secaoComentarios.enviar();
        }
    });

    modalElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.id === 'input-novo-comentario') {
            window.secaoComentarios.enviar();
        }
    });

    modalElement.dataset.listenersAtivos = "true";
}

async function carregarComentariosRealTime(idConteudo) {
    const colRef = collection(db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    unsubscribeAtual = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        Interface.renderizarListaComentarios(comentarios);
    }, (error) => {
        console.error("Erro Firebase:", error);
    });
}

async function enviarComentario() {
    if (!window.AniGeekUser) {
        if (window.logVisual) window.logVisual("⚠️ Você precisa estar logado!");
        return;
    }

    const input = document.getElementById('input-novo-comentario');
    if (!input || !input.value.trim() || !idConteudoAtual) return;

    const texto = input.value.trim();
    const nomeAutor = window.AniGeekUser.nome || "Leitor Geek";
    
    try {
        const colRef = collection(db, "analises", idConteudoAtual, "comentarios");
        await addDoc(colRef, {
            autor: nomeAutor,
            texto: texto,
            data: serverTimestamp(),
            uid: window.AniGeekUser.uid || null // Opcional: para moderação futura
        });
        input.value = ""; 
    } catch (error) {
        if (window.logVisual) window.logVisual("❌ Erro ao enviar.");
    }
}
