function Validate() {
  var password = document.getElementById("txtPassword").value;
  var confirmPassword = document.getElementById("txtConfirmPassword").value;

  if (password != confirmPassword) {
    showError("Passwords do not Match!!!");

    return false;
  }
  return true;
}

function showError(message) {
  var errordiv = document.getElementById("error-caption");
  var alertElement = document.createElement("div");
  alertElement.classList.add("alert");
  alertElement.classList.add("alert-danger");
  alertElement.innerText = message;
  errordiv.appendChild(alertElement);
}

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
  return x;
}

function changePrice(selectObject) {
  var option = selectObject.options[selectObject.selectedIndex];

  var data = {
    productId: option.dataset.product,
    bundleId: option.dataset.bundle
  };

  var json = JSON.stringify(data);

  var xhttpReq = new XMLHttpRequest();
  var url = window.origin + "/products/bundle";
  xhttpReq.open("POST", url, true);
  xhttpReq.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhttpReq.setRequestHeader(
    "X-CSRF-Token",
    document.getElementById("_csrf").value
  );
  xhttpReq.responseType = "json";

  xhttpReq.onload = () => {
    var data = xhttpReq.response;

    if (xhttpReq.readyState === 4 && xhttpReq.status === 201) {
      document.getElementById(
        option.dataset.product
      ).innerText = numberWithCommas(data.price);
    } else {
      showError("Error Loading Product Price From Database Status: " + xhttpReq.status);
    }
  };

  xhttpReq.onerror = () => {

    var message = "Error Loading Product http POST Error"
    showError(message);
    console.log(message);
  };

  // xhttpReq.onprogress = (event) => {
  //   console.log(`Received ${event.loaded} of ${event.total}`);
  // };

  xhttpReq.send(json);
}

function clickplus(tBox, productId, bundleId) {
  var value = parseInt(tBox.value);

  if (value < 1) {
    return showError(
      "Product Quantity cannot be less than 1, instead of 0 quantity delete product from cart"
    );
  }

  var data = {
    productId: productId,
    bundleId: bundleId,
    value: value
  };

  var json = JSON.stringify(data);

  var xhttpReq = new XMLHttpRequest();
  var url = window.origin + "/products/addremove";
  xhttpReq.open("POST", url, true);
  xhttpReq.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhttpReq.setRequestHeader(
    "X-CSRF-Token",
    document.getElementById("_csrf").value
  );
  xhttpReq.responseType = "json";

  xhttpReq.onload = () => {
    var data = xhttpReq.response;

    if (!(xhttpReq.readyState === 4 && xhttpReq.status === 201)) {
      return showError("Error Ammending Shopping Cart");
    }

    window.location.href = "/products/shopping-cart";
  };

  xhttpReq.onerror = () => {
    showError("Network Error");
    console.log("Network Error");
  };

  xhttpReq.send(json);
}

function payWithPaystack() {
  var xhttpReq = new XMLHttpRequest();
  var url = window.origin + "/orders/start-transaction";
  xhttpReq.open("POST", url, true);
  xhttpReq.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhttpReq.setRequestHeader(
    "X-CSRF-Token",
    document.getElementById("_csrf").value
  );

  xhttpReq.responseType = "json";

  var json = JSON.stringify({});

  xhttpReq.onload = () => {
    var indata = xhttpReq.response;

    if (xhttpReq.readyState === 4 && xhttpReq.status === 201) {
      var handler = PaystackPop.setup({
        key: "pk_test_94dbaebf2467e2b41e3552f23a093e7e55cbe57e",
        email: indata.email,
        amount: indata.amount * 100,
        currency: "NGN",
        ref: generateId(16),
        callback: function(response) {
          var xhttpReq2 = new XMLHttpRequest();
          var url2 = window.origin + "/orders/save-transaction";
          xhttpReq2.open("POST", url2, true);
          xhttpReq2.setRequestHeader(
            "Content-type",
            "application/json; charset=utf-8"
          );
          xhttpReq2.setRequestHeader(
            "X-CSRF-Token",
            document.getElementById("_csrf").value
          );

          xhttpReq2.responseType = "json";

          var json2 = JSON.stringify({
            payref: response.reference
          });

          xhttpReq2.onload = () => {
            if (xhttpReq2.readyState === 4 && xhttpReq2.status === 201) {
              window.location.href = "/products/shopping-cart";
            } else {
              showError(xhttpReq2.response);
            }
          };

          xhttpReq2.onerror = () => {
            var message = "Error Saving Paystack backend Payment details";

            showError(message);
            console.log(message);
          };

          xhttpReq2.send(json2);
        },
        onClose: function() {
          return console.log("window closed");
        }
      });
      handler.openIframe();
    } else {
      showError(indata);
    }
  };

  xhttpReq.onerror = () => {
    var message = "Error Getting Paystack backend Payment details";

    showError(message);
    console.log(message);
  };

  xhttpReq.send(json);
}

function dec2hex(dec) {
  return ("0" + dec.toString(16)).substr(-2);
}

// generateId :: Integer -> String
function generateId(len) {
  var arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join("");
}
