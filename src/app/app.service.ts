import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { faker } from '@faker-js/faker';
import { withCache } from '@ngneat/cashew';
import { map } from 'rxjs';
import { Product } from './app.model';

type GetProductsResponse = Array<Product>;

@Injectable({ providedIn: 'root' })
export class AppService {
  private readonly httpClient = inject(HttpClient);

  getProducts() {
    return this.httpClient.get<GetProductsResponse>(
      'https://jsonplaceholder.typicode.com/photos',
      {
        context: withCache(),
      }
    ).pipe(map(res => res.map(({ thumbnailUrl, url, id }) => ({
      id,
      thumbnailUrl,
      url,
      title: faker.commerce.productName()
    }))));
  }
}
