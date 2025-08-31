// Firebase Configuration for Admin Panel
const firebaseConfig = {
    apiKey: "AIzaSyDbsxCPAeCW3I9jT2IbLtIyhSNasesQf9g",
    authDomain: "omgs-b62ba.firebaseapp.com",
    projectId: "omgs-b62ba",
    storageBucket: "omgs-b62ba.firebasestorage.app",
    messagingSenderId: "734359078518",
    appId: "1:734359078518:android:2467d093b28a1446bbc157"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code == 'unimplemented') {
            console.log('The current browser does not support persistence.');
        }
    });

// Export for use in other files
window.firebase = firebase;
window.auth = auth;
window.db = db;
