using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Signum.Entities;

namespace Southwind.Entities
{
    [Serializable]
    public class ItemDN : Entity
    {
        [NotNullable, SqlDbType(Size = 100), UniqueIndex]
        string name;
        [StringLengthValidator(AllowNulls = false, Min = 3, Max = 100)]
        public string Name
        {
            get { return name; }
            set { SetToStr(ref name, value); }
        }

        ItemExtensionDN extension;
        [NotNullValidator]
        public ItemExtensionDN Extension
        {
            get { return extension; }
            set { Set(ref extension, value); }
        }

        protected override void PostRetrieving()
        {
            Extension.Item = this; 

            base.PostRetrieving();
        }

        public override string ToString()
        {
            return name;
        }
    }

    [Serializable]
    public abstract class ItemExtensionDN : Entity
    {
        [Ignore]
        ItemDN item;
        public ItemDN Item
        {
            get { return item; }
            internal set { item = value; }
        }
    }

    [Serializable] // An specific kind of Item
    public class ContainerDN : ItemExtensionDN
    {
        int width;
        public int Width
        {
            get { return width; }
            set { Set(ref width, value); }
        }

        int height;
        public int Height
        {
            get { return height; }
            set { Set(ref height, value); }
        }
    }



    [Serializable] // External entity using Items in an abstract way
    public class ItemReportDN : Entity
    {
        ItemDN item;
        public ItemDN Item
        {
            get { return item; }
            set { Set(ref item, value); }
        }

        string notes;
        public string Notes
        {
            get { return notes; }
            set { Set(ref notes, value); }
        }
    }

    //public static class Logic
    //{
    //    public static void NewContainer()
    //    {
    //        new ItemDN
    //        {
    //            Name = "Container 1234",
    //            Extension = new ContainerDN
    //            {
    //                Width = 10,
    //                Height = 5
    //            }
    //        }.Save();
    //    }
    //}
}
