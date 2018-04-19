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

    _mergeGroupWithPreviousCell(x, clearedGroups) {
        for (const value of this.columnGroups[x]) {
            this.columnGroups[x - 1].push(value);
        }
        const replacedGroup = this.columnGroups[x];
        for (let i = 0; i < this.columnGroups.length; i++) {
            if (this.columnGroups[i] === replacedGroup) {
                this.columnGroups[i] = this.columnGroups[x - 1];
            } 
        }
        clearedGroups.delete(replacedGroup);
    }

    _findLineGroups(line) {
        const updatedGroups = new Set();
        const clearedGroups = new Set();
        for (let x = 0; x < line.length; x++) {
            if (line[x] === ACCEPTED_CELL) {
                if (line[x - 1] === ACCEPTED_CELL && this.columnGroups[x] !== this.columnGroups[x - 1]) {
                    this._mergeGroupWithPreviousCell(x, clearedGroups);
                }
                this.columnGroups[x].push([this.y, x]);
                updatedGroups.add(this.columnGroups[x]);
            } else if (this.columnGroups[x].length) {
                clearedGroups.add(this.columnGroups[x]);
                this.columnGroups[x] = [];
            }
        }
        this._checkForCompletedGroups(updatedGroups, clearedGroups);
        return updatedGroups;
    }

    _checkForCompletedGroups(updatedGroupsSet, clearedGroupsSet) {
        for (const group of clearedGroupsSet) {
            if (!updatedGroupsSet.has(group)) {
                if (group.length > 1) {
                    this.push(group);
                }
                group.length = 0;
            }
        }
    }

    _write(data, encoding, callback) {
        this._handleLine(data);
        callback();
    }

    _final(callback) {
        this._checkForCompletedGroups(new Set(), new Set(this.columnGroups));
        callback();
    }

    _read() {}
}

module.exports = Solver;