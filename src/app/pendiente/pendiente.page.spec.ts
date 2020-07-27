import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PendientePage } from './pendiente.page';

describe('PendientePage', () => {
  let component: PendientePage;
  let fixture: ComponentFixture<PendientePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendientePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PendientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
