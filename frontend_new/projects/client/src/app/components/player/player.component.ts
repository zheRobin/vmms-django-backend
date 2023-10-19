import {Component, inject, OnInit} from '@angular/core';
import {ClientService} from "../../_services/client.service";
import {ActivatedRoute} from "@angular/router";
import {filter, map, Observable, repeat, shareReplay, switchMap, tap} from "rxjs";

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  private clientService = inject(ClientService);
  private activatedRoute = inject(ActivatedRoute);

  secretKey!: string;
  client$!: Observable<any>;
  player$!: Observable<any>;

  constructor() {
  }

  ngOnInit() {
    this.activatedRoute.paramMap.pipe(
      map(params => this.secretKey = params.get('clientSecret') || ''),
      filter(clientSecret => !!clientSecret),
    ).subscribe(clientSecret => {
      this.client$ = this.clientService.getClient(clientSecret).pipe(
        tap((client: any) => this.player$ = this.clientService.getPlayerByKey(client.api_key).pipe(
          shareReplay(),
        )),
        filter((client: any) => client),
        repeat({delay: 3000})
      );
    })
  }

  changeVolume(clientId: number, clientVolume: number, direction: boolean) {
    if (!clientVolume) {
      return;
    }
    this.clientService.updateVolume(clientId, clientVolume + (direction ? +5 : -5)).subscribe();
  }

  changeContent(clientId: number, contentId: number) {
    this.clientService.changeActiveContent(clientId, contentId).subscribe();
  }

}
