function Validate() {
  var password = document.getElementById("txtPassword").value;
  var confirmPassword = document.getElementById("txtConfirmPassword").value;

  if (password != confirmPassword) {
    showMessage("Passwords do not Match!!!", "error");
    console.log("False");
    return false;
  }

  return true;
}

function showMessage(message, status) {
  var errordiv = document.getElementById("error-caption");

  // Clear Earlier Messages
  while (errordiv.firstChild) {
    errordiv.firstChild.remove();
  }

  var alertElement = document.createElement("div");
  alertElement.classList.add("alert");

  if (status === "error") {
    alertElement.classList.add("alert-danger");
  } else {
    alertElement.classList.add("alert-success");
  }
  alertElement.innerHTML = message;
  errordiv.appendChild(alertElement);
}

// function showPickupPolicy() {
//   var policydiv = document.getElementById("pickup");
//   var policyElement = document.createElement("div");
//   policyElement.classList.add("alert");
//   policyElement.classList.add("alert-info");

// }

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x)) x = x.replace(pattern, "$1,$2");
  return x;
}

function handleOptions(option) {
  $(".cart-info").css("display", "none");
  //$("#delivery-item").css("display", "none");

  console.log($("#delivery-item"));

  if (option.id === "option-1") {
    $("#pickup").css("display", "block");
  } else if (option.id === "option-2") {
    $("#deliver").css("display", "block");
    //$("#delivery-item").css("display", "block");
  } else if (option.id === "option-3") {
    $("#credit").css("display", "block");
  } else if (option.id === "option-4") {
    $("#org").css("display", "block");
  }
}

function changePrice(selectObject) {
  var option = selectObject.options[selectObject.selectedIndex];

  var data = {
    productId: option.dataset.product,
    bundleId: option.dataset.bundle,
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
      showMessage(
        "Error Loading Product Price From Database Status: " + xhttpReq.status,
        "error"
      );
    }
  };

  xhttpReq.onerror = () => {
    var message = "Error Loading Product http POST Error";
    showMessage(message, "error");
  };

  // xhttpReq.onprogress = (event) => {
  //   console.log(`Received ${event.loaded} of ${event.total}`);
  // };

  xhttpReq.send(json);
}

function clickplus(tBox, productId, bundleId) {
  var value = parseInt(tBox.value);

  if (isNaN(value) || value < 1) {
    return showMessage(
      "Product Quantity cannot be less than 1, instead of 0 quantity delete product from cart",
      "error"
    );
  }

  var data = {
    productId: productId,
    bundleId: bundleId,
    value: value,
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
      return showMessage("Error Amending Shopping Cart", "error");
    }

    window.location.href = "/products/shopping-cart";
  };

  xhttpReq.onerror = () => {
    showMessage("Network Error Handling clickplus Event", "error");
  };

  xhttpReq.send(json);
}

function processPayment() {
  // Get the Value of the Option selected
  var value = $("input[name='options']:checked").val();

  if (value === "pickup") {
    payWithPaystack();
  } else if (value === "deliver") {
    // Ensure (a) user is logged in (b) minimum value is

    var url = window.origin + "/orders/check-delivery";

    $.ajax({
      type: "POST",
      url: url,
      data: {},
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        "X-CSRF-Token": $("#_csrf").val(),
      },
      success: function (data) {
        if (data.message === "OK") {
          payWithPaystack();
        } else {
          showMessage(data.message, "error");
        }
      },
      failure: function (errMsg) {
        showMessage(errMsg, "error");
      },
    });

    // $.post(url, data => {
    //   console.log("Success1");
    //   console.log(data);
    // })
    //   .done(data => {
    //     console.log("Success2");
    //     console.log(data);
    //   })
    //   .fail(data => {
    //     console.log("failure");
    //     console.log(data);
    //   });
  } else if (value === "credit") {
    // Ensure (a) user is logged in (b) credit facilities approved
    showMessage(
      "Please Contact Ice-Planet on 08188111333 / 08075210001 or info@iceplanet.store, to setup credit facilities",
      "error"
    );
    // var url = window.origin + "/orders/check-credit";
  } else if (value === "org") {
    // Ensure (a) user is logged in (b) user is an org user (c) credit facilities approved
    //var url = window.origin + "/orders/check-org";

    showMessage(
      "Please contact Ice-Planet on 08188111333 / 08075210001 or info@iceplanet.store to setup organizational and/or credit facilities",
      "error"
    );
  }
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
        key: "pk_live_03b4aca139cfec3fc9b816440742819e32d87bc4",
        email: indata.email,
        amount: indata.amount * 100,
        currency: "NGN",
        ref: generateId(16),
        callback: function (response) {
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
            payref: response.reference,
          });

          xhttpReq2.onload = () => {
            if (xhttpReq2.readyState === 4 && xhttpReq2.status === 201) {
              window.location.href = "/products/shopping-cart";
            } else {
              showMessage(xhttpReq2.response, "error");
            }
          };

          xhttpReq2.onerror = () => {
            var message = "Error Saving Paystack backend Payment details";
            showMessage(message, "error");
          };

          xhttpReq2.send(json2);
        },
        onClose: function () {},
      });
      handler.openIframe();
    } else {
      showMessage(indata, "error");
    }
  };

  xhttpReq.onerror = () => {
    var message = "Error Getting Paystack backend Payment details";

    showMessage(message, "error");
  };

  xhttpReq.send(json);
}

function fulfillOrder(orderId, button) {
  // $('#displayModal').on('show.bs.modal', () => {
  //   const div = $('.modal-body');
  //   console.log(div);
  //   div.innerText = 'The Order has been fulfilled (picked up / delivered) successfully';
  // });
  // return $('#displayModal').modal('show');

  var url = window.origin + "/orders/fulfill";

  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify({ orderId: orderId }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    headers: {
      "X-CSRF-Token": $("#_csrf").val(),
    },
    success: function (data) {
      button.className = "btn btn-success";
      showMessage(data.message, "success");
    },
    failure: function (errMsg) {
      showMessage(errMsg, "error");
    },
  });
}

function verifyPayment(orderId, button) {
  var url = window.origin + "/orders/verifypayment";

  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify({ orderId: orderId }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    headers: {
      "X-CSRF-Token": $("#_csrf").val(),
    },
    success: function (data) {
      button.className = "btn btn-success";
      console.log(data);
      showMessage(data.message, "success");
    },
    failure: function (errMsg) {
      showMessage(errMsg, "error");
    },
  });
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
