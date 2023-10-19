import { NgModule } from '@angular/core';
import { CommonComponent } from './common.component';
import {NavBarComponent} from "./components/nav-bar/nav-bar.component";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {MatExpansionModule} from "@angular/material/expansion";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {ResponsiveModule} from "./modules/responsive/responsive.module";
import {CustomInputComponent} from "./components/custom-input/custom-input.component";
import {ReactiveFormsModule} from "@angular/forms";
import {CustomSelectComponent} from "./components/custom-select/custom-select.component";
import {CustomFileInputComponent} from "./components/custom-file-input/custom-file-input.component";
import {FilterItemListPipe} from "./pipes/filter-item-list.pipe";
import {GetFilterTypePipe} from "./pipes/get-filter-type.pipe";
import {GetFiltersForFieldPipe} from "./pipes/get-filters-for-field.pipe";
import {CustomFilterInputComponent} from "./components/custom-filter-input/custom-filter-input.component";
import {GetFormArrayPipe} from "./pipes/get-form-array.pipe";
import {GetFormControlPipe} from "./pipes/get-form-control.pipe";
import {GetFormGroupPipe} from "./pipes/get-form-group.pipe";
import {CustomTagInputComponent} from "./components/custom-tag-input/custom-tag-input.component";
import {AngularMaterialModule} from "./modules/angular-material.module";
import {GetItemLabelByIdPipe} from "./pipes/get-item-label-by-id.pipe";
import {FilterItemListBySearchPipe} from "./pipes/filter-item-list-by-search.pipe";
import {
  CustomAutocompleteInputComponent
} from "./components/custom-autocomplete-input/custom-autocomplete-input.component";
import {SpinnerComponent} from "./components/spinner/spinner.component";
import {GetPrefixListPipe} from "./pipes/get-prefix-list.pipe";

@NgModule({
  declarations: [
    CommonComponent,
    NavBarComponent,
    CustomInputComponent,
    CustomSelectComponent,
    CustomFileInputComponent,
    CustomFilterInputComponent,
    CustomTagInputComponent,
    CustomAutocompleteInputComponent,
    SpinnerComponent,

    FilterItemListPipe,
    FilterItemListBySearchPipe,
    GetFilterTypePipe,
    GetFiltersForFieldPipe,
    GetFormArrayPipe,
    GetFormControlPipe,
    GetFormGroupPipe,
    GetItemLabelByIdPipe,
    GetPrefixListPipe,
  ],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatExpansionModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
  exports: [
    CommonComponent,
    NavBarComponent,
    CustomInputComponent,
    CustomSelectComponent,
    CustomFileInputComponent,
    CustomFilterInputComponent,
    CustomTagInputComponent,
    CustomAutocompleteInputComponent,
    SpinnerComponent,

    FilterItemListPipe,
    FilterItemListBySearchPipe,
    GetFilterTypePipe,
    GetFiltersForFieldPipe,
    GetFormArrayPipe,
    GetFormControlPipe,
    GetFormGroupPipe,
    GetItemLabelByIdPipe,
    GetPrefixListPipe,

    ResponsiveModule,
  ]
})
export class VmmsSharedModule { }
