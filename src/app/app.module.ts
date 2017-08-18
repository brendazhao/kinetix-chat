import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';
import * as firebase from 'firebase';

import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { DataService } from './data.service';

// import { routing } from './app.routers';
import { NewChannelComponent } from './chat/new-channel/new-channel.component';
  // Initialize Firebase
  const config = {
    apiKey: 'AIzaSyCK2ovXv1Rh59ydcpscWgEVtoUBLMaFGk8',
    authDomain: 'chatapp-b8b34.firebaseapp.com',
    databaseURL: 'https://chatapp-b8b34.firebaseio.com',
    projectId: 'chatapp-b8b34',
    storageBucket: 'chatapp-b8b34.appspot.com',
    messagingSenderId: '567426598222'
  };
  firebase.initializeApp(config);
@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    NewChannelComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  //  routing,
    AngularFireModule,
    AngularFireModule.initializeApp(config)
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
