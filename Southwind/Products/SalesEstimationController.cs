using Microsoft.AspNetCore.Mvc;
using Signum.MachineLearning;
using Southwind.Orders;
using Southwind.Products;

namespace Southwind.Products;

public class SalesEstimationController : ControllerBase
{
    [Route("api/salesEstimation"), HttpPost]
    public decimal? SalesEstimation([FromBody] Lite<ProductEntity> product)
    {
        var ctx = PredictorPredictLogic.GetCurrentPredictor(ProductPredictorPublication.MonthlySales).GetPredictContext();
        var pred = ctx.Predictor;

        var input = new PredictDictionary(pred)
        {
            MainQueryValues =
            {
                { pred.MainQuery.FindColumn(nameof(DateTime.Year)), DateTime.Now.Year },
                { pred.MainQuery.FindColumn(nameof(DateTime.Month)), DateTime.Now.Month },
                { pred.MainQuery.FindColumn(nameof(OrderDetailEmbedded.Product)), product },
            }
        };

        var output = input.PredictBasic();

        var obj = output.MainQueryValues.GetOrThrow(pred.MainQuery.FindColumn(nameof(OrderDetailEmbedded.Quantity)));

        return Convert.ToDecimal(obj);
    }
}
