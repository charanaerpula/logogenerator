let generationHistory = [];

function addToHistory(imageData, prompt) {
    const historyItem = {
        imageData,
        prompt,
        timestamp: new Date().toLocaleString()
    };
    generationHistory.unshift(historyItem);
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyContainer = document.getElementById('history-items');
    historyContainer.innerHTML = generationHistory.map((item, index) => `
        <div class="history-item" onclick="restoreFromHistory(${index})">
            <img src="data:image/png;base64,${item.imageData}" alt="Generated logo">
            <p>${item.timestamp}</p>
        </div>
    `).join('');
}

function restoreFromHistory(index) {
    const item = generationHistory[index];
    const image = document.getElementById('generatedImage');
    image.src = `data:image/png;base64,${item.imageData}`;
    image.style.display = 'block';
    document.getElementById('downloadBtn').style.display = 'block';
}

async function generateImage() {
    const brandName = document.getElementById('brandName').value;
    const logoType = document.getElementById('logoType').value;
    const details = document.getElementById('details').value;
    
    if (!brandName) {
        alert('Please enter a brand name');
        return;
    }

    const prompt = `generate a logo image of a brand called ${brandName}, the type of logo is ${logoType}, add more details like ${details}`;
    
    const status = document.getElementById('status');
    const image = document.getElementById('generatedImage');
    const spinner = document.getElementById('spinner');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const imageSize = document.getElementById('imageSize').value;
    
    status.className = '';
    status.textContent = 'Generating image...';
    image.style.display = 'none';
    downloadBtn.style.display = 'none';
    spinner.style.display = 'block';
    generateBtn.disabled = true;
    
    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt,
                size: imageSize 
            })
        });
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        image.src = `data:image/png;base64,${data.image}`;
        image.style.display = 'block';
        downloadBtn.style.display = 'block';
        status.className = 'success';
        status.textContent = 'Image generated successfully!';
        
        // Add to history
        addToHistory(data.image, prompt);
    } catch (error) {
        status.className = 'error';
        status.textContent = `Error: ${error.message}`;
    } finally {
        spinner.style.display = 'none';
        generateBtn.disabled = false;
    }
}

function downloadImage() {
    const image = document.getElementById('generatedImage');
    const link = document.createElement('a');
    link.download = 'generated-image.png';
    link.href = image.src;
    link.click();
}
