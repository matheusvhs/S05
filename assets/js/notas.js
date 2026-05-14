// ========== NOTAS.JS ==========

let notasData = [];

document.addEventListener('DOMContentLoaded', async () => {
    notasData = await carregarJSON('../assets/data/notas.json');
    exibirNotas();
    calcularMediaGeral();
});

function exibirNotas() {
    const container = document.getElementById('notasContainer');
    if (!container || !notasData || notasData.length === 0) return;
    
    mostrarLoading(container);
    container.innerHTML = '';
    
    // Ordenar por CR (maior para menor)
    const ordenado = [...notasData].sort((a, b) => b.cr - a.cr);
    
    ordenado.forEach(nota => {
        const card = document.createElement('div');
        const statusClass = nota.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        card.className = `nota-card ${statusClass} fade-in`;
        
        const corCR = getCorNota(nota.cr);
        
        card.innerHTML = `
            <div class="nota-header">
                <div class="nota-materia-info">
                    <h3>${nota.materia}</h3>
                    <div class="nota-codigo">${nota.codigo}</div>
                </div>
                <div class="cr-display" style="background: ${corCR};">
                    <div class="cr-label">CR</div>
                    <div class="cr-valor">${nota.cr.toFixed(0)}</div>
                </div>
            </div>
            
            <table class="avaliacoes-tabela">
                <thead>
                    <tr>
                        <th>Avaliação</th>
                        <th>Data</th>
                        <th>Peso</th>
                        <th>Nota</th>
                    </tr>
                </thead>
                <tbody>
                    ${nota.avaliacoes.map(av => `
                        <tr>
                            <td>${av.tipo}</td>
                            <td>${av.data}</td>
                            <td>${av.peso}</td>
                            <td>
                                <span class="nota-valor ${getClasseNota(av.nota)}">
                                    ${av.nota.toFixed(0)}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="text-align: center; margin-top: 15px;">
                <span class="status-aprovacao ${statusClass}">
                    ${nota.status}
                </span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function getClasseNota(nota) {
    if (nota >= 80) return 'alta';
    if (nota >= 60) return 'media';
    return 'baixa';
}

function calcularMediaGeral() {
    if (!notasData || notasData.length === 0) return;
    
    const crs = notasData.map(n => n.cr);
    const mediaGeral = (crs.reduce((a, b) => a + b, 0) / crs.length).toFixed(0);
    
    const aprovadas = notasData.filter(n => n.status === 'Aprovado').length;
    const recuperacao = notasData.filter(n => n.status === 'NP3').length;
    
    document.getElementById('mediaGeralValor').textContent = mediaGeral;
    document.getElementById('totalAprovadas').textContent = aprovadas;
    document.getElementById('totalRecuperacao').textContent = recuperacao;
    
    // Atualizar cor da média geral
    const mediaElement = document.getElementById('mediaGeralValor');
    if (mediaElement) {
        const cor = getCorNota(parseFloat(mediaGeral));
        mediaElement.parentElement.parentElement.style.background = cor;
    }
}

console.log('✅ Notas.js carregado!');
