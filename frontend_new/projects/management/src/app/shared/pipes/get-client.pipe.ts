import {inject, Pipe, PipeTransform} from '@angular/core';
import {DetailedClient} from "../../_interfaces/detailed-client";
import {ClientService} from "../../_services/client.service";
import {Observable, of} from "rxjs";
import {ClientCacheService} from "../../_services/client-cache.service";
import {Client} from "../../_interfaces/file-system";

@Pipe({
  name: 'getClient'
})
export class GetClientPipe implements PipeTransform {

  private clientService = inject(ClientService);
  private clientCacheService = inject(ClientCacheService);

  transform(clientId: number): Observable<Client | DetailedClient> {
    const cachedClient = this.clientCacheService.getCachedClient(clientId);
    return cachedClient ? of(cachedClient) : this.clientService.getClient(clientId);
  }

}
