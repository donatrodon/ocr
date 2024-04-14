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

function resizeImage(file, callback) {
    const maxWidth = 1024;
    const maxHeight = 768;
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;

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
            canvas.toBlob((blob) => {
                callback(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.7);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function recognizeText(imageFile) {
    showLoader(true);
    resizeImage(imageFile, (imageDataUrl) => {
        Tesseract.recognize(
            imageDataUrl,
            'ara', // Or change dynamically based on user selection
            {
                logger: m => console.log(m.status + ' ' + (m.progress * 100).toFixed(1) + '%'),
            }
        ).then(({ data: { text } }) => {
            document.getElementById('output').value = text;
            showLoader(false);
            document.getElementById('startBtn').disabled = false; // Re-enable the button after processing
        }).catch(err => {
            console.error('OCR Error:', err);
            showLoader(false);
            document.getElementById('startBtn').disabled = false; // Re-enable the button after error
            alert('Error processing image!');
        });
    });
}
