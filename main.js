var totalSeconds;
var timer;

const indexOf2D = (array, value) => {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            if (array[i][j] == value) return [i, j];
        }
    }
    return -1;
}

const index2Dto1D = (i, j, rows) => {
    return (i * rows) + j;
}

const formatTime = () => {
    const timer = document.getElementById('time');
    const seconds = totalSeconds % 60;
    const minutes = parseInt(totalSeconds / 60);
    const hours = parseInt(minutes / 60);
    let secPart = "";
    let minPart = "";
    let hourPart = "";

    // format seconds
    if (seconds < 10)
        secPart = ":0" + seconds;
    else
        secPart = ":" + seconds;

    // format minutes
    if (hours != 0 && minutes < 10)
        minPart = "0" + minutes;
    else
        minPart = minutes;

    // format hours
    if (hours != 0)
        hourPart = hours + ":";

    timer.innerHTML = hourPart + minPart + secPart;
    totalSeconds++;
}

class Game {
    constructor() {
        this.moveCount = 0;
        this.grid = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 0]
        ];
    }

    start() {
        let gridArea = document.getElementById('grid');
        gridArea.innerHTML = "";

        // shuffle the grid
        this.shuffle();

        // create DOM elements for the tiles
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                let tile = document.createElement('button');
                tile.innerHTML = this.grid[i][j];
                gridArea.appendChild(tile);
            }
        }
        gridArea.lastChild.id = 'blank';
        gridArea.lastChild.innerHTML = "";
    }

    shuffle() {
        // shuffle with 1000 random moves
        for (let i = 0; i < 1000; i++) {
            const blankIndex = this.getBlankIndex();
            const blankNeighbors = this.getNeighbors(blankIndex);
            const swapNum = blankNeighbors[Math.floor(Math.random() * blankNeighbors.length)];
            this.updateGrid(swapNum, blankIndex);
        }

        // move blank space to bottom right
        while (this.grid[3][3] != 0) {
            const blankIndex = this.getBlankIndex();
            const blankNeighbors = this.getNeighbors(blankIndex);
            const swapNum = blankNeighbors[0];
            this.updateGrid(swapNum, blankIndex);
        }
    }

    reset() {
        document.getElementById('count').innerHTML = 0;
        document.getElementById('time').innerHTML = "0:00";
        jQuery.ready(main()); // create a new instance
    }

    disable() {
        $('#grid button').each(function() {
            $(this).css('pointer-events', 'none');
        });
    }

    getBelowTile(x, y) {
        if (y == 3) return null;
        return this.grid[x][y+1];
    }

    getRightTile(x, y) {
        if (x == 3) return null;
        return this.grid[x+1][y];
    }

    getAboveTile(x, y) {
        if (y == 0) return null;
        return this.grid[x][y-1];
    }

    getLeftTile(x, y) {
        if (x == 0) return null;
        return this.grid[x-1][y];
    }

    getNeighbors([x, y]) {
        return [
            this.getBelowTile(x, y),
            this.getRightTile(x, y),
            this.getAboveTile(x, y),
            this.getLeftTile(x, y)
        ].filter(tile => tile != null);
    }

    getBlankIndex() {
        return indexOf2D(this.grid, 0);
    }

    updateGrid(value, blankIndex) {
        const valueIndex = indexOf2D(this.grid, value);
        const tmp = this.grid[valueIndex[0]][valueIndex[1]];
        this.grid[valueIndex[0]][valueIndex[1]] = this.grid[blankIndex[0]][blankIndex[1]];
        this.grid[blankIndex[0]][blankIndex[1]] = tmp;
    }

    updateDOMGrid(tile, value) {
        document.getElementById('blank').innerHTML = value;
        $('#blank').removeAttr('id');
        tile.innerHTML = "";
        tile.id = 'blank';
    }

    updateCount() {
        document.getElementById('count').innerHTML = ++this.moveCount;
    }

    isSolved() {
        if (this.grid[0][0] == 1 && this.grid[0][1] == 2 && this.grid[0][2] == 3 && this.grid[0][3] == 4 &&
            this.grid[1][0] == 5 && this.grid[1][1] == 6 && this.grid[1][2] == 7 && this.grid[1][3] == 8 &&
            this.grid[2][0] == 9 && this.grid[2][1] == 10 && this.grid[2][2] == 11 && this.grid[2][3] == 12 &&
            this.grid[3][0] == 13 && this.grid[3][1] == 14 && this.grid[3][2] == 15 && this.grid[3][3] == 0
        ) {
            return true;
        }

        return false;
    }
}

$('document').ready(main());
function main() {
    let game = new Game();
    game.start();
    totalSeconds = 1;
    timer = setInterval(formatTime, 1000);

    $('#grid button').on('click', function() {
        const blankIndex = game.getBlankIndex();
        const value = parseInt(this.innerHTML);
        
        // if the clicked tile is next to the blank space, then swap them
        if (game.getNeighbors(blankIndex).includes(value)) {
            game.updateGrid(value, blankIndex);
            game.updateDOMGrid(this, value);
            game.updateCount();

            // check if the grid is solved
            if (game.isSolved()) {
                setTimeout(function() {
                    clearInterval(timer);
                    if (window.confirm("YOU WIN! Play again?"))
                        game.reset();
                    else
                        game.disable();
                }, 100); // allows for the DOM to update
            }
        }
    });

    $('#grid button').on('mouseover', function() {
        const blankIndex = game.getBlankIndex();
        const value = parseInt(this.innerHTML);

        if (game.getNeighbors(blankIndex).includes(value))
            $(this).css('cursor', 'pointer');
        else
            $(this).css('cursor', 'auto');
    });

    $('#reset-btn').on('click', function() {
        clearInterval(timer);
        game.reset();
    });
}