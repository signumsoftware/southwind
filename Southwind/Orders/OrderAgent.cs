using Signum.Chatbot.Agents;

namespace Southwind.Orders;


internal static class OrderAgent
{
    public static void Register()
    {
        ChatbotAgentLogic.RegisterAgent(SouthwindAgent.Orders, new ChatbotAgentCode
        {
            IsListed = () => true,
            CreateDefaultEntity = () => new ChatbotAgentEntity
            {
                ShortDescription = "Gets the status of an order given the order id",
                Descriptions = new MList<ChatbotAgentDescriptionsEmbedded>
                {
                    new ChatbotAgentDescriptionsEmbedded
                    {
                        Content = """
                         I can help getting the status on an order given the order id by calling the command $GetOrderStatus(orderId). 
                         """,
                        PromptName = "Default",
                    },
                },
            },
            Resources =  
            {
                { "$GetOrderStatus", async (args, token) =>
                    {
                        var id = args.GetArgument<int>(0);

                        return (await Database.Query<OrderEntity>().Where(a=>a.Id == id).Select(a=>a.State).SingleAsync(token)).ToString();
                    }
                }
            }
        });
    }
}


[AutoInit]
public static class SouthwindAgent
{
    public static readonly ChatbotAgentCodeSymbol Orders;
}
