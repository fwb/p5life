import p5 from 'p5';

import { Game } from './game';

export class Grid {
    cellSize: number;
    rows: number;
    cols: number;
    width: number;
    height: number;

    cells: Array<boolean>;

    constructor() {
        this.cellSize = Game.CellSize;
    }

    index(x: number, y: number): number {
        return x + y * this.cols;
    }

    coords(i: number): { x: number, y: number } {
        const y = Math.floor(i / this.cols);
        const x = i % this.cols;
        return { x, y };
    }

    setup() {
        let center = { x: Math.round(this.cols / 2), y: Math.round(this.rows / 2) };

        let liveCells = new Array();
        liveCells.push(
            { x: center.x + 0, y: center.y + 0 },
            { x: center.x + 1, y: center.y + 0 },
            { x: center.x - 1, y: center.y + 0 },
        );

        if (this.cols > 15 && this.rows > 15) {
            liveCells.push(
                { x: center.x - 2, y: center.y + 0 },
                { x: center.x + 2, y: center.y + 0 },
                { x: center.x - 3, y: center.y + 0 },
                { x: center.x + 3, y: center.y + 0 },
                { x: center.x - 4, y: center.y + 0 },
            );
        }

        liveCells.forEach(c => {
            this.cells[this.index(c.x, c.y)] = true;
        });
    }

    resize(width: number, height: number) {
        this.cols = Math.floor(width / this.cellSize);
        this.rows = Math.floor(height / this.cellSize);
        console.log({ cellsAcross: this.cols, cellsHigh: this.rows });
        this.cells = new Array<boolean>(this.cols * this.rows);

        this.width = this.cellSize * this.cols;
        this.height = this.cellSize * this.rows;
    }

    liveNeighbors(i: number): number {
        let count = 0;

        const { x, y } = this.coords(i);
        [
            { x: x - 1, y: y - 1 }, // NW
            { x: x + 0, y: y - 1 }, // N
            { x: x + 1, y: y - 1 }, // NE
            { x: x - 1, y: y + 0 }, // W
            { x: x + 1, y: y + 0 }, // E
            { x: x - 1, y: y + 1 }, // SW
            { x: x + 0, y: y + 1 }, // S
            { x: x + 1, y: y + 1 }, // SE
        ].forEach(c => {
            if (x >= 0 && y >= 0 && x <= this.cols && y <= this.rows) {
                if (this.cells[this.index(c.x, c.y)]) {
                    count++;
                }
            }
        });

        return count;
    }

    update(sketch: p5) {
        const cellCount = this.rows * this.cols;
        const newCells = new Array<boolean>(cellCount);
        for (let i = 0; i < cellCount; i++) {
            const ln = this.liveNeighbors(i);
            if (this.cells[i]) {
                if (ln == 2 || ln == 3) {
                    newCells[i] = true;
                }
            } else {
                if (ln == 3) {
                    const { x, y } = this.coords(i);
                    newCells[i] = true;
                }
            }
        }
        this.cells = newCells;
    }

    draw(sketch: p5) {
        const size = this.cellSize;

        sketch.push();
        sketch.stroke(130);
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.cells[this.index(x, y)]) {
                    sketch.fill(180);
                } else {
                    sketch.fill(80);
                }

                sketch.rect(x * size, y * size, size, size);
            }
        }
        sketch.pop();
    }

    touchEnded(gridX: number, gridY: number) {
        const i = this.index(gridX, gridY);
        this.cells[i] = !this.cells[i];
    }
}
