using Signum.Chatbot;
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
            Tools = 
            {
                new ChatbotAgentTool<OrderStateRequest, OrderStateResponse>("orderStatus")
                {
                    Description = "Get the status of an order given the order id",
                    Execute = async (req, token) =>
                    {
                        var state = await Database.Query<OrderEntity>().Where(a => a.Id == req.OrderId).Select(a => a.State).SingleAsync(token);
                        return new OrderStateResponse { State = state };
                    },
                }
            }
        });
    }
}

class OrderStateRequest : IToolPayload
{
    public int OrderId { get; set; }
}

class OrderStateResponse : IToolPayload
{
    public OrderState State { get; set; }
}


[AutoInit]
public static class SouthwindAgent
{
    public static readonly ChatbotAgentCodeSymbol Orders;
}
