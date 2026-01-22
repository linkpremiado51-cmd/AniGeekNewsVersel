/* scripts/config-firebase.js */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBC_ad4X9OwCHKvcG_pNQkKEl76Zw2tu6o",
    authDomain: "anigeeknews.firebaseapp.com",
    projectId: "anigeeknews",
    storageBucket: "anigeeknews.firebasestorage.app",
    messagingSenderId: "769322939926",
    appId: "1:769322939926:web:6eb91a96a3f74670882737",
    measurementId: "G-G5T8CCRGZT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.noticiasFirebase = [];
let linkProcessado = false;

/**
 * Função auxiliar para logs visuais seguros
 */
function avisar(msg) {
    if (window.logVisual) window.logVisual(msg);
    console.log(msg);
}

/**
 * Normaliza os dados extraindo a imagem (thumb) e formatando o vídeo.
 */
function normalizarNoticia(doc, nomeColecao) {
    const data = doc.data();
    
    const imagemExtraida = data.thumb || 
                          (data.relacionados && data.relacionados.length > 0 ? data.relacionados[0].thumb : null) || 
                          'https://anigeeknews.com/default-og.jpg';

    let videoUrl = data.videoPrincipal || "";
    if (videoUrl.includes("watch?v=")) {
        videoUrl = videoUrl.replace("watch?v=", "embed/") + "?autoplay=1&mute=1&modestbranding=1";
    } else if (videoUrl.includes("youtu.be/")) {
        videoUrl = videoUrl.replace("youtu.be/", "youtube.com/embed/") + "?autoplay=1&mute=1&modestbranding=1";
    }

    return {
        id: doc.id,
        origem: nomeColecao,
        ...data,
        thumb: imagemExtraida,
        videoPrincipal: videoUrl
    };
}

window.verificarGatilhoDeLink = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const idDesejado = urlParams.get('id');

    if (idDesejado && window.noticiasFirebase.length > 0) {
        const noticiaEncontrada = window.noticiasFirebase.find(n => n.id === idDesejado);
        
        if (noticiaEncontrada && typeof window.abrirModalNoticia === 'function') {
            avisar(`[DeepLink] Abrindo: ${idDesejado}`);
            window.abrirModalNoticia(noticiaEncontrada);
            linkProcessado = true; 
        }
    }
};

function sincronizarComBusca(nomeColecao) {
    onSnapshot(collection(db, nomeColecao), (snapshot) => {
        // Limpa dados antigos da mesma origem para evitar duplicados
        window.noticiasFirebase = window.noticiasFirebase.filter(item => item.origem !== nomeColecao);
        
        const novosDados = snapshot.docs.map(doc => normalizarNoticia(doc, nomeColecao));
        window.noticiasFirebase.push(...novosDados);
        
        // Ordenação por timestamp (prioritário) ou campo data
        window.noticiasFirebase.sort((a, b) => (b.timestamp || b.data || 0) - (a.timestamp || a.data || 0));

        // PONTO CRÍTICO: Dispara o evento que os módulos (Futebol/Análises) estão ouvindo
        window.dispatchEvent(new CustomEvent('firebase:data_updated', { 
            detail: { origem: nomeColecao, total: window.noticiasFirebase.length } 
        }));

        if (snapshot.metadata.fromCache) {
            avisar(`[Cache] ${nomeColecao} ok.`);
        } else {
            avisar(`[Nuvem] ${nomeColecao} atualizado.`);
        }

        if (!linkProcessado) window.verificarGatilhoDeLink();
        
    }, (error) => {
        avisar(`❌ Erro Firebase (${nomeColecao})`);
        console.error(error);
    });
}

const colecoesParaMonitorar = ["noticias", "lancamentos", "analises", "entrevistas", "podcast", "futebol"];
colecoesParaMonitorar.forEach(nome => sincronizarComBusca(nome));

window.addEventListener('popstate', window.verificarGatilhoDeLink);

avisar("🔥 Firebase: Sincronização v9 Ativa");
