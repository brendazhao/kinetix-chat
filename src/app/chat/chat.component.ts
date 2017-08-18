import { Component, OnInit, Input, Output, EventEmitter, Injectable } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';

import * as firebase from 'firebase';

// This variable is used to connect the database

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  // init part decleartion
  messageList: any;
  messageForm: any;
  messageInput: any;
  submitButton: any;
  submitImageButton: any;
  imageForm: any;
  mediaCapture: any;
  userPic: any;
  userName: any;
  signInButton: any;
  signOutButton: any;
  signInSnackbar: any;
  navBar: any;

  // function initFirebase()
  database: any;
  storage: any;
  auth: any;

  // function save message
  messagesRef: any;

  channelNum: any;

  welcomeMsg: any;
  messageContainer: any;

  newChannel: any;
  myInput: any;

  newInput: Array<string>;
  myNewChannelComp: any;

  constructor() {
    this.channelNum = 'Home';
    this.newInput = [];
    console.log('55');
  }

  ngOnInit() {

    // Shortcuts to DOM Elements.
    this.messageList = document.getElementById('messages');
    this.messageForm = document.getElementById('message-form');
    this.messageInput = document.getElementById('message');
    this.submitButton = document.getElementById('submit');
    this.submitImageButton = document.getElementById('submitImage');
    this.imageForm = document.getElementById('image-form');
    this.mediaCapture = document.getElementById('mediaCapture');
    this.userPic = document.getElementById('user-pic');
    this.userName = document.getElementById('user-name');
    this.signInButton = document.getElementById('sign-in');
    this.signOutButton = document.getElementById('sign-out');
    this.signInSnackbar = document.getElementById('must-signin-snackbar');
    this.navBar = document.getElementById('nav');

    this.messageContainer = document.getElementById('messages-card-container');
    this.welcomeMsg = document.getElementById('welcome-message');

    this.newChannel = document.getElementById('newChannel');
    this.myInput = document.getElementById('myInput');
    this.myNewChannelComp = document.getElementById('myNewChannelComp');

    // Saves message on form submit.
    this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton.addEventListener('click', this.signIn.bind(this));

    // Toggle for the button.
    const buttonTogglingHandler = this.toggleButton.bind(this);
    this.messageInput.addEventListener('keyup', buttonTogglingHandler);
    this.messageInput.addEventListener('change', buttonTogglingHandler);

    // Events for image upload.
    this.submitImageButton.addEventListener('click', function(e) {
      e.preventDefault();
      this.mediaCapture.click();
    }.bind(this));
    this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

    this.initFirebase();
    console.log('99');
  }

  // Signs-in Friendly Chat.
  signIn() {
    console.log('signin');
    const provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);
  }

  // Signs-in Friendly Chat.
   signOut() {
     console.log('signout');
    // Sign out of Firebase.
    this.auth.signOut();
  }

  // Returns true if user is signed-in. Otherwise false and displays a message.
  checkSignedInWithMessage() {
    console.log('checksignedinwithmessage');
    // Return true if the user is signed in Firebase
    if (this.auth.currentUser) {
      return true;
    }

    // Display a message to the user using a Toast.
    const data = {
      message: 'You must sign-in first',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return false;
  };


  toggleButton() {
    if (this.messageInput.value) {
      this.submitButton.removeAttribute('disabled');
    } else {
      this.submitButton.setAttribute('disabled', 'true');
    }
  }

  initFirebase() {
    // Shortcuts to Firebase SDK features.
    this.database = firebase.database();
    this.storage = firebase.storage();
    this.auth = firebase.auth();
    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
 }

  onAuthStateChanged(user) {
        // console.log(user)
    if (user) { // User is signed in!
      // Get profile pic and user's name from the Firebase user object.

      const profilePicUrl = user.photoURL;
      const userName = user.displayName;

      // Set the user's profile pic and name.
      this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || 'assets/images/profile_placeholder.png') + ')';
      this.userName.textContent = userName;

      // Show user's profile and sign-out button.
      this.userName.removeAttribute('hidden');
      this.userPic.removeAttribute('hidden');
      if (this.signOutButton) {
        this.signOutButton.removeAttribute('hidden');
        this.navBar.removeAttribute('hidden');
      }

      // Hide sign-in button.
      if (this.signInButton) {
        this.signInButton.setAttribute('hidden', 'true');
      }

      // We load currently existing chart messages.
      this.loadMessages();
  //   We save the Firebase Messaging Device token and enable notifications.
      navigator.serviceWorker.register('assets/firebase-messaging-sw.js')
        .then((registration) => {
        firebase.messaging().useServiceWorker(registration);
        console.log('182');
        this.saveMessagingDeviceToken();
      }).catch(function(err){
        console.log(err);
      });
      this.saveMessagingDeviceToken();

    } else { // User is signed out!
      // Hide user's profile and sign-out button.
      this.userName.setAttribute('hidden', 'true');
      this.userPic.setAttribute('hidden', 'true');
      this.signOutButton.setAttribute('hidden', 'true');
      this.navBar.setAttribute('hidden', 'true');

      // Show sign-in button.
      this.signInButton.removeAttribute('hidden');
    }
  }

  // Saves the messaging device token to the datastore.
  saveMessagingDeviceToken() {
     console.log(firebase.messaging().getToken())
      firebase.messaging().getToken().then(function(currentToken) {
        console.log(currentToken)
      if (currentToken) {
        console.log('Got FCM device token:', currentToken);
        // Saving the Device Token to the datastore.
        firebase.database().ref('/fcmTokens').child(currentToken)
            .set(firebase.auth().currentUser.uid);
      } else {
        // Need to request permissions to show notifications.
        this.requestNotificationsPermissions();
      }
    }.bind(this)).catch(function(error){
      console.error('Unable to get messaging token.', error);
    });
  }


  // Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
  setImageUrl (imageUri, imgElement) {
    // If the image is a Cloud Storage URI we fetch the URL.
    if (imageUri.startsWith('gs://')) {
      imgElement.src = 'https://www.google.com/images/spin-32.gif'; // Display a loading image first.
      this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
        imgElement.src = metadata.downloadURLs[0];
      });
    } else {
      imgElement.src = imageUri;
    }
  }

