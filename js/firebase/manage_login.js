

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
window.location.href = "../";
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