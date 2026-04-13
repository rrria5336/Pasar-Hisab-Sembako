// Data Barang Pokok (IKON 100% KOMPATIBEL FONT AWESOME 6.4.0)
const barangData = [
    { nama: "Beras Premium 5kg", kategori: "Sembako", icon: "fas fa-seedling", hargaProdusen: 22000, biayaProduksi: 18000 },
    { nama: "Minyak Goreng 1L", kategori: "Sembako", icon: "fas fa-oil-can", hargaProdusen: 16000, biayaProduksi: 13000 },
    { nama: "Gula Pasir 1kg", kategori: "Sembako", icon: "fas fa-cubes", hargaProdusen: 14000, biayaProduksi: 11000 },
    { nama: "Telur Ayam 1kg", kategori: "Protein", icon: "fas fa-egg", hargaProdusen: 28000, biayaProduksi: 22000 },
    { nama: "Garam Dapur 500g", kategori: "Bumbu", icon: "fas fa-gem", hargaProdusen: 2500, biayaProduksi: 1800 },
    { nama: "Roti Tawar 400g", kategori: "Konsumsi", icon: "fas fa-bread-slice", hargaProdusen: 12500, biayaProduksi: 9500 },
    { nama: "Tepung Terigu 1kg", kategori: "Sembako", icon: "fas fa-wheat-awn", hargaProdusen: 11000, biayaProduksi: 8500 },
    { nama: "Mie Instan 5pcs", kategori: "Konsumsi", icon: "fas fa-bowl-food", hargaProdusen: 7500, biayaProduksi: 5500 },
    { nama: "Sarden Kaleng", kategori: "Konsumsi", icon: "fas fa-fish", hargaProdusen: 11500, biayaProduksi: 9000 },
    { nama: "Susu UHT 1L", kategori: "Minuman", icon: "fas fa-bottle-water", hargaProdusen: 16500, biayaProduksi: 12500 }
];

let chartInstance = null;
let currentBarang = null;

// ===== INTEGRAL SYARIAH =====
function hitungIntegralSyariah(barang, volumeProduksi = 1000) {
    const { hargaProdusen } = barang;
    const marginMinimum = hargaProdusen * 0.30;
    const marginEkstra = (volumeProduksi / 1000) * 500;
    const hargaSyariah = hargaProdusen + marginMinimum + marginEkstra;
    const keuntunganPerUnit = hargaSyariah - hargaProdusen;
    const keuntunganTotal = keuntunganPerUnit * volumeProduksi;
    const keuntungan20Stok = keuntunganPerUnit * 20;
    
    return {
        hargaSyariah: Math.round(hargaSyariah),
        keuntunganPerUnit: Math.round(keuntunganPerUnit),
        keuntunganTotal: Math.round(keuntunganTotal),
        keuntungan20Stok: Math.round(keuntungan20Stok),
        efisiensi: ((keuntunganPerUnit / hargaProdusen) * 100).toFixed(1),
        volumeOptimasi: volumeProduksi,
        persentaseMargin: ((keuntunganPerUnit / hargaSyariah) * 100).toFixed(1)
    };
}

