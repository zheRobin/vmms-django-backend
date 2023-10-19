import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListButtonsComponent } from './list-buttons.component';

describe('ListButtonsComponent', () => {
  let component: ListButtonsComponent;
  let fixture: ComponentFixture<ListButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
