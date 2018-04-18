const ReadableStream = require('stream').Readable;

const ACCEPTED_CELL = 1;

class Solver {
    constructor(matrix) {
        this.matrix = matrix;
    }

    *solve() {
        if (this.matrix.length === 0) {
            return [];
        }

        const visited = this._createVisitedMatrix();

        for (let y = 0; y < this.matrix.length; y++) {
            for (let x = 0; x < this.matrix[y].length; x++) {
                if (this.matrix[y][x] === ACCEPTED_CELL && !visited[y][x]) {
                    visited[y][x] = true;
                    const group = this._explore(x, y, visited, [[y, x]]);
                    if (group.length > 1) {
                        yield group;
                    }
                }
            }
        }
    }

    _explore(x, y, visited, group) {
        for (const [incX, incY] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
            const [x2, y2] = [x + incX, y + incY];
            if (visited[y2] && !visited[y2][x2] && this.matrix[y2][x2] === ACCEPTED_CELL) {
                visited[y2][x2] = true;
                group.push([y2, x2]);
                this._explore(x2, y2, visited, group);
            }
        }
        
        return group;
    }

    _createVisitedMatrix() {
        return Array(this.matrix.length)
        .fill(undefined)
        .map((e, i) =>
            Array(this.matrix[i].length)
            .fill(undefined)
            .map(() => false)
        );
    }
}

module.exports = Solver;