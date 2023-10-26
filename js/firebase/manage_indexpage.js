 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
 import {
   getFirestore,
   collection,
   doc,
   addDoc,
   getDocs,
   onSnapshot,
   updateDoc,
   query, where, orderBy, serverTimestamp, getDoc,Timestamp
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

 const colRef = collection(database, "bookings");

 async function getBooking() {

   const currentYear = new Date().getFullYear();
   document.getElementById("currentYear").textContent = currentYear;

   //check if user is logged in or not
   onAuthStateChanged(auth, (user) => {
     if (user) {
       const uid = user.uid;
     } else {
       window.location.href = "login.html";
     }
   });

   let tableRow = document.getElementById("bookingTable");
   let totalBooking = document.getElementById("totalBooking");
   const loader = document.getElementById("bookingloader");
   // show the loader initially
   loader.style.display = "block";

   try {

     const q = query(colRef, orderBy("timestamp", "desc"));

     onSnapshot(q, { includeMetadataChanges: true }, (docsSnap) => {
       loader.style.display = "none";
       let rows = "";
       let index = 0;

       const bookingCount = docsSnap.size;
       totalBooking.innerHTML = bookingCount;

       docsSnap.forEach((doc) => {
         index++;
         let data = doc.data();
         let row = `<tr>
           <td>${index}</td>
           <td>${convertFirebaseTimestamp(data.timestamp)}</td>
           <td>${data.name}</td>
           <td>
             <div>${data.service}</div>
           </td>
           <td>${data.phone}</td>
           <td>${data.email}</td>
          
           <td>
             <label class="badge ${data.status == "New"
             ? "badge-info"
             : data.status == "Accepted"
               ? "badge-success"
               : data.status == "Cancelled"
                 ? "badge-danger"
                 : data.status == "Completed"
                   ? "badge-dark"
                   : "badge-secondary"
           }" id="statusLabel"
               >${data.status}</label
             >
           </td>
          
           <td>
             <i class="${data.status === 'Completed' || data.status === 'Cancelled' ? '' : 'icon-ellipsis'}" id="dropdownMenuSplitButton1"
 data-toggle="${data.status === 'Completed' || data.status === 'Cancelled' ? '' : 'dropdown'}"
 aria-haspopup="true" aria-expanded="false"
></i>
<div class="dropdown-menu" aria-labelledby="dropdownMenuSplitButton1">
 <h6 class="dropdown-header">Action</h6>
 ${data.status === 'New' ? `
   <a class="dropdown-item accept-action" data-docid="${doc.id}" data-servicename="${doc.data().service}" data-customeremail="${doc.data().email}">Accept</a>
 ` : ''}
 ${data.status === 'Accepted' ? `
   <a class="dropdown-item complete-action" data-docid="${doc.id}" data-servicename="${doc.data().service}" data-customeremail="${doc.data().email}">Complete</a>
 ` : ''}
 ${data.status === 'New' || data.status === 'Accepted' ? `
   <a class="dropdown-item cancel-action" data-docid="${doc.id}" data-servicename="${doc.data().service}" data-customeremail="${doc.data().email}">Cancel</a>
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
           const serviceName = event.target.dataset.servicename;
           const customerEmail = event.target.dataset.customeremail;

           // Show confirmation alert
           const confirmation = window.confirm("Do you really want to accept this booking?");
           if (confirmation) {
             acceptFunction(docId, serviceName, customerEmail);
           }
         });
       });

       // Add event listener to complete dropdown item
       const completeItems = document.querySelectorAll(".complete-action");
       completeItems.forEach((item) => {
         item.addEventListener("click", (event) => {
           const docId = event.target.dataset.docid;
           const serviceName = event.target.dataset.servicename;
           const customerEmail = event.target.dataset.customeremail;

           // Show confirmation alert
           const confirmation = window.confirm("Do you really want to set this booking status to completed?");
           if (confirmation) {
             completeFunction(docId, serviceName, customerEmail);
           }
         });
       });

       // Add event listener to cancel dropdown item
       const cancelItems = document.querySelectorAll(".cancel-action");
       cancelItems.forEach((item) => {
         item.addEventListener("click", (event) => {
           const docId = event.target.dataset.docid;
           const serviceName = event.target.dataset.servicename;
           const customerEmail = event.target.dataset.customeremail;
           // Show confirmation alert
           const confirmation = window.confirm("Do you really want to cancel this booking?");
           if (confirmation) {
             cancelFunction(docId, serviceName, customerEmail);
           }
         });
       });


     });



     function acceptFunction(docId, serviceName, customerEmail) {
       // Execute your accept function here with the docId parameter
       console.log("Accept function executed for docId", docId);

       const docRef = doc(database, "bookings", docId);

       const data = {
         status: "Accepted",
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
         message: `Your booking for ${serviceName} has been accepted.`,
         email: customerEmail,
         status: "New",
         timestamp: serverTimestamp(),
       });

     }

     function completeFunction(docId, serviceName, customerEmail) {
       // Execute your complete function here with the docId parameter
       console.log("Complete function executed for docId", docId);
       const docRef = doc(database, "bookings", docId);

       const data = {
         status: "Completed",
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
         message: `Your booking for ${serviceName} has been set to completed.`,
         email: customerEmail,
         status: "New",
         timestamp: serverTimestamp(),
       });
     }




     function cancelFunction(docId, serviceName, customerEmail) {
       // Execute your complete function here with the docId parameter
       console.log("Complete function executed for docId", docId);
       const docRef = doc(database, "bookings", docId);

       const data = {
         status: "Cancelled",
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
         message: `Your booking for ${serviceName} has been canceled.`,
         email: customerEmail,
         status: "New",
         timestamp: serverTimestamp(),
       });
     }

   } catch (error) {
     console.log(error);
   }
 }

 //get today's booking
 async function getTodayBookings() {
   try {

     const today = new Date();
     const day = today.toLocaleString('en-us', { weekday: 'long' });
     const date = today.getDate();
     const month = today.toLocaleString('en-us', { month: 'short' });
     const year = today.getFullYear();
     const todayString = `Today (${date} ${month} ${year})`;

     document.getElementById("today").textContent = todayString;
     const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
     const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

     const q = query(collection(database, "bookings"), where("timestamp", ">=", start), where("timestamp", "<", end));
     const newBkQuery = query(collection(database, "bookings"), where("status", "==", "New"));
     const cancelledBkQuery = query(collection(database, "bookings"), where("status", "==", "Cancelled"));
     const completedBkQuery = query(collection(database, "bookings"), where("status", "==", "Completed"));
     const acceptedBkQuery = query(collection(database, "bookings"), where("status", "==", "Accepted"));
     await
       onSnapshot(q, (querySnapshot) => {
         const todaysbookingCount = querySnapshot.size;
         document.getElementById('todaysBookings').innerHTML = todaysbookingCount

       });
       await
       onSnapshot(newBkQuery, (querySnapshot) => {
         document.getElementById('totalNewBookings').innerHTML = querySnapshot.size;
       });
       await
       onSnapshot(cancelledBkQuery, (querySnapshot) => {
         document.getElementById('totalCancelledBookings').innerHTML = querySnapshot.size;
       });
       await
       onSnapshot(completedBkQuery, (querySnapshot) => {
         document.getElementById('totalCompletedBookings').innerHTML = querySnapshot.size;
       });
       await
       onSnapshot(acceptedBkQuery, (querySnapshot) => {
         document.getElementById('totalAcceptedBookings').innerHTML = querySnapshot.size;
       });
     





   } catch (error) {
     console.log(error);
   }
 }

 // fetch orders 

 const orderRef = collection(database, "orders");
 async function getOrders() {

   const currentYear = new Date().getFullYear();
   document.getElementById("currentYear").textContent = currentYear;
   let tableRow = document.getElementById("orderTable");
   const loader = document.getElementById("orderloader");
   // show the loader initially
   loader.style.display = "block";

   try {

     const q = query(orderRef, orderBy("timestamp", "desc"));

     onSnapshot(q, { includeMetadataChanges: true }, (docsSnap) => {
       loader.style.display = "none";
       let rows = "";
       let index = 0;
       const orderCount = docsSnap.size;
       document.getElementById("totalOrders").innerHTML = orderCount;
       docsSnap.forEach((doc) => {
         index++;
         let data = doc.data();


         let row = `<tr>
         <td>${index}</td>
   
         <td>${convertFirebaseTimestamp(data.timestamp)}</td>
         <td>${data.customerName}</td>
         <td>${data.productName}</td>
         <td>${data.productQuantity}</td>
         <td>${data.productPrice}</td>
         <td>${data.deliveryFee}</td>
         <td>${data.amountPaid}</td>
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
   <a class="dropdown-item accept-action" data-docid="${doc.id}" data-itemname="${doc.data().productName}" data-customeremail="${doc.data().customerEmail}">Confirm</a>
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
           const confirmation = window.confirm("Do you really want to confirm this order?");
           if (confirmation) {
             confirmOrderFunction(docId, customaEmail, itemName);
           }

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
           // Show confirmation alert
           const confirmation = window.confirm("Do you really want to set this order status to completed?");
           if (confirmation) {
             completeFunction(docId, customaEmail, itemName, itemPrice, qtyPurchased);
           }

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
           const confirmation = window.confirm("Do you really want to cancel this order?");
           if (confirmation) {
             cancelFunction(docId, customaEmail, itemName);
           }

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

 //get today's registered customer
 async function getTodayOrder() {
   try {

     const today = new Date();
     const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
     const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

     const q = query(collection(database, "orders"), where("timestamp", ">=", start), where("timestamp", "<", end));
     const newOrdQuery = query(collection(database, "orders"), where("orderStatus", "==", "New"));
     const cancelledOrdQuery = query(collection(database, "orders"), where("orderStatus", "==", "Cancelled"));
     const completedOrdQuery = query(collection(database, "orders"), where("orderStatus", "==", "Completed"));
     const acceptedOrdQuery = query(collection(database, "orders"), where("orderStatus", "==", "Confirmed"));
     await
       onSnapshot(q, (querySnapshot) => {
         const todaysRegCount = querySnapshot.size;
         document.getElementById('todaysOrders').innerHTML = todaysRegCount

       });
       await
       onSnapshot(newOrdQuery, (querySnapshot) => {
         document.getElementById('totalNewOrders').innerHTML = querySnapshot.size;
       });
       await
       onSnapshot(cancelledOrdQuery, (querySnapshot) => {
         document.getElementById('totalCancelledOrders').innerHTML = querySnapshot.size;
       });
       await
       onSnapshot(completedOrdQuery, (querySnapshot) => {
         document.getElementById('totalCompletedOrders').innerHTML = querySnapshot.size;
       });
       await
       onSnapshot(acceptedOrdQuery, (querySnapshot) => {
         document.getElementById('totalAcceptedOrders').innerHTML = querySnapshot.size;
       });





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
             notificationLink.setAttribute('href', './pages/bookings/booking-page.html');
           } else if (notification.type == "feedback") {
             notificationLink.setAttribute('href', './pages/feedbacks/feedbacks.html');
           } else {
             notificationLink.setAttribute('href', './pages/orders/orders.html');
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


 //Fetch Customers
 const customerColRef = collection(database, "users");

 async function getCustomer() {
   let tableRow = document.getElementById("customerTable");
   let registeredCustomer = document.getElementById("registeredCustomer");
   const loader = document.getElementById("customerloader");
   // show the loader initially
   loader.style.display = "block";

   function formatDate(timestamp) {
     const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
     return date.toLocaleString();
   }


   try {

     const q = query(customerColRef, orderBy("createdDateTime", "desc"));
     onSnapshot(q, { includeMetadataChanges: true }, (docsSnap) => {
       loader.style.display = "none";
       let rows = "";
       let index = 0;

       const customerbookingCount = docsSnap.size;
       registeredCustomer.innerHTML = customerbookingCount;

       docsSnap.forEach((doc) => {
         index++;
         let data = doc.data();
         let row = `<tr>
           <td>${index}</td>
           <td>${convertFirebaseTimestamp(data.createdDateTime)}</td>
           <td>${data.fullName}</td>
           <td>
             <div>${data.email}</div>
           </td>
           <td>${data.phoneNo}</td>
       
       
         
           
          
           <td>
             <a href="./pages/customers/registered-customers.html" style="text-decoration:none;color:black">
             <i
               class="icon-eye"
              aria-haspopup="true" aria-expanded="false"
             ></i> View
            </a>
           </td>
         </tr>`;

         rows += row;
       });
       tableRow.innerHTML = rows;



     });



   } catch (error) {
     console.log(error);
   }
 }

// Function to convert Firebase timestamp to a formatted date and time
function convertFirebaseTimestamp(timestamp) {
// Create a new Firebase timestamp object
const firebaseTimestamp = Timestamp.fromMillis(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

// Convert the Firebase timestamp to JavaScript Date
const date = firebaseTimestamp.toDate();

// Format the date and time without the time zone
const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
return date.toLocaleString('en-US', options);
}

 //get today's registered customer
 async function getTodayRegCustomer() {
   try {

     const today = new Date();
     const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
     const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

     const q = query(collection(database, "users"), where("timestamp", ">=", start), where("timestamp", "<", end));
     await
       onSnapshot(q, (querySnapshot) => {
         const todaysRegCount = querySnapshot.size;
         document.getElementById('todaysRegCustomer').innerHTML = todaysRegCount

       });





   } catch (error) {
     console.log(error);
   }
 }


 //Fetch products
 const productsColRef = collection(database, "products");

 async function getProducts() {
   let tableRow = document.getElementById("stockTable");
   let ourProducts = document.getElementById("ourProducts");
   const loader = document.getElementById("stockloader");
   // show the loader initially
   loader.style.display = "block";

   function formatDate(timestamp) {
     const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
     return date.toLocaleString();
   }


   try {
     const q = query(productsColRef, orderBy("timestamp", "desc"));

     onSnapshot(q, { includeMetadataChanges: true }, (docsSnap) => {
       loader.style.display = "none";
       let rows = "";
       let index = 0;

       const productCount = docsSnap.size;
       ourProducts.innerHTML = productCount;

       docsSnap.forEach((doc) => {
         index++;
         let data = doc.data();
         let row = `<tr>
           <td>${index}</td>
           <td>${convertFirebaseTimestamp(data.timestamp)}</td>
           <td>${data.productName}</td>
           <td>
             <div>${data.productPrice}</div>
           </td>
           <td>
             <div>${data.productQty}</div>
           </td>
           <td>
             <label class="badge ${data.productQty == 0
             ? "badge-secondary"
             : data.productQty <= 2
               ? "badge-warning"
               : data.productQty >= 3
                 ? "badge-success" : "badge-dart"

           }" id="statusLabel"
               >${data.productQty == 0
             ? "Not available"
             : data.productQty <= 2
               ? "Low in stock"
               : data.productQty >= 3
                 ? "Available"
                 : "Not available"}</label
             >
             </td>
       
       
         
           
          
           <td>
             <a href="./pages/inventory/viewstock-dashboard.html" style="text-decoration:none;color:black">
             <i
               class="icon-eye"
              aria-haspopup="true" aria-expanded="false"
             ></i> View
            </a>
           </td>
         </tr>`;

         rows += row;
       });
       tableRow.innerHTML = rows;

     });

   } catch (error) {
     console.log(error);
   }
 }

 //get today's added product
 async function getTodayaddedProduct() {
   try {

     const today = new Date();
     const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
     const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

     const q = query(collection(database, "products"), where("timestamp", ">=", start), where("timestamp", "<", end));
     await
       onSnapshot(q, (querySnapshot) => {
         const todaysAddedProdCount = querySnapshot.size;
         document.getElementById('todayaddedProducts').innerHTML = todaysAddedProdCount

       });

   } catch (error) {
     console.log(error);
   }
 }




 // signout user


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

 window.onload = function () {
   // call both functions
   getBooking();
   getOrders();
   getCustomer();
   getProducts();
   getTodayBookings();
   getTodayRegCustomer();
   getTodayaddedProduct();
   getTodayOrder();
   getNotifications();
 };
