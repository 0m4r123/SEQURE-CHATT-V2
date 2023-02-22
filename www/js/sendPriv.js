// Hämta meddelandeformuläret och meddelandelistan från DOM
const privateMessageForm = document.getElementById("private-send-container");
const privateMessageList = document.getElementById("privateMessages-ul");
// Lägg till en event i meddelandeformuläret
privateMessageForm.addEventListener("submit", (event) => {
  // Förhindra att formuläret skickas in normalt, genom att refresha
  event.preventDefault();

  // Hämta meddelandet från inmatningsfältet
  const messageInput = document.getElementById("private-message-input");
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

  // Gör en AJAX-begäran till servern att skicka meddelandet
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/private-message");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => {
    if (xhr.status === 200) {
      // ta svaret JSON och uppdatera meddelandelistan på sidan
      const response = JSON.parse(xhr.responseText);
      const messageHtml = `<li style=" margin-top: 20px; padding-left: 10px; padding-top: 10px;  width: 90%;color: #222222;"> ${response.username}: ${response.message} </br> ${response.date}  </li>`;
      privateMessageList.insertAdjacentHTML("beforeend", messageHtml);

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
