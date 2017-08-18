/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// const gcs = require('@google-cloud/storage')();
// const vision = require('@google-cloud/vision')();
const exec = require('child-process-promise').exec;

//const language = require('@google-cloud/language')();

// Adds a message that welcomes new users into the chat.
exports.addWelcomeMessages = functions.auth.user().onCreate((event) => {
  const user = event.data;
  console.log('A new user signed in for the first time.');
  const fullName = user.displayName || 'Anonymous';

  // Saves the new welcome message into the database
  // which then displays it in the FriendlyChat clients.
  return admin.database().ref('messages').push({
    name: 'Welcome',
    photoUrl: '/assets/images/firebase-logo.png', // Firebase logo
    text: `${fullName} signed in for the first time!`
  });
});

// Sends a notifications to all users when a new message is posted.
exports.sendNotifications = functions.database.ref('/messages/Channel1').onWrite((event) => {
  const snapshot = event.data;
  // Only send a notification when a message has been created.
   console.log('index.js-annotatemessage');
   console.log('149'+ snapshot.previous.val());
   console.log('50'+snapshot.val());
   /*if (snapshot.previous.val()) {
    console.log('what it is????');
    return;
  }
  */
  // Notification details.
  const text = snapshot.val().text;
  console.log('56'+ snapshot.val());
  console.log('57'+text);
  console.log('58'+snapshot);
  const payload = {
    notification: {
      title: `${snapshot.val().name} posted ${text ? 'a message' : 'an image'}`,
      body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
      icon: snapshot.val().photoUrl || './../images/profile_placeholder.png',
      click_action: `https://${functions.config().firebase.authDomain}`
    }
  };

  // Get the list of device tokens.
  admin.database().ref('fcmTokens').once('value').then(allTokens => {
    if (allTokens.val()) {
      // Listing all tokens.
      const tokens = Object.keys(allTokens.val());

      // Send notifications to all tokens.
      return admin.messaging().sendToDevice(tokens, payload).then(response => {
        // For each message check if there was an error.
        const tokensToRemove = [];
        response.results.forEach((result, index) => {
          const error = result.error;
          if (error) {
            console.error('Failure sending notification to', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              tokensToRemove.push(allTokens.ref.child(tokens[index]).remove());
            }
          }
        });
        console.log(tokensToRemove);
        return Promise.all(tokensToRemove);
      });
    }
  });
});

// // Annotates messages using the Cloud Natural Language API
// exports.annotateMessages = functions.database.ref('/messages/{messageId}').onWrite((event) => {
//   const snapshot = event.data;
//   const messageId = event.params.messageId;
//   console.log('index.js-annotatemessage');
//   // Only annotate new text-based messages.
//   if (snapshot.previous.val() || !snapshot.val().text) {
//     return;
//   }

//   // Annotation arguments.
//   const text = snapshot.val().text;
//   const options = {
//     entities: true,
//     sentiment: true
//   };

//   console.log('Annotating new message.');

//   // Detect the sentiment and entities of the new message.
//   return language.annotate(text, options)
//     .then((result) => {
//       console.log('Saving annotations.');

//       // Update the message with the results.
//       return admin.database().ref(`/messages/${messageId}`).update({
//         sentiment: result[0].sentiment,
//         entities: result[0].entities.map((entity) => {
//           return {
//             name: entity.name,
//             salience: entity.salience
//           };
//         })
//       });
//     });
// });