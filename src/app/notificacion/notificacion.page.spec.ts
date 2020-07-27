import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NotificacionPage } from './notificacion.page';

describe('NotificacionPage', () => {
  let component: NotificacionPage;
  let fixture: ComponentFixture<NotificacionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificacionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
