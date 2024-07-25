import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDayEventsDialogComponent } from './all-day-events-dialog.component';

describe('AllDayEventsDialogComponent', () => {
  let component: AllDayEventsDialogComponent;
  let fixture: ComponentFixture<AllDayEventsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllDayEventsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllDayEventsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
