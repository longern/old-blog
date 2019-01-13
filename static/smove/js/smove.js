Smove = function () {
    var smove = new Object();

    smove.resource = {
        image: {
            black: new Image(),
            board: new Image(),
            food: new Image(),
            levelfood: new Image(),
            white: new Image(),
        },
    };

    smove.bestScore = 0;

    smove.resource.image.black.src = "/static/smove/image/black.svg";
    smove.resource.image.board.src = "/static/smove/image/board.svg";
    smove.resource.image.food.src = "/static/smove/image/food.svg";
    smove.resource.image.levelfood.src = "/static/smove/image/levelfood.svg";
    smove.resource.image.white.src = "/static/smove/image/white.svg";

    smove.levelData = [
        {
            interval: 3,
            dots() { smove.addDot(Math.floor(Math.random() * 12)); }
        },
        {
            interval: 4,
            dots() {
                var dotPos = Math.floor(Math.random() * 12);
                smove.addDot(dotPos);
                smove.addDot(dotPos >= 6 ? 17 - dotPos : 5 - dotPos);
            }
        },
        {
            interval: 4,
            dots() {
                var dotPos = Math.floor(Math.random() * 12);
                smove.addDot(dotPos);
                smove.addDot(Math.floor(dotPos / 3) * 3 + Math.floor(dotPos + Math.random() * 2 + 1) % 3);
            }
        },
        {
            interval: 11,
            dots() {
                var dotDir = Math.floor(Math.random() * 4);
                var flip = Math.floor(Math.random() * 2)
                smove.addDot(dotDir * 3 + (flip ? 0 : 2));
                smove.addDot(dotDir * 3 + 1, 2);
                smove.addDot(dotDir * 3 + (flip ? 2 : 0), 4);
                smove.addDot(dotDir * 3 + (flip ? 2 : 0), 6);
                smove.addDot(dotDir * 3 + 1, 8);
                smove.addDot(dotDir * 3 + (flip ? 0 : 2), 10);
            }
        },
        {
            interval: 7,
            dots() {
                var dotDir = Math.floor(Math.random() * 4);
                var flip = Math.floor(Math.random() * 2)
                smove.addDot(dotDir * 3 + (flip ? 0 : 2));
                smove.addDot(dotDir * 3 + 1, 0.75);
                smove.addDot(dotDir * 3 + (flip ? 0 : 2), 1.5);
                smove.addDot(dotDir * 3 + (flip ? 2 : 0), 2.75);
                smove.addDot(dotDir * 3 + 1, 3.5);
                smove.addDot(dotDir * 3 + (flip ? 2 : 0), 4.25);
            }
        },
    ];

    smove.isPlaying = function () {
        return this.states.gameState === Smove.GameState.Playing;
    }

    smove.addFood = function () {
        if (this.states.food !== null)
            return;
        var foodPos = Math.floor(Math.random() * 8);
        if (foodPos === (this.states.whiteDot.x + 1) * 3 + this.states.whiteDot.y + 1)
            foodPos = 8;
        this.states.food = {
            x: Math.floor(foodPos / 3) - 1,
            y: Math.floor(foodPos % 3) - 1,
        };
        Animation({ duration: 100, callback: ret => this.display.foodFade = ret });
    }

    smove.eatFood = function () {
        this.states.food = null;
        this.states.lastFoodTime = frameCount;
        this.states.score += 1;
        if (this.states.score % 10 === 0) {
            this.states.level += 1;
            Animation({ delay: 250, duration: 250, callback: ret => this.display.levelTextFade = ret });
            Animation({ delay: 2000, duration: 250, callback: ret => this.display.levelTextFade = 1 - ret });
        }
        this.display.foodFade = 0;
    }

    smove.addDot = function (dotPos, delay = 0) {
        var speed = 0.07 + Math.floor((this.states.level - 1) / 5) / 100;
        var newDot = {
            x: 0,
            y: 0,
            speedX: 0,
            speedY: 0,
        };
        if (dotPos >= 6) {
            newDot.speedY = speed * (dotPos >= 9 ? -1 : 1);
            newDot.x = dotPos % 3 - 1;
            newDot.y = -delay * (dotPos >= 9 ? -1 : 1) + newDot.speedY * -120;
        } else {
            newDot.speedX = speed * (dotPos >= 3 ? -1 : 1);
            newDot.y = dotPos % 3 - 1;
            newDot.x = -delay * (dotPos >= 3 ? -1 : 1) + newDot.speedX * -120;
        }
        this.states.blackDots.push(newDot);
        this.states.lastDotTime = frameCount;
    }

    smove.levelRule = function (level) {
        return this.levelData[(this.states.level - 1) % this.levelData.length];
    }

    smove.gameOver = function () {
        this.states.gameState = Smove.GameState.End;
        if (this.bestScore < this.states.score) {
            this.bestScore = this.states.score;
            if (typeof (window.localStorage) === "object")
                window.localStorage.setItem("SmoveBestScore", this.bestScore);
        }
        Animation({ duration: 1000, endValue: 1, curve: Animation.SquareOut, callback: ret => this.display.endAnimation = ret });
    }

    smove.reset = function () {
        this.states = {
            gameState: Smove.GameState.Start,
            level: 1,
            score: 0,
            whiteDot: {
                x: 0,
                y: 0,
                motive: false,
            },
            food: null,
            blackDots: [],
            lastFoodTime: null,
            lastDotTime: null,
        };

        this.display = {
            quake: { x: 0, y: 0 },
            startTextFade: 1,
            levelTextFade: 0,
            endAnimation: 0,
            foodFade: 0,
            foodRotate: 0,
        }
    }

    smove.reset();
    return smove;
}

