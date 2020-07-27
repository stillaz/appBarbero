import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PersonaPage } from './persona.page';

describe('PersonaPage', () => {
  let component: PersonaPage;
  let fixture: ComponentFixture<PersonaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
