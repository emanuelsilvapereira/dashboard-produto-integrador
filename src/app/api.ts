import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http'; 
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
    private apiUrl:string ="https://esp32-mongodb-idev3.onrender.com"

    constructor(private http: HttpClient) {}

    // Esta é a única função que precisamos!
    getSensores():Observable<any[]> {
      return this.http.get<any[]>(this.apiUrl+"/api/leituras/Dezan");
    }

    // A função getHistoricoDia() foi removida.
}