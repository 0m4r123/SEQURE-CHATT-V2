const publicChat = document.getElementById("messages-ul");

/* Använder XMLHttpRequest för att hämta alla privata meddelanden */
// Fetcha offentliga meddelanden
const xhr = new XMLHttpRequest();
xhr.open("GET", "/fetch-public-messages");
xhr.onload = () => {
  if (xhr.status === 200) {
    const messages = JSON.parse(xhr.responseText);
    messages.forEach((message) => {
      const messageHtml = `<li style=" margin-top: 20px; padding-left: 10px; padding-top: 10px;  width: 90%;color: #222222;"> ${message.username}: ${message.message} </br> ${message.date} </li>`;
      publicChat.insertAdjacentHTML("beforeend", messageHtml);
    });
  } else {
    console.log("Error:", xhr.status, xhr.statusText);
  }
};
xhr.onerror = () => {
  console.log("Network error");
};
xhr.send();
