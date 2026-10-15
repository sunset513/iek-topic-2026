(function () {
    var animation = document.getElementById('homeAnimation');
    var cardStage = document.getElementById('cardStage');
    var runner = document.getElementById('runner');

    if (!animation || !cardStage || !runner) {
        return;
    }

    var cards = Array.prototype.slice.call(cardStage.querySelectorAll('.card-wrap'));
    var cardProgress = cards.map(function (card) {
        return Number(card.getAttribute('data-progress') || 0);
    });
    var runnerFrames = [
        './images/runner-01.png?20260915',
        './images/runner-02.png?20260915',
        './images/runner-03.png?20260915',
        './images/runner-04.png?20260915',
        './images/runner-05.png?20260915',
        './images/runner-06.png?20260915'
    ];
    var runnerProgress = 0;
    var runnerStartX = 0;
    var runnerCenterX = 0;
    var runnerTravel = 1;
    var runnerWidth = 0;
    var runnerFrameIndex = 0;
    var runnerVelocity = 0;
    var runnerCadence = 0;
    var runnerState = 'approach';
    var gaitPhase = 0;
    var speed = 140;
    var paused = false;
    var last = performance.now();
    var ACCELERATION_TIME = .35;
    var STRIDE_DISTANCE = 130;
    var BOB_DISTANCE = 2.5;
    var CONTACT_SQUASH = .025;
    var preloadedFrames = [];

    function measureRunner() {
        var animationRect = animation.getBoundingClientRect();
        var cardRadiusX = Math.min(animationRect.width * .36, 360);
        var cardAreaLeft = animationRect.width / 2 - cardRadiusX;

        runnerWidth = runner.getBoundingClientRect().width || animation.clientWidth * .55;
        runnerStartX = cardAreaLeft - runnerWidth;
        runnerCenterX = Math.max(0, (animation.clientWidth - runnerWidth) / 2);
        runnerTravel = Math.max(runnerCenterX - runnerStartX, 1);
    }

    function renderCards() {
        var rect = animation.getBoundingClientRect();
        var radiusX = Math.min(rect.width * .36, 360);
        var radiusZ = Math.min(rect.width * .16, 170);

        cards.forEach(function (card, index) {
            var progress = cardProgress[index];
            var theta = (-90 + progress * 180) * Math.PI / 180;
            var x = radiusX * Math.sin(theta);
            var z = radiusZ * Math.cos(theta);
            var rotateY = progress * 180;
            var scale = .84 + .20 * (z / radiusZ);
            var opacity = .42 + .58 * Math.pow(Math.sin(progress * Math.PI), .5);

            card.style.transform = 'translate(-50%, -50%) translate3d('
                + x.toFixed(1) + 'px, 0px, ' + z.toFixed(1) + 'px) rotateY('
                + rotateY.toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
            card.style.opacity = opacity.toFixed(3);
            card.style.zIndex = String(1000 + Math.round(z));
        });
    }

    function renderRunner() {
        var normalizedPhase = gaitPhase - Math.floor(gaitPhase);
        var x = runnerStartX + runnerTravel * runnerProgress;
        var contact = (1 - Math.cos(normalizedPhase * Math.PI * 4)) / 2;
        var bob = contact * BOB_DISTANCE;
        var squash = 1 - contact * CONTACT_SQUASH;
        var frameIndex = Math.floor(normalizedPhase * runnerFrames.length) % runnerFrames.length;

        if (frameIndex !== runnerFrameIndex) {
            runnerFrameIndex = frameIndex;
            runner.src = runnerFrames[runnerFrameIndex];
        }

        runner.style.transform = 'translate3d(' + x.toFixed(2) + 'px, '
            + bob.toFixed(2) + 'px, 0) scaleY(' + squash.toFixed(4) + ')';
    }

    function render() {
        measureRunner();
        renderCards();
        renderRunner();
    }

    function moveTowards(value, target, amount) {
        if (value < target) {
            return Math.min(value + amount, target);
        }
        return Math.max(value - amount, target);
    }

    function advanceRunner(delta) {
        var acceleration;
        var brakingDistance;
        var distance;
        var previousVelocity;
        var remaining;
        var targetCadence;

        if (runnerState === 'approach') {
            acceleration = Math.max(speed / ACCELERATION_TIME, 1);
            remaining = Math.max(0, runnerTravel * (1 - runnerProgress));
            brakingDistance = runnerVelocity * runnerVelocity / (2 * acceleration);
            previousVelocity = runnerVelocity;

            if (remaining <= brakingDistance + .5) {
                runnerVelocity = Math.max(0, runnerVelocity - acceleration * delta);
            } else {
                runnerVelocity = Math.min(speed, runnerVelocity + acceleration * delta);
            }

            distance = (previousVelocity + runnerVelocity) * .5 * delta;
            if (distance >= remaining || remaining <= .5) {
                distance = remaining;
                runnerProgress = 1;
                runnerState = 'in-place';
                runnerCadence = previousVelocity / STRIDE_DISTANCE;
                runnerVelocity = 0;
            } else {
                runnerProgress += distance / runnerTravel;
            }

            gaitPhase = (gaitPhase + distance / STRIDE_DISTANCE) % 1;
            return;
        }

        targetCadence = speed / STRIDE_DISTANCE;
        runnerCadence = moveTowards(
            runnerCadence,
            targetCadence,
            Math.max(targetCadence / ACCELERATION_TIME, 1) * delta
        );
        gaitPhase = (gaitPhase + runnerCadence * delta) % 1;
    }

    function preloadRunnerFrames(callback) {
        var remaining = runnerFrames.length;

        function frameReady() {
            remaining -= 1;
            if (remaining === 0) {
                callback();
            }
        }

        runnerFrames.forEach(function (src) {
            var image = new Image();
            var settled = false;

            function finish() {
                if (settled) {
                    return;
                }
                settled = true;
                frameReady();
            }

            image.onload = function () {
                if (typeof image.decode === 'function') {
                    image.decode().then(finish, finish);
                } else {
                    finish();
                }
            };
            image.onerror = finish;
            image.src = src;
            preloadedFrames.push(image);
        });
    }

    function tick(now) {
        var delta = Math.min((now - last) / 1000, .05);
        last = now;

        if (!paused) {
            var cardSpeed = .04 + ((speed - 80) / 340) * .16;
            cardProgress = cardProgress.map(function (progress) {
                progress -= cardSpeed * delta;
                return progress < 0 ? progress + 1 : progress;
            });
            measureRunner();
            advanceRunner(delta);
            renderCards();
            renderRunner();
        }

        requestAnimationFrame(tick);
    }

    window.addEventListener('resize', render);

    render();
    preloadRunnerFrames(function () {
        last = performance.now();
        requestAnimationFrame(tick);
    });
}());
