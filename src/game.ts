import p5 from 'p5';

import { Grid } from './grid';
import { Timer } from './timer';

export class Game {
    static Debug = true;

    static DefaultBackground = 51;
    static DefaultTimer = 500;
    static FrameRate = 30;
    static CellSize = 64;
    static StepLength = 500;

    sketch: p5;

    static PauseIcon = '<i class="fas fa-pause-circle fa-5x"></i>';
    static PlayIcon = '<i class="fas fa-play-circle fa-5x"></i>';
    static StepIcon = '<i class="fas fa-arrow-circle-right fa-5x"></i>';
    static ResetIcon = '<i class="fas fa-undo-alt fa-5x"></i>';
    btnPlay: p5.Element;
    sldDelay: p5.Element;

    loop: boolean;
    init: boolean;
    skip: boolean;

    timer: Timer;
    grid: Grid;

    constructor(sketch: p5) {
        this.sketch = sketch;
    }

    preload() {
        this.grid = new Grid();
    }

    setup() {
        const { sketch } = this;
        const { windowWidth: w, windowHeight: h } = sketch;

        this.btnPlay = sketch.createButton(Game.PauseIcon);
        this.btnPlay.mousePressed(() => this.togglePause());
        this.btnPlay.parent('control-container');
        this.btnPlay.class('control');

        const btnStep = sketch.createButton(Game.StepIcon);
        btnStep.mousePressed(() => this.step());
        btnStep.parent('control-container');
        btnStep.class('control');

        this.sldDelay = sketch.createSlider(100, 3000, 500, 100);
        this.sldDelay.parent('control-container');
        this.sldDelay.class('slider');

        const btnReset = sketch.createButton(Game.ResetIcon);
        btnReset.mousePressed(() => this.reset());
        btnReset.parent('control-container');
        btnReset.class('control');

        this.grid.resize(w, h);
        const canvas = sketch.createCanvas(this.grid.width, this.grid.height);
        canvas.style('display', 'block');
        canvas.parent('canvas-container');

        sketch.background(Game.DefaultBackground);
        sketch.frameRate(Game.FrameRate);

        this.timer = new Timer(Game.StepLength);
        this.timer.start();

        this.resizeCanvas();
        this.loop = true;
        this.init = false;

        this.togglePause();
    }

    togglePause() {
        this.loop = !this.loop;
        if (this.loop) {
            this.btnPlay.html(Game.PauseIcon);
            this.loop = true;
            this.sketch.loop();
        } else {
            this.btnPlay.html(Game.PlayIcon);
            this.loop = false;
            this.sketch.noLoop();
        }
    }

    step() { this.sketch.redraw(); }

    reset() {
        this.init = false;
        this.resizeCanvas();
        this.grid.setup();
    }

    update() {
        if (!this.init) {
            this.init = true;
            return;
        }

        if (!this.loop || !this.timer.active) {
            this.timer.duration = this.sldDelay.value() as number;
            this.grid.update(this.sketch);
            this.timer.start();
        }

        this.timer.tick(this.sketch.deltaTime);
    }

    draw() {
        if (!this.init) {
            // FIXME: why is canvas larger than container in setup()?
            this.resizeCanvas();
            this.grid.setup();
        }

        if (!this.skip) {
            this.update();
        }

        this.sketch.background(Game.DefaultBackground);

        this.grid.draw(this.sketch);
    }

    resizeCanvas() {
        const { sketch } = this;
        const { width, height } = sketch.select('#canvas-container').size() as any;

        this.grid.resize(width, height);
        sketch.resizeCanvas(this.grid.width, this.grid.height);
    }

    touchEnded(): boolean {
        const { sketch } = this;
        const { mouseX, mouseY, width, height } = sketch;

        if (mouseX > width || mouseY < height) {
            const gridX = sketch.int(mouseX / Game.CellSize);
            const gridY = sketch.int(mouseY / Game.CellSize);
            this.grid.touchEnded(gridX, gridY);
            this.skip = true;
            sketch.redraw();
            this.skip = false;

            return false;
        }

        return true;
    }

    touchMoved(): boolean {
        const { sketch } = this;
        const { mouseX, mouseY, width, height } = sketch;

        if (mouseX > width || mouseY < height) {
            return false;
        }

        return true;
    }

    windowResized() { this.resizeCanvas(); }
}
