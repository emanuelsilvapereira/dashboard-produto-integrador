import { Component, OnInit } from '@angular/core';
import { Api } from '../api';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  // Lista completa com todos os registros
  private listaMestreSensores: any[] = [];

  // Dados filtrados do dia
  public historicoDoDia: any[] = [];

  // Variáveis de data e modal
  public dataSelecionada: string;
  public dataSelecionadaFormatada: string = '';
  tempDataSelecionada: string;
  public isModalOpen = false;

  // Variáveis do gráfico
  public lineChartData: ChartData<'line'> | null = null;
  public lineChartLabels: string[] = [];
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
  };

  constructor(private apiService: Api) {
    // Define a data de hoje como padrão
    this.dataSelecionada = new Date().toISOString();
    this.tempDataSelecionada = this.dataSelecionada;
  }

  ngOnInit() {
    this.carregarDadosMestre();
  }

  carregarDadosMestre() {
    this.apiService.getSensores().subscribe({
      next: (data: any[]) => {
        this.listaMestreSensores = data;
        console.log(`Dados carregados: ${this.listaMestreSensores.length} itens.`);
        this.filtrarDadosPorData();
      },
      error: (err) => {
        console.error('Erro ao buscar sensores:', err);
        this.listaMestreSensores = [];
      }
    });
  }

  // =======================================================
  // CONTROLE DO MODAL
  // =======================================================
  abrirModal() {
    this.tempDataSelecionada = this.dataSelecionada;
    this.isModalOpen = true;
  }

  dataMudouTemp(event: any) {
    this.tempDataSelecionada = event.detail.value;
  }

  cancelarModal() {
    this.isModalOpen = false;
  }

  confirmarData() {
    this.dataSelecionada = this.tempDataSelecionada;
    this.filtrarDadosPorData();
    this.isModalOpen = false;
  }

  // =======================================================
  // FILTRAGEM E GRÁFICO
  // =======================================================
  filtrarDadosPorData() {
    const dataFiltro = this.formatarData(this.dataSelecionada);
    this.dataSelecionadaFormatada = dataFiltro;
    console.log(`Filtrando por data: ${dataFiltro}`);

    this.historicoDoDia = this.listaMestreSensores.filter(item =>
      item.timestamp && item.timestamp.startsWith(dataFiltro)
    );

    console.log(`Itens encontrados: ${this.historicoDoDia.length}`);

    if (this.historicoDoDia.length > 0) {
      const dadosOrdenados = [...this.historicoDoDia].reverse();
      const temperaturas = dadosOrdenados.map(item => item.temperatura);
      const umidades = dadosOrdenados.map(item => item.umidade);

      this.lineChartLabels = dadosOrdenados.map(item => {
        const partes = item.timestamp.split(', ');
        return partes.length > 1 ? partes[1] : item.timestamp;
      });

      this.lineChartData = {
        labels: this.lineChartLabels,
        datasets: [
          {
            data: temperaturas,
            label: 'Temperatura (°C)',
            borderColor: '#EB445A',
            backgroundColor: 'rgba(235,68,90,0.3)',
            fill: 'origin',
            tension: 0.3,
          },
          {
            data: umidades,
            label: 'Umidade (%)',
            borderColor: '#3880FF',
            backgroundColor: 'rgba(56,128,255,0.3)',
            fill: 'origin',
            tension: 0.3,
          }
        ]
      };
    } else {
      this.lineChartData = null;
    }
  }

  private formatarData(isoString: string): string {
    const data = new Date(isoString);
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
}
