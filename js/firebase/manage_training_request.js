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
  writeBatch,where
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
const auth = getAuth(app);

const colRef = collection(database, "trainingApplication");
// const notRef = collection(database, "orderNotification");




async function updateNotificationStatus() {
  const notificationRef = collection(database, "orderNotification");


  const batch = writeBatch(database);

  const unsubscribe = onSnapshot(notificationRef, (querySnapshot) => {
    console.log(querySnapshot.size);
    querySnapshot.forEach((doc) => {
      const docRef = doc.ref;
      batch.update(docRef, { status: "read" });
    });

    batch.commit().then(() => {
      console.log("Batch update completed successfully.");
    }).catch((error) => {
      console.error("Error committing batch update:", error);
    });
  });

  // Call unsubscribe when you are finished listening to the snapshot.
  // For example, if this function is used in a Vue.js component, you could
  // call unsubscribe in the "beforeDestroy" hook.
  // unsubscribe();
}


const successOkBtn = document.getElementById("succees-ok-btn");
successOkBtn.addEventListener("click", () => {
  document.getElementById("success-alert-modal").style.display = "none";
});
const failureOkBtn = document.getElementById("failure-ok-btn");
failureOkBtn.addEventListener("click", () => {
  document.getElementById("failure-alert-modal").style.display = "none";
});


const confirmBtn = document.getElementById("yes-btn");
const declineBtn = document.getElementById("no-btn");
const acceptModal = document.getElementById("accept-modal");


declineBtn.addEventListener("click", () => {
  acceptModal.style.display = "none";
});

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


