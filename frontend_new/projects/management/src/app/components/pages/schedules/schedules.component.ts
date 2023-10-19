import {Component, inject, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ClientService} from "../../../_services/client.service";
import {GlobalService} from "vmms-common";
import {Observable, shareReplay} from "rxjs";
import {FileSystem} from "../../../_interfaces/file-system";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {

  private router = inject(Router);
  private clientService = inject(ClientService);
  private globalService = inject(GlobalService);

  currentFileSystem$!: Observable<FileSystem>;
  searchControl: FormControl = new FormControl('');

  ngOnInit() {
    this.currentFileSystem$ = this.clientService.getClientFileSystem().pipe(shareReplay());
  }

  select(clientId: number) {
    this.globalService.setCurrentItem({id: clientId, category: 'client'});
    this.router.navigateByUrl(`schedules/schedule/${clientId}`);
  }

}