// ===== GENERATE BARANG CARDS (SAFE) =====
function generateBarangCards() {
    const grid = document.getElementById('barangGrid');
    if (!grid) {
        console.error('ERROR: barangGrid tidak ditemukan!');
        return;
    }
    
    grid.innerHTML = '';
    
    barangData.forEach((barang, index) => {
        const card = document.createElement('div');
        card.className = 'barang-card';
        card.onclick = () => pilihBarang(barang);
        card.setAttribute('data-barang', index);
        card.innerHTML = `
            <div class="barang-icon">
                <i class="${barang.icon}"></i>
            </div>
            <h3>${barang.nama}</h3>
            <div class="barang-category">${barang.kategori}</div>
            <div class="barang-price">
                Rp ${barang.hargaProdusen.toLocaleString()}
                <small>Harga Beli dari Produsen</small>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ===== PILIH BARANG (SAFE) =====
function pilihBarang(barang) {
    currentBarang = barang;
    
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    if (!step1 || !step2) {
        console.error('ERROR: step1 atau step2 tidak ditemukan!');
        return;
    }
    
    step1.classList.remove('active');
    setTimeout(() => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        
        updateDisplay();
        initChart();
        hitungDanUpdate();
        
        const chartSection = document.querySelector('.chart-section');
        if (chartSection) {
            chartSection.scrollIntoView({ behavior: 'smooth' });
        }
    }, 300);
}

// ===== UPDATE DISPLAY (SAFE) =====
function updateDisplay() {
    if (!currentBarang) return;
    
    const titleEl = document.getElementById('barangTitle');
    const hargaPasarEl = document.getElementById('hargaPasarValue');
    
    if (titleEl) titleEl.textContent = currentBarang.nama;
    if (hargaPasarEl) hargaPasarEl.textContent = `Rp ${currentBarang.hargaProdusen.toLocaleString()}`;
}

// ===== INIT CHART (SAFE) =====
function initChart() {
    const canvas = document.getElementById('syariahChart');
    if (!canvas) {
        console.error('ERROR: syariahChart canvas tidak ditemukan!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Harga Beli Produsen',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.3,
                    fill: false,
                    borderWidth: 5,
                    pointRadius: 6
                },
                {
                    label: 'Harga Jual Syariah (TOKO)',
                    data: [],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.3)',
                    tension: 0.4,
                    fill: '+1',
                    borderWidth: 5,
                    pointRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: 'Volume Penjualan (Unit)', color: '#fff', font: { size: 16, weight: 'bold' } },
                    grid: { color: 'rgba(255,255,255,0.2)' },
                    ticks: { color: '#fff', font: { size: 14, weight: 'bold' }, maxTicksLimit: 10 }
                },
                y: {
                    title: { display: true, text: 'Harga (Rp)', color: '#fff', font: { size: 16, weight: 'bold' } },
                    grid: { color: 'rgba(255,255,255,0.2)' },
                    ticks: { 
                        color: '#fff', 
                        font: { size: 14, weight: 'bold' },
                        callback: value => 'Rp ' + Math.round(value).toLocaleString()
                    }
                }
            },
            plugins: {
                legend: {
                    labels: { 
                        color: '#fff',
                        padding: 40,
                        usePointStyle: true,
                        font: { size: 15, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// ===== HITUNG & UPDATE (SAFE) =====
function hitungDanUpdate() {
    if (!currentBarang || !chartInstance) return;
    
    const volumeMax = 2000;
    const points = 50;
    const labels = [];
    const dataProdusen = [];
    const dataSyariah = [];
    
    for (let i = 0; i <= points; i++) {
        const q = (volumeMax * i) / points;
        labels.push(Math.round(q));
        const produsen = currentBarang.hargaProdusen * (1 - 0.00005 * q);
        dataProdusen.push(produsen);
        const hasil = hitungIntegralSyariah(currentBarang, q);
        dataSyariah.push(hasil.hargaSyariah);
    }
    
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = dataProdusen;
    chartInstance.data.datasets[1].data = dataSyariah;
    chartInstance.update('active');
    
    const hasilFinal = hitungIntegralSyariah(currentBarang, 1000);
    updateHargaDisplay(hasilFinal);
    updateKeuntunganNotes(hasilFinal);
}

// ===== UPDATE HARGA DISPLAY (SAFE) =====
function updateHargaDisplay(hasil) {
    const hargaSyariahEl = document.getElementById('hargaSyariahValue');
    const hargaDescEl = document.getElementById('hargaDescSyariah');
    
    if (hargaSyariahEl) {
        hargaSyariahEl.textContent = `Rp ${hasil.hargaSyariah.toLocaleString()}`;
    }
    if (hargaDescEl) {
        hargaDescEl.innerHTML = `Keuntungan <strong>Rp${hasil.keuntunganPerUnit.toLocaleString()}</strong> per unit<br><small>(Margin ${hasil.persentaseMargin}%)</small>`;
    }
}

// ===== UPDATE NOTES (SAFE) =====
function updateKeuntunganNotes(hasil) {
    const notesContainer = document.getElementById('keuntunganNotes');
    if (!notesContainer) return;
    
    notesContainer.innerHTML = `
        <div class="note-item profit">
            <i class="fas fa-coins"></i>
            <div><strong>Rp ${hasil.keuntunganTotal.toLocaleString()}</strong><br><small>Keuntungan Total (1000 unit)</small></div>
        </div>
        <div class="note-item profit-20">
            <i class="fas fa-boxes"></i>
            <div><strong>Rp ${hasil.keuntungan20Stok.toLocaleString()}</strong><br><small>Keuntungan 20 Stok</small></div>
        </div>
        <div class="note-item margin">
            <i class="fas fa-percentage"></i>
            <div><strong>${hasil.persentaseMargin}%</strong><br><small>Margin Keuntungan</small></div>
        </div>
        <div class="note-item efficiency">
            <i class="fas fa-chart-line"></i>
            <div><strong>${hasil.efisiensi}%</strong><br><small>Keuntungan dari Modal</small></div>
        </div>
    `;
}

// ===== GANTI BARANG (SAFE) =====
function gantiBarang() {
    const step2 = document.getElementById('step2');
    const step1 = document.getElementById('step1');
    
    if (step2) step2.classList.add('hidden');
    if (step1) {
        step1.classList.remove('hidden');
        step1.classList.add('active');
    }
    currentBarang = null;
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
}

function showInfo() {
    alert('🕌 SYARIAH OPTIMIZER\n\n✅ Harga Jual > Harga Beli\n✅ Margin 30%+ Aman\n✅ Keuntungan 20 stok\n✅ Grafik JELAS\n\nToko AMAN untung!');
}

// ===== INIT (SUPER SAFE) =====
document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.style.display = 'none', 300);
        }
    }, 1200);
    
    // AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true });
    } else {
        console.warn('AOS tidak ter-load');
    }
    
    // Generate Cards
    generateBarangCards();
});