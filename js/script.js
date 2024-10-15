const video = document.getElementById('videoElement');
const captureButton = document.getElementById('capture');
const imagesContainer = document.getElementById('imagesContainer');
const instructions = document.getElementById('instructions');
let images = [];
let captureCount = 0;

async function getCameraAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        // Certifique-se de que o vídeo está pronto antes de capturar imagens
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
    } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
        alert("Permissão negada para acessar a câmera. Por favor, permita o acesso nas configurações do seu navegador.");
    }
}

getCameraAccess();

// Atualiza as instruções conforme as imagens são capturadas
function updateInstructions() {
    const steps = [
        "Inicie a captura movendo a câmera para cobrir todo o ambiente.",
        "Mova a câmera lentamente para a esquerda.",
        "Mova a câmera lentamente para a direita.",
        "Mova a câmera para cima para capturar o teto.",
        "Mova a câmera para baixo para capturar o chão.",
        "Repita o processo até cobrir toda a área."
    ];
    instructions.textContent = steps[captureCount % steps.length];
}

// Captura uma imagem e adiciona ao container
captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    imagesContainer.appendChild(img);
    images.push(img.src); // Armazena a imagem em um array
    captureCount++;
    updateInstructions();

    console.log(`Capturadas ${images.length} imagens`);
});

// Função para salvar o mapeamento de profundidade como PNG
function saveDepthMap() {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("Vídeo não está carregado corretamente. Tente novamente.");
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Aplica o mapa de profundidade básico
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imageData = createDepthMap(imageData); 
    ctx.putImageData(imageData, 0, 0);
    
    // Cria o link para download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'depth_map.png';
    link.click();
}

// Botão para salvar o mapeamento de profundidade
const saveButton = document.createElement('button');
saveButton.textContent = 'Salvar Mapeamento de Profundidade';
saveButton.addEventListener('click', saveDepthMap);
document.body.appendChild(saveButton);

// Função para renderizar a imagem gerada e entrar na simulação
function renderSimulation() {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    document.body.appendChild(container);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

// Botão para renderizar a imagem gerada e entrar na simulação de ambiente
const renderButton = document.createElement('button');
renderButton.textContent = 'Entrar na Simulação';
renderButton.addEventListener('click', renderSimulation);
document