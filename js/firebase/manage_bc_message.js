
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
    import {
      getFirestore,
      collection,
      doc,
      getDocs,
      onSnapshot,
      updateDoc,
      addDoc,
      serverTimestamp
    } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js"
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
    const colRef = collection(database, "users");



    async function getCustomer() {
      const currentYear = new Date().getFullYear();
      document.getElementById("currentYear").textContent = currentYear;

      //check if user is logged in or not
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          const uid = user.uid;       // ...
        } else {
          // User is signed out
          // ...
          window.location.href = "login.html";
        }
      });
      let tableRow = document.getElementById("customerTable");
      const loader = document.getElementById("loader");
      // show the loader initially
      loader.style.display = "block";

      function formatDate(timestamp) {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        return date.toLocaleString();
      }

      try {
        //  const docsSnap = await getDocs(colRef);

        onSnapshot(colRef, { includeMetadataChanges: true }, (docsSnap) => {
          loader.style.display = "none";
          let rows = "";
          let index = 0;
          docsSnap.forEach((doc) => {
            index++;
            let data = doc.data();
            let row = `<tr>
          <td><input type="checkbox" class="customer-checkbox" value="${doc.docId}"></td>
              <td>${index}</td>
              <td>${data.fullName}</td>
              <td>
                <div>${data.email}</div>
              </td>
              <td>${data.phoneNo}</td>           
            </tr>`;

            rows += row;
          });
          tableRow.innerHTML = rows;


          // Get the "Select All" checkbox and all customer checkboxes
          var selectAll = document.getElementById("select-all");
          var checkboxes = document.querySelectorAll(".customer-checkbox");

          // Add an event listener to the "Select All" checkbox
          selectAll.addEventListener("click", function () {
            checkboxes.forEach(function (checkbox) {
              checkbox.checked = selectAll.checked;
            });
          });

          // Add an event listener to each customer checkbox
          checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener("click", function (e) {
              // Stop event propagation
              e.stopPropagation();
              // Uncheck the "Select All" checkbox if any customer checkbox is unchecked
              if (!this.checked) {
                selectAll.checked = false;
              }
              // Check the "Select All" checkbox if all customer checkboxes are checked
              else if (document.querySelectorAll(".customer-checkbox:checked").length === checkboxes.length) {
                selectAll.checked = true;
              }
            });
          });

          // Add an event listener to the "Import Recipients" button
          var importButton = document.getElementById("importButton");
          importButton.addEventListener("click", importRecipients);

          // Function to handle the file import
          function importRecipients() {
            document.getElementById("customerTable").innerHTML = "";
            var importFile = document.getElementById("importFile").files[0];

            if (importFile) {
              var reader = new FileReader();

              // Read the contents of the file
              reader.onload = function (e) {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: "array" });

                // Get the first sheet of the workbook
                var worksheet = workbook.Sheets[workbook.SheetNames[0]];

                // Convert the worksheet to JSON format
                var recipients = XLSX.utils.sheet_to_json(worksheet);
                console.log(recipients);

                // Hide the table and show the imported recipients
                document.getElementById("customerTable").style.display = "none";
                document.getElementById("tableHead").style.display = "none";
                displayImportedRecipients(recipients);
              };

              reader.readAsArrayBuffer(importFile);
            }
          }

          // Function to display the imported recipients
          function displayImportedRecipients(recipients) {
            var tableBody = document.getElementById("customerTable");
            var dataRows = recipients.map(function (recipient, index) {
              return `
      <tr>
        <td><input type="checkbox" class="customer-checkbox" value="${index + 1}" /></td>
        <td>${index + 1}</td>
        <td>${recipient['Full Name'] || ''}</td>
        <td>${recipient['Email'] || ''}</td>
        <td>${recipient['Phone Number'] || ''}</td>
      </tr>
    `;
            });

          

            tableBody.innerHTML = dataRows.join('');

            // Add event listener to "Select All" checkbox
            var selectAllCheckbox = document.getElementById("select-all");
            selectAllCheckbox.addEventListener("change", function () {
              var checkboxes = document.getElementsByClassName("customer-checkbox");
              for (var i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = selectAllCheckbox.checked;
              }
            });

            // Show the table and imported recipients
            document.getElementById("customerTable").style.display = "table";
            document.getElementById("tableHead").style.display = "table-row";
          }




          // Add an event listener to the "Send" button
          var sendButton = document.getElementById("sendMessageBtn");
          sendButton.addEventListener("click", function (e) {
            e.preventDefault(); // Prevent the default form submission behavior

            // Check if recipients are imported from the Excel sheet
            var importedRecipients = document.querySelectorAll(".customer-checkbox:checked");
            if (importedRecipients.length > 0) {
              sendButton.innerHTML = '<span class="spinner"></span> Sending...';
              sendMessagesToImportedRecipients(importedRecipients);
            } else {
              sendMessagesToDatabaseRecipients();
            }
          });

          // Function to send messages to imported recipients
          function sendMessagesToImportedRecipients(recipients) {
            var subject = document.getElementById("messageSubject").value;
            var message = document.getElementById("messageContent").value;
            var optLink = document.getElementById("optionalLink").value;


            if (subject.trim() === "" || message.trim() === "") {
              alert("Please fill in all required fields.");
              return; // Stop further execution
            }

            var smsContent = subject + "\n\n" + message;
            if (optLink) {
              smsContent += "\n\n" + optLink;
            }

            recipients.forEach(function (recipient) {
              // Get the recipient details from the imported recipients
              var index = recipient.value - 1;
              var fullName = recipient.closest("tr").cells[2].textContent;
              var email = recipient.closest("tr").cells[3].textContent;
              var phoneNo = recipient.closest("tr").cells[4].textContent;

              // Send the message to the imported recipient
              sendSMS(phoneNo, smsContent, optLink, fullName, email, subject);
           
              // sendMessage(subject, message, optLink, fullName, email, phoneNo);
            });

            // Clean the array after processing all imported recipients
            importedRecipients = [];
          }

          // Function to send messages to recipients from the database
          function sendMessagesToDatabaseRecipients() {
            // Get the selected customers from the database
            // Collect the form input values
            var subject = document.getElementById("messageSubject").value;
            var message = document.getElementById("messageContent").value;
            var optLink = document.getElementById("optionalLink").value;


            if (subject.trim() === "" || message.trim() === "") {
              alert("Please fill in all required fields.");
              return; // Stop further execution
            }

            var smsContent = subject + "\n\n" + message;
            if (optLink) {
              smsContent += "\n\n" + optLink;
            }

            var selectedCustomers = [];
            var checkboxes = document.querySelectorAll(".customer-checkbox:checked");

            checkboxes.forEach(function (checkbox) {
              var row = checkbox.closest("tr");
              var name = row.cells[2].textContent;
              var email = row.cells[3].textContent;
              var phone = row.cells[4].textContent;

              selectedCustomers.push({
                name: name,
                email: email,
                phone: phone,
              });
            });

            // Send the message to the selected customers
            if (selectedCustomers.length > 0) {
              selectedCustomers.forEach(function (customer) {
                sendButton.innerHTML = '<span class="spinner"></span> Sending...';

                sendSMS(customer.phone, smsContent, optLink, customer.name, customer.email, subject);
                // sendMessage(subject, message, optLink, customer.name, customer.email, customer.phone);
              });

              // Clean the array after processing all customers
              selectedCustomers = [];
            } else {
              sendButton.innerHTML = "Submit";
              alert("Please select at least one recipient.");
            }
          }



          // Add an event listener to the "Send" button
          /*           var sendButton = document.getElementById("sendMessageBtn");
                    sendButton.addEventListener("click", function (e) {
                      e.preventDefault(); // Prevent the default form submission behavior
          
                      // Collect the form input values
                      var subject = document.getElementById("messageSubject").value;
                      var message = document.getElementById("messageContent").value;
                      var optLink = document.getElementById("optionalLink").value;
          
          
                      if (subject.trim() === "" || message.trim() === "") {
                        alert("Please fill in all required fields.");
                        return; // Stop further execution
                      }
          
                      var smsContent = subject + "\n\n" + message;
                      if (optLink) {
                        smsContent += "\n\n" + optLink;
                      }
          
          
                      var selectedCustomers = [];
                      var checkboxes = document.querySelectorAll(".customer-checkbox");
          
                      checkboxes.forEach(function (checkbox) {
                        if (checkbox.checked) {
                          var row = checkbox.closest("tr");
                          var name = row.cells[2].textContent;
                          var email = row.cells[3].textContent;
                          var phone = row.cells[4].textContent;
          
                          selectedCustomers.push({
                            name: name,
                            email: email,
                            phone: phone,
                          });
                        }
                      });
          
                      // Send the message to the selected customers
                      if (selectedCustomers.length > 0) {
                        selectedCustomers.forEach(function (customer) {
                          sendButton.innerHTML = '<span class="spinner"></span> Sending...';
          
                          sendSMS(customer.phone, smsContent, optLink, customer.name, customer.email, subject);
                          // sendMessage(subject, message, optLink, customer.name, customer.email, customer.phone);
                        });
          
                        // Clean the array after processing all customers
                        selectedCustomers = [];
                      } else {
                        sendButton.innerHTML = "Submit";
                        alert("Please select at least one recipient.");
                      }
                    }); */

          // Function to send an SMS message using Termii API
          async function sendSMS(recipientPhoneNumber, message, optLink, name, email, subject) {
            // Set your Termii API key and sender ID
            const TERMII_API_KEY = 'TLXnn6CfF9iCwj4uzWXFL84AGqo7w8UT6ga4mqND139VrYCy7D7QOuuHY7mY22';
            const TERMII_SENDER_ID = 'Hilal';

            try {
              const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
                to: recipientPhoneNumber,
                from: TERMII_SENDER_ID,
                sms: message,
                type: 'plain',
                channel: 'generic',
                api_key: TERMII_API_KEY,
              });
              sendMessage(recipientPhoneNumber, message, optLink, name, email, subject);
           
              console.log('SMS sent successfully:', response.data);
            } catch (error) {
              console.error('Failed to send SMS:', error.response.data);
            }
          }

          async function sendMessage(recipientPhone, message, optlink, recipientName, recipientEmail, subject) {
            try {
              await addDoc(collection(database, "messages"), {
                subject: subject,
                message: message,
                optionalLink: optlink,
                recipientName: recipientName,
                recipientEmail: recipientEmail,
                recipientPhone: recipientPhone,
                timestamp: serverTimestamp()
              });

              showSnackbar("Message was sent successfully", true);



              // console.log("Message has been added to the database successfully");

              // Clear the form fields and close the modal
              document.getElementById("messageSubject").value = "";
              document.getElementById("messageContent").value = "";
              document.getElementById("optionalLink").value = "";
              sendButton.innerHTML = "Submit";
              document.getElementById("messageForm").reset();
              createLog(recipientName);

            } catch (error) {
              showSnackbar(`Opps! Something went wrong ${error}`, false);

              console.log("Error adding the message to the database:", error);
              sendButton.innerHTML = "Submit";
            }
          }
          async function createLog(recipientName) {
            try {

              await addDoc(collection(database, "log"), {
                comment: "a message was sent to " + recipientName,

                timestamp: serverTimestamp(),
              })
                .then((docRef) => {
                  console.log("Log created successfully");
                })
                .catch((error) => {
                  console.log(error);

                });

            } catch (error) {
              console.log("Error adding the message to the database:", error);
              sendButton.innerHTML = "Submit";
            }
          }


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

    // Get the "Select All" checkbox and all customer checkboxes

    window.onload = getCustomer;