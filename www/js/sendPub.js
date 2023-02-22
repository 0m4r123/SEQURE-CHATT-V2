// Hämta meddelandeformuläret och meddelandelistan från DOM
const messageForm = document.getElementById("send-container");
const messageList = document.getElementById("messages-ul");
// Lägg till en event i meddelandeformuläret
messageForm.addEventListener("submit", (event) => {
  // Förhindra att formuläret skickas in normalt,
  event.preventDefault();

  // Hämta meddelandet från inmatningsfältet
  const messageInput = document.getElementById("message-input");
  const messageText = messageInput.value;

  // Hämta aktuellt datum och tid
  let today = new Date();
  let date = today.toDateString();
  let time = today.toLocaleTimeString();

  // Skapa meddelandeobjektet med meddelandetexten och information om datum/tid
  const message = {
    message: messageText,
    date: date,
    time: time,
  };

  // Make an AJAX request to the server to post the message
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/message");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => {
    if (xhr.status === 200) {
      // Gör en AJAX-begäran till servern att skicka meddelandet
      const response = JSON.parse(xhr.responseText);
      const messageHtml = `<li style=" margin-top: 20px; padding-left: 10px; padding-top: 10px;  width: 90%;color: #222222;"> ${response.username}: ${response.message} </br> ${response.date}  </li>`;
      messageList.insertAdjacentHTML("beforeend", messageHtml);

      // Rensa inmatningsfältet
      messageInput.value = "";
    } else {
      console.log("Error:", xhr.status, xhr.statusText);
    }
  };
  xhr.onerror = () => {
    console.log("Network error");
  };
  xhr.send(JSON.stringify(message));
});
