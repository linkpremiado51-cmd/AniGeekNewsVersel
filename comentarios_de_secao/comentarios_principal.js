/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * PAPEL: Módulo Global Autônomo de Comentários (Com Diagnóstico Visual)
 * VERSÃO: 5.1 - Logs Visuais para Depuração em Mobile
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

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

async function carregarComentariosRealTime(idConteudo) {
    if (unsubscribeAtual) unsubscribeAtual();
    idConteudoAtual = idConteudo;

    if (window.logVisual) window.logVisual(`[Firebase] Conectando: ${idConteudo}`);
    
    const colRef = collection(db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    unsubscribeAtual = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (window.logVisual) window.logVisual(`[Firebase] ${comentarios.length} mensagens recebidas.`);
        Interface.renderizarListaComentarios(comentarios);
    }, (error) => {
        if (window.logVisual) window.logVisual("❌ Erro Firebase: " + error.code);
        console.error(error);
    });
}

async function enviarComentario() {
    const input = document.getElementById('input-novo-comentario');
    if (!input || !input.value.trim() || !idConteudoAtual) {
        if (window.logVisual) window.logVisual("⚠️ Campo vazio ou ID ausente.");
        return;
    }

    const texto = input.value.trim();
    const nomeAutor = window.AniGeekUser?.nome || "Leitor Geek";
    input.value = ""; 

    try {
        if (window.logVisual) window.logVisual("📤 Enviando comentário...");
        const colRef = collection(db, "analises", idConteudoAtual, "comentarios");
        await addDoc(colRef, {
            autor: nomeAutor,
            texto: texto,
            data: serverTimestamp()
        });
        if (window.logVisual) window.logVisual("✅ Comentário publicado!");
    } catch (error) {
        if (window.logVisual) window.logVisual("❌ Erro ao enviar.");
        console.error(error);
    }
}

/**
 * API GLOBAL COM DIAGNÓSTICO
 */
window.secaoComentarios = {
    abrir: (id) => {
        if (window.logVisual) window.logVisual(`[API] Abrindo modal para: ${id}`);
        
        // Diagnóstico de Injeção
        const modalExiste = document.getElementById('modal-comentarios-global');
        if (!modalExiste) {
            if (window.logVisual) window.logVisual("[Interface] Criando estrutura modal...");
            Interface.injetarEstruturaModal();
        }
        
        Funcoes.toggleComentarios(true, id);
        carregarComentariosRealTime(id);
    },
    fechar: () => {
        if (window.logVisual) window.logVisual("[API] Fechando modal.");
        if (unsubscribeAtual) unsubscribeAtual();
        idConteudoAtual = null;
        Funcoes.toggleComentarios(false);
    },
    enviar: enviarComentario
};

// Inicia o serviço
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Interface.injetarEstruturaModal();
        if (window.logVisual) window.logVisual("🚀 Módulo pronto (DOM Loaded)");
    });
} else {
    Interface.injetarEstruturaModal();
    if (window.logVisual) window.logVisual("🚀 Módulo pronto (Immediate)");
}

// Escuta de cliques globais para botões dinâmicos
document.addEventListener('click', (e) => {
    // Detecta se o usuário clicou em algum botão de fechar
    const fecharBtn = e.target.closest('.btn-close-comentarios') || e.target.id === 'btn-fechar-comentarios';
    if (fecharBtn || e.target.classList.contains('modal-comentarios-overlay')) {
        window.secaoComentarios.fechar();
    }

    // Detecta envio
    if (e.target.closest('#btn-enviar-comentario') || e.target.closest('#btn-enviar-global')) {
        if (window.logVisual) window.logVisual("🖱️ Clique no botão Enviar detectado.");
        window.secaoComentarios.enviar();
    }
});

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'input-novo-comentario') {
        window.secaoComentarios.enviar();
    }
});

if (window.logVisual) window.logVisual("✔️ Módulo Comentários Carregado.");
