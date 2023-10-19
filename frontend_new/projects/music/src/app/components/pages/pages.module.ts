import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {PageLayoutComponent} from "./page-layout/page-layout.component";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {PagesRoutingModule} from "./pages-routing.module";
import { DashboardComponent } from './dashboard/dashboard.component';
import { PlaylistsComponent } from './playlists/playlists.component';
import { ProgramsComponent } from './programs/programs.component';
import { UsersComponent } from './users/users.component';
import { PlaylistEditorComponent } from './playlists/playlist-editor/playlist-editor.component';
import { FolderEditorComponent } from './folder-editor/folder-editor.component';
import {ReactiveFormsModule} from "@angular/forms";
import { PlaylistDashboardComponent } from './playlists/playlist-dashboard/playlist-dashboard.component';
import { ProgramDashboardComponent } from './programs/program-dashboard/program-dashboard.component';
import { ProgramEditorComponent } from './programs/program-editor/program-editor.component';
import { UserDashboardComponent } from './users/user-dashboard/user-dashboard.component';
import { UserEditorComponent } from './users/user-editor/user-editor.component';
import { SongsPreviewComponent } from './songs-preview/songs-preview.component';
import {VmmsSharedModule, AngularMaterialModule} from "vmms-common";

@NgModule({
  declarations: [
    PageLayoutComponent,
    DashboardComponent,
    PlaylistsComponent,
    ProgramsComponent,
    UsersComponent,
    PlaylistEditorComponent,
    FolderEditorComponent,
    PlaylistDashboardComponent,
    ProgramDashboardComponent,
    ProgramEditorComponent,
    UserDashboardComponent,
    UserEditorComponent,
    SongsPreviewComponent,
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    SharedModule,
    RouterLinkActive,
    RouterLink,
    PagesRoutingModule,
    AngularMaterialModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    VmmsSharedModule,
  ]
})
export class PagesModule { }
