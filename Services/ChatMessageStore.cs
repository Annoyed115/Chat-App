public class ChatMessageStore
{
    private const int MaxMessages = 50;
    private readonly List<ChatMessage> messages = [];
    private readonly object syncRoot = new();

    public void Add(ChatMessage message)
    {
        lock (syncRoot)
        {
            messages.Add(message);

            if (messages.Count > MaxMessages)
            {
                messages.RemoveAt(0);
            }
        }
    }

    public List<ChatMessage> GetRecentMessages()
    {
        lock (syncRoot)
        {
            return messages.ToList();
        }
    }
}
