// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  query,
  addDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  orderBy,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize  Database and get a reference to the service
const database = getFirestore(app);
const auth = getAuth();

const colRef = collection(database, "messages");
// const notRef = collection(database, "orderNotification");



// Function to convert Firebase timestamp to a formatted date and time
function convertFirebaseTimestamp(timestamp) {
  // Create a new Firebase timestamp object
  const firebaseTimestamp = Timestamp.fromMillis(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

  // Convert the Firebase timestamp to JavaScript Date
  const date = firebaseTimestamp.toDate();

  // Format the date and time without the time zone
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  return date.toLocaleString('en-US', options);
}

async function getMessages() {

  const currentYear = new Date().getFullYear();
  document.getElementById("currentYear").textContent = currentYear;
  //check if user is logged in or not
onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
  
    } else {
  
      window.location.href = "../../../login.html";
    }
  });
  let tableRow = document.getElementById("bookingTable");
  const loader = document.getElementById("loader");
  // show the loader initially
  loader.style.display = "block";

  try {


    

    const q = query(colRef, orderBy("timestamp", "desc"));

    onSnapshot(q, { includeMetadataChanges: true }, (docsSnap) => {
      loader.style.display = "none";
      let rows = "";
      let index = 0;
      docsSnap.forEach((doc) => {
        index++;
        let data = doc.data();
    
        let row = `<tr>
              <td>${index}</td>
              <td>${data.recipientName}</td>
              <td>
                ${data.recipientEmail}
              </td>
              <td>${data.recipientPhone}</td>
           
              <td>${data.subject}</td>
              <td style=" max-width: 700px;word-wrap: break-word;overflow-wrap break-word; white-space: pre-wrap;font-size: 14px;" >${data.message}</td>
              <td>${data.optionalLink}</td>
              <td>${convertFirebaseTimestamp(data.timestamp)}</td>

            
            </tr>`;

        rows += row;
      });
      tableRow.innerHTML = rows;
      // Add event listener to accept dropdown item

    });

    


  } catch (error) {
    console.log(error);
  }
}


const signOutBtn = document.getElementById("sign-out-btn");
const signOutModal = document.getElementById("sign-out-modal");
const confirmSignOutBtn = document.getElementById("confirm-sign-out-btn");
const cancelSignOutBtn = document.getElementById("cancel-sign-out-btn");

// Show the modal when the sign-out button is clicked
signOutBtn.addEventListener("click", () => {
  signOutModal.style.display = "block";
});

// Hide the modal when the cancel button is clicked
cancelSignOutBtn.addEventListener("click", () => {
  signOutModal.style.display = "none";
});

// Sign the user out of Firebase when the confirm button is clicked
confirmSignOutBtn.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("User signed out successfully");
      signOutModal.style.display = "none";
    })
    .catch((error) => {
      console.error("Error signing out:", error);
      signOutModal.style.display = "none";
    });
});
  //get notifications
  async function getNotifications() {
    try {
      // Get a reference to the notificationTray element
      const notificationTray = document.getElementById('notificationTray');
      // const notSpan = document.getElementById('notSpan');



      const q = query(collection(database, "orderNotification"), where("status", "==", "unread"), orderBy("timestamp", "desc"));
      await
        onSnapshot(q, (querySnapshot) => {
          const notificationCount = querySnapshot.size;

          if (querySnapshot.size > 0) {
            document.getElementById('notSpan').style.visibility = "visible";
            document.getElementById('count').innerHTML = notificationCount
            document.getElementById('notCount').innerHTML = notificationCount;
            document.getElementById('notificationDropdown').classList.add("count-indicator");
          } else {
            document.getElementById('notSpan').style.visibility = "hidden";
            document.getElementById('notificationDropdown').classList.remove("count-indicator");
          }


          // Loop through each document in the query snapshot and create an HTML element for it
          querySnapshot.forEach((doc) => {
            // Get the data from the document
            const notification = doc.data();

            // Create a new anchor element for the notification
            const notificationLink = document.createElement('a');
            notificationLink.classList.add('dropdown-item', 'preview-item');
            if (notification.type == "service") {
              notificationLink.setAttribute('href', '../services/');
            } else if (notification.type == "feedback") {
              notificationLink.setAttribute('href', '../feedbacks/');
            } else {
              notificationLink.setAttribute('href', '../orders/');
            }



            // Create the preview-thumbnail element
            const previewThumbnail = document.createElement('div');
            previewThumbnail.classList.add('preview-thumbnail');

            // Create the preview-icon element
            const previewIcon = document.createElement('div');
            previewIcon.classList.add('preview-icon', 'bg-success');
            const icon = document.createElement('i');
            icon.classList.add('ti-info-alt', 'mx-0');
            previewIcon.appendChild(icon);
            previewThumbnail.appendChild(previewIcon);

            // Create the preview-item-content element
            const previewItemContent = document.createElement('div');
            previewItemContent.classList.add('preview-item-content');
            const subject = document.createElement('h6');
            subject.classList.add('preview-subject', 'font-weight-normal');
            subject.textContent = notification.title;
            const message = document.createElement('p');
            message.classList.add('font-weight-light', 'small-text', 'mb-0', 'text-muted');
            message.textContent = notification.message;
            const time = document.createElement('p');
            time.classList.add('font-weight-light', 'small-text', 'mb-0', 'text-muted');
            time.textContent = getTimeAgo(notification.timestamp.toDate().toLocaleString());
            previewItemContent.appendChild(subject);
            previewItemContent.appendChild(message);
            previewItemContent.appendChild(time);

            // Add the preview-thumbnail and preview-item-content elements to the anchor element
            notificationLink.appendChild(previewThumbnail);
            notificationLink.appendChild(previewItemContent);

            // Add the anchor element to the notificationTray element
            notificationTray.appendChild(notificationLink);
          });

        });


      function getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.round(diffMs / 1000);
        const diffMin = Math.round(diffSec / 60);
        const diffHr = Math.round(diffMin / 60);
        const diffDays = Math.round(diffHr / 24);

        if (diffSec < 60) {
          return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
        } else if (diffMin < 60) {
          return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
        } else if (diffHr < 24) {
          return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
        } else if (diffDays === 1) {
          return `1 day ago`;
        } else if (diffDays < 30) {
          return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
          const diffMonths = Math.floor(diffDays / 30);
          return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
        }
      }


    } catch (error) {
      console.log(error);
    }
  }


window.onload = function () {
  // call both functions
  getMessages();
  getNotifications();

}; 
