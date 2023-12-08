import { Injectable } from '@angular/core';

import type { Orama, SearchParams, TypedDocument } from '@orama/orama';
import { create, insertMultiple, search } from '@orama/orama';
// import { stemmer } from '@orama/stemmers/dist/en.js';
import { BehaviorSubject, from, map } from 'rxjs';
import { Product } from './app.model';

type ProductDocument = TypedDocument<Orama<typeof productSchema>>;

const productSchema = {
  title: 'string',
  thumbnailUrl: 'string',
  url: 'string',
  id: 'string',
} as const; // <-- this is important

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly db$ = new BehaviorSubject<
    Orama<typeof productSchema> | undefined
  >(undefined);
  private get db() {
    return this.db$.value as Orama<typeof productSchema>;
  }

  constructor() {
    from(
      create({
        schema: productSchema,
        components: {
          tokenizer: {
            stemming: true,
            // stemmer,
            stemmerSkipProperties: ['url', 'thumbnailUrl'],
            language: 'english'
          },
        },
      })
    ).subscribe((v) => this.db$.next(v as Orama<typeof productSchema>));
  }

  saveAll(products: Array<Product>) {
    const data = products.map(({ title, thumbnailUrl, url, id }) => ({
      title,
      thumbnailUrl,
      url,
      id: id.toString(),
    }));
    return from(insertMultiple(this.db, data));
  }

  search({ term }: { term: string }) {
    const searchParams = {
      term,
      properties: ['title'],
      limit: 20,
    } satisfies SearchParams<Orama<typeof productSchema>>;
    return from(
      search<Orama<typeof productSchema>, ProductDocument>(this.db, searchParams)
    ).pipe(
      map((res) => {
        return {
          ...res,
          hits: res.hits.map((h) => ({
            ...h,
            document: { ...h.document, id: +h.document.id },
          })),
        };
      })
    );
  }
}
