const imageLoader = document.getElementById('imageLoader');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const magnifier = document.getElementById('magnifierCanvas');
const magCtx = magnifier.getContext('2d');
const zoomFactor = 10;

const colorInfo = document.getElementById('colorInfo');
const colorPreview = document.getElementById('colorPreview');
const hexValue = document.getElementById('hexValue');
const rgbaValue = document.getElementById('rgbaValue');
        
const copyHexBtn = document.getElementById('copyHex');
const copyRgbaBtn = document.getElementById('copyRgba');
const toast = document.getElementById('toast');

// Handle image upload
imageLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
            // Set canvas dimensions to match image
                canvas.width = img.width;
                canvas.height = img.height;
                // Draw image on canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Function to get color from canvas
function pickColor(event) {
    // Get the position of the mouse click relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY
    // Get the pixel data from the canvas at the clicked position
    // getImageData returns an array of color data for a 1x1 pixel area
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const a = pixel[3] / 255; // Alpha is 0-255, convert to 0-
    const rgba = `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    // Convert RGB to HEX
    const hex = `#${('0' + r.toString(16)).slice(-2)}${('0' + g.toString(16)).slice(-2)}${('0' + b.toString(16)).slice(-2)}`;
    
    // Update the UI with the new color information
    updateColorInfo(hex, rgba);
}

// Add click event listener to the canvas
canvas.addEventListener('click', pickColor)
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseenter', () => magnifier.classList.remove('hidden'));
canvas.addEventListener('mouseleave', () => magnifier.classList.add('hidden'));

// HANDLE THE MAGNIFIER LOGIC
function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Calculate mouse position on the source canvas
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Position the magnifier circle near the cursor
    magnifier.style.left = `${event.clientX - rect.left - magnifier.width / 2}px`;
    magnifier.style.top = `${event.clientY - rect.top - magnifier.height / 2}px`;
    
    // Clear the magnifier canvas
    magCtx.clearRect(0, 0, magnifier.width, magnifier.height);
    magCtx.fillStyle = '#fff'; // Optional: background for the magnifier
    magCtx.fillRect(0, 0, magnifier.width, magnifier.height);
    
    // Draw the magnified portion of the image
    magCtx.drawImage(
        canvas, // source canvas
        x - (magnifier.width / (2 * zoomFactor)), // source x
        y - (magnifier.height / (2 * zoomFactor)), // source y
        magnifier.width / zoomFactor, // source width
        magnifier.height / zoomFactor, // source height
        0, // destination x
        0, // destination y
        magnifier.width, // destination width
        magnifier.height // destination height
    );
        
    // Draw a crosshair or highlight in the center of the magnifier
    const centerX = magnifier.width / 2;
    const centerY = magnifier.height / 2;
    magCtx.strokeStyle = '#000';
    magCtx.lineWidth = 2;
    // Draw a 1-pixel rectangle highlight around the center pixel
    magCtx.strokeRect(centerX - zoomFactor / 2, centerY - zoomFactor / 2, zoomFactor, zoomFactor);
}

// Function to update the color information display
function updateColorInfo(hex, rgba) {
    colorPreview.style.backgroundColor = hex;
    hexValue.textContent = hex.toUpperCase();
    rgbaValue.textContent = rgba;
    
    // Make the color info visible if it's hidden
    if (colorInfo.classList.contains('opacity-0')) {
        colorInfo.classList.remove('opacity-0');
    }
}
        
// Function to copy text to clipboard and show toast
function copyToClipboard(text, button) {
    // Using execCommand as a fallback for broader browser support in iFrames
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast();
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
}

// Function to show a toast notification
function showToast() {
    toast.classList.remove('opacity-0', 'translate-y-10');
    toast.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-10');
    }, 2000);
}

// Event listeners for copy buttons
copyHexBtn.addEventListener('click', () => copyToClipboard(hexValue.textContent));
copyRgbaBtn.addEventListener('click', () => copyToClipboard(rgbaValue.textContent));

