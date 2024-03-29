# CircleProgressBar

CircleProgressBar is a JavaScript library for creating animated circular progress bars.

## Features

- Customizable progress bar styles and animations
- Support for both track and progress gradients
- Easy-to-use API for starting, stopping, and modifying progress

## Usage

1. Include the CircleProgressBar script in your HTML file:

```html
<script src="circle-progress-bar.js"></script>
```

2. Create a canvas element in your HTML file:

```html
<canvas id="progressCanvas" width="200" height="200"></canvas>
```

3. Initialize the progress bar in your JavaScript file:

```javascript
const progressBar = new CircleProgressBar("#progressCanvas", {
    textElement: document.getElementById("progressValue"),
    textElementModifier: (value) => {
        return value + "%";
    },
});

progressBar.run(75); // Start progress at 75%
```

## API

### `new CircleProgressBar(element, options)`

Creates a new instance of the CircleProgressBar.

- `element`: Either a string representing the CSS selector of the canvas element or the canvas element itself.
- `options`: An optional object containing configuration options for the progress bar.

### `run(value)`

Starts the progress animation with an optional initial value.

- `value`: The initial value of the progress bar (default is 0).

### `pause()`

Pauses the progress animation.

### `stop()`

Stops the progress animation and resets the progress bar to 0%.

### `restart()`

Stops the progress animation and restarts it from the beginning.

### `setSpeed(value)`

Sets the speed of the progress animation.

- `value`: The speed value (default is 1).

## Events

The CircleProgressBar instance emits the following events:

- `init`: Fired when the progress bar is initialized.
- `play`: Fired when the progress animation starts.
- `pause`: Fired when the progress animation is paused.
- `done`: Fired when the progress animation completes.
- `isEnd`: Fired when the progress animation reaches its end.

## License

This project is licensed under the [MIT License](LICENSE).
```
