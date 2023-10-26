// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  query,
  onSnapshot,
  startAt,
  endAt, where
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import {
  getStorage,
  ref as sRef,
  getDownloadURL,
  uploadBytesResumable,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);
// Initialize Realtime Database and get a reference to the service
const database = getFirestore(app);

const auth = getAuth(app);

//check if user is logged in or not
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;

  } else {

    window.location.href = "../../../login.html";
  }
});

let pictureUrl;

const currentYear = new Date().getFullYear();
document.getElementById("currentYear").textContent = currentYear;

const addProductBtn = document.getElementById("addProductBtn");

document.getElementById("productForm").addEventListener("submit", addProduct);

const imageInput = document.getElementById("product-image");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
imageInput.addEventListener("change", () => {

  const file = imageInput.files[0];
  imagePreview.style.height = '150px';
  imagePreviewContainer.style.height = '150px'
  if (file) {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      imagePreview.setAttribute("src", reader.result);
    });

    reader.readAsDataURL(file);
  }
});


var inputField = document.getElementById("productTitle");
var matchingValuesList = document.createElement("ul");
document.getElementById("matchingValuesContainer").appendChild(matchingValuesList);


inputField.addEventListener("input", searchMatchingValues);
inputField.addEventListener("keyup", searchMatchingValues);
inputField.addEventListener("focus", searchMatchingValues);

function searchMatchingValues() {
  // Get the entered value
  var enteredValue = inputField.value;

  // Query the Firestore collection for matching values
  const q = query(
    collection(database, "products"),
    orderBy("productName"),
    startAt(enteredValue),
    endAt(enteredValue + "\uf8ff")
  );

  getDocs(q)
    .then((querySnapshot) => {
      // Get the matching values
      var matchingValues = querySnapshot.docs.map(function (doc) {
        console.log(doc.data().productName);
        return doc.data().productName;
      });

      // Clear the existing list items
      matchingValuesList.innerHTML = "";

      // If there are matching values
      if (matchingValues.length > 0) {
        // Loop through the matching values and add them to the list
        for (var i = 0; i < matchingValues.length; i++) {
          var matchingValue = matchingValues[i];
          var matchingValueItem = document.createElement("li");
          matchingValueItem.textContent = matchingValue;
          matchingValueItem.addEventListener("click", function () {
            inputField.value = this.textContent;
            matchingValuesList.innerHTML = "";
          });
          matchingValuesList.appendChild(matchingValueItem);
        }

        // Display the list of matching values
        document.getElementById("matchingValuesContainer").style.display = "block";
        document.getElementById("productExist").style.display = "block";
        document.getElementById("addProductBtn").style.display = "none";
      } else {
        // Hide the matching values container if there are no matching values
        document.getElementById("matchingValuesContainer").style.display = "none";
        document.getElementById("productExist").style.display = "none";
        document.getElementById("addProductBtn").style.display = "block";
      }
    })
    .catch((error) => {
      console.log("Error getting matching values: ", error);
    });
}

async function getDeliveryPrice() {
  try {
    const querySnapshot = await getDocs(collection(database, "deliveryFee"));

    querySnapshot.forEach((doc) => {
      const deliveryPrice = doc.data().price;
      console.log(deliveryPrice);
      document.getElementById('deliveryPrice').value = deliveryPrice;
    });
  } catch (error) {
    console.log(error);
  }
}

// Add an event listener to clear the matching values list when the input field loses focus
inputField.addEventListener("blur", function () {
  matchingValuesList.innerHTML = "";
});
function addProduct(e) {
  e.preventDefault();

  // Change submit button to spinner
  addProductBtn.innerHTML = '<span class="spinner"></span>Sending...';

  // Get values

  var productTitle = getInputVal("productTitle");
  var productPrice = getInputVal("productPrice");
  var productCat = getInputVal("productCat");
  var productQty = getInputVal("productQuantiy");
  var productDescription = getInputVal("productDescription");

  // const storRef = sRef(storage,'products');
  const file = document.querySelector("#product-image").files[0];
  if (!file) return;

  const storageRef = sRef(storage, `productsImages/${file.name}` + new Date());
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      // setProgresspercent(progress);
    },
    (error) => {
      alert(error);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        // setImgUrl(downloadURL)
        pictureUrl = downloadURL;
        setTimeout(
          addProducts(
            pictureUrl,
            productTitle,
            productPrice,
            productCat,
            productQty,
            productDescription
          ),
          5000
        );
      });
    }
  );
}

