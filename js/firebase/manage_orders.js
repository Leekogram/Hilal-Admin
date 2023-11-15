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
  writeBatch,where, getDoc, getDocs
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
 // Initialize Firebase Authentication and get a reference to the service
 const auth = getAuth(app);
const colRef = collection(database, "orders");
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
  }




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


  

async function getOrders() {

  const currentYear = new Date().getFullYear();
  document.getElementById("currentYear").textContent = currentYear;

   //check if user is logged in or not
   onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      // ...
    } else {
      // User is signed out
      // ...
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
              <td>${data.orderId}</td>
              <td>${data.customerName}</td>
              <td>
                <div>${data.customerPhone}</div>
              </td>
              <td>${data.customerEmail}</td>
              <td>${data.productName}</td>
              <td>${data.productQuantity}</td>
              <td>${data.productPrice}</td>
              <td>${data.deliveryFee}</td>
              <td>${data.amountPaid}</td>
              <td ><div class="section-des">  ${data.instructions}</div>
              <td>${data.delivery}</td>
              </td>
              <td>${data.sourceType}</td>
            
              <td>${data.paymentStatus}</td>

              
              <td>
              <label class="badge ${data.orderStatus == "Confirmed"
              ? "badge-success"
              : data.orderStatus == "Cancelled"
                ? "badge-danger"
                : data.orderStatus == "Completed"
                  ? "badge-dark"
                  : "badge-info"
            }" id="statusLabel"
            >${data.orderStatus}</label
          >
              
       </td>
       <td>
       <i class="${data.orderStatus === 'Completed' || data.orderStatus === 'Cancelled' ? '' : 'icon-ellipsis'}" id="dropdownMenuSplitButton1"
