const connectionStatus = document.getElementById("connectionStatus");
const messageForm = document.getElementById("messageForm");
const messagesList = document.getElementById("messagesList");
const userInput = document.getElementById("userInput");
const messageInput = document.getElementById("messageInput");
const savedUserName = localStorage.getItem("chatUserName");

if (savedUserName) {
    userInput.value = savedUserName;
    messageInput.focus();
}

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .withAutomaticReconnect()
    .build();

connection.on("LoadMessageHistory", (messages) => {
    messagesList.innerHTML = "";

    for (const message of messages) {
        renderMessage(message);
    }
});

connection.on("ReceiveMessage", (message) => {
    renderMessage(message);
});

function renderMessage(message) {
    const item = document.createElement("article");
    const currentUser = userInput.value.trim();
    item.className = message.user === currentUser ? "message message-own" : "message";

    const author = document.createElement("strong");
    author.textContent = message.user;

    const body = document.createElement("p");
    body.textContent = message.text;

    const time = document.createElement("time");
    time.textContent = new Date(message.sentAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    item.append(author, body, time);
    messagesList.appendChild(item);
    messagesList.scrollTop = messagesList.scrollHeight;
}

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
    const text = messageInput.value.trim();

    if (!user || !text) {
        return;
    }

    localStorage.setItem("chatUserName", user);
    await connection.invoke("SendMessage", {
        user,
        text,
        sentAt: new Date().toISOString()
    });
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
