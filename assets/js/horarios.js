// ========== HORÁRIOS.JS ==========

let horariosData = [];

document.addEventListener('DOMContentLoaded', async () => {
    horariosData = await carregarJSON('../assets/data/horarios.json');
    exibirHorarios();
});

function exibirHorarios() {
    const container = document.getElementById('horariosTabela');
    if (!container || !horariosData || horariosData.length === 0) return;
    
    const horarios = ['08:00 - 09:40', '10:00 - 11:40', '14:00 - 15:40', '16:00 - 17:40'];
    
    let html = '<thead><tr><th>Horário</th>';
    horariosData.forEach(dia => {
        html += `<th>${dia.dia}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    horarios.forEach(horario => {
        html += `<tr><td class="horario-coluna">${horario}</td>`;
        
        horariosData.forEach(dia => {
            const aula = dia.aulas.find(a => a.horario === horario);
            
            if (aula) {
                html += `
                    <td>
                        <div class="aula-info">
                            <div class="aula-nome-tabela">${aula.materia}</div>
                            <div class="aula-codigo-tabela">${aula.codigo}</div>
                            <div class="aula-detalhes-tabela">
                                <span>
                                    <span class="material-symbols-outlined" style="font-size: 14px;">location_on</span>
                                    ${aula.sala}
                                </span>
                                <span>
                                    <span class="material-symbols-outlined" style="font-size: 14px;">category</span>
                                    ${aula.tipo}
                                </span>
                            </div>
                        </div>
                    </td>
                `;
            } else {
                html += '<td class="celula-vazia">—</td>';
            }
        });
        
        html += '</tr>';
    });
    
    html += '</tbody>';
    container.innerHTML = html;
}

console.log('✅ Horarios.js carregado!');
