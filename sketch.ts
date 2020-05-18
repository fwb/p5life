import p5 from 'p5';

import { Game } from './src/game';

var app = function (sketch: p5) {
    var game: Game;

    sketch.preload = function () {
        game = new Game(sketch);
        game.preload();
    }

    sketch.setup = function () {
        game.setup();
    };

    sketch.draw = function () {
        game.draw();
    }

    sketch.touchEnded = function () {
        return game.touchEnded();
    }

    sketch.touchMoved = function () {
        return game.touchMoved();
    }

    sketch.windowResized = function () {
        game.windowResized();
    }
}

new p5(app);
