import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarDireccionPage } from './editar-direccion.page';

describe('EditarDireccionPage', () => {
  let component: EditarDireccionPage;
  let fixture: ComponentFixture<EditarDireccionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarDireccionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
