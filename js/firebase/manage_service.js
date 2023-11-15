// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc, getDocs,
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

const auth = getAuth();

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

document.getElementById("serviceForm").addEventListener("submit", addProduct);

const imageInput = document.getElementById("service-image");
const imagePreview = document.getElementById("imagePreview");
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      imagePreview.setAttribute("src", reader.result);
    });

    reader.readAsDataURL(file);
  }
});



async function getSections() {
  var sectionDropdown = document.getElementById("serviceCat");
  const colRef = collection(database, "section");


  try {
    //  const docsSnap = await getDocs(colRef);
    onSnapshot(colRef, { includeMetadataChanges: true }, (docsSnap) => {

      // Clear existing options
      sectionDropdown.innerHTML = "";

      // Create an option group
      var optionGroup = document.createElement("optgroup");
      optionGroup.setAttribute("id", "section-dropdown");
      optionGroup.label = "Select a section";

      // Loop through the documents in the query snapshot and create an option for each one
      docsSnap.forEach((doc) => {
        var option = document.createElement("option");
        var sectionId = doc.id;
        var sectionName = doc.data().sectionName;
        option.value = sectionId + "|" + sectionName;
        option.text = doc.data().sectionName;
        optionGroup.appendChild(option);
      });

      // Add the option group to the dropdown
      sectionDropdown.appendChild(optionGroup);

    });


  } catch (error) {
    console.log(error);
  }
}


var inputField = document.getElementById("serviceName");
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
    collection(database, "service"),
    orderBy("serviceName"),
    startAt(enteredValue),
    endAt(enteredValue + "\uf8ff")
  );

  getDocs(q)
    .then((querySnapshot) => {
      // Get the matching values
      var matchingValues = querySnapshot.docs.map(function (doc) {
        console.log(doc.data().serviceName);
        return doc.data().serviceName;
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




function addProduct(e) {
  e.preventDefault();

  // Change submit button to spinner
  addProductBtn.innerHTML = '<span class="spinner"></span>Sending...';

  // Get values

  var serviceName = getInputVal("serviceName");
  var servicePrice = getInputVal("servicePrice");
  var serviceDuration = getInputVal("serviceDuration");
  var serviceCat = getInputVal("serviceCat");
  var serviceDescription = getInputVal("serviceDescription");

  // const storRef = sRef(storage,'products');
  const file = document.querySelector("#service-image").files[0];
  if (!file) {
    alert("Service image is required");
    addProductBtn.innerHTML = "Submit";
    return;
  }

  const storageRef = sRef(storage, `serviceImages/${file.name}` + new Date());
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
          addService(
            pictureUrl,
            serviceName,
            servicePrice,
            serviceDuration,
            serviceCat,
            serviceDescription
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


// Function to get form values
function getInputVal(id) {
  return document.getElementById(id).value;
}

// Save products to firebase
async function addService(
  servicePicture,
  serviceName,
  servicePrice,
  serviceDuration,
  serviceCat,
  serviceDes
) {
  // Split the selected value by the pipe delimiter
  var splitValues = serviceCat.split("|");

  // Assign the section ID and section name to separate variables
  var sectionId = splitValues[0];
  var sectionName = splitValues[1];
  // Add a new document with a generated id.
  await addDoc(collection(database, "service"), {
    servicePicture: servicePicture,
    serviceName: serviceName,
    servicePrice: servicePrice,
    serviceDuration: serviceDuration,
    sectionId:sectionId,
    serviceCat: sectionName,
    serviceDes: serviceDes,
    timestamp: serverTimestamp(),
  })
    .then((docRef) => {
      addProductBtn.innerHTML = "Submit";
 

      document.getElementById("success-alertMessage").innerHTML = `${serviceName} service was added successfully`;
      document.getElementById("success-alert-modal").style.display = "block";
      console.log("Product has been added successfully");
      document.getElementById("serviceForm").reset();
      imagePreview.setAttribute("src", "");
    })
    .catch((error) => {
      // Data sent failed...
      addProductBtn.innerHTML = "Submit";
   
      document.getElementById("failure-alertMessage").innerHTML = `An Error occured when adding ${serviceName}, please try again`;
      document.getElementById("failure-alert-modal").style.display = "block";
      console.log(error);
      // document.getElementById("serviceForm").reset();
    });

  addDoc(collection(database, "log"), {
    comment: "Added " + serviceName,
    timestamp: serverTimestamp(),
  })
    .then((docRef) => {
      console.log("Product has been added successfully");
    })
    .catch((error) => {
      console.log(error);
      // document.getElementById("serviceForm").reset();
    });
}

function createAlert(
  title,
  summary,
  details,
  severity,
  dismissible,
  autoDismiss,
  appendToId
) {
  var iconMap = {
    info: "fa fa-info-circle",
    success: "fa fa-thumbs-up",
    warning: "fa fa-exclamation-triangle",
    danger: "fa ffa fa-exclamation-circle",
  };

  var iconAdded = false;

  var alertClasses = ["alert", "animated", "flipInX"];
  alertClasses.push("alert-" + severity.toLowerCase());

  if (dismissible) {
    alertClasses.push("alert-dismissible");
  }

  var msgIcon = $("<i />", {
    class: iconMap[severity], // you need to quote "class" since it's a reserved keyword
  });

  var msg = $("<div />", {
    class: alertClasses.join(" "), // you need to quote "class" since it's a reserved keyword
  });

  if (title) {
    var msgTitle = $("<h4 />", {
      html: title,
    }).appendTo(msg);

    if (!iconAdded) {
      msgTitle.prepend(msgIcon);
      iconAdded = true;
    }
  }

  if (summary) {
    var msgSummary = $("<strong />", {
      html: summary,
    }).appendTo(msg);

    if (!iconAdded) {
      msgSummary.prepend(msgIcon);
      iconAdded = true;
    }
  }

  if (details) {
    var msgDetails = $("<p />", {
      html: details,
    }).appendTo(msg);

    if (!iconAdded) {
      msgDetails.prepend(msgIcon);
      iconAdded = true;
    }
  }

  if (dismissible) {
    var msgClose = $("<span />", {
      class: "close", // you need to quote "class" since it's a reserved keyword
      "data-dismiss": "alert",
      html: "<i class='fa fa-times-circle'></i>",
    }).appendTo(msg);
  }

  $("#" + appendToId).prepend(msg);

  if (autoDismiss) {
    setTimeout(function () {
      msg.addClass("flipOutX");
      setTimeout(function () {
        msg.remove();
      }, 1000);
    }, 5000);
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
            notificationLink.setAttribute('href', './services/');
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
  getSections();
  getNotifications();
}
