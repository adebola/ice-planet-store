const mongoose = require("mongoose");
const Product = require("./models/product");
const User = require("./models/user");

var data = [
  {
    imagePath: "/images/titus.jpg",
    name: "Titus",
    category: "fish",
    description:
      "Titus is an Oily fish has been linked to many health benefits, including a lower risk of heart disease, improved mental ability, and protection from cancer, alcohol-related dementia, and rheumatoid arthritis.",
    bundles: [
      {
        unit: "Kg",
        price: 1400,
      },
      {
        unit: "Carton - 20Kg",
        price: 23500,
      },
      {
        unit: "Carton - 23Kg",
        price: 25000,
      },
    ],
  },
  {
    imagePath: "/images/kote.jpg",
    name: "Kote",
    category: "fish",
    description:
      "Horse Mackerel Fish (Popularly known as Kote) rich in protein, fat, vitamins and mineral salts. It is a good source of protein, has vitamins B2, B3 and B12, rich in omega 3 fatty acids",
    bundles: [
      {
        unit: "Kg",
        price: 900,
      },
      {
        unit: "Carton - 20Kg",
        price: 16500,
      },
    ],
  },
  {
    imagePath: "/images/tilapia.jpg",
    name: "Tilapia",
    category: "fish",
    description:
      "It's an Excellent Source of Protein and Nutrients In 3.5 ounces (100 grams), it packs 26 grams of protein and only 128 calories (3). Even more impressive is the amount of vitamins and minerals in this fish. Tilapia is rich in niacin, vitamin B12, phosphorus, selenium and potassium",
    bundles: [
      {
        unit: "Kg",
        price: 1300,
      },
      {
        unit: "Carton - 10Kg",
        price: 11000,
      },
    ],
  },
  {
    imagePath: "/images/hake.jpg",
    name: "Panla",
    category: "fish",
    description:
      "Hake locally known as Panla is a source of potassium and phosphorus and a fish of high selenium content. So hake has at least four unquestionable benefits for a healthy diet; It is low in fat, low in calories, a source of high-value protein and a significant content of vitamins and minerals",
    bundles: [
      {
        unit: "Kg",
        price: 1000,
      },
      {
        unit: "Carton - 10Kg",
        price: 9000,
      },
    ],
  },
  {
    imagePath: "/images/croaker.jpg",
    name: "Croaker",
    category: "fish",
    description:
      "Croaker Fish is considered a very good source of protein. In addition, it also supplies rich amounts of omega-3 fatty acids  and other healthful minerals as well. ",
    bundles: [
      {
        unit: "Kg",
        price: 1300,
      },
      {
        unit: "Carton - 20Kg",
        price: 22000,
      },
    ],
  },
  {
    imagePath: "/images/pangasius.jpg",
    name: "Pangasius",
    category: "fish",
    description:
      "Pangasius is a genus of medium-large to very large shark catfishes native to fresh water, rich in Omega-3, Zero Sodium it is a healthy choice for families and particularly for people who pay special attention to a healthy diet ",
    bundles: [
      {
        unit: "Kg",
        price: 2000,
      },
    ],
  },
  {
    imagePath: "/images/catfish.jpg",
    name: "Catfish",
    category: "fish",
    description:
      "Catfish is low in healthy fats, a great source of anti-inflammatory omega 3s, and a great source of protein. Catfish also packs a punch for essential nutrients our bodies need to function. ",
    bundles: [
      {
        unit: "Kg",
        price: 2000,
      },
    ],
  },
  {
    imagePath: "/images/chicken-laps.jpg",
    name: "Orobo-Lap (chicken)",
    category: "chicken",
    description:
      "Chicken Lap - Chicken is a lean meat with high nutritional value, and eating it regularly will help you stay healthy, Chicken is an excellent low-calorie and low-fat source of high-quality protein that important nutrients throughout our lives – from pregnancy through our later years.",
    bundles: [
      {
        unit: "Kg",
        price: 1500,
      },
      {
        unit: "Carton - 10Kg",
        price: 15000,
      },
    ],
  },
  {
    imagePath: "/images/turkey-wings.jpg",
    name: "Turkey Wings",
    category: "turkey",
    description:
      "Turkey Wings - Turkey is loaded with trytophan, a sleep-inducing amino acid, it is rich in potassium and loaded with zinc, lean turkey breasts fulfill more than half of most people's daily protein needs, Niacin may help increase your HDL cholesterol, the good kind, while also helping to reduce your LDL cholesterol, the bad kind.",
    bundles: [
      {
        unit: "Kg",
        price: 1800,
      },
      {
        unit: "Carton - 10Kg",
        price: 18000,
      },
    ],
  },
  {
    imagePath: "/images/turkey-gizzard.png",
    name: "Turkey Gizzard",
    category: "turkey",
    description:
      "Turkey Gizzard - - Turkey is loaded with trytophan, a sleep-inducing amino acid, it is rich in potassium and loaded with zinc, lean turkey breasts fulfill more than half of most people's daily protein needs, Niacin may help increase your HDL cholesterol, the good kind, while also helping to reduce your LDL cholesterol, the bad kind.",
    bundles: [
      {
        unit: "Kg",
        price: 1800,
      },
      {
        unit: "Carton - 10Kg",
        price: 17000,
      },
    ],
  },
  {
    imagePath: "/images/drumsticks.jpg",
    name: "Fryer (Soft Chicken)",
    category: "chicken",
    description:
      "Fryer Soft Chicken - Chicken is a lean meat with high nutritional value, and eating it regularly will help you stay healthy, Chicken is an excellent low-calorie and low-fat source of high-quality protein that important nutrients throughout our lives – from pregnancy through our later years.",
    bundles: [
      {
        unit: "Kg",
        price: 1500,
      },
      {
        unit: "Carton - 10Kg",
        price: 14000,
      },
    ],
  },
  {
    imagePath: "/images/chickenlap.jpg",
    name: "Fryer Lap",
    category: "chicken",
    description:
      "Soft Chicken Lap - Chicken is a lean meat with high nutritional value, and eating it regularly will help you stay healthy, Chicken is an excellent low-calorie and low-fat source of high-quality protein that important nutrients throughout our lives – from pregnancy through our later years.",
    bundles: [
      {
        unit: "Kg",
        price: 1500,
      },
      {
        unit: "Carton - 10Kg",
        price: 14500,
      },
    ],
  },
  {
    imagePath: "/images/chicken-cut4.jpg",
    name: "Fryer Cut4",
    category: "chicken",
    description:
      "Fryer Cut4 Soft Chicken - Chicken is a lean meat with high nutritional value, and eating it regularly will help you stay healthy, Chicken is an excellent low-calorie and low-fat source of high-quality protein that important nutrients throughout our lives – from pregnancy through our later years.",
    bundles: [
      {
        unit: "Kg",
        price: 1500,
      },
      {
        unit: "Carton - 10Kg",
        price: 14000,
      },
    ],
  },
  {
    imagePath: "/images/chicken-wings2.jpg",
    name: "Fryer - Wings",
    category: "chicken",
    description:
      "Soft Fryer Wings - Chicken is a lean meat with high nutritional value, and eating it regularly will help you stay healthy, Chicken is an excellent low-calorie and low-fat source of high-quality protein that important nutrients throughout our lives – from pregnancy through our later years.",
    bundles: [
      {
        unit: "Kg",
        price: 2500,
      },
      {
        unit: "Carton - 10Kg",
        price: 20000,
      },
    ],
  },
  {
    imagePath: "/images/chicken-gizzard.jpg",
    name: "Chicken - Gizzard",
    category: "chicken",
    description:
      "Chicken Gizzard - Chicken is a lean meat with high nutritional value, and eating it regularly will help you stay healthy, Chicken is an excellent low-calorie and low-fat source of high-quality protein that important nutrients throughout our lives – from pregnancy through our later years.",
    bundles: [
      {
        unit: "Kg",
        price: 1800,
      },
      {
        unit: "Carton - 10Kg",
        price: 17000,
      },
    ],
  },
  {
    imagePath: "/images/chicken-cut4-2.jpg",
    name: "Chicken Cut4",
    category: "chicken",
    description:
      "Hard Chicken Cut4 - Chicken is a lean meat with high nutritional value, and eating it regularly will help you stay healthy, Chicken is an excellent low-calorie and low-fat source of high-quality protein that important nutrients throughout our lives – from pregnancy through our later years.",
    bundles: [
      {
        unit: "Kg",
        price: 1500,
      },
      {
        unit: "Carton - 10Kg",
        price: 14000,
      },
    ],
  },
  {
    imagePath: "/images/chicken-laps.jpg",
    name: "Chicken Lap",
    category: "chicken",
    description:
      "Hard Chicken Lap - Chicken is a lean meat with high nutritional value, and eating it regularly will help you stay healthy, Chicken is an excellent low-calorie and low-fat source of high-quality protein that important nutrients throughout our lives – from pregnancy through our later years.",
    bundles: [
      {
        unit: "Kg",
        price: 1500,
      },
      {
        unit: "Carton - 10Kg",
        price: 14000,
      },
    ],
  },
  {
    imagePath: "/images/frozen-french-fries.jpg",
    name: "Chips",
    category: "food",
    description:
      "French Fries, sold in Kg and cartoons, 2 types of cartons are sold each weighing 10kg packaged as 2.5kg bundles (4) or 1kg bundles(10) in the respective cartons",
    bundles: [
      {
        unit: "Kg",
        price: 1000,
      },
      {
        unit: "Carton - 10kg(4 - packs)",
        price: 14000,
      },
      {
        unit: "Carton - 10kg(10 - packs)",
        price: 14000,
      },
    ],
  },
  {
    imagePath: "/images/sausages.jpg",
    name: "Sausage (Value)",
    category: "food",
    description: "Value Premium Sausages",
    bundles: [
      {
        unit: "Kg",
        price: 600,
      },
      {
        unit: "Carton - 30 packs",
        price: 14000,
      },
    ],
  },
  {
    imagePath: "/images/burgers.jpg",
    name: "Burger",
    category: "food",
    description: "Nigerian Premium Burgers",
    bundles: [
      {
        unit: "Kg",
        price: 2000,
      },
    ],
  },
  {
    imagePath: "/images/shrimps2.jpg",
    name: "Shrimps",
    category: "shrimps",
    description:
      "Shrimp may have a variety of health benefits. It is high in several vitamins and minerals, and is a rich source of protein. Eating shrimp may also promote heart and brain health due to its content of omega-3 fatty acids and the antioxidant astaxanthin ( 6 , 11 , 12 , 13 )",
    bundles: [
      {
        unit: "200g",
        price: 700,
      },
    ],
  },

  {
    imagePath: "/images/tiger-prawns.jpg",
    name: "Tiger Prawns",
    category: "shrimps",
    description:
      "Prawns are a rich source of selenium, one of the most effective antioxidants at maintaining healthy cells. They also contain high levels of Zinc, which is important to develop a healthy immune system. Eating prawns helps build strong bones because they contain phosphorous, copper and magnesium",
    bundles: [
      {
        unit: "Kg",
        price: 10000,
      },
    ],
  },
  // {
  //   imagePath: "/images/IMG_1370.jpg",
  //   name: "Full Chicken",
  //   category: "chicken",
  //   description: "Full Chicken",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/IMG_1368.jpg",
  //   name: "Chicken Wings",
  //   category: "chicken",
  //   description: "Chicken Wings",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/IMG_1373.jpg",
  //   name: "Chicken - Cut4",
  //   category: "chicken",
  //   description: "Soft Chicken",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/IMG_1374.jpg",
  //   name: "Chicken Chest",
  //   category: "chicken",
  //   description: "Soft Chicken Chest",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/IMG_1375.jpg",
  //   name: "Chicken Fillet",
  //   category: "chicken",
  //   description: "Soft Chicken Fillet",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/image/IMG_1376",
  //   name: "Chicken - Gizzard",
  //   category: "chicken",
  //   description: "Chicken Gizzard",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/IMG_1377.jpg",
  //   name: "Turkey - Lap",
  //   category: "turkey",
  //   description: "Turkey Lap",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/IMG_1374.jpg",
  //   name: "sausage",
  //   category: "sausage",
  //   description: "Sausage",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/fish5.jpg",
  //   name: "Red Sniper",
  //   category: "fish",
  //   description: "Red Sniper Fish",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/fish5.jpg",
  //   name: "Mullet",
  //   category: "fish",
  //   description: "Mullet Fish",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/fish5.jpg",
  //   name: "Shawa",
  //   category: "fish",
  //   description: "Shawa Fish",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
  // {
  //   imagePath: "/images/fish4.jpg",
  //   name: "Blue-White",
  //   category: "fish",
  //   description: "Blue-White Fish",
  //   bundles: [
  //     {
  //       unit: "Kg",
  //       price: 2500,
  //     },
  //     {
  //       unit: "Carton",
  //       price: 20000,
  //     },
  //   ],
  // },
];

