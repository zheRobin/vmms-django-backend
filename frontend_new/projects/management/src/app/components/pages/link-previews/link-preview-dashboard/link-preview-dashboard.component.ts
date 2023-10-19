import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {DetailedLinkPreview} from "../../../../_interfaces/detailed-link-preview";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-link-preview-dashboard',
  templateUrl: './link-preview-dashboard.component.html',
  styleUrls: ['./link-preview-dashboard.component.scss']
})
export class LinkPreviewDashboardComponent implements AfterViewInit, OnChanges {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() linkPreviews: DetailedLinkPreview[] = [];

  @Output() editClicked: EventEmitter<number> = new EventEmitter<number>();
  @Output() removeClicked: EventEmitter<number> = new EventEmitter<number>();

  displayedColumns: string[] = ['id', 'name', 'program', 'expires-at', 'settings'];
  dataSource!: MatTableDataSource<DetailedLinkPreview>;

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<DetailedLinkPreview>(this.linkPreviews);
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['linkPreviews'].currentValue?.length) {
      this.dataSource = new MatTableDataSource<DetailedLinkPreview>(this.linkPreviews);
      this.dataSource.paginator = this.paginator;
    }
  }

  goTo(name: string) {
    window.location.href =
      `${environment.previewPlayerUrl}/#${name.toLowerCase().replaceAll(' ', '_')}`;
  }

  edit(id: number) {
    this.editClicked.emit(id);
  }

  remove(id: number) {
    this.removeClicked.emit(id);
  }

}
