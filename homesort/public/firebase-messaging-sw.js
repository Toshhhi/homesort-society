importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCX6c-9acVn9UdwkbeIlRLPDJAvWhUxoWU",
    authDomain: "homesort-6f217.firebaseapp.com",
    projectId: "homesort-6f217",
    storageBucket: "homesort-6f217.firebasestorage.app",
    messagingSenderId: "178879552964",
    appId: "1:178879552964:web:acb10c3b0aae2328a71891",
    measurementId: "G-NFWNQPTDHS"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icon.png",
    });
});
