  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
  import {
    getFirestore,
    collection,
    doc,
    getDocs,
    getDoc,
    onSnapshot,
    updateDoc,
    query,
    orderBy, where, deleteDoc, serverTimestamp, addDoc
  } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
  import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
  import {
    getStorage,
    ref as sRef,
    getDownloadURL,
    uploadBytesResumable,
    deleteObject
  } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-storage.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional


  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize  Database and get a reference to the service
  const database = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  const colRef = collection(database, "service");

  //check if user is logged in or not
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
    } else {

      window.location.href = "../../../login/";
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

  const successOkBtn = document.getElementById("succees-ok-btn");
  successOkBtn.addEventListener("click", () => {
    document.getElementById("success-alert-modal").style.display = "none";
  });
  const failureOkBtn = document.getElementById("failure-ok-btn");
  failureOkBtn.addEventListener("click", () => {
    failureOkBtn.getElementById("failure-alert-modal").style.display = "none";
  });
  const confirmBtn = document.getElementById("yes-btn");
  const declineBtn = document.getElementById("no-btn");
  const confirmationModal = document.getElementById("confirmation-modal");
 

  declineBtn.addEventListener("click", () => {
    confirmationModal.style.display = "none";
  });

  async function getServices() {
    const currentYear = new Date().getFullYear();
    document.getElementById("currentYear").textContent = currentYear;
    let tableRow = document.getElementById("stockTable");
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
            <td><img src="${data.servicePicture}"  style="border-radius:0px;width:50px;heigth:50px"/></td>
            <td>${data.serviceName} </td>
            <td  style="max-width: 500px;word-wrap: break-word;overflow-wrap: break-word;white-space: pre-wrap;font-size: 14px;">
            ${data.serviceDes}
           
            </td>
            <td>
             
            ${data.servicePrice}
              </td>
            <td>  ${data.serviceDuration}</td>
            
            <td>
              ${data.serviceCat}
            </td>
           
            <td>
              <i
                class="icon-ellipsis"
                id="dropdownMenuSplitButton1" data-toggle="${data.status == "Completed" ? "" : "dropdown"}" aria-haspopup="true" aria-expanded="false"
              ></i>
              <div
                class="dropdown-menu"
                aria-labelledby="dropdownMenuSplitButton1"
              >
                <h5 class="dropdown-header">Action</h5>
                             
<a class="dropdown-item update-action" data-docid="${doc.id}" data-servicepic="${doc.data().servicePicture}" data-servicename="${doc.data().serviceName}" data-servicecat="${doc.data().serviceCat}" data-serviceprice="${doc.data().servicePrice}" data-servicedesc="${doc.data().serviceDes}" data-serviceduration="${doc.data().serviceDuration}")">Edit</a>
<a class="dropdown-item delete-action " data-docid="${doc.id}" data-servicepic="${doc.data().servicePicture}" data-servicename="${doc.data().serviceName}" data-servicecat="${doc.data().serviceCat}" data-serviceprice="${doc.data().servicePrice}" data-servicedesc="${doc.data().serviceDes}" data-serviceduration="${doc.data().serviceDuration}")">Delete</a>

               
               
            
              
              </div>
            </td>
          </tr>`;

          rows += row;
        });
        tableRow.innerHTML = rows;


        // Add event listener to modify dropdown item
        const modifyItems = document.querySelectorAll(".update-action");
        modifyItems.forEach((item) => {
          item.addEventListener("click", (event) => {

            const docId = event.target.dataset.docid;
            const servicePicture = event.target.dataset.servicepic;
            const serviceTitle = event.target.dataset.servicename;
            const serviceCat = event.target.dataset.servicecat;
            const serviceprice = event.target.dataset.serviceprice;
            const servciesDuration = event.target.dataset.serviceduration;
            const serviceDescription = event.target.dataset.servicedesc;

            document.getElementById("itemName").innerHTML=serviceTitle;
            confirmationModal.style.display = "block";

            confirmBtn.addEventListener("click", () => {
              confirmationModal.style.display = "none";
              openModal(docId, servicePicture, serviceTitle, serviceCat, serviceprice, servciesDuration, serviceDescription);
            });

         
          });
        });
        // Add event listener to delete dropdown item
        const deleteItems = document.querySelectorAll(".delete-action");
        deleteItems.forEach((item) => {
          item.addEventListener("click", (event) => {

            const docId = event.target.dataset.docid;
            const serviceTitle = event.target.dataset.servicename;

            const  deleteConfirmationModal = document.getElementById("delete-confirmation-modal");
            const deleteConfirmBtn = document.getElementById("delete-yes-btn");
            const deletedeclineBtn = document.getElementById("delete-no-btn");

            
            document.getElementById("deleteItemName").innerHTML=serviceTitle;
            deleteConfirmationModal.style.display="block";
          


            deleteConfirmBtn.addEventListener("click", () => {
              deleteConfirmationModal.style.display = "none";
              deleteDocument("service", docId, serviceTitle);
            });

            deletedeclineBtn.addEventListener("click", () => {
              deleteConfirmationModal.style.display = "none";
             
            });


            // Show confirmation alert
          
          });
        });

      });
    } catch (error) {
      console.log(error);
    }
  }


  // Add the openModal and closeModal functions
  function openModal(docId, servicePicture, serviceTitle, serviceCat, serviceprice, servciesDuration, serviceDescription) {

    // Populate the modal with the data
    document.getElementById("serviceName").value = serviceTitle;
    document.getElementById("serviceCat").value = serviceCat;
    document.getElementById("servicePrice").value = serviceprice;
    document.getElementById("serviceDuration").value = servciesDuration;
    document.getElementById("serviceDescription").value = serviceDescription;
    document.getElementById("documentId").value = docId;
    document.getElementById("imagePreview").setAttribute("src", servicePicture);



    // Show the modal
    const modal = document.getElementById("modifyModal");
    modal.style.display = "block";
  }


  const closeModalBtn = document.getElementById("close");
  closeModalBtn.addEventListener("click", () => {
    const modal = document.getElementById("modifyModal");
    modal.style.display = "none";
  });


  const updateBtn = document.getElementById("updateServiceBtn");

  document.getElementById("serviceForm").addEventListener("submit", updateServ);
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

  function updateServ(e) {
    e.preventDefault();

    // Change submit button to spinner
    updateBtn.innerHTML = '<span class="spinner"></span> Updating...';

    // Get values
    var serviceTitle = getInputVal("serviceName");
    var servicePrice = getInputVal("servicePrice");
    var serviceCat = getInputVal("serviceCat");
    var serviceDuration = getInputVal("serviceDuration");
    var servciesDes = getInputVal("serviceDescription");
    var documentId = getInputVal("documentId");

    const file = document.querySelector("#service-image").files[0];

    if (file) {
      const storageRef = sRef(storage, `productsImages/${file.name}` + new Date());

      const deleteOldImagePromise = deleteOldImage(documentId); // Delete old image
      const uploadNewImagePromise = uploadNewImage(storageRef, file); // Upload new image

      Promise.all([deleteOldImagePromise, uploadNewImagePromise])
        .then(([oldImageDeleted, downloadURL]) => {
          // Update image fields and other corresponding fields
          if (oldImageDeleted) {
            // Old image deleted successfully
            updateService(documentId, downloadURL, serviceTitle, servicePrice, serviceCat, serviceDuration, servciesDes);
          } else {
            // Failed to delete old image
            console.error("Failed to delete old image");
          }
        })
        .catch((error) => {
          console.error("Error updating product:", error);
        })
        .finally(() => {
          // Change submit button back to normal text
          updateBtn.innerHTML = "Update Product";
        });
    } else {
      // No new image selected, update other fields only
      updateService(documentId, null, serviceTitle, servicePrice, serviceCat, serviceDuration, servciesDes);
    }
  }


  function updateService(documentId, downloadURL, serviceTitle, servicePrice, serviceCat, serviceDuration, servciesDes) {

  // Split the selected value by the pipe delimiter
  var splitValues = serviceCat.split("|");

  // Assign the section ID and section name to separate variables
  var sectionId = splitValues[0];
  var sectionName = splitValues[1];
  console.log(sectionId);
  console.log(sectionName);

    const productRef = doc(database, "service", documentId);

    if (downloadURL != null) {
      updateDoc(productRef, {
        servicePicture: downloadURL,
        serviceName: serviceTitle,
        servicePrice: servicePrice,
        sectionId:sectionId,
        serviceCat: sectionName,
        serviceDuration: serviceDuration,
        serviceDes: servciesDes
      })
        .then(() => {
          // Product updated successfully
          // Show success message or perform any additional actions
          addDoc(collection(database, "log"), {
            comment: `${serviceTitle} was modified`,
            timestamp: serverTimestamp(),
          });
          document.getElementById("modifyModal").style.display = "none";
          document.getElementById("success-alertMessage").innerHTML = `${serviceTitle} service has been updated successfully`;
          document.getElementById("success-alert-modal").style.display = "block";
          // showSnackbar("Service updated successfully", true);
        })
        .catch((error) => {
          // Error occurred while updating the product
          console.error("Error updating service:", error);
          // Show error message or perform any error handling
          document.getElementById("modifyModal").style.display = "none";
          document.getElementById("failure-alertMessage").innerHTML = `${serviceTitle} update Failed, please try again`;
          document.getElementById("failure-alert-modal").style.display = "block";
          // showSnackbar("Failed to update service, please try again", false);
        })
        .finally(() => {
          // Reset the submit button
          updateBtn.innerHTML = "Update Service";
        });
    } else {
      updateDoc(productRef, {
        serviceName: serviceTitle,
        servicePrice: servicePrice,
        sectionId:sectionId,
        serviceCat: sectionName,
        serviceDuration: serviceDuration,
        serviceDes: servciesDes
      })
        .then(() => {
          // Product updated successfully
          // Show success message or perform any additional actions
          addDoc(collection(database, "log"), {
            comment: `${serviceTitle} was modified`,
            timestamp: serverTimestamp(),
          });
          document.getElementById("modifyModal").style.display = "none";
          document.getElementById("success-alertMessage").innerHTML = `${serviceTitle} service has been updated successfully`;
          document.getElementById("success-alert-modal").style.display = "block";
        })
        .catch((error) => {
          // Error occurred while updating the product
          console.error("Error updating service:", error);
          // Show error message or perform any error handling
          document.getElementById("modifyModal").style.display = "none";
          document.getElementById("failure-alertMessage").innerHTML = `${serviceTitle} update Failed, please try again`;
          document.getElementById("failure-alert-modal").style.display = "block";
        })
        .finally(() => {
          // Reset the submit button
          updateBtn.innerHTML = "Update Service";
        });
    }

  }

  function deleteObjectFromURL(url) {
    // Assuming you have initialized the Firebase Storage instance as `storage`
    // Extract the storage path from the URL
    const storagePath = url.replace(
      "https://firebasestorage.googleapis.com/v0/b/serviceImages/o/",
      ""
    );

    const storageRef = sRef(storage, storagePath);
    return deleteObject(storageRef)
      .then(() => {
        console.log("Old image deleted successfully");
        return true;
      })
      .catch((error) => {
        console.error("Error deleting old image:", error);
        return false;
      });
  }





  function deleteOldImage(documentId) {
    // Get the URL of the old image from the database
    // Assuming you have a function to retrieve the old image URL based on the document ID
    return getOldImageURL(documentId)
      .then((oldImageURL) => {
        if (!oldImageURL) {
          // No old image to delete
          return true;
        }

        // Delete the old image from the storage bucket
        return deleteObjectFromURL(oldImageURL);
      })
      .catch((error) => {
        console.error("Error retrieving old image URL:", error);
        return false;
      });
  }


  function uploadNewImage(storageRef, file) {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          // setProgresspercent(progress);
        },
        (error) => {
          console.error("Error uploading new image:", error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              console.log("New image uploaded successfully");
              resolve(downloadURL);
            })
            .catch((error) => {
              console.error("Error retrieving download URL for new image:", error);
              reject(error);
            });
        }
      );
    });
  }



  function getOldImageURL(documentId) {
    const docRef = doc(database, "service", documentId);
    return getDoc(docRef)
      .then((doc) => {
        if (doc.exists()) {
          const data = doc.data();
          return data.servicePicture; // Assuming the field storing the image URL is named 'productPicture'
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error("Error retrieving old image URL:", error);
        return null;
      });
  }


  function getFilenameFromURL(url) {
    // Check if the URL is null, undefined, or not a string
    if (!url || typeof url !== "string") {
      return null;
    }
    const parts = url.split("/");
    return parts[parts.length - 1];
  }

  // Function to get form values
  function getInputVal(id) {
    return document.getElementById(id).value;
  }

  // Function to delete a document from Firestore
  async function deleteDocument(collectionName, documentId, serviceName) {
    try {

      const documentRef = doc(database, collectionName, documentId);

      await deleteDoc(documentRef);
      console.log("Document deleted successfully");
      addDoc(collection(database, "log"), {
        comment: `${serviceName} was deleted`,
        timestamp: serverTimestamp(),
      });
     // showSnackbar(`${serviceName} was deleted successfully`, true);
      document.getElementById("success-alertMessage").innerHTML = `${serviceName} service was deleted successfully`;
      document.getElementById("success-alert-modal").style.display = "block";
    } catch (error) {
      console.error("Error deleting document:", error);
      // showSnackbar(`Failed to delete document ${serviceName}, try again`, false);
      document.getElementById("failure-alertMessage").innerHTML = `An error occured while trying to delete ${serviceName}, please try again`;
      document.getElementById("failure-alert-modal").style.display = "block";
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
    getServices();
    getNotifications();
  }