const fs = require('fs');
const Solver = require('./solver');
const JSONStream = require('JSONStream');

if (process.argv.length !== 3) {
    console.log("USAGE: node index.js INPUT_FILE");
    return;
}

function printGroup(group) {
    const groupsString = group
        .map(coords => `[${coords.join(', ')}]`)
        .join(", ")
        console.log(`[ ${groupsString} ]`);
}

const fileName = process.argv[2];

fs.createReadStream(fileName)
    .pipe(JSONStream.parse('*'))
    .pipe(new Solver())
    .on('data', printGroup);
