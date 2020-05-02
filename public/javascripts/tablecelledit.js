class TableCellEdit {
  constructor(table) {
    this.tbody = table.querySelector("tbody");
  }

  init() {
    this.tds = this.tbody.querySelectorAll("td");
    this.tds.forEach((td) => {
      if (!td.classList.contains("noedit")) {
        td.setAttribute("contenteditable", true);

        td.addEventListener("click", (evt) => {
          if (!this.isInEditMode(td)) {
            this.startEdit(td);
          }
        });
      }
    });
  }

  startEdit(td) {
    const activeTd = this.findActiveTd();

    if (activeTd) {
      this.cancelEdit(activeTd);
    }

    td.className = "in-edit-mode";
    td.setAttribute("data-old-value", td.innerHTML);
    this.createButtonToolbar(td);
  }

  cancelEdit(td) {
    td.innerHTML = td.getAttribute("data-old-value");
    td.classList.remove("in-edit-mode");
  }

  finishEdit(td) {
    td.classList.remove("in-edit-mode");
    this.removeToolbar(td);
  }

  isInEditMode(td) {
    return td.classList.contains("in-edit-mode");
  }

  createButtonToolbar(td) {
    const toolbar = document.createElement("div");
    toolbar.setAttribute("contenteditable", false);

    toolbar.className = "button-toolbar";
    toolbar.innerHTML = `
    <div class="button-wrapper">
    <button class="btn-xs btn-danger btn-cancel">Cancel</button>
    <button class="btn-xs btn-primary btn-save">Save</button>
    </div>
    `;
    td.appendChild(toolbar);

    const btnSave = toolbar.querySelector(".btn-save");
    btnSave.setAttribute("data-value", td.getAttribute("data-value"));
    btnSave.setAttribute("data-type", td.getAttribute("data-type"));
    const btnCancel = toolbar.querySelector(".btn-cancel");

    btnSave.addEventListener("click", (evt) => {
      evt.stopPropagation();

      const type = evt.target.getAttribute("data-type");
      const id = evt.target.getAttribute("data-value");

      console.log(type);
      console.log(id);

      const parentTd = evt.target.parentElement.parentElement.parentElement;
      const result = parentTd.innerText.split("\n")[0];

      console.log(result);

      let url;

      if (type === "unit") {
        // Update Unit
        url = window.origin + "/products/productdetails/bundle/updateunit";
      } else {
        // Update Price
        url = window.origin + "/products/productdetails/bundle/updateprice";
      }

      console.log(url);

      const json = JSON.stringify({
        _id: $("#_id").val(),
        bundleId: id,
        value: result,
      });

      $.ajax({
        type: "POST",
        url: url,
        data: json,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "X-CSRF-Token": $("#_csrf").val(),
        },
        success: function (data) {
          console.log(data);
        },
        failure: function (errMsg) {
          console.log(errMsg);
          showMessage(errMsg, "error");
        },
      });

      this.finishEdit(td);
    });

    btnCancel.addEventListener("click", (evt) => {
      evt.stopPropagation();
      this.cancelEdit(td);
    });
  }

  removeToolbar(td) {
    const toolbar = td.querySelector(".button-toolbar");
    toolbar.remove();
  }

  findActiveTd() {
    let foundTd = null;

    Array.prototype.forEach.call(this.tds, (td) => {
      if (this.isInEditMode(td)) {
        foundTd = td;
      }
    });

    return foundTd;
  }

  addRow() {
    this.newRow = this.tbody.insertRow(this.tbody.rows.length);
    this.unitCell = this.newRow.insertCell(0);
    const unitText = document.createTextNode("Unit");
    this.unitCell.appendChild(unitText);
    this.unitCell.setAttribute("contenteditable", true);

    this.priceCell = this.newRow.insertCell(1);
    const priceText = document.createTextNode("0");
    this.priceCell.appendChild(priceText);
    this.priceCell.setAttribute("contenteditable", true);

    this.actionCell = this.newRow.insertCell(2);
    this.actionCell.className = 'noedit';
    this.actionCell.innerHTML = `
    <button class="btn-xs btn-success" onclick="saveRow()"><i class="fas fa-check"></i></button>
    <button class="btn-xs btn-danger" onclick="deleteRow()"><i class="fas fa-times"></i></button>
    `;
  }
}

const edit = new TableCellEdit(document.querySelector("table"));
edit.init();

function onAddNewBundle() {
  edit.addRow();
}

function deleteRow() {
  edit.tbody.deleteRow(edit.tbody.rows.length - 1);
}

function saveRow() {
  const unit = edit.unitCell.innerHTML;
  let price = edit.priceCell.innerHTML;

  price = parseFloat(price);

  if (!Number.isNaN(price)) {
    // Save Bundle to Database
    const url = window.origin + "/products/productdetails/bundle";
    const json = JSON.stringify({
      _id: $("#_id").val(),
      bundle: {
        unit: unit,
        price: price,
      },
    });

    $.ajax({
      type: "POST",
      url: url,
      data: json,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      headers: {
        "X-CSRF-Token": $("#_csrf").val(),
      },
      success: function (data) {
        const newBundleId = data.bundleId;
        edit.actionCell.innerHTML = `
                <button class="btn-xs btn-danger" data-value="true" onclick="toggleBundle('${newBundleId}', this)">
                  <i class="fas fa-times"></i> Suspend
                </button>
       `;

       edit.init();

        console.log(data);
      },
      failure: function (errMsg) {
        showMessage(errMsg, "error");
      },
    });
  } else {
    showMessage("Please enter a number greater than 0 for the Price", "error");
  }
}

function toggleBundle(bundleId, button) {
  let url;

  const status = button.getAttribute("data-value");

  if (status == "true") {
    url = window.origin + "/products/productdetails/bundle/suspend";
  } else {
    url = window.origin + "/products/productdetails/bundle/restore";
  }

  const json = JSON.stringify({
    productId: $("#_id").val(),
    bundleId: bundleId,
  });

  $.ajax({
    type: "POST",
    url: url,
    data: json,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    headers: {
      "X-CSRF-Token": $("#_csrf").val(),
    },
    success: function (data) {
      if (status == "true") {
        button.className = "btn-xs btn-success";
        button.innerHTML = `<i class="fas fa-check"></i> Restore`;
        button.setAttribute("data-value", "false");
      } else {
        button.className = "btn-xs btn-danger";
        button.innerHTML = `<i class="fas fa-times"></i> Suspend`;
        button.setAttribute("data-value", "true");
      }
      console.log(data);
    },
    failure: function (errMsg) {
      showMessage(errMsg, "error");
    },
  });
}
