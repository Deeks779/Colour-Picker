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

    const pickEvent = event.changedTouches ? event.changedTouches[0] : event;

    // Get the position of the mouse click relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (pickEvent.clientX - rect.left) * scaleX;
    const y = (pickEvent.clientY - rect.top) * scaleY;
    // Get the pixel data from the canvas at the clicked position
    // getImageData returns an array of color data for a 1x1 pixel area
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const a = pixel[3] / 255;
    const rgba = `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    // Convert RGB to HEX
    const hex = `#${('0' + r.toString(16)).slice(-2)}${('0' + g.toString(16)).slice(-2)}${('0' + b.toString(16)).slice(-2)}`;
    
    // Update the UI with the new color information
    updateColorInfo(hex, rgba);
}


// Handle mouse movement for 11x11 grid [not works properly]
// function handleMouseMove(event) {
//     const rect = canvas.getBoundingClientRect();
//     const scaleX = canvas.width / rect.width;
//     const scaleY = canvas.height / rect.height;

//     // --- Part 1: Position the magnifier ---
//     const mouseX = event.clientX - rect.left;
//     const mouseY = event.clientY - rect.top;
//     const canvasX = mouseX * scaleX;
//     const canvasY = mouseY * scaleY;
    
//     const offsetX = 20;
//     const offsetY = 20;
//     let magLeft = mouseX + offsetX;
//     let magTop = mouseY + offsetY;
//     if (magLeft + magnifier.width > rect.width) {
//         magLeft = mouseX - magnifier.width - offsetX;
//     }
//     if (magTop + magnifier.height > rect.height) {
//         magTop = mouseY - magnifier.height - offsetY;
//     }
//     magnifier.style.left = `${magLeft}px`;
//     magnifier.style.top = `${magTop}px`;
    
//     // --- Part 2: Draw the grid ---
//     const gridSize = 11; 

//     // Use smaller dimension so grid fits fully inside circle
//     const pixelSize = Math.min(magnifier.width, magnifier.height) / gridSize;
//     const gridDrawWidth = gridSize * pixelSize;
//     const gridDrawHeight = gridSize * pixelSize;

//     // Center the grid inside the magnifier
//     const offsetXGrid = (magnifier.width - gridDrawWidth) / 2;
//     const offsetYGrid = (magnifier.height - gridDrawHeight) / 2;

//     const centerIndex = Math.floor(gridSize / 2);

//     magCtx.clearRect(0, 0, magnifier.width, magnifier.height);
//     magCtx.setTransform(1, 0, 0, 1, 0, 0);
//     magCtx.save();

//     // Clip to circular magnifier
//     magCtx.beginPath();
//     magCtx.arc(magnifier.width / 2, magnifier.height / 2, magnifier.width / 2, 0, Math.PI * 2);
//     magCtx.clip();

//     for (let y = 0; y < gridSize; y++) {
//         for (let x = 0; x < gridSize; x++) {
//             // Map grid cell to actual canvas pixel (centered around mouse)
//             let sourceX = Math.round(canvasX + (x - centerIndex));
//             let sourceY = Math.round(canvasY + (y - centerIndex));

//             // Clamp to bounds
//             sourceX = Math.max(0, Math.min(sourceX, canvas.width - 1));
//             sourceY = Math.max(0, Math.min(sourceY, canvas.height - 1));

//             const pixelData = ctx.getImageData(sourceX, sourceY, 1, 1).data;
            
//             // Draw pixel block
//             magCtx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
//             magCtx.fillRect(offsetXGrid + x * pixelSize, offsetYGrid + y * pixelSize, pixelSize, pixelSize);

//             // Draw grid lines (highlight center cell)
//             if (x === centerIndex && y === centerIndex) {
//                 magCtx.strokeStyle = 'red';
//                 magCtx.lineWidth = 2;
//             } else {
//                 magCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
//                 magCtx.lineWidth = 1;
//             }
//             magCtx.strokeRect(offsetXGrid + x * pixelSize, offsetYGrid + y * pixelSize, pixelSize, pixelSize);
//         }
//     }

