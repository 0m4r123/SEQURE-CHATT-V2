/* (function ()  för att ändra scoope, blev error utan */

/* Använder XMLHttpRequest för att hämta alla privata meddelanden */
// Fetcha privata meddelanden
(function () {
  const NotPublicChat = document.getElementById("privateMessages-ul");

  // Fetcha privata meddelanden
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/fetch-private-messages");
  xhr.onload = () => {
    if (xhr.status === 200) {
      const messages = JSON.parse(xhr.responseText);
      messages.forEach((message) => {
        const messageHtml = `<li style=" margin-top: 20px; padding-left: 10px; padding-top: 10px;  width: 90%;color: #222222;"> ${message.username}: ${message.message} </br> ${message.date} </li>`;
        NotPublicChat.insertAdjacentHTML("beforeend", messageHtml);
      });
    } else {
      console.log("Error:", xhr.status, xhr.statusText);
    }
  };
  xhr.onerror = () => {
    console.log("Network error");
  };
  xhr.send();
})();
