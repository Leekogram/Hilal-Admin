// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
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


  //handlemodals
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
//check if user is logged in or not
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;

  } else {

    window.location.href = "../../../login/";
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
  var isTopProduct = document.querySelector("input[type='radio'][name=topProductRadios]:checked").value;

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
            productDescription,
            isTopProduct
          ),
          5000
        );
      });
    }
  );
}


const successOkBtn = document.getElementById("succees-ok-btn");
successOkBtn.addEventListener("click", () => {
  document.getElementById("success-alert-modal").style.display = "none";
});
const failureOkBtn = document.getElementById("failure-ok-btn");
failureOkBtn.addEventListener("click", () => {
  failureOkBtn.getElementById("failure-alert-modal").style.display = "none";
});


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
  productDesc,
  isTopProduct
) {
  // Add a new document with a generated id.
  await addDoc(collection(database, "products"), {
    productPicture: productPicture,
    productName: productName,
    productPrice: productPrice,
    productCategory: productCat,
    productQty: productQty,
    productDesc: productDesc,
    isTopProduct: isTopProduct,
    timestamp: serverTimestamp(),
  })
    .then((docRef) => {
      addProductBtn.innerHTML = "Submit";
      // Data sent successfully!
    
      document.getElementById("success-alertMessage").innerHTML = `${productName} was added successfully`;
      document.getElementById("success-alert-modal").style.display = "block";
    
      console.log("Product has been added successfully");
      document.getElementById("productForm").reset();
      document.getElementById("productExist").style.display = "none";
      document.getElementById("addProductBtn").style.display = "block";
      imagePreview.setAttribute("src", "");
    })
    .catch((error) => {
      // Data sent failed...
      addProductBtn.innerHTML = "Submit";

      document.getElementById("failure-alertMessage").innerHTML = `An error Occured while trying to add ${productName}, please try again`;
      document.getElementById("failure-alert-modal").style.display = "block";
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



// Add an event listener to the form submit event
/* const updateDeliveryFeeBtn = document.getElementById("updateDeliveryFeeBtn");
updateDeliveryFeeBtn.addEventListener("click", function (event) {
  event.preventDefault();
  document.getElementById("updateDeliveryFeeBtn").innerHTML="Updating..."; // Prevent the default form submission
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
    document.getElementById("success-alertMessage").innerHTML = `Price has been updated successfully`;
    document.getElementById("success-alert-modal").style.display = "block";
    document.getElementById("updateDeliveryFeeBtn").innerHTML="Update";
   
  })
  .catch((error) => {
    // Error occurred while updating the product
    console.error("Error updating price:", error);
    document.getElementById("failure-alertMessage").innerHTML = `Price update Failed, please try again`;
    document.getElementById("failure-alert-modal").style.display = "block";
    document.getElementById("updateDeliveryFeeBtn").innerHTML="Update";

  })


 
} */

// Get the delivery prices container
const deliveryPricesContainer = document.getElementById("deliveryPrices");

// Function to create input fields for each state
function createInputFields() {
  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", 
    "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", 
    "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];


  const columns = 4; // Number of columns
  const statesPerColumn = Math.ceil(states.length / columns);

  // Create columns for states
  for (let i = 0; i < columns; i++) {
    const column = document.createElement("div");
    column.classList.add("state-column");
  


     // Create input fields for each state
  states.forEach(state => {
    const label = document.createElement("label");
    label.setAttribute("for", `deliveryPrice-${state.replace(/ /g, "-")}`);
    label.textContent = state;
  

    const inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group", "mb-3");

    const inputGroupPrepend = document.createElement("div");
    inputGroupPrepend.classList.add("input-group-prepend");

    const currencySpan = document.createElement("span");
    currencySpan.classList.add("input-group-text", "bg-dark", "text-white");
    currencySpan.textContent = "₦";

    inputGroupPrepend.appendChild(currencySpan);

    const inputField = document.createElement("input");
    inputField.setAttribute("type", "number");
    inputField.setAttribute("class", "form-control");
    inputField.setAttribute("aria-label", `Delivery Price for ${state} (in ₦)`);
    inputField.setAttribute("placeholder", `Enter Delivery Price for ${state}`);
    inputField.setAttribute("id", `deliveryPrice-${state.replace(/ /g, "-")}`); 
    inputField.required = true;

    const inputGroupAppend = document.createElement("div");
    inputGroupAppend.classList.add("input-group-append");

    const appendSpan = document.createElement("span");
    appendSpan.classList.add("input-group-text");
    appendSpan.textContent = ".00";

    // Append the label to the container
  deliveryPricesContainer.appendChild(label);

    inputGroupAppend.appendChild(appendSpan);

    inputGroup.appendChild(inputGroupPrepend);
    inputGroup.appendChild(inputField);
    inputGroup.appendChild(inputGroupAppend);

    // Append the input field to the container
    deliveryPricesContainer.appendChild(inputGroup);
  });

  // Create the update button
  const updateButton = document.createElement("button");
  updateButton.textContent = "Update Delivery Prices";
  updateButton.setAttribute("id", "updateDeliveryPricesBtn");
  updateButton.classList.add("btn", "btn-primary");
  updateButton.addEventListener("click", updateDeliveryPrices);
  getExistingDeliveryPrices();

  // Append the update button to the container
  deliveryPricesContainer.appendChild(updateButton);
  
  
  }

 
}

// Function to update delivery prices
function updateDeliveryPrices() {
  const statePrices = {};

  // Loop through each state input field
  const stateInputs = deliveryPricesContainer.querySelectorAll("input[type='number']");
  stateInputs.forEach(input => {
    // Update the regex pattern to match the modified ID format
    const stateName = input.id.replace(/deliveryPrice-/g, "").replace(/-/g, " "); // Convert ID back to state name

    statePrices[stateName] = input.value ? Number(input.value) : 0;
  });

  // Call the function to update prices in Firestore database
  updateDeliveryPricesFirestore(statePrices);
}

// Function to update delivery prices in Firestore
async function updateDeliveryPricesFirestore(statePrices) {
  const deliveryPricesCollection = collection(database, "deliveryPrices");
 document.getElementById("updateDeliveryPricesBtn").textContent="Updating..."

  // Loop through statePrices object and update Firestore
  for (const state in statePrices) {
    try {
      const stateDocRef = doc(deliveryPricesCollection, state);
      console.log("the price =====>"+statePrices[state] );

      // Update the Firestore database with statePrices[state]
      await setDoc(stateDocRef, {
        price: statePrices[state],
        id: state // You can set the state name as the document ID
      });

      console.log(`Delivery price for ${state} updated successfully!`);
     
    } catch (error) {
      console.error(`Error updating delivery price for ${state}:`, error);
      document.getElementById("updateDeliveryPricesBtn").textContent="Opps Failed please try again"
      return;
    }
  }
  document.getElementById("updateDeliveryPricesBtn").textContent="Done !!!"
  setTimeout(() => {
    document.getElementById("updateDeliveryPricesBtn").textContent = "Update Delivery Prices";
  }, 2000); // You can adjust the delay as needed, here set to 0 for immediate execution
  
  
  console.log("All delivery prices updated successfully!");
}


// Function to fetch existing delivery prices from the database
async function getExistingDeliveryPrices() {
  try {
    const querySnapshot = await getDocs(collection(database, "deliveryPrices"));

    querySnapshot.forEach((doc) => {
      const state = doc.id; // Assuming the document ID corresponds to the state name
      const deliveryPrice = doc.data().price || 0;

      console.log(deliveryPrice);

      // Find the corresponding input field by ID and set its value
      const inputField = document.getElementById(`deliveryPrice-${state.replace(/ /g, "-")}`);
      if (inputField) {
        inputField.value = deliveryPrice;
      }
    });
  } catch (error) {
    console.error("Error getting existing delivery prices:", error);
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
  createInputFields();
  getNotifications();
  // getDeliveryPrice();
}
