const fs = require('fs');
const Solver = require('./solver');

if (process.argv.length !== 3) {
    console.log("USAGE: node index.js INPUT_FILE");
    return;
}

const fileName = process.argv[2];
const inputFile = fs.readFileSync(fileName);
const input = JSON.parse(inputFile);

const result = new Solver(input).solve();
console.log(result);