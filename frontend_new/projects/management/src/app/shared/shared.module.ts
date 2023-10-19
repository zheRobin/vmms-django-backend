import {LOCALE_ID, NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IsFolderOpenedPipe} from "./pipes/is-folder-opened.pipe";
import { GetInnerFileSystemPipe } from './pipes/get-inner-file-system.pipe';
import { ConfirmationDialogComponent } from './modals/confirmation-dialog/confirmation-dialog.component';
import { FilterFolderTreePipe } from './pipes/filter-folder-tree.pipe';
import {AngularMaterialModule, VmmsSharedModule} from "vmms-common";
import {FolderTreeComponent} from "./components/folder-tree/folder-tree.component";
import {CreateFolderDialogComponent} from "./modals/create-folder-dialog/create-folder-dialog.component";
import {ListButtonsComponent} from "./components/list-buttons/list-buttons.component";
import { CustomWorkingHoursInputComponent } from './components/custom-working-hours-input/custom-working-hours-input.component';
import { SchedulerComponent } from './components/scheduler/scheduler.component';

import {
  CalendarDateFormatter,
  CalendarModule,
  CalendarNativeDateFormatter,
  DateAdapter, DateFormatterParams,
  MOMENT
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import * as moment from 'moment';
import { CustomDateTimeInputComponent } from './components/custom-date-time-input/custom-date-time-input.component';
import { GetClientPipe } from './pipes/get-client.pipe';
import {MAT_DIALOG_DEFAULT_OPTIONS} from "@angular/material/dialog";

export function momentAdapterFactory() {
  return adapterFactory(moment);
}

class CustomDateFormatter extends CalendarNativeDateFormatter {
  public override dayViewHour({date, locale}: DateFormatterParams): string {
    return new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  }
}

@NgModule({
  declarations: [
    IsFolderOpenedPipe,
    GetInnerFileSystemPipe,
    ConfirmationDialogComponent,
    CreateFolderDialogComponent,
    FilterFolderTreePipe,
    FolderTreeComponent,
    ListButtonsComponent,
    CustomWorkingHoursInputComponent,
    SchedulerComponent,
    CustomDateTimeInputComponent,
    GetClientPipe,
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    FormsModule,
    VmmsSharedModule,
    CalendarModule.forRoot(
      { provide: DateAdapter, useFactory: momentAdapterFactory },
      { dateFormatter: { provide: CalendarDateFormatter, useClass: CustomDateFormatter }}),
  ],
  exports: [
    IsFolderOpenedPipe,
    FilterFolderTreePipe,
    FolderTreeComponent,
    ListButtonsComponent,
    CustomWorkingHoursInputComponent,
    SchedulerComponent,
    CustomDateTimeInputComponent,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'en-GB' },
    { provide: MOMENT, useValue: moment },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {maxWidth: 400, minWidth: 400} }
  ]
})
export class SharedModule { }
