import { Component, OnInit } from "@angular/core";
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js';

@Component({
  selector: "app-dashboard",
  templateUrl: "dashboard.component.html"
})
export class DashboardComponent implements OnInit {
  public canvas : any;
  public ctx;
  public datasets: any;
  public data: any;
  public myChartData;
  public chartObitosPorMes;
  public chartObitosPorRaca;
  public chartObitosPorMunicipio;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  public clicked2: boolean = false;
  private BASE_URL = 'https://datasus.victorsavoi.dev.br';
  private BASE_URL_COVID = 'https://datasus.victorsavoi.dev.br/leitos-covid/obter-por-municipio';

  private obitosPorMes: any = [];
  private obitosPorIdade: any = [];
  private obitosPorRaca: any = [];
  private obitosPorGenero: any = [];
  private obitosPorMunicipio: any = [];
  private casosPorMunicipio: any = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    /* Óbitos por Mes */
    this.http
        .get(`${this.BASE_URL}/obitos-por-mes`)
        .subscribe(data => {
          this.obitosPorMes = data;
          this.buildObitosPorMes();
        });

    /* Óbitos por Idade */
    this.http
        .get(`${this.BASE_URL}/obitos-por-idade`)
        .subscribe(data => {
          this.obitosPorIdade = data;
          this.buildObitosPorIdade();
        });

    /* Óbitos por Genero */
    this.http
        .get(`${this.BASE_URL}/obitos-por-genero`)
        .subscribe(data => {
          this.obitosPorGenero = data;
          this.buildObitosPorGenero();
        });

