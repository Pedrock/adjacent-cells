const { Duplex } = require('stream');


const ACCEPTED_CELL = 1;

class Solver extends Duplex {

    constructor(options) {
        super({ objectMode: true });
        this.columnGroups = null;
        this.y = 0;
    }

    _handleLine(line) {
        if (!this.columnGroups) {
            this.columnGroups = line.map(() => []);
        } else if (this.columnGroups.length !== line.length) {
            throw new Error('Not all lines have the same length');
        }
        this._findLineGroups(line);
        this.y++;
    }

    _mergeGroupWithPreviousCell(x) {
        for (const value of this.columnGroups[x]) {
            this.columnGroups[x - 1].push(value);
        }
        this.columnGroups[x] = this.columnGroups[x - 1];
    }

    _findLineGroups(line) {
        const updatedGroups = new Set();
        for (let x = 0; x < line.length; x++) {
            if (line[x] === ACCEPTED_CELL) {
                if (line[x - 1] === ACCEPTED_CELL && this.columnGroups[x] !== this.columnGroups[x - 1]) {
                    this._mergeGroupWithPreviousCell(x);
                }
                this.columnGroups[x].push([this.y, x]);
                updatedGroups.add(this.columnGroups[x]);
            }
        }
        this._checkForCompletedGroups(updatedGroups);
        return updatedGroups;
    }

    _checkForCompletedGroups(updatedGroupsSet) {
        for (let x = 0; x < this.columnGroups.length; x++) {
            const group = this.columnGroups[x];
            if (group.length && !updatedGroupsSet.has(group)) {
                this.push(group);
                this.columnGroups[x].length = 0;
            }
        }
    }

    _write(data, encoding, callback) {
        this._handleLine(data);
        callback();
    }

    _final(callback) {
        this._checkForCompletedGroups(new Set());
        callback();
    }

    _read() {}
}

module.exports = Solver;