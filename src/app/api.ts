import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private readonly baseUrl = 'https://esp32-mongodb-idev3.onrender.com/api';

  constructor(private http: HttpClient) {}

  // Busca histórico de um dia específico
  getHistoricoDoDia(data: string): Observable<any[]> {
    const collection = 'Dezan'; // sua collection
    const url = `${this.baseUrl}/historico-dia/${collection}?data=${data}`;
    return this.http.get<any[]>(url);
  }
}
