// ========== FREQUÊNCIA.JS ==========

let frequenciaData = [];

document.addEventListener('DOMContentLoaded', async () => {
    frequenciaData = await carregarJSON('../assets/data/frequencia.json');
    exibirFrequencia();
    calcularResumo();
});

function exibirFrequencia() {
    const container = document.getElementById('frequenciaContainer');
    if (!container || !frequenciaData || frequenciaData.length === 0) return;
    
    mostrarLoading(container);
    container.innerHTML = '';
    
    // Ordenar por status (crítico primeiro)
    const ordenado = [...frequenciaData].sort((a, b) => {
        const ordem = { 'critico': 0, 'alerta': 1, 'ok': 2 };
        return ordem[a.status] - ordem[b.status];
    });
    
    ordenado.forEach(freq => {
        const card = document.createElement('div');
        card.className = `frequencia-card status-${freq.status} fade-in`;
        
        const corStatus = getCorFrequencia(freq.status);
        const textoStatus = {
            'ok': '✓ Regular',
            'alerta': '⚠ Atenção',
            'critico': '✕ Crítico'
        }[freq.status];
        
        card.innerHTML = `
            <div class="frequencia-header">
                <div class="frequencia-materia-info">
                    <h3>${freq.materia}</h3>
                    <div class="frequencia-materia-codigo">${freq.codigo}</div>
                </div>
                <div class="frequencia-status-badge" style="background-color: ${corStatus};">
                    ${textoStatus}
                </div>
            </div>
            
            <div class="frequencia-progress-container">
                <div class="progress-label">
                    <span>Frequência</span>
                    <span><strong>${freq.percentual_presenca.toFixed(1)}%</strong></span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${freq.percentual_presenca}%; background-color: ${corStatus};">
                        ${freq.presencas}/${freq.aulas_dadas}
                    </div>
                </div>
            </div>
            
            <div class="frequencia-detalhes">
                <div class="detalhe-item">
                    <div class="detalhe-valor" style="color: var(--cor-sucesso);">${freq.presencas}</div>
                    <div class="detalhe-label">Presenças</div>
                </div>
                <div class="detalhe-item">
                    <div class="detalhe-valor" style="color: ${corStatus};">${freq.faltas}</div>
                    <div class="detalhe-label">Faltas</div>
                </div>
                <div class="detalhe-item">
                    <div class="detalhe-valor" style="color: var(--cor-info);">${freq.aulas_dadas}</div>
                    <div class="detalhe-label">Aulas Dadas</div>
                </div>
                <div class="detalhe-item">
                    <div class="detalhe-valor" style="color: var(--cor-alerta);">${freq.faltas_restantes}</div>
                    <div class="detalhe-label">Faltas Restantes</div>
                </div>
            </div>
            
            ${freq.status === 'critico' ? `
                <div class="alerta-faltas">
                    <span class="material-symbols-outlined">warning</span>
                    <span><strong>ATENÇÃO!</strong> Você atingiu o limite de faltas para esta matéria.</span>
                </div>
            ` : ''}
        `;
        
        container.appendChild(card);
    });
}

function calcularResumo() {
    if (!frequenciaData || frequenciaData.length === 0) return;
    
    const totalPresencas = frequenciaData.reduce((acc, f) => acc + f.presencas, 0);
    const totalAulas = frequenciaData.reduce((acc, f) => acc + f.aulas_dadas, 0);
    const mediaFreq = totalAulas > 0 ? ((totalPresencas / totalAulas) * 100).toFixed(1) : 0;
    
    const criticas = frequenciaData.filter(f => f.status === 'critico').length;
    const alertas = frequenciaData.filter(f => f.status === 'alerta').length;
    
    document.getElementById('mediaFrequencia').textContent = `${mediaFreq}%`;
    document.getElementById('materiasRisco').textContent = criticas + alertas;
    document.getElementById('totalFaltas').textContent = frequenciaData.reduce((acc, f) => acc + f.faltas, 0);
}

console.log('✅ Frequencia.js carregado!');
