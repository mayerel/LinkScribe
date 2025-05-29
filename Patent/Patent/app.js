const form = document.getElementById('patentForm');
const descriptionInput = document.getElementById('description');
const apiKeyInput = document.getElementById('apiKey');
const statusDiv = document.getElementById('status');
const imageContainer = document.getElementById('imageContainer');
const patentImage = document.getElementById('patentImage');
const generateBtn = document.getElementById('generateBtn');

async function generatePatentDrawing(prompt, apiKey) {
  const url = 'https://api.openai.com/v1/images/generations';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
  const body = JSON.stringify({
    model: 'gpt-image-1',
    prompt: prompt,
    size: '1024x1024',
    quality: 'medium',
    n: 1
  });
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body
  });
  if (!response.ok) {
    let msg = 'API error';
    try {
      const errData = await response.json();
      msg = errData.error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  const data = await response.json();
  if (!data.data || !data.data[0] || !data.data[0].b64_json) throw new Error('No image returned.');
  return data.data[0].b64_json;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusDiv.textContent = '';
  patentImage.style.display = 'none';
  imageContainer.style.display = 'block';
  generateBtn.disabled = true;
  const prompt = descriptionInput.value.trim();
  const apiKey = apiKeyInput.value.trim();
  if (!prompt || !apiKey) {
    statusDiv.textContent = 'Please enter a description and API key.';
    generateBtn.disabled = false;
    return;
  }
  statusDiv.textContent = 'Generating drawing...';
  try {
    const b64 = await generatePatentDrawing(prompt, apiKey);
    patentImage.src = `data:image/png;base64,${b64}`;
    patentImage.style.display = 'block';
    statusDiv.textContent = '';
  } catch (err) {
    statusDiv.textContent = err.message || 'Something went wrong!';
  } finally {
    generateBtn.disabled = false;
  }
}); 