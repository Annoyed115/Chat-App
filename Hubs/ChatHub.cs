using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    private readonly ChatMessageStore messageStore;

    public ChatHub(ChatMessageStore messageStore)
    {
        this.messageStore = messageStore;
    }

    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("LoadMessageHistory", messageStore.GetRecentMessages());
        await base.OnConnectedAsync();
    }

    public async Task SendMessage(ChatMessage message)
    {
        ChatMessage messageToSend = message with
        {
            SentAt = DateTime.Now
        };

        messageStore.Add(messageToSend);
        await Clients.All.SendAsync("ReceiveMessage", messageToSend);
    }
}
