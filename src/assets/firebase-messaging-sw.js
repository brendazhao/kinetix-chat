if( 'undefined' === typeof window){ 
    importScripts('https://www.gstatic.com/firebasejs/4.1.2/firebase-app.js') ;
    importScripts('https://www.gstatic.com/firebasejs/4.1.2/firebase-messaging.js');
}
firebase.initializeApp({
    messagingSenderId: '567426598222'
});

const messaging = firebase.messaging();
/*
messaging.setBackgroundMessageHandler(function(payload){
    const title = 'hi';
    const options ={
        body :payload.data;
    }
    return self.regustration.showNotification(title,options);
})
*/