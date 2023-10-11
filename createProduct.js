const fs = require("fs");
const csv = require("csvtojson");

const createProduct = async () => {
  let newData = await csv().fromFile("ikeafurniture.csv");
  let data = JSON.parse(fs.readFileSync("db.json"));
  newData = newData.map((e) => {
    return {
      field1: e.field1,
      item_id: e.item_id,
      name: e.name,
      category: e.category,
      price: e.price,
      link: e.link,
      description: e.short_description.trim(),
      designer: e.designer,
    };
  });
  // console.log(newData);

  data.products = newData;

  fs.writeFileSync("db.json", JSON.stringify(data));

  console.log("done");
};
createProduct();
