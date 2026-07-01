// 🔥 MAMTA AI — Firebase Configuration
// Replace with your actual Firebase project config

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "mamta-ai.firebaseapp.com",
    projectId: "mamta-ai",
    storageBucket: "mamta-ai.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("🔥 MAMTA AI Firebase Connected!");