    /* Óbitos por Raça */
    this.http
        .get(`${this.BASE_URL}/obitos-por-raca`)
        .subscribe(data => {
          this.obitosPorRaca = data;
          this.buildObitosPorRaca();
        });
    /* Óbitos por Municipio */
    this.http
        .get(`${this.BASE_URL}/obitos-por-municipio`)
        .subscribe(data => {
          this.obitosPorMunicipio = data;
        });
    /* Casos COVID por Municipio */
    this.http
        .get(`${this.BASE_URL_COVID}`)
        .subscribe((data: any) => {
          const casosCruzados = data.map(caso => {
            const taxaZoneVerde = (caso.totalLeitos / 100) * 30;
            const taxaZoneAmarela = (caso.totalLeitos / 100) * 50;
            const taxaZoneVermelha = (caso.totalLeitos / 100) * 70;
            let zonaIdentificada = '';
            let cor = '';

            if (caso.totalCasosCovid <= taxaZoneVerde) {
              zonaIdentificada = 'Fase 3';
              cor = 'green';
            }
            if (caso.totalCasosCovid > taxaZoneVerde && caso.totalCasosCovid <= taxaZoneAmarela) {
              zonaIdentificada = 'Fase 2';
              cor = 'yellow';
            }
            if (caso.totalCasosCovid >= taxaZoneVermelha) {
              zonaIdentificada = 'Fase 1';
              cor = 'red';
            }

            const casoCruzado = {
              ...caso,
              zonaIdentificada,
              style: {
                width: '20px',
                height: '20px',
                'border-radius': '40px',
                'background': cor
              }
            };

            return casoCruzado;
          });
          this.casosPorMunicipio = casosCruzados;
        });
  }

  public updateOptions() {
    this.myChartData.data.datasets[0].data = this.data;
    this.myChartData.update();
  }

  public buildObitosPorMes() {
    /* Obitos Por Mes */
    const labelsPorMes = this.obitosPorMes.map(o => o.nomeMes);
    const dadosPorMes = this.obitosPorMes.map(o => o.totalObitos);

    const canvas = document.getElementById("obitos-por-mes") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors

    const minValue = Math.min.apply(Math, dadosPorMes);
    const maxValue = Math.max.apply(Math, dadosPorMes);

    const options: any = {
      maintainAspectRatio: false,
      legend: { display: true },
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: minValue,
            suggestedMax: maxValue,
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }],
        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(233,32,16,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };
    const config = {
      type: 'line',
      data: {
        labels: labelsPorMes,
        datasets: [{
          label: "Óbitos no mês",
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: '#ec250d',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: '#ec250d',
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: '#ec250d',
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: dadosPorMes,
        }]
      },
      options: options
    };

    this.chartObitosPorMes = new Chart(ctx, config);
  }

  public buildObitosPorIdade() {
    /* Obitos Por Mes */
    const labelsPorIdade = this.obitosPorIdade.map(o => o.totalObitos);
    const dadosPorIdade = this.obitosPorIdade.map(o => o.idade);

    const canvas = document.getElementById("obitos-por-idade") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
    gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); //red colors

    const minValue = Math.min.apply(Math, dadosPorIdade);
    const maxValue = Math.max.apply(Math, dadosPorIdade);

    const options: any = {
      maintainAspectRatio: false,
      legend: { display: true },
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: minValue,
            suggestedMax: maxValue,
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }],
        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(233,32,16,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9a9a9a"
          }
        }]
      }
    };
    const config = {
      type: 'line',
      data: {
        labels: labelsPorIdade,
        datasets: [{
          label: 'Óbitos na idade',
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: '#ec250d',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: '#ec250d',
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: '#ec250d',
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: dadosPorIdade,
        }]
      },
      options: options
    };

    this.chartObitosPorMes = new Chart(ctx, config);
  }

  public buildObitosPorGenero() {
    /* Obitos Por Genero */
    const labelsPorGenero = this.obitosPorGenero.map(o => o.genero);
    const dadosPorGenero = this.obitosPorGenero.map(o => o.totalObitos);

    const canvas = document.getElementById("obitos-por-genero") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(29,140,248,0.2)');
    gradientStroke.addColorStop(0.4, 'rgba(29,140,248,0.0)');
    gradientStroke.addColorStop(0, 'rgba(29,140,248,0)'); //blue colors

    const minValue = Math.min.apply(Math, dadosPorGenero);
    const maxValue = Math.max.apply(Math, dadosPorGenero);

    const options = {
      maintainAspectRatio: false,
      legend: { display: false },

      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: minValue,
            suggestedMax: maxValue,
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }],
        xAxes: [{
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }]
      }
    };
    const config = {
      type: 'bar',
      responsive: true,
      legend: { display: false },
      data: {
        labels: labelsPorGenero,
        datasets: [{
          label: "Óbitos por Genero",
          fill: true,
          backgroundColor: gradientStroke,
          hoverBackgroundColor: gradientStroke,
          borderColor: '#1f8ef1',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          data: dadosPorGenero,
        }]
      },
      options: options
    };

    this.chartObitosPorMes = new Chart(ctx, config);
  }

  public buildObitosPorRaca() {
    /* Obitos Por Raça */
    const labelsPorRaca = this.obitosPorRaca.map(o => o.raca);
    const dadosPorRaca = this.obitosPorRaca.map(o => o.totalObitos);

    const canvas = document.getElementById("obitos-por-raca") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    const gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke.addColorStop(1, 'rgba(66,134,121,0.15)');
    gradientStroke.addColorStop(0.4, 'rgba(66,134,121,0.0)'); //green colors
    gradientStroke.addColorStop(0, 'rgba(66,134,121,0)'); //green colors

    const minValue = Math.min.apply(Math, dadosPorRaca);
    const maxValue = Math.max.apply(Math, dadosPorRaca);

    const options = {
      maintainAspectRatio: false,
      legend: { display: false },
      tooltips: {
        backgroundColor: '#f5f5f5',
        titleFontColor: '#333',
        bodyFontColor: '#666',
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest"
      },
      responsive: true,
      scales: {
        yAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(29,140,248,0.0)',
            zeroLineColor: "transparent",
          },
          ticks: {
            suggestedMin: minValue,
            suggestedMax: maxValue,
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }],
        xAxes: [{
          barPercentage: 1.6,
          gridLines: {
            drawBorder: false,
            color: 'rgba(0,242,195,0.1)',
            zeroLineColor: "transparent",
          },
          ticks: {
            padding: 20,
            fontColor: "#9e9e9e"
          }
        }]
      }
    };
    const config = {
      type: 'line',
      data: {
        labels: labelsPorRaca,
        datasets: [{
          label: "Óbitos Por Raça",
          fill: true,
          backgroundColor: gradientStroke,
          borderColor: '#00d6b4',
          borderWidth: 2,
          borderDash: [],
          borderDashOffset: 0.0,
          pointBackgroundColor: '#00d6b4',
          pointBorderColor: 'rgba(255,255,255,0)',
          pointHoverBackgroundColor: '#00d6b4',
          pointBorderWidth: 20,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 15,
          pointRadius: 4,
          data: dadosPorRaca,
        }]
      },
      options: options
    };

    this.chartObitosPorRaca = new Chart(ctx, config);
  }
}
