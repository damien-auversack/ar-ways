import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HomepageComponent } from './view/homepage/homepage.component';
import { ViewComponent } from './view/view.component';
import { ModelComponent } from './model/model.component';
import { ArSceneComponent } from './view/ar-scene/ar-scene.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    ViewComponent,
    ModelComponent,
    ArSceneComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
