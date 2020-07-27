import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReportePage } from './reporte.page';

describe('ReportePage', () => {
  let component: ReportePage;
  let fixture: ComponentFixture<ReportePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
