import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { EmployeeMonthlyTime, TimeEntryService } from './time-entry.service';
import { isPlatformBrowser } from '@angular/common';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  employeeMonthlyTimes: EmployeeMonthlyTime[] = [];
  isBrowser: boolean;

  constructor(
    private timeEntryService: TimeEntryService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const customLabelPlugin = {
      id: 'customLabelPlugin',
      afterDraw: (chart: any) => {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset: any, i: any) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((element: any, index: any) => {
            const data = dataset.data as number[];
            const total = data.reduce((acc, cur) => acc + cur, 0);
            const value = data[index];
            const percentage = ((value / total) * 100).toFixed(2);
    
            const position = element.tooltipPosition();
            const chartCenterX = element.x;
            const chartCenterY = element.y;
            const radius = element.outerRadius * 0.8; 

            const angle = (element.startAngle + element.endAngle) / 2;
            const x = chartCenterX + Math.cos(angle) * radius;
            const y = chartCenterY + Math.sin(angle) * radius;

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percentage}%`, x, y);
          });
        });
      }
    };

    Chart.register(PieController, ArcElement, Tooltip, Legend, customLabelPlugin);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.timeEntryService.getTimeEntries().subscribe(
      (timeEntries) => {
        this.employeeMonthlyTimes =
          this.timeEntryService.calculateEmployeeTime(timeEntries);
        if (this.isBrowser) {
          this.generatePieChart();
        }
      },
      (error) => {
        console.error('Error fetching time entries:', error);
      }
    );
  }

  generatePieChart(): void {
    const labels = this.employeeMonthlyTimes.map((entry) => entry.EmployeeName);
    const data = this.employeeMonthlyTimes.map((entry) => entry.TotalTimeInHours);

    const ctx = document.getElementById('pieChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: [
                '#a0522d', '#ffd700', '#800080', '#d8bfd8',
                '#ff4500', '#1e90ff', '#32cd32', '#ff1493',
                '#00ced1', '#ff6347', '#4682b4', '#daa520',
                '#8a2be2', '#5f9ea0', '#7fff00', '#dc143c',
                '#00fa9a', '#ffd700', '#8b0000', '#2e8b57'
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  const dataset = tooltipItem.dataset;
                  const currentValue = dataset.data[tooltipItem.dataIndex] as number;
                  return `${tooltipItem.label}: ${Math.round(currentValue)} hrs`;
                }
              }
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      });
    }
  }
}
