using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    public async Task SendMessage(ChatMessage message)
    {
        ChatMessage messageToSend = message with
        {
            SentAt = DateTime.Now
        };

        await Clients.All.SendAsync("ReceiveMessage", messageToSend);
    }
}
