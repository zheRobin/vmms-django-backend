import {AfterViewInit, Directive, OnDestroy, TemplateRef, ViewContainerRef} from "@angular/core";
import {Subscription} from "rxjs";
import {ResponsiveService} from "./responsive.service";

@Directive({
  selector: '[mobile]'
})
export class MobileDirective implements AfterViewInit, OnDestroy {

  subscription!: Subscription;

  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef,
              private responsiveService: ResponsiveService) {
  }

  ngAfterViewInit(): void {
    this.updateView();
    this.subscription = this.responsiveService.responsiveChangeSubject
      .subscribe(() => this.updateView());
  }

  updateView() {
    Promise.resolve().then(() =>
      this.responsiveService.isMobile
        ? this.viewContainer.createEmbeddedView(this.templateRef) : this.viewContainer.clear()
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