Smove.GameState = {
    Start: 1,
    Playing: 2,
    End: 3,
};

function distance(point1, point2) {
    return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2))
}

function prerender(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas;
};

var frameCount = 0;

function gameTimeout() {
    if (smove.states.gameState === Smove.GameState.End) {
        repaint();
        setTimeout(gameTimeout, 15);
        return;
    }

    if (smove.states.gameState === Smove.GameState.Playing && smove.states.food === null) {
        if (smove.states.score % 10 !== 0 && frameCount - smove.states.lastFoodTime >= 30)
            smove.addFood();
        else if (smove.states.score % 10 === 0 && frameCount - smove.states.lastFoodTime >= 150)
            smove.addFood();
    }

    var speed = 0.07 + Math.floor((smove.states.level - 1) / 5) / 100;
    if (frameCount - smove.states.lastDotTime >= smove.levelRule().interval / speed
        && (smove.states.food || smove.states.score % 10 !== 0)) {
        smove.levelRule().dots();
    }

    for (let dot of smove.states.blackDots) {
        dot.x += dot.speedX;
        dot.y += dot.speedY;
    }

    if (smove.states.food && distance(smove.states.whiteDot, smove.states.food) <= 0.2)
        smove.eatFood();
    
    for (let dot of smove.states.blackDots) {
        if (distance(smove.states.whiteDot, dot) <= 0.7) {
            smove.gameOver();
            break;
        }
    }

    repaint();
    frameCount++;
    setTimeout(gameTimeout, 15);
}

function repaint() {
    ctx = document.getElementById("smove").getContext("2d");
    ctx.clearRect(0, 0, 800, 600);
    var quake = smove.display.quake;
    // NOTICE: Up is the positive direction of y-axis.
    ctx.translate(quake.x * 6, -quake.y * 6);

    // Fade out when game ends
    if (smove.display.endAnimation) {
        ctx.globalAlpha = 1 - smove.display.endAnimation * 0.8;
        ctx.translate(400, 300);
        ctx.rotate(smove.display.endAnimation / 2);
        ctx.scale(1 + 2 * smove.display.endAnimation, 1 + 2 * smove.display.endAnimation);
        ctx.translate(-400, -300);
    }

    // Render board
    ctx.drawImage(smove.resource.image.board, 310, 200);

    // Render food
    if (smove.states.food !== null) {
        var oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = smove.display.foodFade * oldAlpha;
        ctx.translate(401 + smove.states.food.x * 54, 291 - smove.states.food.y * 54);
        ctx.rotate(smove.display.foodRotate);
        if (smove.states.score % 10 === 9)
            ctx.drawImage(smove.resource.image.levelfood, -8, -8);
        else
            ctx.drawImage(smove.resource.image.food, -8, -8);
        ctx.rotate(-smove.display.foodRotate);
        ctx.translate(-401 - smove.states.food.x * 54, -291 + smove.states.food.y * 54);
        ctx.globalAlpha = oldAlpha;
    }

    // Render dots
    ctx.drawImage(smove.resource.image.white, 370 + smove.states.whiteDot.x * 54, 260 - smove.states.whiteDot.y * 54);
    for (let dot of smove.states.blackDots)
        ctx.drawImage(smove.resource.image.black, 370 + dot.x * 54, 260 - dot.y * 54);

    // Render text
    ctx.font = "36px 'Calibri Light'";
    ctx.textAlign = 'center';
    if (smove.display.startTextFade) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + smove.display.startTextFade + ')';
        ctx.fillText("PRESS ARROW KEY", 400, 180);
    }
    if (smove.display.levelTextFade) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + smove.display.levelTextFade + ')';
        ctx.fillText("LEVEL " + smove.states.level, 400, 180);
    }
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText("BEST: " + smove.bestScore, 40, 40);
    ctx.font = "100px 'Calibri Light'";
    ctx.fillText(String(smove.states.score), 40, 140);
    if (smove.display.endAnimation) {
        ctx.globalAlpha = 1.0;
        ctx.translate(400, 300);
        ctx.scale(1 / (1 + 2 * smove.display.endAnimation), 1 / (1 + 2 * smove.display.endAnimation));
        ctx.rotate(-smove.display.endAnimation / 2);
        ctx.translate(-400, -300);
        ctx.font = "48px 'Calibri Light'";
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, ' + smove.display.endAnimation + ')';
        ctx.fillText("GAME OVER", 400, 140);
        ctx.fillText("PRESS ARROW KEY", 400, 500);
        ctx.font = "200px 'Calibri Light'";
        ctx.fillText(String(smove.states.score), 400, 380);
    }

    // Reset quake translation
    ctx.translate(-quake.x * 6, quake.y * 6);
}

