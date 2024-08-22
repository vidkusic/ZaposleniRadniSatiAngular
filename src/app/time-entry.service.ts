import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface TimeEntry {
  EmployeeName: string;
  StarTimeUtc: string;
  EndTimeUtc: string;
  EntryNotes: string;
  DeletedOn: string;
}

export interface EmployeeMonthlyTime {
  EmployeeName: string;
  TotalTimeInHours: number;
}

@Injectable({
  providedIn: 'root'
})

export class TimeEntryService {
  private requestUrl = 'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==';

  constructor(private http: HttpClient) { }

  getTimeEntries(): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(this.requestUrl);
  }

  calculateEmployeeTime(timeEntries: TimeEntry[]): EmployeeMonthlyTime[] {
    const employeeTimeDictionary: { [key: string]: number } = {};

    timeEntries.forEach((entry) => {
      if (!entry.EmployeeName) {
        return;
      }

      const startTime = new Date(entry.StarTimeUtc);
      const endTime = new Date(entry.EndTimeUtc);
      const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      if (employeeTimeDictionary[entry.EmployeeName]) {
        employeeTimeDictionary[entry.EmployeeName] += hoursWorked;
      } else {
        employeeTimeDictionary[entry.EmployeeName] = hoursWorked;
      }
    });

    return Object.keys(employeeTimeDictionary).map((key) => ({
      EmployeeName: key,
      TotalTimeInHours: employeeTimeDictionary[key],
    })).sort((a, b) => b.TotalTimeInHours - a.TotalTimeInHours);
  }
}
