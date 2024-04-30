import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TvmodePage } from './tvmode.page';

describe('TvmodePage', () => {
  let component: TvmodePage;
  let fixture: ComponentFixture<TvmodePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TvmodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
