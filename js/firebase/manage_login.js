

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
/* const firebaseConfig = {
  apiKey: "AIzaSyAjW8pGmsL9l5olUhU5je0zKD8hkrQThZw",
  authDomain: "boldandbeautifulsalon-89023.firebaseapp.com",
  projectId: "boldandbeautifulsalon-89023",
  storageBucket: "boldandbeautifulsalon-89023.appspot.com",
  messagingSenderId: "466649288397",
  appId: "1:466649288397:web:150d344db30d3f2185a384",
  measurementId: "G-0V7GXFY5ZP",
  databaseURL:
    "https://boldandbeautifulsalon-89023-default-rtdb.firebaseio.com/",
};
 */

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);


const submitBtn = document.getElementById('submit-btn');
const errorDiv = document.getElementById("error");
const loader = document.querySelector(".loader"); 


submitBtn.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally
    const user_email = document.getElementById("email").value;
    const user_password = document.getElementById("password").value;
       // Show the loader when the login process starts
       submitBtn.style.display = "none";
       loader.style.display = "block";

  login(user_email,user_password);
  });
async function login(userEmail,userPassword) {
  console.log(userEmail);
  console.log(userPassword);
  signInWithEmailAndPassword(auth, userEmail, userPassword)
.then((userCredential) => {
// Signed in 
const user = userCredential.user;
window.location.href = "index.html";
})
.catch((error) => {
const errorCode = error.code;
const errorMessage = error.message;
errorDiv.innerHTML = errorMessage;
submitBtn.style.display = "block";
}).finally(()=>
{
  loader.style.display = "none";
});

;
}