import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {PageLayoutComponent} from "./page-layout/page-layout.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {PagesRoutingModule} from "./pages-routing.module";
import {ReactiveFormsModule} from "@angular/forms";
import {VmmsSharedModule, AngularMaterialModule} from "vmms-common";
import {UsersComponent} from "./users/users.component";
import {UserDashboardComponent} from "./users/user-dashboard/user-dashboard.component";
import {UserEditorComponent} from "./users/user-editor/user-editor.component";
import { ClientsComponent } from './clients/clients.component';
import { ClientDashboardComponent } from './clients/client-dashboard/client-dashboard.component';
import { ClientEditorComponent } from './clients/client-editor/client-editor.component';
import { PlayerVersionsComponent } from './player-versions/player-versions.component';
import { PlayerVersionEditorComponent } from './player-versions/player-version-editor/player-version-editor.component';
import {FolderEditorComponent} from "./folder-editor/folder-editor.component";
import { SchedulesComponent } from './schedules/schedules.component';
import { ScheduleDashboardComponent } from './schedules/schedule-dashboard/schedule-dashboard.component';
import { ScheduleEditorComponent } from './schedules/schedule-editor/schedule-editor.component';
import { LinkPreviewsComponent } from './link-previews/link-previews.component';
import { LinkPreviewEditorComponent } from './link-previews/link-preview-editor/link-preview-editor.component';
import { LinkPreviewDashboardComponent } from './link-previews/link-preview-dashboard/link-preview-dashboard.component';
import { MasterSchedulesComponent } from './master-schedules/master-schedules.component';
import { ClientGroupsComponent } from './client-groups/client-groups.component';
import { ClientGroupDashboardComponent } from './client-groups/client-group-dashboard/client-group-dashboard.component';
import { EventEditorComponent } from './event-editor/event-editor.component';
import { ClientGroupEditorComponent } from './client-groups/client-group-editor/client-group-editor.component';
import { ClientGroupScheduleComponent } from './client-groups/client-group-schedule/client-group-schedule.component';

@NgModule({
  declarations: [
    PageLayoutComponent,
    DashboardComponent,
    FolderEditorComponent,
    ClientsComponent,
    ClientDashboardComponent,
    ClientEditorComponent,
    UsersComponent,
    UserDashboardComponent,
    UserEditorComponent,
    PlayerVersionsComponent,
    PlayerVersionEditorComponent,
    SchedulesComponent,
    ScheduleDashboardComponent,
    ScheduleEditorComponent,
    LinkPreviewsComponent,
    LinkPreviewEditorComponent,
    LinkPreviewDashboardComponent,
    MasterSchedulesComponent,
    ClientGroupsComponent,
    ClientGroupDashboardComponent,
    EventEditorComponent,
    ClientGroupEditorComponent,
    ClientGroupScheduleComponent,
  ],
  imports: [
    CommonModule,
    RouterOutlet,
    SharedModule,
    AngularMaterialModule,
    RouterLinkActive,
    RouterLink,
    PagesRoutingModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    VmmsSharedModule,
    SharedModule,
  ],
})
export class PagesModule { }
