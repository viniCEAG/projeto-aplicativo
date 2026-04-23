// 1. Configuração do Mapa e Estado
let userCoords = [-23.5505, -46.6333]; // Fallback São Paulo
const map = L.map('map').setView(userCoords, 13);
const reportsLayer = L.layerGroup().addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// 2. Elementos do DOM
const cameraInput = document.getElementById('camera-input');
const btnReport = document.getElementById('btn-report');
const modal = document.getElementById('modal-report');
const photoPreview = document.getElementById('photo-preview');
const iaStatus = document.getElementById('ia-status');
const categorySelect = document.getElementById('category-select');
const btnConfirm = document.getElementById('btn-confirm-report');
const btnSafe = document.getElementById('btn-safe');

// 3. Inicialização e Localização
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
        userCoords = [pos.coords.latitude, pos.coords.longitude];
        map.setView(userCoords, 16);
        L.marker(userCoords, { icon: createIcon('blue') }).addTo(map).bindPopup("Sua Localização");
    });
}

// Carregar reportes salvos
loadStoredReports();

// 4. Fluxo de Reporte
btnReport.onclick = () => cameraInput.click();

cameraInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        modal.style.display = 'flex';
        simulateIA(file);
    }
};

function simulateIA(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        photoPreview.innerHTML = `<img src="${event.target.result}">`;
        iaStatus.innerText = "Analisando imagem...";
        
        // Simula IA detectando a categoria em 2 segundos
        setTimeout(() => {
            const categories = ["Asfalto", "Limpeza", "Iluminação"];
            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            categorySelect.value = randomCat;
            showToast(`IA detectou: ${randomCat}`);
        }, 1500);
    };
    reader.readAsDataURL(file);
}

btnConfirm.onclick = () => {
    const report = {
        id: Date.now(),
        lat: userCoords[0] + (Math.random() - 0.5) * 0.002, // Pequeno offset para teste
        lng: userCoords[1] + (Math.random() - 0.5) * 0.002,
        category: categorySelect.value,
        description: document.getElementById('report-description').value,
        timestamp: new Date().toLocaleString()
    };

    saveReport(report);
    addMarkerToMap(report);
    closeModal();
    showToast("Protocolo enviado! Acompanhe no mapa.");
};

// 5. Funções Auxiliares
function saveReport(report) {
    const reports = JSON.parse(localStorage.getItem('civic_reports') || '[]');
    reports.push(report);
    localStorage.setItem('civic_reports', JSON.stringify(reports));
}

function loadStoredReports() {
    const reports = JSON.parse(localStorage.getItem('civic_reports') || '[]');
    reports.forEach(addMarkerToMap);
}

function addMarkerToMap(data) {
    const color = data.category === 'Segurança' ? 'red' : 'orange';
    const marker = L.circleMarker([data.lat, data.lng], {
        radius: 10,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(reportsLayer);

    marker.bindPopup(`
        <strong>${data.category}</strong><br>
        ${data.description || 'Sem descrição'}<br>
        <small>${data.timestamp}</small><br>
        <button onclick="confirmIssue(${data.id})" style="margin-top:5px">É real (Confirmar)</button>
    `);
}

function showToast(msg) {
    const toast = document.getElementById('notification-toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeModal() {
    modal.style.display = 'none';
    photoPreview.innerHTML = `<span class="material-icons">sync</span><p id="ia-status">Processando...</p>`;
    cameraInput.value = '';
}

// Botão Estou Seguro
btnSafe.onclick = () => {
    btnSafe.disabled = true;
    btnSafe.innerText = "NOTIFICANDO...";
    setTimeout(() => {
        showToast("Contatos de emergência avisados!");
        btnSafe.innerText = "ESTOU SEGURO";
        btnSafe.disabled = false;
    }, 1500);
};

function createIcon(color) {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
}