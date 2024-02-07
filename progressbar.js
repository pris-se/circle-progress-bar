const defaults = {
    init: true,
    lineWidth: 10,
    lineCapStyle: "round",
    speed: 1000,
    track: {
        enabled: true,
        gradient: null,
        options: {
            strokeStyle: "#F3F3F3",
            fillStyle: "transparent",
            shadowColor: null,
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
        }
    },
    progress: {
        enabled: true,
        gradient: {
            colors: {
                "0": "rgba(255, 255, 255, 0.36)",
                "0.2": "rgba(255, 255, 255, 0.00)",
                "0.4": "rgba(255, 255, 255, 0.00)",
                "0.6": "rgba(255, 255, 255, 0.00)",
                "0.8": "rgba(255, 255, 255, 0.00)",
                "1": "rgba(255, 255, 255, 0.36)",
            },
            direction: 225,
        },
        options: {
            strokeStyle: "#FF5C00",
            fillStyle: "transparent",
            shadowColor: null,
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
        }
    },
    textElement: null,
    textElementModifier: null,
    loop: {
        enabled: false,
        options: {
            lineLength: 25,
        }
    }
};

class CircleProgressBar {
    _isAnimate = false;
    _increment = 1;
    _isForward = true;
    _currentValue = 0;
    _maxValue = 100;
    constructor(element, options) {
        this.canvas =
            typeof element === "string"
                ? document.querySelector(element)
                : element;
        this.radius = this.canvas.width / 2;
        this.context = this.canvas.getContext("2d");
        this.options = defaults
        this.deepMerge(this.options, options);
        this.options.init && this.init()
    }
    draw(options, shouldAnimate = false) {
        let step = shouldAnimate ? this._currentValue : 100;
        let startPos = this.calculateStartAngle(step, shouldAnimate);
        let endPos = this.calculateEndAngle(step);
        this.context.beginPath();
        this.context.arc(this.radius, this.radius, this.radius - this.options.lineWidth, startPos, endPos);
        if (options) this.setupContextProperties(options);
        this.context.stroke();
        this.context.fill();
        this.context.closePath();
    }
    inRange(min, max, value) {
        return Math.max(Math.min(value, max), min)
    };
    calculateStartAngle(step, shouldAnimate) {
        if (shouldAnimate && this.options.loop?.enabled) {
            return (Math.PI / 180) * (270 + (step - this.options.loop.options.lineLength) * 3.6);
        } else {
            return (Math.PI / 180) * 270;
        }
    }
    calculateEndAngle(step) {
        return (Math.PI / 180) * (270 + step * 3.6);
    }
    setupContextProperties(options) {
        this.context.lineWidth = this.options.lineWidth;
        this.context.lineCap = this.options.lineCapStyle;
        Object.keys(options).forEach(option => {
            this.context[option] = options[option]
        })

    }
    setupQuality() {
        const dpi = window.devicePixelRatio
        const rect = this.canvas.getBoundingClientRect()
        const { width, height } = rect
        this.canvas.width = width * dpi
        this.canvas.height = height * dpi
        this.context.scale(dpi, dpi)
        this.canvas.style.width = width + "px"
        this.canvas.style.height = height + "px"
        this.render()
    }
    createLinearGradient(options) {
        const { colors, direction } = options;
        const gradient = this.context.createLinearGradient(0, 0, 0, direction);
        const keys = Object.keys(colors);
        keys.forEach(key => {
            gradient.addColorStop(Number(key), colors[key]);
        })
        return gradient;
    }
    calcDirection(value) {
        if (typeof value === "number") {
            const isForward = this._currentValue < this._maxValue;
            this._isForward = isForward;
            const increment = Math.abs(this._increment);
            this._increment = isForward ? increment : -increment;
        }
    }
    isEnd() {
        const isStartValueGreater = this._currentValue >= this._maxValue;
        const isEndValueGreater = this._maxValue >= this._currentValue;
        if (this._increment > 0) {
            this.emit("isEnd")
            return isStartValueGreater;
        } else {
            this.emit("isEnd")
            return isEndValueGreater
        }

    }
    /**
     * @param {number} value
     */
    set currentValue(value) {
        if (this.options.loop?.enabled) {
            this._currentValue = value
        } else {
            this._currentValue =
                this._isForward ? Math.min(value, this._maxValue) : Math.max(value, this._maxValue)
        }

    }
    increment() {
        const incrementedValue = this._currentValue + this._increment;
        this.currentValue = incrementedValue

    }
    animate() {
        if (this._isAnimate && (this.options.loop?.enabled || !this.isEnd())) {
            requestAnimationFrame(() => {
                this.increment()
                this.clear();
                this.render()
                this.renderText()
                requestAnimationFrame(this.animate.bind(this));
            });
        } else {
            this.render()
            this.renderText()
            this.emit("done")
        }
    }
    run(value = null) {
        this._timeStamp = Date.now()
        this._maxValue = typeof value === "number" && !isNaN(value)
            ? value
            : this._maxValue;
        this.calcDirection(value);
        this._isAnimate = true;
        this.animate();
        this.emit("play")

    }
    render() {
        const options = this.options
        const { track, progress } = options
        if (track.enabled) {
            this.draw(track.options);
            if (track.gradient) {
                const gradient = this.createLinearGradient(track.gradient)
                this.draw({ strokeStyle: gradient });
            }
        }
        if (progress.enabled) {
            this.draw(progress.options, true);
            if (progress.gradient) {
                const gradient = this.createLinearGradient(progress.gradient)
                this.draw({ strokeStyle: gradient }, true);
            }
        }
        this.emit("render")

    }
    renderText() {
        if (this.options.textElement) {
            const value = Math.max(Number(this._currentValue), 0).toFixed(2)
            if (!this.options.textElementModifier) {
                this.options.textElement.innerHTML = value;
            } else {
                this.options.textElement.innerHTML = this.options.textElementModifier(value)
            }
        }
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    pause() {
        this._isAnimate = false;
        this.emit("pause")
    }
    stop() {
        this.pause();
        this._currentValue = 0;
        this.clear();
        this.render()
        if (this.options.textElement) {
            this.options.textElement.innerHTML = 0;
        }
    }
    reset() {
        this.stop()
        this._maxValue = 0
    }
    restart() {
        this.stop();
        this.run();
    }
    setSpeed(value) {
        if (isNaN(value) || typeof value !== "number") {
            console.warn("invalid value", typeof value)
            return;
        }
        this._increment = value;
    }
    on(event, handler) {
        this.canvas.addEventListener(event, handler);
    }
    emit(type, data = null) {
        const customEvent = new CustomEvent(type, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        this.canvas.dispatchEvent(customEvent);
    }
    deepMerge(target, ...objects) {
        objects.filter(o => o).forEach((obj) => {
            for (let [key, value] of Object.entries(obj)) {
                let arrayOrObject = value !== undefined ? value.toString() === ('[object Object]' || '[object Array]') : false;

                if (arrayOrObject) {
                    let targetType = target[key] !== undefined ? target[key].toString() : undefined,
                        sourceType = value.toString(),
                        initialValue = Array.isArray(value) ? [] : {};
                    target[key] = target[key]
                        ? targetType !== sourceType
                            ? initialValue
                            : target[key]
                        : initialValue;

                    this.deepMerge(target[key], value);
                } else {
                    target[key] = value;
                }
            }
        });

        return target;
    }
    init() {
        if (this.canvas !== null) {
            this.setupQuality()
            this.emit("init")
        }
    }
}


const canvasElements = document.querySelectorAll(".progressbar");
canvasElements.forEach(canvasElement => {
    const progressBar = new CircleProgressBar(canvasElement, {
        textElement: canvasElement.parentElement.querySelector(".progressbar-wrapper .progressbar__value"),
        textElementModifier: (value) => {
            return value + "%"
        },
    });

    window.chart = progressBar
    progressBar.run(85)
})



