import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {filter, Observable, switchMap, tap} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ListItem} from "vmms-common";
import {eventRepeatingOptions} from "../../../shared/static/event-repeating-options";
import {ClientService} from "../../../_services/client.service";
import {DetailedEvent} from "../../../_interfaces/detailed-event";
import {ScheduleService} from "../../../_services/schedule.service";
import {ConfirmationDialogComponent} from "../../../shared/modals/confirmation-dialog/confirmation-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-event-editor',
  templateUrl: './event-editor.component.html',
  styleUrls: ['./event-editor.component.scss']
})
export class EventEditorComponent implements OnInit, OnChanges {

  private formBuilder = inject(FormBuilder);
  private clientService = inject(ClientService);
  private scheduleService = inject(ScheduleService);
  private dialog = inject(MatDialog);

  @Input() id!: number;
  @Input() category: 'client-group' | 'client' = 'client';
  @Input() eventId!: number | null;
  @Output() eventUpdated: EventEmitter<void> = new EventEmitter<void>();
  event!: DetailedEvent;

  programList$!: Observable<ListItem[]>;
  eventRepeatingOptions: ListItem[] = eventRepeatingOptions;

  formGroup!: FormGroup | null;

  ngOnInit() {
    this.programList$ = this.clientService.getProgramList();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.formGroup = null;
    if (changes['eventId'].currentValue) {
      this.scheduleService.getEvent(changes['eventId'].currentValue, this.eventCategory).pipe(
        tap(event => {
          this.event = event;
          this.buildForm();

          if (event) {
            this.updateForm(event);
          }
        })
      ).subscribe();
    } else {
      this.buildForm();
    }

  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      id: [{value: null, disabled: true}],
      name: ['', Validators.required],
      content: [null, Validators.required],
      start: [null, Validators.required],
      end: [null, Validators.required],
      repeating: [null],
      repeat_every_n: [null],
      repeating_end: [null],
      high_priority: [false],
    });
  }

  updateForm(event: DetailedEvent) {
    this.formGroup?.patchValue(event);
    this.formGroup?.get('start')?.setValue((new Date(event.start)).toISOString().substring(0, 16));
    this.formGroup?.get('end')?.setValue((new Date(event.end)).toISOString().substring(0, 16));
    if (event.repeating_end) {
      this.formGroup?.get('repeating_end')?.setValue((new Date(event.repeating_end)).toISOString().substring(0, 16));
    }
    this.formGroup?.get('content')?.setValue(event.content.object);
  }

  save() {
    const form = {
      ...this.formGroup?.value,
      id: this.eventId,
      content: {
        id: `pr${this.formGroup?.get('content')?.value?.id}`,
        object: this.formGroup?.get('content')?.value,
        type: 'program',
      },
      repeating: this.formGroup?.get('repeating')?.value ? this.formGroup?.get('repeating')?.value : 'NO',
    }

    if (this.category === 'client') {
      form.client = this.id;
    } else {
      form.group = this.id;
    }

    if (this.eventId) {
      return this.scheduleService.updateEvent(this.eventId, this.eventCategory, form)
        .subscribe(() => this.eventUpdated.emit());
    }
    return this.scheduleService.createEvent(this.eventCategory, form)
      .subscribe(() => this.eventUpdated.emit());
  }

  discard(event: DetailedEvent) {
    this.buildForm();
    this.updateForm(event);
  }

  remove(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: `Are you sure you want to delete this event? This action is irreversible.` }
    });

    dialogRef.afterClosed().pipe(
      filter((res: boolean) => res),
      switchMap(() => {
        return this.scheduleService.deleteEvent(id, this.eventCategory).pipe(
          tap(() => this.eventUpdated.emit())
        );
      })
    ).subscribe();
  }

  get eventCategory() {
    return this.category === 'client' ? 'event' : 'group-event';
  }

}
