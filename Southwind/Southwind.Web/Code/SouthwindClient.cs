using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;
using Signum.Web;
using Signum.Utilities;
using Southwind.Entities;
using System.Web.Mvc;
using System.Drawing;
using System.IO;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using Signum.Entities;

namespace Southwind.Web
{
    public static class SouthwindClient
    {
        public static string ViewPrefix = "~/Views/Southwind/{0}.cshtml";

        public static void Start()
        {
            if (Navigator.Manager.NotDefined(MethodInfo.GetCurrentMethod()))
            {
                Navigator.AddSettings(new List<EntitySettings>
                {
                    new EmbeddedEntitySettings<AddressDN>() { PartialViewName = e => ViewPrefix.Formato("Address") },

                    new EntitySettings<TerritoryDN>(EntityType.Admin) { PartialViewName = e => ViewPrefix.Formato("Territory") },
                    new EntitySettings<RegionDN>(EntityType.Admin) { PartialViewName = e => ViewPrefix.Formato("Region") },
                    new EntitySettings<EmployeeDN>(EntityType.Default) { PartialViewName = e => ViewPrefix.Formato("Employee") },

                    new EntitySettings<SupplierDN>(EntityType.Default) { PartialViewName = e => ViewPrefix.Formato("Supplier") },
                    new EntitySettings<ProductDN>(EntityType.Default) { PartialViewName = e => ViewPrefix.Formato("Product") },
                    new EntitySettings<CategoryDN>(EntityType.Admin) { PartialViewName = e => ViewPrefix.Formato("Category") },

                    new EntitySettings<PersonDN>(EntityType.Default) { PartialViewName = e => ViewPrefix.Formato("Person") },
                    new EntitySettings<CompanyDN>(EntityType.Default) { PartialViewName = e => ViewPrefix.Formato("Company") },
                   
                    new EntitySettings<OrderDN>(EntityType.Default) { PartialViewName = e => ViewPrefix.Formato("Order"), ShowSave = false },
                    new EmbeddedEntitySettings<OrderDetailsDN> { PartialViewName = e => ViewPrefix.Formato("OrderDetails") },
                    new EntitySettings<ShipperDN>(EntityType.Admin) { PartialViewName = e => ViewPrefix.Formato("Shipper") },
                });

                QuerySettings.RegisterPropertyFormat((EmployeeDN e) => e.Photo, (html, obj) =>
                    obj == null ? null :
                    new MvcHtmlString("<img src=\"data:image/jpg;base64," + Base64Thumbnail((byte[])obj) + "\" />"));

                QuerySettings.RegisterPropertyFormat((CategoryDN e) => e.Picture, (html, obj) =>
                    obj == null ? null :
                    new MvcHtmlString("<img src=\"data:image/jpg;base64," + Base64Thumbnail((byte[])obj) + "\" />"));

                Constructor.ConstructorManager.Constructors.Add(typeof(EmployeeDN), () => new EmployeeDN { Address = new AddressDN() });
                Constructor.ConstructorManager.Constructors.Add(typeof(OrderDN), () => new OrderDN { 
                    ShipAddress = new AddressDN(),
                    Details = new MList<OrderDetailsDN>()
                
                });
                Constructor.ConstructorManager.Constructors.Add(typeof(PersonDN), () => new PersonDN { Address = new AddressDN() });
                Constructor.ConstructorManager.Constructors.Add(typeof(CompanyDN), () => new CompanyDN { Address = new AddressDN() });
                Constructor.ConstructorManager.Constructors.Add(typeof(SupplierDN), () => new SupplierDN { Address = new AddressDN() });
            }
                    
        }

        public static string Base64Thumbnail(byte[] image)
        {
            using(MemoryStream ms = new MemoryStream(image))
            using(Bitmap bmp = new Bitmap(ms))
            using(Bitmap target =  Resize(bmp, new Size(48,48)))
            {
                return Convert.ToBase64String(target.SaveJPG100()); 
            }
        }

        public static Bitmap Resize(Bitmap bmpOriginal, Size limit)
        {
            if (bmpOriginal.Size == limit)
            {
                return bmpOriginal;
            }

            Size size = Resize(bmpOriginal.Size, limit);

            Bitmap bmpResized = new Bitmap(size.Width, size.Height);
            using (Graphics g = Graphics.FromImage(bmpResized))
            {
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;

                g.DrawImage(bmpOriginal,
                    new Rectangle(Point.Empty, bmpResized.Size),
                    new Rectangle(Point.Empty, bmpOriginal.Size),
                    GraphicsUnit.Pixel);

                return bmpResized;
            }
        }


        internal static Size Resize(Size original, Size limit)
        {
            if (original.Height < limit.Height && original.Width < limit.Width)
                return original;

            Size r = new Size(limit.Width, original.Height * limit.Width / original.Width);
            if (r.Height <= limit.Height) // Height resize if necessary
                return r;
            return new Size(limit.Height * original.Width / original.Height, limit.Height);
        }

        public static byte[] SaveJPG100(this Bitmap bmp)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                EncoderParameters encoderParameters = new EncoderParameters(1);
                encoderParameters.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 100L);
                bmp.Save(ms, ImageCodecInfo.GetImageDecoders().First(a=>a.FormatID == ImageFormat.Jpeg.Guid), encoderParameters);
                return ms.ToArray();
            }
        }
    }
}