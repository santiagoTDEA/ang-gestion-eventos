import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { STYLES, GenericAlertType } from './utils/style';
const FADE_OUT_MS = 300;

@Component({
  selector: 'app-generic-alert',
  templateUrl: './generic-alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericAlertComponent implements OnInit, OnDestroy {
  readonly type = input<GenericAlertType>('info');
  readonly duration = input<number>(5000);
  readonly closable = input<boolean>(true);
  readonly closed = output<void>();

  protected readonly shown = signal(false);
  protected readonly running = signal(false);

  protected readonly styles = computed(() => STYLES[this.type()]);
  protected readonly role = computed(() =>
    this.type() === 'error' || this.type() === 'warning' ? 'alert' : 'status'
  );
  protected readonly containerClasses = computed(
    () => `${this.styles().box} ${this.shown() ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`
  );

  private closing = false;
  private frameId?: number;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private fadeTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.frameId = requestAnimationFrame(() => {
      this.shown.set(true);
      this.running.set(true);
    });

    this.hideTimer = setTimeout(() => this.close(), this.duration());
  }

  close(): void {
    if (this.closing) return;
    this.closing = true;

    clearTimeout(this.hideTimer);
    this.shown.set(false);
    this.fadeTimer = setTimeout(() => this.closed.emit(), FADE_OUT_MS);
  }

  ngOnDestroy(): void {
    if (this.frameId !== undefined) cancelAnimationFrame(this.frameId);
    clearTimeout(this.hideTimer);
    clearTimeout(this.fadeTimer);
  }
}