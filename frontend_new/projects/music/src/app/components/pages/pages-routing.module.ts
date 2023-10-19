import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {PageLayoutComponent} from "./page-layout/page-layout.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {PlaylistsComponent} from "./playlists/playlists.component";
import {ProgramsComponent} from "./programs/programs.component";
import {UsersComponent} from "./users/users.component";
import {PlaylistEditorComponent} from "./playlists/playlist-editor/playlist-editor.component";
import {FolderEditorComponent} from "./folder-editor/folder-editor.component";
import {PlaylistDashboardComponent} from "./playlists/playlist-dashboard/playlist-dashboard.component";
import {ProgramDashboardComponent} from "./programs/program-dashboard/program-dashboard.component";
import {ProgramEditorComponent} from "./programs/program-editor/program-editor.component";
import {UserDashboardComponent} from "./users/user-dashboard/user-dashboard.component";
import {UserEditorComponent} from "./users/user-editor/user-editor.component";

export const routes: Routes = [
  {
    path: '',
    component: PageLayoutComponent,
    children: [
      {
        path: '', pathMatch: 'full', redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'playlists',
        component: PlaylistsComponent,
        children: [
          {
            path: '', pathMatch: 'full', redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: PlaylistDashboardComponent
          },
          {
            path: 'playlist', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'folder', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'folder/:id',
            component: FolderEditorComponent,
            data: { category: 'playlist' }
          },
          {
            path: 'playlist/new',
            component: PlaylistEditorComponent
          },
          {
            path: 'playlist/:playlistId',
            component: PlaylistEditorComponent
          }
        ]
      },
      {
        path: 'programs',
        component: ProgramsComponent,
        children: [
          {
            path: '', pathMatch: 'full', redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: ProgramDashboardComponent
          },
          {
            path: 'program', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'folder', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'folder/:id',
            component: FolderEditorComponent,
            data: { category: 'program' }
          },
          {
            path: 'program/new',
            component: ProgramEditorComponent
          },
          {
            path: 'program/:programId',
            component: ProgramEditorComponent,
          },
          {
            path: 'program/:programId/playlist', pathMatch: 'full', redirectTo: 'program/:programId'
          },
          {
            path: 'program/:programId/playlist/:playlistId',
            component: PlaylistEditorComponent
          }
        ],
      },
      {
        path: 'users',
        component: UsersComponent,
        children: [
          {
            path: '', pathMatch: 'full', redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: UserDashboardComponent
          },
          {
            path: 'user', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'user/new',
            component: UserEditorComponent,
          },
          {
            path: 'user/:id',
            component: UserEditorComponent,
          },
        ],
      },
      {
        path: '**', redirectTo: 'dashboard'
      },
    ]
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class PagesRoutingModule { }