// Requests permissions to show notifications.
  requestNotificationsPermissions () {
    console.log('Requesting notifications permission...');
    firebase.messaging().requestPermission().then(function() {
      // Notification permission granted.
      this.saveMessagingDeviceToken();

    }.bind(this)).catch(function(error) {
      console.error('Unable to get permission to notify.', error);
    });
  }


    // Saves a new message containing an image URI in Firebase.
  // This first saves the image in Firebase storage.
  saveImageMessage(event) {
    event.preventDefault();
    const file = event.target.files[0];

    // Clear the selection in the file picker input.
    this.imageForm.reset();

    // Check if the file is an image.
  //  let flag = 'image';
    if (!file.type.match('image.*')) {
      const data = {
        message: 'You can only share images',
        timeout: 2000
      };
      this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
      return;
    //  flag = 'file';
    }

    // Check if the user is signed-in
    if (this.checkSignedInWithMessage()) {

      // We add a message with a loading icon that will get updated with the shared image.
      const currentUser = this.auth.currentUser;
      this.messagesRef.push({
        name: currentUser.displayName,
        imageUrl: 'https://www.google.com/images/spin-32.gif', // FriendlyChat.LOADING_IMAGE_URL,
        photoUrl: currentUser.photoURL || '/assets/images/profile_placeholder.png'
       // flag: flag
      }).then(function(data) {

        // Upload the image to Cloud Storage.
        const filePath = currentUser.uid + '/' + data.key + '/' + file.name;
        return this.storage.ref(filePath).put(file).then(function(snapshot) {

          // Get the file's Storage URI and update the chat message placeholder.
          const fullPath = snapshot.metadata.fullPath;
           console.log(fullPath)
          return data.update({imageUrl: this.storage.ref(fullPath).toString()});
        }.bind(this));
      }.bind(this)).catch(function(error) {
        console.error('There was an error uploading a file to Cloud Storage:', error);
      });
    }
  }

  // Loads chat messages history and listens for upcoming ones.
  loadMessages() {
    console.log(this.channelNum);
    // Reference to the /messages/ database path.
      this.messageList.innerHTML = '';
      this.messagesRef = this.database.ref('messages/' + this.channelNum);
      // Make sure we remove all previous listeners.
      this.messagesRef.off();
      // Loads the last 12 messages and listen for new ones.
      const setMessage = function(data) {
      const val = data.val();
        this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl, val.channel, val.flag);
      }.bind(this);
      this.messagesRef.limitToLast(12).on('child_added', setMessage);
      this.messagesRef.limitToLast(12).on('child_changed', setMessage);
  }

   // Displays a Message in the UI.
  displayMessage = function(key, name, text, picUrl, imageUri, channel, flag) {
    let div = document.getElementById(key);
    // If an element for that message does not exists yet we create it.
    // load the info in this channl
      if (!div) {
        const container = document.createElement('div');
        container.innerHTML =  '<div class="message-container">' +
        '<div class="spacing"><div class="pic"></div></div>' +
        '<div class="message"></div>' +
        '<div class="name"></div>' +
      '</div>';
        div = <HTMLElement>container.firstChild;
        div.setAttribute('id', key);
        this.messageList.appendChild(div);
      }
      if (picUrl) {
        const tmp = <HTMLElement>div.querySelector('.pic');
        tmp.style.backgroundImage = 'url(' + picUrl + ')';
      }

      div.querySelector('.name').textContent = name;
      const messageElement = div.querySelector('.message');
      if (text) { // If the message is text.
        messageElement.textContent = text;
        // Replace all line breaks by <br>.
        messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
      } else if (imageUri) { // If the message is an image.
        const image = document.createElement('img');
        image.addEventListener('load', function() {
          this.messageList.scrollTop = this.messageList.scrollHeight;
        }.bind(this));
        this.setImageUrl(imageUri, image);
        messageElement.innerHTML = '';
        messageElement.appendChild(image);
      }
      // Show the card fading-in and scroll to view the new message.
      setTimeout(function() {div.classList.add('visible')}, 1);
      this.messageList.scrollTop = this.messageList.scrollHeight;
      this.messageInput.focus();
  }

  // Saves a new message on the Firebase DB.
  saveMessage(e) {
   // console.log('savemessage');
    e.preventDefault();
    // Check that the user entered a message and is signed in.
    if (this.messageInput.value && this.checkSignedInWithMessage()) {
      const currentUser = this.auth.currentUser;
      // Add a new message entry to the Firebase Database.
      this.messagesRef.push({
        name: currentUser.displayName,
        text: this.messageInput.value,
        photoUrl: currentUser.photoURL || '/assets/images/profile_placeholder.png',
        channel: this.channelNum
      }).then(function() {
        // Clear message text field and SEND button state.
        // FriendlyChat.resetMaterialTextfield(this.messageInput);
        this.messageInput.value = '';
        this.messageInput.parentNode.MaterialTextfield.boundUpdateClassesHandler();

        this.toggleButton();
      }.bind(this)).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
      });
    }
  }

  nav(curchannelNum) {
    // Channel1, Channel2, Channel3, Home
    this.channelNum = curchannelNum;
    this.welcomeMsg.setAttribute('hidden', 'true');
    this.messageContainer.removeAttribute('hidden');
    this.loadMessages();
  }


  navBack() {
    this.channelNum = 'Home';
    this.welcomeMsg.removeAttribute('hidden');
    this.messageContainer.setAttribute('hidden', 'true');
  }

  addChannel() {
    this.newChannel.removeAttribute('hidden');
  }

  myChannel() {
   // console.log(this.myInput.value);
    let cur = '';
    if (!this.myInput.value) {
      cur = 'defaultChannel';
    } else {
      cur = this.myInput.value;
    }
    this.newChannel.setAttribute('hidden', 'true');
    // this.channelNum = cur;
    // if this channel is not exists, add the channel
    let flag = 0;
    for (let i = 0; i < this.newInput.length; i++) {
      if (this.newInput[i] === cur) {
          flag = 1;
      }
    }
    if (flag === 0) {
      this.newInput.push(cur);
    }
    this.myNewChannelComp.removeAttribute('hidden');
  }
}