//     magCtx.restore();
// }

// Handle mouse movement for 11x7 grid 
function handleMouseMove(event) {
    // Prevent the page from scrolling when you drag your finger on the canvas
    event.preventDefault();
    const moveEvent = event.touches ? event.touches[0] : event;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Position the magnifier
    const mouseX = moveEvent.clientX - rect.left;
    const mouseY = moveEvent.clientY - rect.top;
    const canvasX = mouseX * scaleX;
    const canvasY = mouseY * scaleY;
    
    const offsetX = 15;
    // Place magnifier on LEFT of cursor
    let magLeft = mouseX - magnifier.width - offsetX;
    let magTop = mouseY - magnifier.height / 2;

    // Clamp inside canvas bounds
    if (magLeft < 0) {
        magLeft = mouseX + offsetX;
    }
    if (magTop < 0) {
        magTop = 0;
    }
    if (magTop + magnifier.height > rect.height) {
        magTop = rect.height - magnifier.height;
    }
    magnifier.style.left = `${magLeft}px`;
    magnifier.style.top = `${magTop}px`;
    
    // Draw the grid 
    const cols = 11;  // number of columns
    const rows = 7;   // number of rows

    // Fit grid inside circle
    const pixelWidth = magnifier.width / cols;
    const pixelHeight = magnifier.height / rows;

    const gridDrawWidth = cols * pixelWidth;
    const gridDrawHeight = rows * pixelHeight;

    // Center the grid
    const offsetXGrid = (magnifier.width - gridDrawWidth) / 2;
    const offsetYGrid = (magnifier.height - gridDrawHeight) / 2;

    const centerCol = Math.floor(cols / 2);
    const centerRow = Math.floor(rows / 2);

    magCtx.clearRect(0, 0, magnifier.width, magnifier.height);
    magCtx.setTransform(1, 0, 0, 1, 0, 0);
    magCtx.save();

    // Clip to circular magnifier
    magCtx.beginPath();
    magCtx.arc(magnifier.width / 2, magnifier.height / 2, magnifier.width / 2, 0, Math.PI * 2);
    magCtx.clip();

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            // Map grid cell to actual canvas pixel (centered around mouse)
            let sourceX = Math.round(canvasX + (x - centerCol));
            let sourceY = Math.round(canvasY + (y - centerRow));

            // Clamp to bounds
            sourceX = Math.max(0, Math.min(sourceX, canvas.width - 1));
            sourceY = Math.max(0, Math.min(sourceY, canvas.height - 1));

            const pixelData = ctx.getImageData(sourceX, sourceY, 1, 1).data;
            
            // Fill the grid cell
            magCtx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
            magCtx.fillRect(offsetXGrid + x * pixelWidth, offsetYGrid + y * pixelHeight, pixelWidth, pixelHeight);

            // Draw grid lines (highlight center cell)
            if (x === centerCol && y === centerRow) {
                magCtx.strokeStyle = 'red';
                magCtx.lineWidth = 2;
            } else {
                magCtx.strokeStyle = 'rgba(60, 59, 59, 0.5)';
                magCtx.lineWidth = 1;
            }
            magCtx.strokeRect(offsetXGrid + x * pixelWidth, offsetYGrid + y * pixelHeight, pixelWidth, pixelHeight);
        }
    }

    magCtx.restore();
}


// Add click event listener to the canvas
canvas.addEventListener('click', pickColor)
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseenter', () => magnifier.classList.remove('hidden'));
canvas.addEventListener('mouseleave', () => magnifier.classList.add('hidden'));

canvas.addEventListener('touchmove', handleMouseMove);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    magnifier.classList.remove('hidden');
    handleMouseMove(e);
});
canvas.addEventListener('touchend', (e) => {
    pickColor(e); 
    magnifier.classList.add('hidden');
});
// Function to update the color information display
function updateColorInfo(hex, rgba) {
    colorPreview.style.backgroundColor = hex;
    hexValue.textContent = hex.toUpperCase();
    rgbaValue.textContent = rgba;
    
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