data-toggle="${data.orderStatus === 'Completed' || data.orderStatus === 'Cancelled' ? '' : 'dropdown'}"
aria-haspopup="true" aria-expanded="false"
></i>
<div class="dropdown-menu" aria-labelledby="dropdownMenuSplitButton1">
<h6 class="dropdown-header">Action</h6>
${data.orderStatus === 'New' ? `
 <a class="dropdown-item accept-action" data-docid="${doc.id}" data-itemname="${doc.data().productName}" data-customeremail="${doc.data().customerEmail}">Accept</a>
` : ''}
${data.orderStatus === 'Confirmed' ? `
 <a class="dropdown-item complete-action" data-docid="${doc.id}" data-itemname="${doc.data().productName}" data-customeremail="${doc.data().customerEmail}" data-itemprice="${doc.data().productPrice}" data-qty="${doc.data().productQuantity}">Complete</a>
` : ''}
${data.orderStatus === 'New' || data.orderStatus === 'Confirmed' ? `
 <a class="dropdown-item cancel-action" data-docid="${doc.id}" data-itemname="${doc.data().productName}" data-customeremail="${doc.data().customerEmail}" >Cancel</a>
` : ''}
</div>
       </td>
            </tr>`;

        rows += row;
      });
      tableRow.innerHTML = rows;
 // Add event listener to accept dropdown item
 const acceptItems = document.querySelectorAll(".accept-action");
 acceptItems.forEach((item) => {
   item.addEventListener("click", (event) => {
     const docId = event.target.dataset.docid;
     const itemName = event.target.dataset.itemname;
     const customaEmail = event.target.dataset.customeremail;

     // Show confirmation alert

     acceptModal.style.display = "block";

     confirmBtn.addEventListener("click", () => {
       acceptModal.style.display = "none";
       confirmOrderFunction(docId, customaEmail, itemName);
     });
   

   });
 });

  // Add event listener to complete dropdown item
  const completeItems = document.querySelectorAll(".complete-action");
  completeItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      const docId = event.target.dataset.docid;
      const itemName = event.target.dataset.itemname;
      const customaEmail = event.target.dataset.customeremail;
      const itemPrice = event.target.dataset.itemprice;
      const qtyPurchased = event.target.dataset.qty;


      const  completedConfirmationModal = document.getElementById("completed-modal");
      const completedConfirmBtn = document.getElementById("completed-yes-btn");
      const completeNoBtn = document.getElementById("completed-no-btn");

      
    
      completedConfirmationModal.style.display="block";
    


      completedConfirmBtn.addEventListener("click", () => {
       
        completeFunction(docId, customaEmail, itemName, itemPrice, qtyPurchased);
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
     const itemName = event.target.dataset.itemname;
     const customaEmail = event.target.dataset.customeremail;
     // Show confirmation alert

     const  cancelConfirmationModal = document.getElementById("cancel-modal");
     const cancelConfirmBtn = document.getElementById("cancel-yes-btn");
     const cancelBtn = document.getElementById("cancel-no-btn");

     
   
     cancelConfirmationModal.style.display="block";
   


     cancelConfirmBtn.addEventListener("click", () => {
       cancelConfirmationModal.style.display = "none";
       cancelFunction(docId, customaEmail, itemName);
     });

     cancelBtn.addEventListener("click", () => {
       cancelConfirmationModal.style.display = "none";
      
     });
   
   });
 });


     
    });

    


    function confirmOrderFunction(docId, customerEmail, productName) {
      // Execute your accept function here with the docId parameter
      // console.log("Confirm function executed for docId", docId);

      console.log(customerEmail);
      console.log(productName);

      const docRef = doc(database, "orders", docId);

      const data = {
        orderStatus: "Confirmed",
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
        message: `Your order for ${productName} has been confirm, our represenative will contact you soon.`,
        email: customerEmail,
        status: "New",
        timestamp: serverTimestamp(),
      });


      addDoc(collection(database, "log"), {
        comment: "Order status has been updated to comfirmed.",

        timestamp: serverTimestamp(),
      })
        .then((docRef) => {
          console.log("Product has been updated successfully");
        })
        .catch((error) => {
          console.log(error);
          // document.getElementById("productForm").reset();
        });
    }

    function completeFunction(docId, customerEmail, productName, productPrice, quantityPurchased) {
      // Execute your complete function here with the docId parameter
      console.log("Complete function executed for docId", docId);
      const docRef = doc(database, "orders", docId);
      const productRef = collection(database, "products");
    
      // Query the products collection for a document with the matching field
      const q = query(productRef, where("productName", "==", productName));
    
      // Get the current quantity of the product
      getDocs(q)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const productDoc = querySnapshot.docs[0].data();
            const currentQuantity = parseInt(productDoc.productQty);
    
            // Convert quantityPurchased to a number
            const boughtQuantity = parseInt(quantityPurchased);
    
            // Check if the current quantity is less than the quantity being bought
            if (currentQuantity < boughtQuantity) {
              // Alert the user to add more quantity or purchase a smaller amount
              alert("The current quantity in stock is insufficient. Please add more quantity or ask the customer to purchase a smaller amount.");
            } else {
              // Calculate the remaining quantity
              const remainingQuantity = currentQuantity - boughtQuantity;
    
              // Update the productQty field in the matched document
              const productDocRef = doc(database, "products", querySnapshot.docs[0].id);
              updateDoc(productDocRef, { productQty: remainingQuantity.toString() })
                .then(() => {
                  console.log("Product quantity updated successfully.");
                })
                .catch((error) => {
                  console.log("Error updating product quantity:", error);
                });
    
              const data = {
                orderStatus: "Completed",
                paymentStatus: "Paid",
                amountPaid: productPrice,
              };
              updateDoc(docRef, data)
                .then(() => {
                  console.log("A new document field has been added to an existing document.");
                })
                .catch((error) => {
                  console.log(error);
                });
    
              addDoc(collection(database, "appNotification"), {
                message: `Your order for ${productName} has been set to completed.`,
                email: customerEmail,
                status: "New",
                timestamp: serverTimestamp(),
              });
    
              addDoc(collection(database, "log"), {
                comment: "Order status has been updated to completed.",
                timestamp: serverTimestamp(),
              })
                .then(() => {
                  console.log("Order has been updated successfully");
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          } else {
            console.log("Product does not exist.");
          }
        })
        .catch((error) => {
          console.log("Error retrieving product:", error);
        });
    }
    function cancelFunction(docId, customerEmail, productName) {
      // Execute your complete function here with the docId parameter
      console.log("Complete function executed for docId", docId);
      const docRef = doc(database, "orders", docId);

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
        message: `Your order for ${productName} has been cancelled, please contact our support for more info`,
        email: customerEmail,
        status: "New",
        timestamp: serverTimestamp(),
      });

      addDoc(collection(database, "log"), {
        comment: "Order status has been updated to cancelled.",

        timestamp: serverTimestamp(),
      })
        .then((docRef) => {
          console.log("Product has been updated successfully");
        })
        .catch((error) => {
          console.log(error);
          // document.getElementById("productForm").reset();
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
              notificationLink.setAttribute('href', '../services/');
            } else if (notification.type == "feedback") {
              notificationLink.setAttribute('href', '../feedbacks/');
            } else {
              notificationLink.setAttribute('href', './');
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
  getOrders();
  getNotifications();
  updateNotificationStatus();
}; 
