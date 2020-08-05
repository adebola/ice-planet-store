const Receipt = require("../utils/receipt");

function runReceipt() {
  const receipt = new Receipt("5e8cab5eeccf6aef8cb44cbc");
  receipt.createReceipt();
}

module.exports = runReceipt;
