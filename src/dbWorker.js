const { parentPort } = require('worker_threads');
const admin = require("firebase-admin");

//firebase credentials
let firebaseConfig = {
    apiKey: "AIzaSyDmbSDTnKYJLQHxGkSOwMWnuPtjUcPTYQo",
    authDomain: "addresscrawler.firebaseapp.com",
    databaseURL: "https://addresscrawler.firebaseio.com",
    projectId: "addresscrawler",
    storageBucket: "addresscrawler.appspot.com",
    messagingSenderId: "593450046686",
    appId: "1:593450046686:web:8adf133557b8718f455e4f",
    measurementId: "G-GEH2VEEY42"
};

// Initialize Firebase

var serviceAccount = require("/Users/timaddai/Downloads/addresscrawler-firebase-adminsdk-lnmwg-da7336e8fc.json");
console.log(serviceAccount)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://addresscrawler.firebaseio.com"
});
let db = admin.firestore();
// get current data in DD-MM-YYYY format
let date = new Date();
let currDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

// recieve crawled data from main thread
parentPort.once("message", (message) => {
    console.log("Recieved data from mainWorker...");

    // store data gotten from main thread in database
    db.collection("Rates").doc(currDate).set({
        rates: JSON.stringify(message)
    }).then(() => {
        // send data back to main thread if operation was successful
        parentPort.postMessage("Data saved successfully");
    })
    .catch((err) => console.log(err))    
});
