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

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function sendPredictionRequest() {
    var dataURL = canvas.toDataURL('image/png');
    var blob = dataURLtoBlob(dataURL);
    let formData = new FormData();
    formData.append('file', blob, 'canvas_image.png');

    fetch('https://flasktestjanuar-a1eae1288c2b.herokuapp.com/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.prediction !== undefined) {
            predictionResult.innerText = 'Prediction: ' + data.prediction + ', Class Name: ' + data.class_name;
        } else {
            predictionResult.innerText = 'Error: Unexpected response format';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        predictionResult.innerText = 'Error in prediction';
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
