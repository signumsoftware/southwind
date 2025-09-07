using ModelContextProtocol.Server;
using Signum.Chatbot;
using Signum.Chatbot.Agents;
using Southwind.Orders;

namespace Southwind.ChatbotSkills;

public class OrdersSkill : ChatbotSkill
{
    public OrdersSkill()
    {
        ShortDescription = "Retrieve information about Orders";
        IsAllowed = () => true;
    }

    [McpServerTool, Description("Get the status of an order given the order id")]
    public static OrderState OrderStatus(int orderId)
    {
        var state = Database.Query<OrderEntity>().Where(a => a.Id == orderId).Select(a => a.State).Single();
        return state;
    }
}
