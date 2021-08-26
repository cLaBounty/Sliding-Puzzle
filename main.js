var totalSeconds;
var timer;

const SOLVED_GRID = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
];

const indexOf2D = (array, value) => {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            if (array[i][j] == value) return [i, j];
        }
    }
    return -1;
}

const index2Dto1D = (i, j, columns) => {
    return (i * columns) + j;
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const formatTime = () => {
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

    document.getElementById('time').innerHTML = hourPart + minPart + secPart;
    totalSeconds++;
}

class Grid {
    constructor(grid, gScore=0, parent=null, swapNum=0) {
        this.grid = grid;
        this.gScore = gScore;
        this.hScore = this.get_hScore();
        this.fScore = this.gScore + this.hScore;
        this.parent = parent;
        this.swapNum = swapNum;
    }

    getBelowTile(x, y) {
        if (y == 2) return null;
        return this.grid[x][y + 1];
    }

    getRightTile(x, y) {
        if (x == 2) return null;
        return this.grid[x + 1][y];
    }

    getAboveTile(x, y) {
        if (y == 0) return null;
        return this.grid[x][y - 1];
    }

    getLeftTile(x, y) {
        if (x == 0) return null;
        return this.grid[x - 1][y];
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

    swap(value1, value2) {
        const v1Index = indexOf2D(this.grid, value1);
        const v2Index = indexOf2D(this.grid, value2);
        const tmp = this.grid[v1Index[0]][v1Index[1]];
        this.grid[v1Index[0]][v1Index[1]] = this.grid[v2Index[0]][v2Index[1]];
        this.grid[v2Index[0]][v2Index[1]] = tmp;
        this.updateScores();
    }

    isSolved() {
        return JSON.stringify(this.grid) === JSON.stringify(SOLVED_GRID)
    }

    get_hScore() {
        let manhattenDistanceSum = 0;
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                const solvedPosition = indexOf2D(SOLVED_GRID, this.grid[i][j]);
                manhattenDistanceSum += Math.abs(solvedPosition[0] - i) + Math.abs(solvedPosition[1] - j);
            }
        }

        return manhattenDistanceSum;
    }

    updateScores() {
        this.hScore = this.get_hScore();
        this.fScore = this.gScore + this.hScore;
    }
}

class Game {
    constructor() {
        this.gameGrid = new Grid(JSON.parse(JSON.stringify(SOLVED_GRID)));
    }

    start() {
        let gridArea = document.getElementById('grid');
        gridArea.innerHTML = "";

        // shuffle the grid
        this.shuffle();

        // create DOM elements for the tiles
        for (let i = 0; i < this.gameGrid.grid.length; i++) {
            for (let j = 0; j < this.gameGrid.grid[i].length; j++) {
                let tile = document.createElement('button');
                tile.innerHTML = this.gameGrid.grid[i][j];
                gridArea.appendChild(tile);
            }
        }
        gridArea.lastChild.id = 'blank';
        gridArea.lastChild.innerHTML = "";
    }

    shuffle() {
        // shuffle with 1000 random moves
        for (let i = 0; i < 1000; i++) {
            const blankIndex = this.gameGrid.getBlankIndex();
            const blankNeighbors = this.gameGrid.getNeighbors(blankIndex);
            const swapNum = blankNeighbors[Math.floor(Math.random() * blankNeighbors.length)];
            this.gameGrid.swap(0, swapNum);
        }

        // move blank space to bottom right
        while (this.gameGrid.grid[2][2] != 0) {
            const blankIndex = this.gameGrid.getBlankIndex();
            const blankNeighbors = this.gameGrid.getNeighbors(blankIndex);
            const swapNum = blankNeighbors[0];
            this.gameGrid.swap(0, swapNum);
        }
    }

    disable() {
        $('#grid button,#solve-btn').each(function() {
            $(this).css('pointer-events', 'none');
        });
    }

    updateGrid(value) {
        this.gameGrid.swap(0, value);
    }

    updateDOMGrid(tile, value) {
        document.getElementById('blank').innerHTML = value;
        $('#blank').removeAttr('id');
        tile.innerHTML = "";
        tile.id = 'blank';
    }

    getBlankIndex() {
        return this.gameGrid.getBlankIndex();
    }

    getNeighbors([x, y]) {
        return this.gameGrid.getNeighbors([x, y]);
    }

    isSolved() {
        return this.gameGrid.isSolved();
    }

    solve() {
        let frontier = new TinyQueue([this.gameGrid], (a, b) => {
            return a.fScore - b.fScore
        });
        let visited = new Set();

        while (frontier.length > 0) {
            const current = frontier.pop()

            // Base Case: current grid is solved
            if (current.isSolved()) {
                let solution = [];
                let temp = current;

                while (temp.parent != null) {
                    solution.unshift(temp.swapNum);
                    temp = temp.parent;
                }

                return solution;
            }

            // Recursive Case: add children to frontier
            const blankIndex = current.getBlankIndex();
            const neighbors = current.getNeighbors(blankIndex);

            for (let i = 0; i < neighbors.length; i++) {
                const gridCopy = JSON.parse(JSON.stringify(current.grid));
                const child = new Grid(gridCopy, current.gScore + 1, current, neighbors[i]);
                child.swap(0, neighbors[i]);

                if (!visited.has(JSON.stringify(child.grid))) {
                    frontier.push(child);
                }
            }

            visited.add(JSON.stringify(current.grid));
        }
    }

    async animateSolution() {
        this.disable();

        const solution = this.solve();
        for (let i = 0; i < solution.length; i++) {
            const index2D = indexOf2D(this.gameGrid.grid, solution[i]);
            const index1D = index2Dto1D(index2D[0], index2D[1], this.gameGrid.grid[index2D[0]].length);
            this.updateDOMGrid($('#game button')[index1D], solution[i]);
            this.updateGrid(solution[i]);
            await delay(500);
        }

        clearInterval(timer);
        if (window.confirm("You win! Play again?"))
            location.reload();
    }
}

$('document').ready(function() {
    let game = new Game();
    game.start();
    totalSeconds = 1;
    timer = setInterval(formatTime, 1000);

    $('#grid button').on('click', function() {
        const blankIndex = game.getBlankIndex();
        const value = parseInt(this.innerHTML);
        
        // if the clicked tile is next to the blank space, then swap them
        if (game.getNeighbors(blankIndex).includes(value)) {
            game.updateGrid(value);
            game.updateDOMGrid(this, value);

            // check if the grid is solved
            if (game.isSolved()) {
                setTimeout(function() {
                    clearInterval(timer);
                    if (window.confirm("You win! Play again?"))
                        location.reload();
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
        location.reload();
    });

    $('#solve-btn').on('click', function() {
        game.animateSolution();
    });
});