import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArSceneComponent } from './ar-scene.component';

describe('ArSceneComponent', () => {
  let component: ArSceneComponent;
  let fixture: ComponentFixture<ArSceneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArSceneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArSceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
