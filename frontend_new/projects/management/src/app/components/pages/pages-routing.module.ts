import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {PageLayoutComponent} from "./page-layout/page-layout.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {UsersComponent} from "./users/users.component";
import {UserDashboardComponent} from "./users/user-dashboard/user-dashboard.component";
import {UserEditorComponent} from "./users/user-editor/user-editor.component";
import {ClientsComponent} from "./clients/clients.component";
import {ClientDashboardComponent} from "./clients/client-dashboard/client-dashboard.component";
import {ClientEditorComponent} from "./clients/client-editor/client-editor.component";
import {PlayerVersionsComponent} from "./player-versions/player-versions.component";
import {PlayerVersionEditorComponent} from "./player-versions/player-version-editor/player-version-editor.component";
import {FolderEditorComponent} from "./folder-editor/folder-editor.component";
import {SchedulesComponent} from "./schedules/schedules.component";
import {ScheduleDashboardComponent} from "./schedules/schedule-dashboard/schedule-dashboard.component";
import {ScheduleEditorComponent} from "./schedules/schedule-editor/schedule-editor.component";
import {LinkPreviewsComponent} from "./link-previews/link-previews.component";
import {LinkPreviewEditorComponent} from "./link-previews/link-preview-editor/link-preview-editor.component";
import {MasterSchedulesComponent} from "./master-schedules/master-schedules.component";
import {ClientGroupsComponent} from "./client-groups/client-groups.component";
import {
  ClientGroupDashboardComponent
} from "./client-groups/client-group-dashboard/client-group-dashboard.component";
import {ClientGroupScheduleComponent} from "./client-groups/client-group-schedule/client-group-schedule.component";
import {ClientGroupEditorComponent} from "./client-groups/client-group-editor/client-group-editor.component";

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
        path: 'clients',
        component: ClientsComponent,
        children: [
          {
            path: '', pathMatch: 'full', redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: ClientDashboardComponent
          },
          {
            path: 'client', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'folder', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'folder/:id',
            component: FolderEditorComponent,
            data: { category: 'client' }
          },
          {
            path: 'client/new',
            component: ClientEditorComponent,
          },
          {
            path: 'client/:clientId',
            component: ClientEditorComponent,
          },
          {
            path: '**', redirectTo: 'dashboard'
          },
        ],
      },
      {
        path: 'schedules',
        component: SchedulesComponent,
        children: [
          {
            path: '', pathMatch: 'full', redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: ScheduleDashboardComponent
          },
          {
            path: 'schedule', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'schedule/:clientId',
            component: ScheduleEditorComponent,
          },
          {
            path: '**', redirectTo: 'dashboard'
          },
        ],
      },
      {
        path: 'master-schedules',
        component: MasterSchedulesComponent,
      },
      {
        path: 'client-groups',
        component: ClientGroupsComponent,
        children: [
          {
            path: '', pathMatch: 'full', redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: ClientGroupDashboardComponent,
          },
          {
            path: 'client-group', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'group-schedule', pathMatch: 'full', redirectTo: 'dashboard'
          },
          {
            path: 'client-group/new',
            component: ClientGroupEditorComponent,
          },
          {
            path: 'client-group/:id/edit',
            component: ClientGroupEditorComponent,
          },
          {
            path: 'client-group/:id',
            component: ClientGroupScheduleComponent,
          },
          {
            path: '**', redirectTo: 'dashboard'
          },
        ]
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
          {
            path: '**', redirectTo: 'dashboard'
          },
        ],
      },
      {
        path: 'player-versions',
        component: PlayerVersionsComponent,
        children: [
          {
            path: '', pathMatch: 'full', redirectTo: 'player-version/new',
          },
          {
            path: 'player-version', pathMatch: 'full', redirectTo: 'player-version/new'
          },
          {
            path: 'player-version/new',
            component: PlayerVersionEditorComponent,
          },
          {
            path: 'player-version/:id',
            component: PlayerVersionEditorComponent,
          },
          {
            path: '**', redirectTo: 'player-version/new'
          },
        ],
      },
      {
        path: 'link-previews',
        component: LinkPreviewsComponent,
      },
      {
        path: 'link-previews/link-preview', pathMatch: 'full', redirectTo: 'link-previews',
      },
      {
        path: 'link-previews/link-preview/new',
        component: LinkPreviewEditorComponent,
      },
      {
        path: 'link-previews/link-preview/:previewLinkId',
        component: LinkPreviewEditorComponent,
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
