const { Duplex } = require('stream');


const ACCEPTED_CELL = 1;

class Group {

    constructor(columnIndex) {
        this.columns = new Set();
        this.points = [];
    }

    addCurrentPoint([y, x]) {
        this.columns.add(x);
        this.points.push([y, x]);
    }

    addPoints(points) {
        this.points.push(...points);
    }

    addColumns(columns) {
        this.columns.add(...columns);
    }

    addColumn(i) {
        this.columns.add(i);
    }

    removeColumn(i) {
        this.columns.delete(i);
    }

    isCleared() {
        return this.columns.size === 0;
    }
}

class Solver extends Duplex {

    constructor(options) {
        super({ objectMode: true });
        this.columnGroups = null;
        this.y = 0;
    }

    _handleLine(line) {
        if (!this.columnGroups) {
            this.columnGroups = line.map(() => null);
        } else if (this.columnGroups.length !== line.length) {
            throw new Error('Not all lines have the same length');
        }
        this._findLineGroups(line);
        this.y++;
    }

    _mergeGroupToPreviousCell(x) {
        if (this.columnGroups[x]) {
            this.columnGroups[x - 1].addPoints(this.columnGroups[x].points);
            this.columnGroups[x - 1].addColumns(this.columnGroups[x].columns);
            const columnsToReplace = this.columnGroups[x].columns;
            for (const i of columnsToReplace) {
                this.columnGroups[i] = this.columnGroups[x - 1];
            }
        } else {
            this.columnGroups[x] = this.columnGroups[x - 1];
        }
    }

    _addCurrentPoint(x) {
        if (!this.columnGroups[x]) {
            this.columnGroups[x] = new Group();
        }
        this.columnGroups[x].addCurrentPoint([this.y, x]);
    }

    _removeCurrentPoint(x, clearedGroups) {
        this.columnGroups[x].removeColumn(x);
        if (this.columnGroups[x].isCleared()) {
            clearedGroups.add(this.columnGroups[x]);
        }
        this.columnGroups[x] = null;
    }

    _findLineGroups(line) {
        const clearedGroups = new Set();
        for (let x = 0; x < line.length; x++) {
            if (line[x] === ACCEPTED_CELL) {
                if (line[x - 1] === ACCEPTED_CELL && this.columnGroups[x] !== this.columnGroups[x - 1]) {
                    this._mergeGroupToPreviousCell(x);
                }
                this._addCurrentPoint(x);
            } else if (this.columnGroups[x]) {
                this._removeCurrentPoint(x, clearedGroups);
            }
        }
        this._checkForCompletedGroups(clearedGroups);
    }

    _checkForCompletedGroups(clearedGroupsSet) {
        for (const group of clearedGroupsSet) {
            if (group.points.length > 1) {
                this.push(group.points);
            }
        }
    }

    _write(data, encoding, callback) {
        this._handleLine(data);
        callback();
    }

    _final(callback) {
        const groupsSet = new Set(this.columnGroups.filter(group => !!group));
        this._checkForCompletedGroups(groupsSet);
        callback();
    }

    _read() {}
}

module.exports = Solver;