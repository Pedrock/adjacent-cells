const fs = require('fs');
const path = require('path');
const assert = require('assert');
const JSONStream = require('JSONStream');
const Solver = require('../solver');

const expected1 = [
    [ [ 0, 3 ], [ 1, 2 ], [ 1, 3 ], [ 1, 4 ] ],
    [ [ 0, 6 ], [ 0, 7 ], [ 1, 6 ], [ 1, 7 ], [ 2, 6 ], [ 3, 6 ], [ 3, 7 ], [ 4, 6 ], [ 4, 7 ] ],
    [ [ 3, 3 ], [ 4, 3 ] ],
];

const expected2 = [
    [ [0, 3], [0, 4], [1, 2], [1, 3], [2, 2], [2, 3] ],
    [ [0, 6], [0, 7], [1, 6], [1, 7], [2, 6], [3, 6], [3, 7], [4, 6], [4, 7] ],
];

const expected3 = [
    [ [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 4], [2, 0], [2, 3], [2, 4] ],
];

const expected4 = [
    [ [0, 2], [1, 2], [1, 3], [1, 5], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 1], [3, 4], [4, 3], [4, 4] ],
];

function streamToArray(stream) {
    const arr = [];
    return new Promise((resolve, reject) => {
        stream
            .on('data', data => arr.push(data))
            .on('finish', () => resolve(arr))
            .on('error', reject);
    })
}

async function assertSolverStream(expected, stream) {
    const result = await streamToArray(stream);
    for (const group of result) {
        group.sort();
    }
    result.sort();
    assert.deepEqual(expected, result);
}

async function testExample(fileName, expected) {
    const stream = fs.createReadStream(path.join(__dirname, 'data', fileName))
        .pipe(JSONStream.parse('*'))
        .pipe(new Solver());
    return assertSolverStream(expected, stream);
}

describe('Solver', function() {

    it('should work with example 1', () => testExample('example1.json', expected1));
    it('should work with example 2', () => testExample('example2.json', expected2));
    it('should work with example 3', () => testExample('example3.json', expected3));
    it('should work with example 4', () => testExample('example4.json', expected4));
});
