const mongoose = require("mongoose");
const Product = require("./models/product");
const Bundle = require("./models/package");

var data = [
  {
    imagePath: "/images/fish4.jpg",
    name: "Titus",
    category: "fish",
    description: "Titus Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/fish5.jpg",
    name: "Croaker",
    category: "fish",
    description: "Croaker Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/fish4.jpg",
    name: "Kote",
    category: "fish",
    description: "Horse Mackerel Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/fish4.jpg",
    name: "Panla",
    category: "fish",
    description: "Panla Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/fish4.jpg",
    name: "Ake",
    category: "fish",
    description: "Ake Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/fish5.jpg",
    name: "Tilapia",
    category: "fish",
    description: "Tilapia Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/fish5.jpg",
    name: "Red Sniper",
    category: "fish",
    description: "Red Sniper Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/fish5.jpg",
    name: "Mullet",
    category: "fish",
    description: "Mullet Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/fish5.jpg",
    name: "Shawa",
    category: "fish",
    description: "Shawa Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/fish4.jpg",
    name: "Blue-White",
    category: "fish",
    description: "Blue-White Fish",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1369.jpg",
    name: "Orobo-Lap",
    category: "chicken",
    description: "Hard Chicken Lap",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1370.jpg",
    name: "Fryer-Lap",
    category: "chicken",
    description: "Soft Chicken Lap",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1371.jpg",
    name: "Normal Lap",
    category: "chicken",
    description: "Hard Chicken lap Normal Size",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1370.jpg",
    name: "Full Chicken",
    category: "chicken",
    description: "Full Chicken",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1368.jpg",
    name: "Chicken Wings",
    category: "chicken",
    description: "Chicken Wings",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1373.jpg",
    name: "Chicken - Cut4",
    category: "chicken",
    description: "Soft Chicken",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1374.jpg",
    name: "Chicken Chest",
    category: "chicken",
    description: "Soft Chicken Chest",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1375.jpg",
    name: "Chicken Fillet",
    category: "chicken",
    description: "Soft Chicken Fillet",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/image/IMG_1376",
    name: "Chicken - Gizzard",
    category: "chicken",
    description: "Chicken Gizzard",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1377.jpg",
    name: "Turkey - Lap",
    category: "turkey",
    description: "Turkey Lap",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1368.jpg",
    name: "Turkey - Wings",
    category: "turkey",
    description: "Turkey Wings",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  },
  {
    imagePath: "/images/IMG_1374.jpg",
    name: "sausage",
    category: "sausage",
    description: "Sausage",
    bundles: [
      {
        unit: "Kg",
        price: 2500
      },
      {
        unit: "Carton",
        price: 20000
      }
    ]
  }
];

function seedDB() {
  // Remove All Products and Bundles
  Product.remove({}, err => {
    if (err) {
      return console.log("Error Removing Products : " + err);
    }

    console.log("Existing Products Removed Successfully");

    data.forEach((product) => {
      Product.create(product, (err, createdProduct) => {
        if (err) {
          console.log("Error Creating Product in Database : " + err);
        } else {
          console.log("Product: " + createdProduct.name + " created successfully");
        }
      });
    });
  });
  

  data.forEach((product) => {

  })
}

module.exports = seedDB;
