const connectionStatus = document.getElementById("connectionStatus");
const messageForm = document.getElementById("messageForm");
const messagesList = document.getElementById("messagesList");
const userInput = document.getElementById("userInput");
const messageInput = document.getElementById("messageInput");

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .withAutomaticReconnect()
    .build();

connection.on("ReceiveMessage", (user, message, sentAt) => {
    const item = document.createElement("article");
    item.className = "message";

    const author = document.createElement("strong");
    author.textContent = user;

    const body = document.createElement("p");
    body.textContent = message;

    const time = document.createElement("time");
    time.textContent = new Date(sentAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    item.append(author, body, time);
    messagesList.appendChild(item);
    messagesList.scrollTop = messagesList.scrollHeight;
});

connection.onreconnecting(() => {
    connectionStatus.textContent = "Reconnecting...";
    messageForm.querySelector("button").disabled = true;
});

connection.onreconnected(() => {
    connectionStatus.textContent = "Connected";
    messageForm.querySelector("button").disabled = false;
});

connection.onclose(() => {
    connectionStatus.textContent = "Disconnected";
    messageForm.querySelector("button").disabled = true;
});

messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = userInput.value.trim();
    const message = messageInput.value.trim();

    if (!user || !message) {
        return;
    }

    await connection.invoke("SendMessage", user, message);
    messageInput.value = "";
    messageInput.focus();
});

async function start() {
    try {
        await connection.start();
        connectionStatus.textContent = "Connected";
    } catch {
        connectionStatus.textContent = "Connection failed";
        setTimeout(start, 2000);
    }
}

start();
