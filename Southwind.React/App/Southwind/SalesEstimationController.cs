using Signum.Engine;
using Signum.Engine.MachineLearning;
using Signum.Entities;
using Signum.Entities.MachineLearning;
using Signum.Entities.Reflection;
using Signum.React.Filters;
using Signum.Utilities;
using Southwind.Entities;
using Southwind.Logic;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace Southwind.React.ApiControllers
{
    public class SalesEstimationController : ApiController
    {
        [Route("api/salesEstimation"), HttpPost]
        public decimal? SalesEstimation(Lite<ProductEntity> product)
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
}