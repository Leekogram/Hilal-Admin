// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  query,
  onSnapshot,
  updateDoc,
  orderBy,
  getDocs, where, Timestamp
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize  Database and get a reference to the service
const database = getFirestore(app);

const colRef = collection(database, "users");






// Get the start date and end date input fields
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');


startDateInput.addEventListener('click',()=>{
  const detailedReports = document.getElementById('detailedReports');
  detailedReports.classList.remove('active');
});
endDateInput.addEventListener('click',()=>{
  const detailedReports = document.getElementById('detailedReports');
  detailedReports.classList.remove('active');
});

function formatDateInput(dateInput) {
  const selectedDate = new Date(dateInput.value);
  const formattedDate = `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}/${selectedDate.getFullYear()}`;
  return formattedDate;
}
// Event handler for the end date input field
endDateInput.addEventListener('change', () => {
  const startDateValue = formatDateInput(startDateInput);
  const endDateValue = formatDateInput(endDateInput);

  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);
    
const startDateTimestamp =Timestamp.fromDate(startDate);
const endDateTimestamp = Timestamp.fromDate(endDate);

    
  getCustomer(startDateTimestamp, endDateTimestamp);
});



//calculate date of birth
function calculateDaysToBirthday(dateOfBirth) {
  const today = new Date();
  const dob = new Date(dateOfBirth);

  // Set the year of the date of birth to the current year
  dob.setFullYear(today.getFullYear());

  // If the birthday has passed for this year, set it to next year
  if (today > dob) {
    dob.setFullYear(today.getFullYear() + 1);
  }

  // Calculate the difference in milliseconds between today and the next birthday
  const diffTime = Math.abs(dob - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {

    return "Birthday";
  } else {
  
    return `${diffDays} days to birthday`;
  }
}

function colorCodeBirthdayCell(dateOfBirth, tableCell) {
  const birthday = new Date(dateOfBirth);
  const today = new Date();

  birthday.setFullYear(today.getFullYear());

  if (birthday.getDate() === today.getDate() && birthday.getMonth() === today.getMonth()) {
    tableCell.textContent = "Birthday";
    tableCell.style.color = "green"; // Change text color to green
    tableCell.style.fontWeight = "bold"; // Make text bold
  } else {
    const daysToBirthday = calculateDaysToBirthday(dateOfBirth);
    tableCell.textContent = daysToBirthday;
    tableCell.style.color = "black"; // Reset text color to default
    tableCell.style.fontWeight = "normal"; // Reset font weight to normal
  }
}

function countBirthdaysToday(listOfBirthdays) {
  const today = new Date();
  const todayStr = `${today.getMonth() + 1}/${today.getDate()}`;

  let count = 0;
  listOfBirthdays.forEach((birthday) => {
    const birthdayDate = new Date(birthday);
    const birthdayStr = `${birthdayDate.getMonth() + 1}/${birthdayDate.getDate()}`;
    if (birthdayStr === todayStr) {
      count++;
    }
  });

  return count;
}





async function getCustomer(startDate,endDate) {
  console.log('i have been called',+startDate);
  const currentYear = new Date().getFullYear();

  const today = new Date();
  const day = today.toLocaleString('en-us', { weekday: 'long' });
  const date = today.getDate();
  const month = today.toLocaleString('en-us', { month: 'short' });
  const year = today.getFullYear();
  const todayString = `Today (${date} ${month} ${year})`;

  // document.getElementById("today").textContent = todayString;
  document.getElementById("currentYear").textContent = currentYear;
  //check if user is logged in or not
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
    } else {
      window.location.href = "../../../login/";
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


  // console.log(newQuery);
  try {
    const q = query(colRef, orderBy("createdDateTime", "desc"));

    onSnapshot(q, { includeMetadataChanges: true }, (docsSnap) => {
      loader.style.display = "none";
      let rows = "";
      let index = 0;
      const listOfBirthdays = []; 
      docsSnap.forEach(async (doc) => {
        index++;
        let data = doc.data();
        const userEmail = doc.data().email;
        listOfBirthdays.push(new Date(data.dateOfBirth));




        let row = `<tr data-useremail="${data.email}" class="clickable-row" id="user-row-${data.email}">
              <td>${index}</td>
              <td>${data.fullName}</td>
              <td>
                <div>${data.email}</div>
              </td>
              <td>${data.phoneNo}</td>
              <td>${data.address}</td>
              <td id="birthdayCell"  >${calculateDaysToBirthday(data.dateOfBirth)}</td>
              <td>${formatDate(data.createdDateTime)} </td>
            
              <td class="total-spending">
              Loading...
              </td>
            </tr>`;

        rows += row;
        
        // Query the "orders" collection for the user's orders
        const ordersSnapshot = await getDocs(query(collection(database, 'orders'), where('customerEmail', '==', userEmail) , where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),where('orderStatus','==', 'Completed'),where('paymentStatus','==', 'Paid')));

        let totalOrderSpending = 0;
        ordersSnapshot.forEach((orderDoc) => {
          const orderData = orderDoc.data();
          const amountPaid = parseFloat(orderData.amountPaid);
          totalOrderSpending += amountPaid;
        });
        console.log("Total Order Spending:", totalOrderSpending);

        // Query the "bookings" collection for the user's bookings
        const bookingsSnapshot = await getDocs(query(collection(database, 'bookings'), where('email', '==', userEmail),where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),where('status','==', 'Completed')));

        let totalBookingSpending = 0;
        bookingsSnapshot.forEach((bookingDoc) => {
          const bookingData = bookingDoc.data();
          const amountPaid = parseFloat(bookingData.serviceAmount);
          totalBookingSpending += amountPaid;
        
        });
        console.log("Total Booking Spending:", totalBookingSpending);
        // Calculate the total spending for the user
        const totalSpending = Number(totalOrderSpending)  + Number(totalBookingSpending); 
        // Update the table row with the total spending information
        console.log("Total Spending:", totalSpending);
        
    
        const tableRow = document.getElementById(`user-row-${userEmail}`);
        
        if (tableRow) {
          const totalSpendingCell = tableRow.querySelector('.total-spending');
          const birthdayCell = tableRow.querySelector('#birthdayCell');
          if (birthdayCell) {
            colorCodeBirthdayCell(data.dateOfBirth, birthdayCell);
          }
          if (totalSpendingCell) {
            if (typeof totalSpending === 'number') {
              totalSpendingCell.textContent = formatTotalSpending(totalSpending);
            } else if (typeof totalSpending === 'string') {
              const amountPaid = parseFloat(totalSpending);
              if (!isNaN(amountPaid)) {
                totalSpendingCell.textContent = formatTotalSpending(amountPaid);
              } else {
                totalSpendingCell.textContent = 'N/A'; // or any other placeholder value
              }
            } else {
              totalSpendingCell.textContent = 'N/A'; // or any other placeholder value
            }
          }
        }

        

      });
      tableRow.innerHTML = rows;
  
      const countToday = countBirthdaysToday(listOfBirthdays);

      document.getElementById("totalcustomerbirthday").innerHTML = countToday;
      console.log("=======>"+countToday);
      // Add click event listener to each row
      const rowsElements = document.querySelectorAll("#customerTable tr");
      rowsElements.forEach((row) => {
        row.addEventListener("click", () => {
          const uEmail = row.getAttribute("data-useremail");
          // console.log(uEmail);
          showUserDetails(uEmail,startDate,endDate);
        });
      });

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
function formatTotalSpending(amount) {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
}



async function showUserDetails(userEmail,startDate,endDate) {
  // const userDetailsDiv = document.getElementById("userDetails");
  // userDetailsDiv.innerHTML = ""; // Clear previous content
  const detailedReports = document.getElementById('detailedReports');
  detailedReports.classList.toggle('active');

  try {
    // Retrieve user details from the Firestore collections (orders and bookings)
    const [ordersSnapshot, bookingsSnapshot] = await Promise.all([
      getDocs(query(collection(database, "orders"), where("customerEmail", "==", userEmail), where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate))),
      getDocs(query(collection(database, "bookings"), where("email", "==", userEmail),where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate)))
    ]);

    const userDetails = {};

    userDetails.totalSpent = (calculateOrderTotalSpent(ordersSnapshot,"Completed")+ calculateBookingTotalSpent(bookingsSnapshot, "Completed")).toLocaleString();
    userDetails.totalOrders = ordersSnapshot.size;
    userDetails.totalBookings = bookingsSnapshot.size;
    userDetails.pendingBookings = countBookingsByStatus(bookingsSnapshot, "New");
    userDetails.completedBookings = countBookingsByStatus(bookingsSnapshot, "Completed");
    userDetails.cancelledBookings = countBookingsByStatus(bookingsSnapshot, "Cancelled");
    userDetails.pendingOrders = countOrdersByStatus(ordersSnapshot, "New");
    userDetails.completedOrders = countOrdersByStatus(ordersSnapshot, "Completed");
    userDetails.cancelledOrders = countOrdersByStatus(ordersSnapshot, "Cancelled");

    // Call this function with the actual values
updateProgressBars(userDetails.totalOrders, userDetails.totalBookings,  userDetails.completedOrders, userDetails.completedBookings,  userDetails.pendingOrders,   userDetails.pendingBookings);


    // Populate the userDetailsDiv with the retrieved data
    /*   const userDetailsHtml = `
        <h2>User Details</h2>
        <p>Total Spent: $${userDetails.totalSpent.toFixed(2)}</p>
        <p>Total Orders: ${userDetails.totalOrders}</p>
        <p>Total Bookings: ${userDetails.totalBookings}</p>
        <p>Pending Bookings: ${userDetails.pendingBookings}</p>
        <p>Completed Bookings: ${userDetails.completedBookings}</p>
        <p>Cancelled Bookings: ${userDetails.cancelledBookings}</p>
      `; */
    // userDetailsDiv.innerHTML = userDetailsHtml;
    document.getElementById("totalOrder").innerHTML = userDetails.totalOrders;
    document.getElementById("totalBookings").innerHTML = userDetails.totalBookings;
    document.getElementById("totalCompletedBookings").innerHTML = userDetails.completedBookings;
    document.getElementById("totalCompletedOrder").innerHTML = userDetails.completedOrders;
    document.getElementById("totalPendingBookings").innerHTML = userDetails.pendingBookings;
    document.getElementById("totalPendingOrders").innerHTML = userDetails.pendingOrders;
    document.getElementById("totalSpent").innerHTML = userDetails.totalSpent;
  } catch (error) {
    console.log(error);
  }
}

function calculateOrderTotalSpent(ordersSnapshot,status) {
  let totalSpent = 0;
  ordersSnapshot.forEach((doc) => {
    const orderData = doc.data();
    const amountPaid = parseFloat(orderData.amountPaid);
    if (!isNaN(amountPaid)) {
      if (orderData.orderStatus === status) {
        totalSpent += amountPaid;
      }
  
    }
  });
  return totalSpent;
}
function calculateBookingTotalSpent(bookingSnapshot,status) {
  let totalSpent = 0;
  bookingSnapshot.forEach((doc) => {
    const bookingData = doc.data();
    const amountPaid = parseFloat(bookingData.serviceAmount);
    if (!isNaN(amountPaid)) {
      if (bookingData.status === status) {
        totalSpent += amountPaid;
      }
  
    }
  });
  return totalSpent;
}


function countBookingsByStatus(bookingsSnapshot, status) {
  let count = 0;
  bookingsSnapshot.forEach((doc) => {
    const bookingData = doc.data();
    if (bookingData.status === status) {
      count++;
    }
  });
  return count;
}
function countOrdersByStatus(orderSnapshot, status) {
  let count = 0;
  orderSnapshot.forEach((doc) => {
    const orderData = doc.data();
    if (orderData.orderStatus === status) {
      count++;
    }
  });
  return count;
}

function updateProgressBars(totalOrder, totalBookings, totalCompletedOrder, totalCompletedBookings, totalPendingOrders, totalPendingBookings) {
  const orderProgress = document.getElementById('orderProgress');
  const bookingProgress = document.getElementById('bookingProgress');
  const completedOrderProgress = document.getElementById('completedOrderProgress');
  const completedBookingProgress = document.getElementById('completedBookingProgress');
  const pendingOrderProgress = document.getElementById('pendingOrderProgress');
  const pendingBookingProgress = document.getElementById('pendingBookingProgress');
  const totalSpending = totalOrder + totalBookings + totalCompletedOrder + totalCompletedBookings + totalPendingOrders + totalPendingBookings;
  const orderPercentage = (totalOrder / totalSpending) * 100;
  const bookingPercentage = (totalBookings / totalSpending) * 100;
  const completedOrderPercentage = (totalCompletedOrder / totalSpending) * 100;
  const completedBookingPercentage = (totalCompletedBookings / totalSpending) * 100;
  const pendingOrderPercentage = (totalPendingOrders / totalSpending) * 100;
  const pendingBookingPercentage = (totalPendingBookings / totalSpending) * 100;

  orderProgress.style.width = `${orderPercentage}%`;
  bookingProgress.style.width = `${bookingPercentage}%`;
  completedOrderProgress.style.width = `${completedOrderPercentage}%`;
  completedBookingProgress.style.width = `${completedBookingPercentage}%`;
  pendingOrderProgress.style.width = `${pendingOrderPercentage}%`;
  pendingBookingProgress.style.width = `${pendingBookingPercentage}%`;
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
              notificationLink.setAttribute('href', '../../bookings/');
            } else if (notification.type == "feedback") {
              notificationLink.setAttribute('href', '../../feedbacks/');
            } else {
              notificationLink.setAttribute('href', '../../orders/');
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


// Calculate the current month's start and end dates

const today = new Date();
const start = new Date(today.getFullYear(), today.getMonth(),0 );
const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);



window.onload = function(){getCustomer(start,end);
  getNotifications();}