function seedDB() {
  // Remove All Products and Bundles
  Product.remove({}, (err) => {
    if (err) {
      return console.log("Error Removing Products : " + err);
    }

    console.log("Existing Products Removed Successfully");

    data.forEach((product) => {
      Product.create(product, (err, createdProduct) => {
        if (err) {
          console.log("Error Creating Product in Database : " + err);
        } else {
          console.log(
            "Product: " + createdProduct.name + " created successfully"
          );
        }
      });
    });
  });

  User.remove({}, (err) => {
    if (err) {
      console.log(
        "Error Removing Users from the database, seeding will continue"
      );
    }
  });

  let user = new User();
  user.email = "anonymous@factorialsystems.io";
  user.fullName = "Anonymous";
  user.password = user.encryptPassword(
    process.env.SECRETACCESSKEY,
    (err, hashPassword) => {
      if (err) {
        return console.log("Error creating hashPassword for Anonymous User");
      }

      user.password = hashPassword;

      user.save((err, anonymousUser) => {
        if (err) {
          return console.log(
            "Error saving Anonymous User to the Database : " + err
          );
        }

        console.log(
          "Database has been successfully seeded with Anonymous User " +
            anonymousUser._id
        );
      });
    }
  );
}

function enableBundles() {
  Product.find({}, (err, products) => {
    if (err) {
      var message =
        "Error Loading Products from Database, please try refreshing the page : " +
        err.message;
      logger.error(message);
    } else {
      products.forEach((product) => {
        if (product.bundles) {
          product.bundles.forEach((bundle) => {
            Product.update(
              { _id: product._id, "bundles._id": bundle._id },
              { $set: { "bundles.$.enabled": true } }
            )
              .then((val) => {
                console.log("Bundle {" + bundle._id + "} Updated Successfully for Product {" + product._id + "}");
                console.log(val);
              })
              .catch((err) => {
                console.log(err);
              });
          });
        } else {
          console.log("Unable to set bundle for Product " + product._id);
          console.log(product);
        }
      });
    }
  });
}

module.exports = enableBundles;
