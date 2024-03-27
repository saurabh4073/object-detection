document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Load COCO-SSD model
    await tf.setBackend('webgl');
    const model = await cocoSsd.load();

    // Access the webcam
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    // Set the canvas size to match the video
    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });

    // Detect objects on each video frame
    const detectObjects = async () => {
        const predictions = await model.detect(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Check if the video is mirrored
        const isMirrored = video.videoWidth !== video.width;

        // Draw bounding boxes on the video element and display predictions on the video
        predictions.forEach(prediction => {
            let [x, y, width, height] = prediction.bbox;

            // Flip the coordinates back if the video is mirrored
            if (isMirrored) {
                x = video.videoWidth - (x + width);
            }

            // Draw bounding box on the video
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.fillStyle = 'red';
            ctx.stroke();

            // Display predictions on the video
            ctx.fillText(
                `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
                x,
                y > 20 ? y - 10 : 10
            );
        });

        requestAnimationFrame(detectObjects);
    };

    // Start object detection
    video.addEventListener('loadeddata', detectObjects);
});
