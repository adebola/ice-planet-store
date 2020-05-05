const fs = require("fs");
const PDFDocument = require("pdfkit");
const uniqueFilename = require("unique-filename");
const os = require("os");
const Order = require("../models/order");
const logger = require("../config/winston");
const mail = require("./sendmail");

module.exports = function Receipt(orderId) {
  this.orderId = orderId;
  this.doc = new PDFDocument({ size: "A4", margin: 50 });
  this.path = uniqueFilename(os.tmpdir()) + ".pdf";

  this.createReceipt = async function () {
    Order.findById(orderId)
      .populate('user')
      .then((order) => {
        logger.info("Saving Pdf file to : " + this.path);

        generateHeader(this.doc);
        generateCustomerInformation(this.doc, order);
        generateReceiptTable(this.doc, order);
        generateFooter(this.doc, this.path);
        this.doc.end();
        this.doc.pipe(fs.createWriteStream(this.path));

        mail.sendMailWithAttachment(
          order.user.email,
          process.env.EMAILADDRESS,
          "Please find attached with thanks your receipt for your recent order",
          "Your Order from IcePlanet - " + formatDate(Date.now()),
          this.path
        );
      })
      .catch((error) => {
        logger.error("Error Creating Receipt : " + error);
      });
  };
};

function generateHeader(doc) {
    doc
      .image("./public/images/logo.png", 50, 45, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text("Ice Planet Cold Store", 110, 57)
      .fontSize(10)
      .text("16 Agungi Ajiran Road, Lekki", 200, 65, { align: "right" })
      .text("08188111333 / 08075120001", 200, 80, { align: "right" })
      .text("info@iceplanet.store ", 200, 95, { align: "right" })
      .moveDown();
  }

   function generateFooter (doc, path) {
    doc
      .fontSize(10)
      .text(
        "Thank You shopping with us, please visit us again on www.iceplanet.store",
        50,
        780,
        { align: "center", width: 500 }
      );
  }

  function generateCustomerInformation (doc, order) {
    doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

    generateHr(doc, 185);

    const customerInformationTop = 200;

    doc
      .fontSize(10)
      .text("Order Number:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(order._id, 150, customerInformationTop)
      .font("Helvetica")
      .text("Order Date:", 50, customerInformationTop + 15)
      .text(formatDate(order.date), 150, customerInformationTop + 15)
      .text("Order Value:", 50, customerInformationTop + 30)
      .text(
        formatCurrency(order.cart.totalPrice),
        150,
        customerInformationTop + 30
      )

      .font("Helvetica-Bold")
      .text(order.user.fullName, 300, customerInformationTop)
      .font("Helvetica")
      .text( order.user.address ? order.user.address.trim() : 'No Address', 300, customerInformationTop + 15)

      .moveDown();

    generateHr(doc, 270);
  }

  function generateReceiptTable (doc, order) {
    let i = 0;
    const orderTableTop = 330;

    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      orderTableTop,
      "Item",
      "Description",
      "Unit Cost",
      "Quantity",
      "Line Total"
    );
    generateHr(doc, orderTableTop + 20);
    doc.font("Helvetica");

    const products = order.cart.items;
    const keys = Object.keys(products);

    for (const key of keys) {
      product = products[key];

      product.bundles.forEach((bundle) => {
        if (bundle.qty > 0) {
          const position = orderTableTop + (i + 1) * 30;

          generateTableRow(
            doc,
            position,
            product.name,
            bundle.unit,
            formatCurrency(bundle.price),
            bundle.qty,
            formatCurrency(bundle.subTotalPrice)
          );
          generateHr(doc, position + 20);
          i++;
        }
      });
    }

    if (order.cart.delivery && order.cart.delivery > 0) {
      const position = orderTableTop + (i + 1) * 30;

          generateTableRow(
            doc,
            position,
            '',
            '',
            'Delivery',
            '',
            formatCurrency(order.cart.delivery)
          );
          generateHr(doc, position + 20);
          i++;
    }

    const subtotalPosition = orderTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "Subtotal",
      "",
      formatCurrency(order.cart.totalPrice)
    );

    doc.font("Helvetica");
  }

  function generateTableRow (
    doc,
    y,
    item,
    description,
    unitCost,
    quantity,
    lineTotal
  ) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(description, 150, y)
      .text(unitCost, 280, y, { width: 90, align: "right" })
      .text(quantity, 370, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
  }

  function generateHr (doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  function formatCurrency (number) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(number);
  }

  function formatDate (date) {
    const options = { month: "long", day: "numeric", year: "numeric" };
    return new Intl.DateTimeFormat("en-NG", options).format(date);
  }
