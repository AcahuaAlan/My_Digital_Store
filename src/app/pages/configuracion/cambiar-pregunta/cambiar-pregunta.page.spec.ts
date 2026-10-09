import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CambiarPreguntaPage } from './cambiar-pregunta.page';

describe('CambiarPreguntaPage', () => {
  let component: CambiarPreguntaPage;
  let fixture: ComponentFixture<CambiarPreguntaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CambiarPreguntaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
