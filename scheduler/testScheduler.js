require("dotenv").config();

const { staggerTransfers } = require("./scheduler");

async function main() {
  console.log("Starting staggered transfers...");
  staggerTransfers();
}

main();
