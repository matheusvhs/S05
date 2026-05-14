// ========== GRAFICOS.JS ==========

let notasData = [];
let frequenciaData = [];
let materiasData = [];

document.addEventListener('DOMContentLoaded', async () => {
    notasData = await carregarJSON('../assets/data/notas.json');
    frequenciaData = await carregarJSON('../assets/data/frequencia.json');
    materiasData = await carregarJSON('../assets/data/materias.json');
    
    if (notasData && frequenciaData && materiasData) {
        criarGraficoNotas();
        criarGraficoFrequencia();
        criarGraficoDistribuicao();
        criarGraficoEvolucao();
        calcularEstatisticas();
    }
});

// Função para obter cores do tema
function getCoresGrafico() {
    const estilo = getComputedStyle(document.documentElement);
    return {
        primaria: estilo.getPropertyValue('--cor-primaria').trim() || '#1976D2',
        sucesso: estilo.getPropertyValue('--cor-sucesso').trim() || '#4CAF50',
        alerta: estilo.getPropertyValue('--cor-alerta').trim() || '#FF9800',
        erro: estilo.getPropertyValue('--cor-erro').trim() || '#F44336',
        info: estilo.getPropertyValue('--cor-info').trim() || '#2196F3',
    };
}

// Gráfico de Notas por Matéria
function criarGraficoNotas() {
    const ctx = document.getElementById('graficoNotas').getContext('2d');
    const cores = getCoresGrafico();
    
    const labels = notasData.map(n => n.codigo);
    const dados = notasData.map(n => n.cr);
    const coresBarras = dados.map(cr => {
        if (cr >= 80) return cores.sucesso;
        if (cr >= 60) return cores.alerta;
        return cores.erro;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'CR',
                data: dados,
                backgroundColor: coresBarras,
                borderColor: coresBarras,
                borderWidth: 2,
                borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            return notasData[index].materia;
                        },
                        label: function(context) {
                            return `CR: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Gráfico de Frequência
function criarGraficoFrequencia() {
    const ctx = document.getElementById('graficoFrequencia').getContext('2d');
    const cores = getCoresGrafico();
    
    const labels = frequenciaData.map(f => f.codigo);
    const dados = frequenciaData.map(f => f.percentual);
    const coresBarras = frequenciaData.map(f => {
        if (f.status === 'ok') return cores.sucesso;
        if (f.status === 'alerta') return cores.alerta;
        return cores.erro;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequência (%)',
                data: dados,
                backgroundColor: coresBarras,
                borderColor: coresBarras,
                borderWidth: 2,
                borderRadius: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            return frequenciaData[index].materia;
                        },
                        label: function(context) {
                            return `Frequência: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Gráfico de Distribuição de Notas
function criarGraficoDistribuicao() {
    const ctx = document.getElementById('graficoDistribuicao').getContext('2d');
    const cores = getCoresGrafico();
    
    let alta = 0, media = 0, baixa = 0;
    
    notasData.forEach(materia => {
        materia.avaliacoes.forEach(av => {
            if (av.nota >= 80) alta++;
            else if (av.nota >= 60) media++;
            else baixa++;
        });
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Alta (≥80)', 'Média (60-79)', 'Baixa (<60)'],
            datasets: [{
                data: [alta, media, baixa],
                backgroundColor: [
                    cores.sucesso,
                    cores.alerta,
                    cores.erro
                ],
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = alta + media + baixa;
                            const percentual = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentual}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de Evolução
function criarGraficoEvolucao() {
    const ctx = document.getElementById('graficoEvolucao').getContext('2d');
    const cores = getCoresGrafico();
    
    // Coletar todas as avaliações com suas datas
    const todasAvaliacoes = [];
    notasData.forEach(materia => {
        materia.avaliacoes.forEach(av => {
            const partesData = av.data.split('/');
            const dataObj = new Date(partesData[2], partesData[1] - 1, partesData[0]);
            todasAvaliacoes.push({
                data: dataObj,
                dataStr: av.data,
                nota: av.nota,
                materia: materia.codigo,
                tipo: av.tipo
            });
        });
    });
    
    // Ordenar por data
    todasAvaliacoes.sort((a, b) => a.data - b.data);
    
    // Preparar datasets por matéria
    const materias = [...new Set(todasAvaliacoes.map(av => av.materia))];
    const datasets = materias.map((matCodigo, index) => {
        const avaliacoesMateria = todasAvaliacoes.filter(av => av.materia === matCodigo);
        const coresMateria = [
            cores.primaria, cores.sucesso, cores.alerta, 
            cores.erro, cores.info, '#9C27B0'
        ];
        
        return {
            label: matCodigo,
            data: avaliacoesMateria.map(av => ({
                x: av.dataStr,
                y: av.nota
            })),
            borderColor: coresMateria[index % coresMateria.length],
            backgroundColor: coresMateria[index % coresMateria.length] + '33',
            tension: 0.4,
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 7,
        };
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    type: 'category',
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Calcular Estatísticas
function calcularEstatisticas() {
    // Todas as notas
    const todasNotas = [];
    notasData.forEach(materia => {
        materia.avaliacoes.forEach(av => {
            todasNotas.push(av.nota);
        });
    });
    
    const maiorNota = Math.max(...todasNotas);
    const menorNota = Math.min(...todasNotas);
    
    // CR Médio
    const crs = notasData.map(n => n.cr);
    const crMedio = (crs.reduce((a, b) => a + b, 0) / crs.length).toFixed(0);
    
    // Frequência Média
    const frequencias = frequenciaData.map(f => f.percentual);
    const frequenciaMedia = (frequencias.reduce((a, b) => a + b, 0) / frequencias.length).toFixed(1);
    
    // Atualizar DOM
    document.getElementById('maiorNota').textContent = maiorNota;
    document.getElementById('menorNota').textContent = menorNota;
    document.getElementById('crMedio').textContent = crMedio;
    document.getElementById('frequenciaMedia').textContent = frequenciaMedia + '%';
}

console.log('✅ Graficos.js carregado!');
