import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DetalleNoDisponibleComponent } from './detalle-no-disponible.component';

describe('DetalleNoDisponibleComponent', () => {
  let component: DetalleNoDisponibleComponent;
  let fixture: ComponentFixture<DetalleNoDisponibleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetalleNoDisponibleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleNoDisponibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
