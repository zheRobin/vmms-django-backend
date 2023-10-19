import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {PlayerComponent} from "./components/player/player.component";

const routes: Routes = [
  {
    path: 'secret/:clientSecret',
    component: PlayerComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
