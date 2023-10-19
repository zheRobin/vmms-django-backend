import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { ListButtonsComponent } from './components/list-buttons/list-buttons.component';
import { CreateFolderDialogComponent } from './modals/create-folder-dialog/create-folder-dialog.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { CustomTextareaInputComponent } from './components/custom-textarea-input/custom-textarea-input.component';
import { CustomTagSelectorComponent } from './components/custom-tag-selector/custom-tag-selector.component';
import { FolderTreeComponent } from './components/folder-tree/folder-tree.component';
import { CustomGenreSelectorComponent } from './components/custom-genre-selector/custom-genre-selector.component';
import {IsFolderOpenedPipe} from "./pipes/is-folder-opened.pipe";
import { GetInnerFileSystemPipe } from './pipes/get-inner-file-system.pipe';
import { CustomColorSelectorComponent } from './components/custom-color-selector/custom-color-selector.component';
import { ConfirmationDialogComponent } from './modals/confirmation-dialog/confirmation-dialog.component';
import { CustomPlaylistInputComponent } from './components/custom-playlist-input/custom-playlist-input.component';
import { GetPlaylistSoundsAmountPipe } from './pipes/get-playlist-sounds-amount.pipe';
import { GetDependentsListPipe } from './pipes/get-dependents-list.pipe';
import { GetPlaylistByIdPipe } from './pipes/get-playlist-by-id.pipe';
import { FilterFolderTreePipe } from './pipes/filter-folder-tree.pipe';
import {AngularMaterialModule, VmmsSharedModule} from "vmms-common";
import {MAT_DIALOG_DEFAULT_OPTIONS} from "@angular/material/dialog";

@NgModule({
  declarations: [
    ListButtonsComponent,
    CreateFolderDialogComponent,
    CustomTextareaInputComponent,
    CustomTagSelectorComponent,
    FolderTreeComponent,
    CustomGenreSelectorComponent,
    IsFolderOpenedPipe,
    GetInnerFileSystemPipe,
    CustomColorSelectorComponent,
    ConfirmationDialogComponent,
    CustomPlaylistInputComponent,
    GetPlaylistSoundsAmountPipe,
    GetDependentsListPipe,
    GetPlaylistByIdPipe,
    FilterFolderTreePipe,
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    FormsModule,
    VmmsSharedModule,
  ],
  exports: [
    ListButtonsComponent,
    CustomTextareaInputComponent,
    CustomTagSelectorComponent,
    FolderTreeComponent,
    CustomGenreSelectorComponent,
    IsFolderOpenedPipe,
    CustomColorSelectorComponent,
    CustomPlaylistInputComponent,
    GetDependentsListPipe,
    FilterFolderTreePipe,
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {maxWidth: 400, minWidth: 400} }
  ]
})
export class SharedModule { }
