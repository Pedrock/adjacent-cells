const fs = require('fs');
const Solver = require('./solver');

if (process.argv.length !== 3) {
    console.log("USAGE: node index.js INPUT_FILE");
    return;
}

function printGroups(result) {
    for (const group of result) {
        const groupsString = group
        .map(coords => `[${coords.join(', ')}]`)
        .join(", ")
        console.log(`[ ${groupsString} ]`);
    }
}

const fileName = process.argv[2];
const inputFile = fs.readFileSync(fileName);
const input = JSON.parse(inputFile);

const resultGroups = new Solver(input).solve();
printGroups(resultGroups);