import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomepageComponent} from "./view/homepage/homepage.component";
import {PageNotFoundComponent} from "./view/page-not-found/page-not-found.component";

const routes: Routes = [
  {path: '', component : HomepageComponent},
  {path: ':role', component : HomepageComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
