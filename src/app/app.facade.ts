import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject, map, of, switchMap, tap } from 'rxjs';
import { AppService } from './app.service';
import { ProductService } from './product.service';

interface Telemetry {
  executionTime: string;
  count: string;
  hits: string;
}

@Injectable({ providedIn: 'root' })
export class AppFacade {
  private readonly appService = inject(AppService);
  private readonly productService = inject(ProductService);

  readonly showSpinner$ = new BehaviorSubject(false);
  readonly message$ = new Subject<string>();
  readonly telemetry$ = new Subject<Telemetry>();

  init() {
    this.showSpinner$.next(true);
    this.appService
      .getProducts()
      .pipe(
        tap(() => {
          this.showSpinner$.next(false);
        }),
        switchMap((d) =>
          this.productService.saveAll(d).pipe(
            map((res) => `${res.length} entries indexed by Orama`),
            tap((message) => console.log(message)),
            tap((message) => this.message$.next(message))
          )
        )
      )
      .subscribe();
  }

  search(term: string | null) {
    if (term) {
      return this.productService.search({ term }).pipe(
        tap((res) =>
          console.log(
            `%csearch time: ${res.elapsed.formatted}`,
            'background: red; color: white; font-size: x-large'
          )
        ),
        tap((res) =>
          this.telemetry$.next({
            executionTime: res.elapsed.formatted,
            count: res.count.toString(),
            hits: res.hits.length.toString(),
          })
        ),
        tap((res) => console.log(res)),
        map((res) => res.hits),
        map((hits) =>
          hits.map(({ document: { url, thumbnailUrl, title } }) => ({
            url,
            thumbnailUrl,
            title,
          }))
        )
      );
    }

    return of([]);
  }
}
