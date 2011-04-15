using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Data;
using Signum.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.IO;

namespace Southwind.Windows
{
    public static class SouthwindConverters
    {
        public static IValueConverter ImageConverter = ConverterFactory.New((byte[] array) =>
        {
            BitmapImage image = new BitmapImage();
            image.BeginInit();
            image.StreamSource = new MemoryStream(array);
            image.EndInit();

            return image;
        }); 
    }
}
