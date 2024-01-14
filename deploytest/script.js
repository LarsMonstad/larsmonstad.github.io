const CANVAS_SIZE = 280;
const CANVAS_SCALE = 0.5;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const clearButton = document.getElementById("clear-button");
const predictButton = document.getElementById("predict-button");
const predictionResult = document.getElementById("predictionResult");

let isMouseDown = false;
let lastX = 0;
let lastY = 0;

ctx.lineWidth = 28;
ctx.lineJoin = "round";
ctx.strokeStyle = "#212121";
ctx.font = "28px sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillStyle = "#212121";
ctx.fillText("Draw here!", CANVAS_SIZE / 2, CANVAS_SIZE / 2);

function clearCanvas() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    predictionResult.innerText = "Prediction will appear here";
}

function drawLine(fromX, fromY, toX, toY) {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.closePath();
    ctx.stroke();
}

function canvasMouseDown(event) {
    isMouseDown = true;
    const x = event.offsetX / CANVAS_SCALE;
    const y = event.offsetY / CANVAS_SCALE;
    lastX = x + 0.001;
    lastY = y + 0.001;
    canvasMouseMove(event);
}

function canvasMouseMove(event) {
    const x = event.offsetX / CANVAS_SCALE;
    const y = event.offsetY / CANVAS_SCALE;
    if (isMouseDown) {
        drawLine(lastX, lastY, x, y);
    }
    lastX = x;
    lastY = y;
}

function bodyMouseUp() {
    isMouseDown = false;
}

function bodyMouseOut(event) {
    if (!event.relatedTarget || event.relatedTarget.nodeName === "HTML") {
        isMouseDown = false;
    }
}

function sendPredictionRequest() {
    // Convert canvas to data URL (image)
    var canvasDataURL = canvas.toDataURL('image/png');

    // Convert data URL to blob
    fetch(canvasDataURL)
        .then(res => res.blob())
        .then(blob => {
            let formData = new FormData();
            formData.append('file', blob, 'canvas_image.png');

            fetch('https://flasktestjanuar-a1eae1288c2b.herokuapp.com/predict', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                predictionResult.innerText = 'Prediction: ' + data.prediction;
            })
            .catch(error => {
                console.error('Error:', error);
                predictionResult.innerText = 'Error in prediction';
            });
        });
}

predictButton.addEventListener("click", function() {
    sendPredictionRequest();
});


canvas.addEventListener("mousedown", canvasMouseDown);
canvas.addEventListener("mousemove", canvasMouseMove);
document.body.addEventListener("mouseup", bodyMouseUp);
document.body.addEventListener("mouseout", bodyMouseOut);
clearButton.addEventListener("mousedown", clearCanvas);
