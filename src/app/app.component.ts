import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { debounceTime, filter, startWith, switchMap, tap } from 'rxjs';
import { AppFacade } from './app.facade';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly facade = inject(AppFacade);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly title = 'Angular ❤️ Orama';
  readonly autocompleteFormControl = this.fb.control({
    value: '',
    disabled: true,
  });
  readonly options$ = this.autocompleteFormControl.valueChanges.pipe(
    debounceTime(400),
    filter((term) => Boolean(term) && typeof term === 'string'),
    switchMap((term) => this.facade.search(term)),
    tap(console.log),
    startWith([])
  );

  readonly showSpinner$ = this.facade.showSpinner$;
  readonly telemetry$ = this.facade.telemetry$;

  ngOnInit() {
    this.facade.message$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((message) => {
          this.autocompleteFormControl.enable();
          this.snackBar.open(message, 'OK', {
            duration: 10000,
          });
        })
      )
      .subscribe();

    this.facade.init();
  }

  displayFn(item: { title: string }) {
    return item && item.title ? item.title : '';
  }
}
