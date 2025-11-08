import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, NgChartsModule]
})
export class DashboardPage implements OnInit, OnDestroy {
  isModalOpen = false;
  tempDataSelecionada: string = new Date().toISOString();
  dataSelecionada: string = new Date().toISOString();
  historicoDoDia: any[] = [];
  lineChartData: ChartConfiguration<'line'>['data'] | null = null;

  // Opções do gráfico
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    elements: {
      line: { tension: 0.4, borderWidth: 3 },
      point: { radius: 5, hoverRadius: 7 }
    },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: '#222' } },
      y: { beginAtZero: true, ticks: { color: '#aaa' }, grid: { color: '#222' } }
    },
    plugins: {
      legend: {
        labels: { color: '#fff', font: { size: 14 } }
      },
      tooltip: {
        backgroundColor: '#111',
        titleColor: '#1a73e8',
        bodyColor: '#fff',
        borderColor: '#1a73e8',
        borderWidth: 1
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    }
  };

  private intervalo!: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.carregarDados();
    this.intervalo = setInterval(() => this.carregarDados(), 5000); // 🔁 Atualiza a cada 5s
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  get dataSelecionadaFormatada(): string {
    const data = new Date(this.dataSelecionada);
    return data.toLocaleDateString('pt-BR');
  }

  abrirModal() { this.isModalOpen = true; }
  cancelarModal() { this.isModalOpen = false; }
  confirmarData() { this.dataSelecionada = this.tempDataSelecionada; this.isModalOpen = false; this.carregarDados(); }
  dataMudouTemp(event: any) { this.tempDataSelecionada = event.detail.value; }

  carregarDados() {
    const data = new Date(this.dataSelecionada);
    const dataFormatada = `${data.getFullYear()}-${(data.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${data.getDate().toString().padStart(2, '0')}`;

    const url = `https://esp32-mongodb-idev3.onrender.com/api/historico-dia/Dezan?data=${dataFormatada}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        this.historicoDoDia = res || [];
        if (this.historicoDoDia.length > 0) {
          const labels = this.historicoDoDia.map(r => r.timestamp.split(', ')[1]);
          const temperaturas = this.historicoDoDia.map(r => r.temperatura);

          this.lineChartData = {
            labels,
            datasets: [
              {
                data: temperaturas,
                label: '🌡️ Temperatura (°C)',
                borderColor: '#1a73e8',
                backgroundColor: 'rgba(26, 115, 232, 0.2)',
                fill: true,
                pointBackgroundColor: '#1a73e8',
                pointBorderColor: '#fff'
              }
            ]
          };
        } else {
          this.lineChartData = null;
        }
      },
      error: (err) => console.error('Erro ao carregar dados:', err)
    });
  }
}
