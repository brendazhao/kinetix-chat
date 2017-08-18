import { Component, OnInit, Input, Inject, forwardRef, Host } from '@angular/core';
import { ChatComponent } from 'app/chat/chat.component';

@Component({
  selector: 'app-new-channel',
  styleUrls: ['./new-channel.component.css'],
  template: `
            <button *ngFor="let newInputEle of newInput"
            class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color-text--white"
            (click)="navComp(newInputEle)">
            {{newInputEle}}</button>`
})
export class NewChannelComponent implements OnInit {
   @Input() newInput = '';
   newInputEle = this.newInput[0]
   constructor(private _parent: ChatComponent) { }

  ngOnInit() {
  }

  navComp(ch) {
    console.log('hi');
    // Call the parent function
    console.log(ch);
    this._parent.nav(ch);
  }
}
