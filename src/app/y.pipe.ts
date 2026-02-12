import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'y',
  standalone: true
})
export class YPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
