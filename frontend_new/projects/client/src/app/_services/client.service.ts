import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private httpClient = inject(HttpClient);

  constructor() { }

  getClient(secret: string) {
    return this.httpClient.get(`/client/secret/${secret}`);
  }

  getPlayerByKey(key: string) {
    return this.httpClient.get(`${environment.monitoringUrl}/api/v1/player-by-key/?api_key=${key}`);
  }

  updateVolume(clientId: number, volume: number) {
    return this.httpClient.post('/client-volume-request/', {client: clientId, volume: volume});
  }

  changeActiveContent(clientId: number, contentId: number) {
    return this.httpClient.post('/client-content-request/', {client: clientId, content: contentId});
  }

}
