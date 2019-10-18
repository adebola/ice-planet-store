module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;

  this.add = function(item, productId, bundleId, qty) {

    var addPrice = 0;
    var addQty = 0;
    var storedItem = this.items[productId];
    qty = parseInt(qty);

    console.log("Total Quantity: " + this.totalQty);

    if (!storedItem) {
      
      console.log("StoredItem Not Found Creating It");

      storedItem = this.items[productId] = item;

      storedItem.bundles.forEach((bundle) => {
        
        if (bundle._id == bundleId) {
          addPrice = qty * bundle.price;
          bundle.qty = qty;
          bundle.subTotalPrice = addPrice;
          addQty = 1;
        } else {
          bundle.qty = 0;
          bundle.subTotalPrice = 0;
        }
      });
    } else {
      console.log("StoredItem Found");

      storedItem.bundles.forEach((bundle) => {
          
          console.log(bundle._id);
          console.log(bundleId);

        if (bundle._id == bundleId) {

          if (bundle.qty === 0) {
            addQty = 1;
          }

          bundle.qty += qty;
          addPrice = qty * bundle.price;
          bundle.subTotalPrice += addPrice;
          console.log("Inside Bundle.Equals Item Found")
        }
      });
    }

    this.totalQty += addQty;
    this.totalPrice += addPrice;
  };

  this.addByOne = function(id) {
    this.items[id].qty++;
    this.items[id].price += this.items[id].item.price;
    this.totalQty++;
    this.totalPrice += this.items[id].item.price;
  };

  this.reduceByOne = function(id) {
    this.items[id].qty--;
    this.items[id].price -= this.items[id].item.price;
    this.totalQty--;
    this.totalPrice -= this.items[id].item.price;

    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  };

  this.removeItem = function(id) {
    this.totalQty -= this.items[id].qty;
    this.totalPrice -= this.items[id].price;

    delete this.items[id];
  };

  this.generateArray = function() {
    var arr = [];

    for (var id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
};
