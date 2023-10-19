import {inject, Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

export type ResponsiveFormat = 'DESKTOP' | 'TABLET' | 'MOBILE';

@Injectable({
  providedIn: 'root',
})
export class ResponsiveService {

  private responsive = inject(BreakpointObserver);

  responsiveChangeSubject = new Subject<ResponsiveFormat>();
  responsiveCheckSubject = new Subject<ResponsiveFormat>();

  responsiveFormat!: ResponsiveFormat;

  constructor() {
    this.responsive.observe([
      Breakpoints.Small,
      Breakpoints.XSmall
    ]).subscribe(result => {
      const breakpoints = result.breakpoints;

      if (breakpoints[Breakpoints.Small]) {
        return this.checkResponsiveFormat('MOBILE');
      }

      if (breakpoints[Breakpoints.XSmall]) {
        return this.checkResponsiveFormat('MOBILE');
      }

      return this.checkResponsiveFormat('DESKTOP');
    });
  }

  checkResponsiveFormat(format: ResponsiveFormat) {
    this.responsiveCheckSubject.next(this.responsiveFormat);

    const oldFormat = this.responsiveFormat;

    if (format === 'DESKTOP') {
      this.responsiveFormat = 'DESKTOP';
      document.body.classList.remove('mobile');
      document.body.classList.add('desktop');
    }

    if (format === 'MOBILE') {
      this.responsiveFormat = 'MOBILE';
      document.body.classList.remove('desktop');
      document.body.classList.add('mobile');
    }

    if (oldFormat !== this.responsiveFormat) {
      this.responsiveChangeSubject.next(this.responsiveFormat);
    }
  }

  get isDesktop(): boolean {
    return this.responsiveFormat === 'DESKTOP';
  }

  get isMobile(): boolean {
    return this.responsiveFormat === 'MOBILE';
  }

}
