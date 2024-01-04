 // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
 import {
     getFirestore,
     collection,
     addDoc,
     doc,
     getDoc,
     serverTimestamp,
     orderBy,
     query,
     onSnapshot,
     startAt,
     endAt, where, getDocs, deleteDoc, updateDoc,
 } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
 import {
     getStorage,
     ref as sRef,
     getDownloadURL,
     uploadBytesResumable, deleteObject
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

         window.location.href = "../login/";
     }
 });


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
 const confirmationModal = document.getElementById("confirmation-modal");


 declineBtn.addEventListener("click", () => {
    confirmationModal.style.display = "none";
  });
 let pictureUrl;

 const currentYear = new Date().getFullYear();
 document.getElementById("currentYear").textContent = currentYear;

 const addProductBtn = document.getElementById("addProductBtn");

 document.getElementById("sectionForm").addEventListener("submit", addSection);

 const imageInput = document.getElementById("section-image");
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


 var inputField = document.getElementById("sectionName");
 var matchingValuesList = document.createElement("ul");
 document.getElementById("matchingValuesContainer").appendChild(matchingValuesList);

 // Add event listeners to the input field
 inputField.addEventListener("input", searchMatchingValues);
 inputField.addEventListener("keyup", searchMatchingValues);
 inputField.addEventListener("focus", searchMatchingValues);

 function searchMatchingValues() {
     // Get the entered value
     var enteredValue = inputField.value;

     // Query the Firestore collection for matching values
     const q = query(
         collection(database, "section"),
         orderBy("sectionName"),
         startAt(enteredValue),
         endAt(enteredValue + "\uf8ff")
     );

     getDocs(q)
         .then((querySnapshot) => {
             // Get the matching values
             var matchingValues = querySnapshot.docs.map(function (doc) {
                 console.log(doc.data().sectionName);
                 return doc.data().sectionName;
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
                 document.getElementById("sectionExist").style.display = "block";
                 document.getElementById("addProductBtn").style.display = "none";
             } else {
                 // Hide the matching values container if there are no matching values
                 document.getElementById("matchingValuesContainer").style.display = "none";
                 document.getElementById("sectionExist").style.display = "none";
                 document.getElementById("addProductBtn").style.display = "block";
             }
         })
         .catch((error) => {
             console.log("Error getting matching values: ", error);
         });
 }


 function addSection(e) {
     e.preventDefault();

     // Change submit button to spinner
     addProductBtn.innerHTML = '<span class="spinner"></span>Sending...';

     // Get values

     var sectionName = getInputVal("sectionName");

     var sectionDescription = getInputVal("sectionDescription");

     // const storRef = sRef(storage,'products');
     const file = document.querySelector("#section-image").files[0];
     if (!file) {
         alert("Section image is required");
         addProductBtn.innerHTML = "Submit";
         return;
     }

     const storageRef = sRef(storage, `sectionImages/${file.name}` + new Date());
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
                     addSect(
                         pictureUrl,
                         sectionName,
                         sectionDescription
                     ),
                     5000
                 );
             });
         }
     );
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


 // Function to get form values
 function getInputVal(id) {
     return document.getElementById(id).value;
 }

 // Save products to firebase
 async function addSect(
     sectionPicture,
     sectionName,
     sectionDes
 ) {
     // Add a new document with a generated id.
       // Add a new document with a generated id.
try {
 const docRef = await addDoc(collection(database, "section"), {
     sectionPicture: sectionPicture,
     sectionName: sectionName,
     sectionDes: sectionDes,
     timestamp: serverTimestamp(),
 });

 addProductBtn.innerHTML = "Submit";

 // Data sent successfully!
 document.getElementById("addSectionModal").style.display = "none";

 document.getElementById("success-alertMessage").innerHTML = `${sectionName} section was created successfully`;
 document.getElementById("success-alert-modal").style.display = "block";

 console.log("Section has been added successfully");
 document.getElementById("sectionForm").reset();
 imagePreview.setAttribute("src", "");

 // Remove the dimmed background
 var backdrop = document.querySelector(".modal-backdrop");
 if (backdrop) {
     backdrop.style.display = "none";
 }
} catch (error) {
 // Data sent failed...
 addProductBtn.innerHTML = "Submit";
 document.getElementById("addSectionModal").style.display = "none";
 document.getElementById("failure-alertMessage").innerHTML = `Oh no! Operation Failed ${error}`;
 document.getElementById("failure-alert-modal").style.display = "block";

 console.log(error);
}
/*      await addDoc(collection(database, "section"), {
         sectionPicture: sectionPicture,
         sectionName: sectionName,
         sectionDes: sectionDes,
         timestamp: serverTimestamp(),
     })
         .then((docRef) => {
             addProductBtn.innerHTML = "Submit";
             // Data sent successfully!
             document.getElementById("addSectionModal").style.display = "none";
             document.body.classList.remove("modal-open"); 
             showSnackbar(`Success! ${sectionName} was created successfully`, true);
           
             console.log("Section has been added successfully");
             document.getElementById("sectionForm").reset();
             imagePreview.setAttribute("src", "");
         })
         .catch((error) => {
             // Data sent failed...
             addProductBtn.innerHTML = "Submit";
             document.getElementById("addSectionModal").style.display = "none";
             document.body.classList.remove("modal-open"); 
             showSnackbar(`Oh no ! Operation  Failed ${error}`, false);
             console.log(error);
             // document.getElementById("sectionForm").reset();
         }); */

     addDoc(collection(database, "log"), {
         comment: "Added " + sectionName,
         timestamp: serverTimestamp(),
     });
 }


 let tableRow = document.getElementById("sectionTable");
 const loader = document.getElementById("loader");
 // show the loader initially
 loader.style.display = "block";
 const colRef = collection(database, "section");
 //  const sectionContainer = document.getElementById("sectionContainer");
 async function getSections() {
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
       <td><img src="${data.sectionPicture}"  style="border-radius:0px;width:50px;heigth:50px"/></td>
       <td>${data.sectionName} </td>
       <td>
         <div class="section-des">  ${data.sectionDes}</div>
      
       </td>
    
       
     
      
       <td>
         <i
           class="icon-ellipsis"
           id="dropdownMenuSplitButton1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
         ></i>
         <div
           class="dropdown-menu"
           aria-labelledby="dropdownMenuSplitButton1"
         >
           <h5 class="dropdown-header">Action</h5>
                  
<a class="dropdown-item update-action" data-docid="${doc.id}" data-sectionpic="${doc.data().sectionPicture}" data-sectionname="${doc.data().sectionName}"  data-sectiondesc="${doc.data().sectionDes}" )">Edit</a>
<a class="dropdown-item delete-action " data-docid="${doc.id}" data-sectionpic="${doc.data().sectionPicture}" data-sectionname="${doc.data().sectionName}"  data-sectiondesc="${doc.data().sectionDes}")">Delete</a>
          
         </div>
       </td>
     </tr>`;
                 rows += row;
             });
             tableRow.innerHTML = rows;



             const modifyItems = document.querySelectorAll(".update-action");
             modifyItems.forEach((item) => {
                 item.addEventListener("click", (event) => {

                     const docId = event.target.dataset.docid;
                     const sectionPicture = event.target.dataset.sectionpic;
                     const sectionTitle = event.target.dataset.sectionname;
                     const sectionDescription = event.target.dataset.sectiondesc;

                     document.getElementById("itemName").innerHTML=sectionTitle;
                     confirmationModal.style.display = "block";
         
                     confirmBtn.addEventListener("click", () => {
                       confirmationModal.style.display = "none";
                       openModal(docId, sectionPicture, sectionTitle, sectionDescription);
                     });
                  
                 });
             });
             // Add event listener to delete dropdown item
             const deleteItems = document.querySelectorAll(".delete-action");
             deleteItems.forEach((item) => {
                 item.addEventListener("click", (event) => {

                     const docId = event.target.dataset.docid;
                     const sectionTitle = event.target.dataset.sectionname;

                     const  deleteConfirmationModal = document.getElementById("delete-confirmation-modal");
                     const deleteConfirmBtn = document.getElementById("delete-yes-btn");
                     const deletedeclineBtn = document.getElementById("delete-no-btn");
         
                     
                     document.getElementById("deleteItemName").innerHTML=sectionTitle;
                     deleteConfirmationModal.style.display="block";
                   
         
         
                     deleteConfirmBtn.addEventListener("click", () => {
                       deleteConfirmationModal.style.display = "none";
                       deleteDocument("section", docId, sectionTitle);
                       deleteOldImage(docId); 
                     });
         
                     deletedeclineBtn.addEventListener("click", () => {
                       deleteConfirmationModal.style.display = "none";
                      
                     });


                    
                 });
             });
         });

     } catch (error) {
         console.log(error);
     }
 }


 const updateSectionBtn = document.getElementById("updateBtn");

 document.getElementById("updatesectionForm").addEventListener("submit", updateSect);
 const updateSectImageInput = document.getElementById("section-picture");
 const updateSectImagePreview = document.getElementById("updateimagePreview");
 updateSectImageInput.addEventListener("change", () => {
     const file = updateSectImageInput.files[0];

     if (file) {
         const reader = new FileReader();

         reader.addEventListener("load", () => {
             updateSectImagePreview.setAttribute("src", reader.result);
         });

         reader.readAsDataURL(file);
     }
 });

 function updateSect(e) {
     e.preventDefault();

     // Change submit button to spinner
     updateSectionBtn.innerHTML = '<span class="spinner"></span> Updating...';

     // Get values
     var sectionTitle = getInputVal("sectionTitle");
     var sectionDescription = getInputVal("sectionDescript");
     var documentId = getInputVal("documentId");

     const file = document.querySelector("#section-picture").files[0];

     if (file) {
         const storageRef = sRef(storage, `sectionImages/${file.name}` + new Date());

         const deleteOldImagePromise = deleteOldImage(documentId); // Delete old image
         const uploadNewImagePromise = uploadNewImage(storageRef, file); // Upload new image

         Promise.all([deleteOldImagePromise, uploadNewImagePromise])
             .then(([oldImageDeleted, downloadURL]) => {
                 // Update image fields and other corresponding fields
                 if (oldImageDeleted) {
                     // Old image deleted successfully
                     updateSections(documentId, downloadURL, sectionTitle, sectionDescription);
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
                 updateSectionBtn.innerHTML = "Update Product";
             });
     } else {
         // No new image selected, update other fields only
         updateSections(documentId, null, sectionTitle, sectionDescription);
     }
 }


 function updateSections(documentId, downloadURL, sectTitle, sectDescript) {



     const sectionRef = doc(database, "section", documentId);

     if (downloadURL != null) {
         updateDoc(sectionRef, {
             sectionPicture: downloadURL,
             sectionName: sectTitle,
             sectionDes: sectDescript
         })
             .then(() => {
                 // Product updated successfully
                 // Show success message or perform any additional actions
                 addDoc(collection(database, "log"), {
                     comment: `${sectTitle} was modified`,
                     timestamp: serverTimestamp(),
                 });
                 document.getElementById("modifyModal").style.display = "none";
                 document.getElementById("success-alertMessage").innerHTML = `${sectTitle} section has been updated successfully`;
                 document.getElementById("success-alert-modal").style.display = "block";
               
             })
             .catch((error) => {
                 // Error occurred while updating the product
                 console.error("Error updating product:", error);
                 // Show error message or perform any error handling
                 document.getElementById("modifyModal").style.display = "none";
                 document.getElementById("failure-alertMessage").innerHTML = `${sectTitle} update Failed, please try again`;
                 document.getElementById("failure-alert-modal").style.display = "block";
                
             })
             .finally(() => {
                 // Reset the submit button
                 updateSectionBtn.innerHTML = "Update Section";
             });
     } else {
         updateDoc(sectionRef, {
             sectionName: sectTitle,
             sectionDes: sectDescript
         })
             .then(() => {
                 // Product updated successfully
                 // Show success message or perform any additional actions
                 addDoc(collection(database, "log"), {
                     comment: `${sectTitle} was modified`,
                     timestamp: serverTimestamp(),
                 });
                 document.getElementById("modifyModal").style.display = "none";
                 document.getElementById("success-alertMessage").innerHTML = `${sectTitle} section has been updated successfully`;
                 document.getElementById("success-alert-modal").style.display = "block";
             })
             .catch((error) => {
                 // Error occurred while updating the product
                 console.error("Error updating product:", error);
                 // Show error message or perform any error handling
                 document.getElementById("modifyModal").style.display = "none";
                 document.getElementById("failure-alertMessage").innerHTML = `${sectTitle} update Failed, please try again`;
                 document.getElementById("failure-alert-modal").style.display = "block";
             })
             .finally(() => {
                 // Reset the submit button
                 updateSectionBtn.innerHTML = "Update Section";
             });
     }

 }

 function deleteObjectFromURL(url) {
     // Assuming you have initialized the Firebase Storage instance as `storage`
     // Extract the storage path from the URL
     const storagePath = url.replace(
         "https://firebasestorage.googleapis.com/v0/b/sectionImages/o/",
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
     const docRef = doc(database, "section", documentId);
     return getDoc(docRef)
         .then((doc) => {
             if (doc.exists()) {
                 const data = doc.data();
                 return data.sectionPicture; // Assuming the field storing the image URL is named 'productPicture'
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




 // Function to delete a document from Firestore
 async function deleteDocument(collectionName, documentId, sectionName) {
     try {

         const documentRef = doc(database, collectionName, documentId);

         await deleteDoc(documentRef);
         console.log("Document deleted successfully");
         addDoc(collection(database, "log"), {
             comment: `${sectionName} was deleted`,
             timestamp: serverTimestamp(),
         });
         document.getElementById("success-alertMessage").innerHTML = `${sectionName} was deleted successfully`;
         document.getElementById("success-alert-modal").style.display = "block";

     } catch (error) {
         console.error("Error deleting document:", error);
         document.getElementById("success-alertMessage").innerHTML = `Failed to delete ${sectionName}, try again`;
         document.getElementById("success-alert-modal").style.display = "block";
       
     }
 }


 // Add the openModal and closeModal functions
 function openModal(docId, sectionPicture, sectionTitle, sectionDescription) {

     // Populate the modal with the data
     document.getElementById("sectionTitle").value = sectionTitle;
     document.getElementById("sectionDescript").value = sectionDescription;
     document.getElementById("documentId").value = docId;
     document.getElementById("updateimagePreview").setAttribute("src", sectionPicture);



     // Show the modal
     const modal = document.getElementById("modifyModal");
     modal.style.display = "block";
 }


 const closeModalBtn = document.getElementById("close");
 closeModalBtn.addEventListener("click", () => {
     const modal = document.getElementById("modifyModal");
     modal.style.display = "none";
 });



 window.onload = function () {

     getSections();
 }