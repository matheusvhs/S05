// ========== GERENCIAMENTO DE TEMAS ==========
const themeButtons = document.querySelectorAll('.theme-btn');
const html = document.documentElement;

// Carregar tema salvo
const savedTheme = localStorage.getItem('theme') || 'inatel';
html.setAttribute('data-theme', savedTheme);

// Event listeners para botões de tema
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Feedback visual
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 100);
    });
});

// ========== GERENCIAMENTO DO SIDEBAR ==========
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');
const closeSidebar = document.getElementById('closeSidebar');

// Abrir sidebar
menuToggle?.addEventListener('click', () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Fechar sidebar
closeSidebar?.addEventListener('click', closeSidebarMenu);
sidebarOverlay?.addEventListener('click', closeSidebarMenu);

function closeSidebarMenu() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Fechar com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeSidebarMenu();
    }
});

// ========== FUNÇÕES UTILITÁRIAS ==========

// Formatar data
function formatarData(data) {
    const opcoes = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return data.toLocaleDateString('pt-BR', opcoes);
}

// Obter dia da semana atual (cod)
function getDiaSemana() {
    const dias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
    return dias[new Date().getDay()];
}

// Carregar dados JSON
async function carregarJSON(caminho) {
    try {
        const response = await fetch(caminho);
        if (!response.ok) throw new Error(`Erro ao carregar ${caminho}`);
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return null;
    }
}

// Obter cor baseada no status de frequência
function getCorFrequencia(status) {
    const cores = {
        'ok': 'var(--cor-frequencia-ok)',
        'alerta': 'var(--cor-frequencia-alerta)',
        'critico': 'var(--cor-frequencia-critico)'
    };
    return cores[status] || 'var(--cor-info)';
}

// Obter cor baseada na nota
function getCorNota(nota) {
    if (nota >= 80) return 'var(--cor-nota-alta)';
    if (nota >= 60) return 'var(--cor-nota-media)';
    return 'var(--cor-nota-baixa)';
}

// Calcular porcentagem de frequência
function calcularFrequenciaPercentual(presencas, totalAulas) {
    if (totalAulas === 0) return 0;
    return ((presencas / totalAulas) * 100).toFixed(1);
}

// Formatar data para DD/MM/YYYY
function formatarDataSimples(dataStr) {
    if (!dataStr) return '';
    const partes = dataStr.split('/');
    if (partes.length === 3) {
        return `${partes[0]}/${partes[1]}/${partes[2]}`;
    }
    return dataStr;
}

// Verificar se uma data é hoje
function isHoje(dataStr) {
    const hoje = new Date();
    const [dia, mes, ano] = dataStr.split('/');
    const data = new Date(ano, mes - 1, dia);
    
    return data.getDate() === hoje.getDate() &&
           data.getMonth() === hoje.getMonth() &&
           data.getFullYear() === hoje.getFullYear();
}

// Verificar se uma data é próxima (nos próximos 7 dias)
function isProxima(dataStr) {
    const hoje = new Date();
    const [dia, mes, ano] = dataStr.split('/');
    const data = new Date(ano, mes - 1, dia);
    
    const diffTime = data - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 7;
}

// ========== ANIMAÇÕES ==========

// Adicionar animação fade-in aos elementos quando eles aparecem na tela
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos com classe fade-in
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});

// ========== TOAST/NOTIFICAÇÃO ==========
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--cor-fundo-card);
        color: var(--cor-texto);
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--cor-sombra);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        border-left: 4px solid var(--cor-primaria);
    `;
    
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Adicionar animações CSS para toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========== LOADING ==========
function mostrarLoading(elemento) {
    elemento.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--cor-texto-secundario);">
            <span class="material-symbols-outlined" style="font-size: 48px; animation: spin 1s linear infinite;">
                progress_activity
            </span>
            <p style="margin-top: 10px;">Carregando...</p>
        </div>
    `;
}

// Adicionar animação de loading
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(loadingStyle);

console.log('✅ Global.js carregado com sucesso!');
