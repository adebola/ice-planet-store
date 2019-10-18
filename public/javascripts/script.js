
function Validate() {
  var password = document.getElementById("txtPassword").value;
  var confirmPassword = document.getElementById("txtConfirmPassword").value;

  if (password != confirmPassword) {
      showError('Passwords do not Match!!!')
    
      return false;
  }
  return true;
}

function showError(message) {
  var errordiv = document.getElementById("error-caption");
  var alertElement = document.createElement("div");
  alertElement.classList.add("alert");
  alertElement.classList.add("alert-danger");
  alertElement.innerText = message
  errordiv.appendChild(alertElement);
}

function numberWithCommas(x) {
  x = x.toString();
  var pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(x))
      x = x.replace(pattern, "$1,$2");
  return x;
}

function changePrice(selectObject) {

  var option = selectObject.options[selectObject.selectedIndex];

  var data = {
    productId: option.dataset.product,
    bundleId: option.dataset.bundle
  }

  var json = JSON.stringify(data);
  
  var xhttpReq = new XMLHttpRequest();
  var url = window.origin + '/products/bundle';
  xhttpReq.open('POST', url, true);
  xhttpReq.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhttpReq.setRequestHeader('X-CSRF-Token', document.getElementById("_csrf").value);
  xhttpReq.responseType = 'json';

  xhttpReq.onload = () => {
    var data = xhttpReq.response;

    if (xhttpReq.readyState === 4 && xhttpReq.status === 201) {
      document.getElementById(option.dataset.product).innerText = numberWithCommas(data.price);
    } else {
      showError('Error Loading Product Price From Database');
      console.log(data);
    }
  };

  xhttpReq.onerror = () => {
    showError("Network Error");
    console.log("Network Error");
  };

  // xhttpReq.onprogress = (event) => {
  //   console.log(`Received ${event.loaded} of ${event.total}`);
  // };

  xhttpReq.send(json);
}

function clickplus(tBox, productId, bundleId) {
  var value = parseInt(tBox.value);

  if (value < 1 ) {
    return showError("Product Quantity cannot be less than 1, instead of 0 quantity delete product from cart");
  }

  var data = {
    productId: productId,
    bundleId: bundleId,
    value: value,
  }

  var json = JSON.stringify(data);
  
  var xhttpReq = new XMLHttpRequest();
  var url = window.origin + '/products/addremove';
  xhttpReq.open('POST', url, true);
  xhttpReq.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhttpReq.setRequestHeader('X-CSRF-Token', document.getElementById("_csrf").value);
  xhttpReq.responseType = 'json';

  xhttpReq.onload = () => {
    var data = xhttpReq.response;

    if (!(xhttpReq.readyState === 4 && xhttpReq.status === 201)) {
      return showError('Error Ammending Shopping Cart');
    }

    window.location.href="/products/shopping-cart";
  };

  xhttpReq.onerror = () => {
    showError("Network Error");
    console.log("Network Error");
  };

  xhttpReq.send(json);
}