function requestWhiteDotMove(x, y) {
    if (smove.states.gameState === Smove.GameState.End) {
        if (smove.display.endAnimation === 1)
            smove.reset();
        return;
    }

    // Disable operations when white dot is motive
    if (smove.states.whiteDot.motive)
        return;

    // Out of range
    if (x < -1 || x > 1 || y < -1 || y > 1)
        return;

    if (smove.states.gameState === Smove.GameState.Start) {
        Animation({ duration: 250, callback: ret => smove.display.startTextFade = 1 - ret });
        Animation({ delay: 250, duration: 250, callback: ret => smove.display.levelTextFade = ret });
        Animation({ delay: 2000, duration: 250, callback: ret => smove.display.levelTextFade = 1 - ret });
        smove.states.gameState = Smove.GameState.Playing;
        frameCount = 0;
        smove.states.lastFoodTime = 0;
        smove.states.lastDotTime = 0;
    }

    Animation({
        startValue: smove.states.whiteDot.x,
        endValue: x,
        curve: Animation.SquareOut,
        callback: ret => smove.isPlaying() && (smove.states.whiteDot.x = ret),
        onEnd: function () { smove.states.whiteDot.motive = false; },
    });
    Animation({
        startValue: smove.states.whiteDot.y,
        endValue: y,
        curve: Animation.SquareOut,
        callback: ret => smove.isPlaying() && (smove.states.whiteDot.y = ret),
    });

    if (Math.abs(smove.states.whiteDot.x) !== 1 && Math.abs(x) === 1)
        Animation({
            duration: 60,
            delay: 40,
            callback: ret => smove.display.quake.x = x * 4 * ret * (1 - ret)
        });
    if (Math.abs(smove.states.whiteDot.y) !== 1 && Math.abs(y) === 1)
        Animation({
            duration: 60,
            delay: 40,
            callback: ret => smove.display.quake.y = y * 4 * ret * (1 - ret)
        });

    smove.states.whiteDot.motive = true;
}

window.addEventListener("load", function () {
    // Adapt to window
    window.onresize();

    // Load best score
    if (typeof (window.localStorage) === "object" && window.localStorage.getItem("SmoveBestScore"))
        smove.bestScore = Number(window.localStorage.getItem("SmoveBestScore"))

    // Prerender images;
    for (let img in smove.resource.image)
        smove.resource.image[img] = prerender(smove.resource.image[img]);

    // Start rendering
    setTimeout(gameTimeout, 15);

    // Rotate food
    Animation({ endValue: 2 * Math.PI, duration: 5000, callback: ret => smove.isPlaying() && (smove.display.foodRotate = ret), forever: true })
});

window.onresize = function () {
    var canvas = document.getElementById("smove");
    var center = document.getElementById("center");
    var scale = center.clientWidth / canvas.width;
    if (scale < 1)
        canvas.style.zoom = scale;
    else
        canvas.style.zoom = "";
}

document.onkeydown = function (event) {
    switch (event.which) {
        case 37: // left
            requestWhiteDotMove(smove.states.whiteDot.x - 1, smove.states.whiteDot.y);
            event.preventDefault();
            break;
        case 38: // up
            requestWhiteDotMove(smove.states.whiteDot.x, smove.states.whiteDot.y + 1);
            event.preventDefault();
            break;
        case 39: // right
            requestWhiteDotMove(smove.states.whiteDot.x + 1, smove.states.whiteDot.y);
            event.preventDefault();
            break;
        case 40: // down
            requestWhiteDotMove(smove.states.whiteDot.x, smove.states.whiteDot.y - 1);
            event.preventDefault();
            break;
    }
};

var touchPoint = null;

window.addEventListener("touchstart", function(event) {
    touchPoint = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
    }
});

window.addEventListener("touchmove", function(event) {
    if (!touchPoint)
        return;

    var xDiff = event.changedTouches[0].clientX - touchPoint.x;
    var yDiff = event.changedTouches[0].clientY - touchPoint.y;
    if (Math.max(Math.abs(xDiff), Math.abs(yDiff)) >= 4) { // Minimal swipe distanse
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff < 0) // left
                requestWhiteDotMove(smove.states.whiteDot.x - 1, smove.states.whiteDot.y);
            else // right
                requestWhiteDotMove(smove.states.whiteDot.x + 1, smove.states.whiteDot.y);
        } else {
            if (yDiff < 0) // up
                requestWhiteDotMove(smove.states.whiteDot.x, smove.states.whiteDot.y + 1);
            else // down
                requestWhiteDotMove(smove.states.whiteDot.x, smove.states.whiteDot.y - 1);
        }
        touchPoint = null;
    }
});

smove = new Smove();
