import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {
  private regex: RegExp = new RegExp(/[^0-9]/g);
  private specialKeys: Array<string> = [
    "Backspace",
    "Tab",
    "End",
    "Home",
    "ArrowLeft",
    "ArrowRight",
    "Delete",
  ];
  constructor(private el: ElementRef) {}
  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    var keyCode = event.which || event.keyCode;
    if (
      keyCode == 9 ||
      keyCode == 38 ||
      keyCode == 39 ||
      keyCode == 37 ||
      keyCode == 40 ||
      keyCode == 8 ||
      keyCode == 46 ||
      keyCode == 118
    ) {
      return true;
    }
    if (event.ctrlKey) {
      if (
        event.key.toLowerCase() != "c" &&
        event.key.toLowerCase() != "v" &&
        event.key.toLowerCase() != "x"
      ) {
        event.preventDefault();
        return;
      }
    } else {
      if (this.specialKeys.indexOf(event.key) !== -1) {
        event.preventDefault();
        return;
      }
      let current: string = this.el.nativeElement.value;
      let next: string = current.concat(event.key);
      if (next && String(next).match(this.regex)) {
        event.preventDefault();
      }
    }
  }
}
