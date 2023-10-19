import {NgModule} from "@angular/core";
import {MobileDirective} from "./mobile.directive";
import {DesktopDirective} from "./desktop.directive";
import {CommonModule} from "@angular/common";

@NgModule({
  imports: [CommonModule],
  declarations: [DesktopDirective, MobileDirective],
  exports: [DesktopDirective, MobileDirective]
})
export class ResponsiveModule { }