async function getTrainingRequest() {



  const currentYear = new Date().getFullYear();
  document.getElementById("currentYear").textContent = currentYear;
  let tableRow = document.getElementById("requestTable");
  const loader = document.getElementById("loader");
  // show the loader initially
  loader.style.display = "block";

  //check if user is logged in or not
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
    } else {
      window.location.href = "../../../../login/";
    }
  });

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
              <td>${data.onlineTrainingId}</td>
              <td>${data.customerName}</td>
              <td>
                <div>${data.trainingName}</div>
              </td>
              <td>${data.customerPhone}</td>
              <td>${data.customerEmail}</td>
              <td>${data.userName}</td>
              <td>${data.paymentStatus}</td>
              <td>${data.amountPaid}</td>
              <td>${data.trainingStartDay}</td>
              <td>${data.trainingStartTime}</td>
              <td>
              <label class="badge ${data.orderStatus == "Confirmed"
            ? "badge-success"
            : data.orderStatus == "Cancelled"
              ? "badge-danger"
              : data.orderStatus == "Completed"
                ? "badge-dark"
                : "badge-info"
          }" id="statusLabel"
            >${data.orderStatus}</label></td>
            
            
             
              <td>
              <i class="${data.orderStatus === 'Completed' || data.orderStatus === 'Cancelled' ? '' : 'icon-ellipsis'}" id="dropdownMenuSplitButton1"
              data-toggle="${data.orderStatus === 'Completed' || data.orderStatus === 'Cancelled' ? '' : 'dropdown'}"
              aria-haspopup="true" aria-expanded="false"
            ></i>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuSplitButton1">
              <h6 class="dropdown-header">Action</h6>
              ${data.orderStatus === 'Pending' ? `
                <a class="dropdown-item accept-action" data-docid="${doc.id}" data-trainingname="${doc.data().trainingName}" data-customeremail="${doc.data().customerEmail}">Accept</a>
              ` : ''}
              ${data.orderStatus === 'Accepted' ? `
                <a class="dropdown-item complete-action" data-docid="${doc.id}" data-trainingname="${doc.data().trainingName}" data-customeremail="${doc.data().customerEmail}">Complete</a>
              ` : ''}
              ${data.orderStatus === 'Pending' || data.orderStatus === 'Accepted' ? `
                <a class="dropdown-item cancel-action" data-docid="${doc.id}" data-trainingname="${doc.data().trainingName}" data-customeremail="${doc.data().customerEmail}">Cancel</a>
              ` : ''}
              </td>
            </tr>`;

        rows += row;
      });
      tableRow.innerHTML = rows;
      // Add event listener to accept dropdown item

      // Add event listener to accept dropdown item
      const acceptItems = document.querySelectorAll(".accept-action");
      acceptItems.forEach((item) => {
        item.addEventListener("click", (event) => {
          const docId = event.target.dataset.docid;
          const trainingName = event.target.dataset.trainingname;
          const customerEmail = event.target.dataset.customeremail;
      

          // Show confirmation alert
          acceptModal.style.display = "block";
       

          confirmBtn.addEventListener("click", () => {
            const startDay = document.getElementById("start-day").value;
            const startTime = document.getElementById("start-time").value;
      
            if (startDay !== "" && startTime !== "") {
              console.log("Start Day: " + startDay);
              console.log("Start Time: " + startTime);
      
             
              acceptFunction(docId, trainingName, customerEmail,startDay,startTime);
              acceptModal.style.display = "none";
            } else {
              console.log("Please fill in both start day and start time.");
              // Show an error message or take appropriate action
            }
          });
       
        });
      });

      // Add event listener to complete dropdown item
      const completeItems = document.querySelectorAll(".complete-action");
      completeItems.forEach((item) => {
        item.addEventListener("click", (event) => {
          const docId = event.target.dataset.docid;
          const trainingName = event.target.dataset.trainingname;
          const customerEmail = event.target.dataset.customeremail;

          const  completedConfirmationModal = document.getElementById("completed-modal");
          const completedConfirmBtn = document.getElementById("completed-yes-btn");
          const completeNoBtn = document.getElementById("completed-no-btn");

          
        
          completedConfirmationModal.style.display="block";
        


          completedConfirmBtn.addEventListener("click", () => {
           
            completeFunction(docId, trainingName, customerEmail);
            completedConfirmationModal.style.display = "none";
          });

          completeNoBtn.addEventListener("click", () => {
            completedConfirmationModal.style.display = "none";
           
          });

        
        });
      });

      // Add event listener to cancel dropdown item
      const cancelItems = document.querySelectorAll(".cancel-action");
      cancelItems.forEach((item) => {
        item.addEventListener("click", (event) => {
          const docId = event.target.dataset.docid;
          const trainingName = event.target.dataset.trainingname;
          const customerEmail = event.target.dataset.customeremail;
          // Show confirmation alert

          const  cancelConfirmationModal = document.getElementById("cancel-modal");
          const cancelConfirmBtn = document.getElementById("cancel-yes-btn");
          const cancelBtn = document.getElementById("cancel-no-btn");

          
        
          cancelConfirmationModal.style.display="block";
        


          cancelConfirmBtn.addEventListener("click", () => {
            cancelConfirmationModal.style.display = "none";
            cancelFunction(docId, trainingName, customerEmail);
          });

          cancelBtn.addEventListener("click", () => {
            cancelConfirmationModal.style.display = "none";
           
          });
        
        });
      });





    });


  
    function acceptFunction(docId, trainingName, customerEmail,startDay, startTime) {
      // Execute your accept function here with the docId parameter
      console.log("Accept function executed for docId", docId);
      
    
      const docRef = doc(database, "trainingApplication", docId);

      const data = {
        orderStatus: "Accepted",
        trainingStartDay:startDay,
        trainingStartTime:startTime
      };
      updateDoc(docRef, data)
        .then((docRef) => {
          console.log(
            "Training Request was accepted."
          );
        })
        .catch((error) => {
          console.log(error);
        });

        addDoc(collection(database, "appNotification"), {
            message: `Your training request for ${trainingName} has been accepted.`,
            email: customerEmail,
            status: "New",
            timestamp: serverTimestamp(),
          });
    
     
    }

    function completeFunction(docId, trainingName, customerEmail) {
      // Execute your complete function here with the docId parameter
      console.log("Complete function executed for docId", docId);
      const docRef = doc(database, "trainingApplication", docId);

      const data = {
        orderStatus: "Completed",
      };
      updateDoc(docRef, data)
        .then((docRef) => {
          console.log(
            "A New Document Field has been added to an existing document"
          );
        })
        .catch((error) => {
          console.log(error);
        });
      addDoc(collection(database, "appNotification"), {
        message: `Your training request for ${trainingName} has been set to completed.`,
        email: customerEmail,
        status: "New",
        timestamp: serverTimestamp(),
      });
    }
    function cancelFunction(docId, trainingName, customerEmail) {
      // Execute your complete function here with the docId parameter
      console.log("Complete function executed for docId", docId);
      const docRef = doc(database, "trainingApplication", docId);

      const data = {
        orderStatus: "Cancelled",
      };
      updateDoc(docRef, data)
        .then((docRef) => {
          console.log(
            "A New Document Field has been added to an existing document"
          );
        })
        .catch((error) => {
          console.log(error);
        });
      addDoc(collection(database, "appNotification"), {
        message: `Your training request for ${trainingName} has been canceled.`,
        email: customerEmail,
        status: "New",
        timestamp: serverTimestamp(),
      });
    }
  } catch (error) {
    console.log(error);
  }
}

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
                notificationLink.setAttribute('href', '../../');
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
  getTrainingRequest();
  getNotifications();
  updateNotificationStatus();
  
}; 
