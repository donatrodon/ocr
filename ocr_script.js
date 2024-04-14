document.getElementById('imageInput').addEventListener('change', function(e) {
    const imageFile = e.target.files[0];
    if (!imageFile) {
        alert('No file selected!');
        return;
    }
    // Enable the button only after a file is selected
    document.getElementById('startBtn').disabled = false;
});

document.getElementById('startBtn').addEventListener('click', () => {
    // Disable the button immediately when clicked to prevent multiple submissions
    document.getElementById('startBtn').disabled = true;
    const imageFile = document.getElementById('imageInput').files[0];
    if (imageFile) {
        recognizeText(imageFile);
    } else {
        alert('Please select an image file first!');
    }
});

function showLoader(show) {
    document.getElementById('loader').style.display = show ? 'block' : 'none';
}

function resizeAndConvertImage(file, callback) {
    const maxWidth = 1024;
    const maxHeight = 768;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;

            // Calculate the new dimensions based on maximum sizes
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            // Convert and output as PNG
            canvas.toBlob((blob) => {
                callback(URL.createObjectURL(blob)), 'image/png';
            }, 'image/png');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function recognizeText(imageFile) {
    document.getElementById('loader').style.display = 'block'; // Show loading indicator
    resizeAndConvertImage(imageFile, (imageDataUrl) => {
        Tesseract.recognize(
            imageDataUrl,
            'ara', // Specify Arabic language
            {
                logger: m => console.log(`${m.status} ${Math.round(m.progress * 100)}%`)
            }
        ).then(({ data: { text } }) => {
            document.getElementById('output').value = text;
            document.getElementById('loader').style.display = 'none'; // Hide loading indicator
        }).catch(err => {
            console.error('OCR Error:', err);
            document.getElementById('loader').style.display = 'none'; // Hide loading indicator
            alert('Error processing image!');
        });
    });
}