// Function to get form values
function getInputVal(id) {
  return document.getElementById(id).value;
}

// Save products to firebase
async function addProducts(
  productPicture,
  productName,
  productPrice,
  productCat,
  productQty,
  productDesc
) {
  // Add a new document with a generated id.
  await addDoc(collection(database, "products"), {
    productPicture: productPicture,
    productName: productName,
    productPrice: productPrice,
    productCategory: productCat,
    productQty: productQty,
    productDesc: productDesc,
    timestamp: serverTimestamp(),
  })
    .then((docRef) => {
      addProductBtn.innerHTML = "Submit";
      // Data sent successfully!
      showSnackbar(`Success ${productName} was added successfully`, true);
    
      console.log("Product has been added successfully");
      document.getElementById("productForm").reset();
      document.getElementById("productExist").style.display = "none";
      document.getElementById("addProductBtn").style.display = "block";
      imagePreview.setAttribute("src", "");
    })
    .catch((error) => {
      // Data sent failed...
      addProductBtn.innerHTML = "Submit";
      showSnackbar(`Opps! Something went wrong ${error} was added successfully`, false);
    
      document.getElementById("productExist").style.display = "none";
      document.getElementById("addProductBtn").style.display = "block";
      console.log(error);
      // document.getElementById("productForm").reset();
    });

  addDoc(collection(database, "log"), {
    comment: "Added " + productName,
    timestamp: serverTimestamp(),
  })
    .then((docRef) => {
      console.log("Product has been added successfully");
    })
    .catch((error) => {
      console.log(error);
      // document.getElementById("productForm").reset();
    });
}
function showSnackbar(message, isSuccess) {
  const snackbar = document.getElementById("snackbar");
  snackbar.textContent = message;

  if (isSuccess) {
    snackbar.style.backgroundColor = "#4CAF50";
  } else {
    snackbar.style.backgroundColor = "#F44336";
  }

  snackbar.classList.add("show");

  setTimeout(() => {
    snackbar.classList.remove("show");
  }, 2000);
}


// Add an event listener to the form submit event
const updateDeliveryFeeBtn = document.getElementById("updateDeliveryFeeBtn");
updateDeliveryFeeBtn.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the default form submission
  updateDeliveryPrice(); // Call the update function
});

function updateDeliveryPrice() {
  const deliveryPrice = document.getElementById("deliveryPrice").value;

  // Update the price in the Firebase database
  const deliveryFeeDocRef = doc(database, "deliveryFee", "deliveryprice");
  updateDoc(deliveryFeeDocRef, {
    price: deliveryPrice
  }) .then(() => {
    // Product updated successfully
    // Show success message or perform any additional actions
    addDoc(collection(database, "log"), {
      comment: `delivery price was modified to ${deliveryPrice}`,
      timestamp: serverTimestamp(),
    });
 
    showSnackbar("Price updated successfully", true);
  })
  .catch((error) => {
    // Error occurred while updating the product
    console.error("Error updating price:", error);

    showSnackbar("Failed to update price, please try again", false);
  })


 
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
            notificationLink.setAttribute('href', './booking-page.html');
          } else if (notification.type == "feedback") {
            notificationLink.setAttribute('href', '../feedbacks/feedbacks.html');
          } else {
            notificationLink.setAttribute('href', '../orders/orders.html');
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
  getNotifications();
  getDeliveryPrice();
}
