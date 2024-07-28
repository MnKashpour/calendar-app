import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingInvitesComponent } from './pending-invites-dialog.component';

describe('PendingInvitesComponent', () => {
  let component: PendingInvitesComponent;
  let fixture: ComponentFixture<PendingInvitesComponent>;

  beforeAll(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingInvitesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingInvitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
