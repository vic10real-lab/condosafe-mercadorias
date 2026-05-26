// CondoSafe - Core Application Script

// ==========================================
// 1. DATA ACCESS & STORAGE LAYER (DATABASE)
// ==========================================
const DB = {
    getResidents() {
        return JSON.parse(localStorage.getItem('condosafe_residents')) || [];
    },
    saveResidents(residents) {
        localStorage.setItem('condosafe_residents', JSON.stringify(residents));
    },
    getPackages() {
        return JSON.parse(localStorage.getItem('condosafe_packages')) || [];
    },
    savePackages(packages) {
        localStorage.setItem('condosafe_packages', JSON.stringify(packages));
    },
    getLogs() {
        return JSON.parse(localStorage.getItem('condosafe_logs')) || [];
    },
    saveLogs(logs) {
        localStorage.setItem('condosafe_logs', JSON.stringify(logs));
    },
    seedDatabase() {
        // Seed default residents if empty
        if (this.getResidents().length === 0) {
            const defaultResidents = [
                { id: 'res-1', name: 'Victor Real', cpf: '123.456.789-00', email: 'victor.real@exemplo.com', quadra: 'A', lote: '12' },
                { id: 'res-2', name: 'Maria Eduarda Santos', cpf: '234.567.890-11', email: 'maria.santos@exemplo.com', quadra: 'B', lote: '45' },
                { id: 'res-3', name: 'João Carlos Oliveira', cpf: '345.678.901-22', email: 'joao.oliveira@exemplo.com', quadra: 'C', lote: '08' },
                { id: 'res-4', name: 'Ana Beatriz Souza', cpf: '456.789.012-33', email: 'ana.souza@exemplo.com', quadra: 'D', lote: '54' }
            ];
            this.saveResidents(defaultResidents);
        }

        // Seed default packages if empty
        if (this.getPackages().length === 0) {
            const defaultPackages = [
                {
                    id: 'pkg-1',
                    code: 'ML555444333BR',
                    residentId: 'res-2', // Maria Eduarda
                    description: 'Mercado Livre - Livro Técnico',
                    status: 'Aguardando Retirada',
                    receivedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
                    receivedBy: 'Portaria A',
                    deliveredAt: null,
                    signature: null
                },
                {
                    id: 'pkg-2',
                    code: 'BR987654321BR',
                    residentId: 'res-1', // Victor Real
                    description: 'Amazon - Tênis de Corrida',
                    status: 'Pré-cadastrada',
                    receivedAt: null,
                    receivedBy: null,
                    deliveredAt: null,
                    signature: null
                },
                {
                    id: 'pkg-3',
                    code: 'AMZ111222333',
                    residentId: 'res-3', // João Carlos
                    description: 'Magazine Luiza - Cafeteira',
                    status: 'Entregue',
                    receivedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24 hours ago
                    receivedBy: 'Portaria A',
                    deliveredAt: new Date(Date.now() - 3600000 * 20).toISOString(), // 20 hours ago
                    signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><path d="M10,25 Q30,10 50,25 T90,25" fill="none" stroke="black" stroke-width="2"/></svg>'
                }
            ];
            this.savePackages(defaultPackages);
            
            // Seed logs
            const defaultLogs = [
                {
                    id: 'log-1',
                    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
                    type: 'ENTRADA',
                    packageCode: 'AMZ111222333',
                    description: 'Entrada registrada por Portaria A. Destinatário: João Carlos Oliveira (Quadra C, Lote 08).'
                },
                {
                    id: 'log-2',
                    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
                    type: 'SAIDA',
                    packageCode: 'AMZ111222333',
                    description: 'Entrega efetuada. Morador assinou termo de ciência da retirada.'
                },
                {
                    id: 'log-3',
                    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
                    type: 'ENTRADA',
                    packageCode: 'ML555444333BR',
                    description: 'Entrada registrada por Portaria A. Destinatário: Maria Eduarda Santos (Quadra B, Lote 45).'
                }
            ];
            this.saveLogs(defaultLogs);
        }
    }
};

// Seed DB right away
DB.seedDatabase();

// ==========================================
// 2. AUDIO & NOTIFICATIONS ENGINE (WEB AUDIO)
// ==========================================
function playNotificationSound(type = 'beep') {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (type === 'beep') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(700, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.08);
        } else if (type === 'success') {
            // Arpeggio beep
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            oscillator.start();
            
            const nextOsc = audioCtx.createOscillator();
            const nextGain = audioCtx.createGain();
            nextOsc.connect(nextGain);
            nextGain.connect(audioCtx.destination);
            nextOsc.type = 'sine';
            nextOsc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
            nextGain.gain.setValueAtTime(0.08, audioCtx.currentTime + 0.08);
            nextOsc.start(audioCtx.currentTime + 0.08);
            
            const finalOsc = audioCtx.createOscillator();
            const finalGain = audioCtx.createGain();
            finalOsc.connect(finalGain);
            finalGain.connect(audioCtx.destination);
            finalOsc.type = 'sine';
            finalOsc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
            finalGain.gain.setValueAtTime(0.08, audioCtx.currentTime + 0.16);
            finalOsc.start(audioCtx.currentTime + 0.16);
            
            oscillator.stop(audioCtx.currentTime + 0.08);
            nextOsc.stop(audioCtx.currentTime + 0.16);
            finalOsc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'error') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(140, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.25);
        }
    } catch (e) {
        console.warn('Audio feedback blocked by browser settings until user gesture.', e);
    }
}

// Toast Alert displayer
function showToast(title, message, isSuccess = true) {
    const toast = document.getElementById('alert-toast');
    const toastIcon = document.getElementById('alert-toast-icon');
    const toastTitle = document.getElementById('alert-toast-title');
    const toastMsg = document.getElementById('alert-toast-message');
    
    toast.className = `alert-toast ${isSuccess ? 'alert-toast-success' : 'alert-toast-error'}`;
    toastIcon.className = `fa-solid ${isSuccess ? 'fa-circle-check' : 'fa-circle-xmark'} alert-toast-icon`;
    
    toastTitle.textContent = title;
    toastMsg.textContent = message;
    
    toast.classList.add('active');
    
    // Play sound accordingly
    playNotificationSound(isSuccess ? 'success' : 'error');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4500);
}

// ==========================================
// 3. UI STATE & ROUTING CONTROLLER
// ==========================================
const App = {
    currentTab: 'dashboard',
    html5QrcodeScanner: null,
    scannedCodeToAssign: null, // Holds tracking code during manual mapping flow
    selectedResidentToAssign: null, // Selected resident ID in manual mapping flow
    currentDeliveryPackage: null, // Package loaded in signature modal
    
    // Cloud sync variables
    googleClientId: null,
    googleAccessToken: null,
    googleTokenClient: null,
    isSyncing: false,
    autoSyncIntervalId: null,
    cloudFileId: null,
    gisScriptLoaded: false,
    
    // Photo capture variables
    capturedPackagePhoto: null,
    evidenceStream: null,
    
    init() {
        this.bindEvents();
        this.startLiveClock();
        this.renderAll();
        this.setupKeyboardBarcodeScanInterception();
        this.initCloudSync();
    },

    bindEvents() {
        // Theme switch
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        
        // Mobile Sidebar Menu
        document.getElementById('mobile-toggle').addEventListener('click', () => {
            document.getElementById('app-sidebar').classList.toggle('mobile-open');
        });
        
        // Navigation Tabs click
        document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const targetTab = item.getAttribute('data-tab');
                this.switchTab(targetTab);
                document.getElementById('app-sidebar').classList.remove('mobile-open'); // Close sidebar on mobile
            });
        });

        // Scan barcode inputs
        document.getElementById('btn-process-code').addEventListener('click', () => this.processBarcodeManualInput());
        document.getElementById('barcode-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processBarcodeManualInput();
            }
        });

        // Camera activation
        document.getElementById('scanner-button').addEventListener('click', () => this.toggleCameraScanner(true));
        document.getElementById('btn-scan-delivery').addEventListener('click', () => this.toggleCameraScanner(true));
        document.getElementById('btn-close-barcode-modal').addEventListener('click', () => this.toggleCameraScanner(false));

        // Cancel manual package assignment
        document.getElementById('btn-cancel-assignment').addEventListener('click', () => {
            this.resetUnregisteredFlow();
        });

        // Confirm manual package assignment
        document.getElementById('btn-confirm-assignment').addEventListener('click', () => {
            this.confirmManualAssignment();
        });

        // Search picker in manual assignment
        document.getElementById('resident-search-picker').addEventListener('input', () => {
            this.renderResidentsPickerList();
        });

        // Live search pending packages table
        document.getElementById('pending-packages-search').addEventListener('input', () => {
            this.renderPendingPackages();
        });

        // Resident tab toggle form
        document.getElementById('btn-toggle-resident-form').addEventListener('click', () => {
            this.toggleResidentForm();
        });
        document.getElementById('btn-cancel-resident').addEventListener('click', () => {
            this.toggleResidentForm(false);
        });

        // Resident tab search
        document.getElementById('residents-search').addEventListener('input', () => {
            this.renderResidents();
        });

        // Resident Form submit
        document.getElementById('resident-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleResidentSubmit();
        });

        // Resident Portal Selector
        document.getElementById('resident-portal-selector').addEventListener('change', () => {
            this.loadResidentPortalView();
        });

        // Resident Portal Pre-registration Form
        document.getElementById('pre-register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePreRegisterSubmit();
        });

        // Clear audit history
        document.getElementById('btn-clear-logs').addEventListener('click', () => {
            if (confirm('Tem certeza de que deseja apagar permanentemente todo o histórico de auditoria?')) {
                DB.saveLogs([]);
                this.renderLogs();
                showToast('Limpo', 'Histórico de auditoria apagado.', true);
            }
        });

        // History logs search filter
        document.getElementById('history-search').addEventListener('input', () => {
            this.renderLogs();
        });

        // OCR Modal and Camera
        document.getElementById('ocr-scanner-button').addEventListener('click', () => this.openOcrModal());
        document.getElementById('btn-close-ocr-modal').addEventListener('click', () => this.closeOcrModal());
        document.getElementById('btn-capture-ocr').addEventListener('click', () => this.captureAndProcessOcr());

        // Evidence Camera Modal
        const btnCaptureEvidence = document.getElementById('btn-capture-package-photo');
        if (btnCaptureEvidence) {
            btnCaptureEvidence.addEventListener('click', () => this.openEvidenceModal());
        }
        const btnCloseEvidence = document.getElementById('btn-close-evidence-modal');
        if (btnCloseEvidence) {
            btnCloseEvidence.addEventListener('click', () => this.closeEvidenceModal());
        }
        const btnSnapEvidence = document.getElementById('btn-snap-evidence');
        if (btnSnapEvidence) {
            btnSnapEvidence.addEventListener('click', () => this.captureEvidencePhoto());
        }
        const btnRemoveEvidence = document.getElementById('btn-remove-package-photo');
        if (btnRemoveEvidence) {
            btnRemoveEvidence.addEventListener('click', () => this.removeEvidencePhoto());
        }

        // Modal close operations
        document.getElementById('btn-close-modal').addEventListener('click', () => this.closeDeliveryModal());
        document.getElementById('btn-cancel-delivery').addEventListener('click', () => this.closeDeliveryModal());
        document.getElementById('btn-confirm-delivery').addEventListener('click', () => this.submitDeliveryConfirmation());
        
        // Canvas Signature Pad drawing events
        this.setupSignatureCanvas();

        // Google Cloud & Sync bindings
        const btnSaveClientId = document.getElementById('btn-save-client-id');
        if (btnSaveClientId) {
            btnSaveClientId.addEventListener('click', () => this.saveGoogleClientId());
        }
        const btnToggleVisibility = document.getElementById('btn-toggle-client-id-visibility');
        if (btnToggleVisibility) {
            btnToggleVisibility.addEventListener('click', () => this.toggleClientIdVisibility());
        }
        const btnCloudConnect = document.getElementById('btn-cloud-connect');
        if (btnCloudConnect) {
            btnCloudConnect.addEventListener('click', () => this.connectGoogleDrive());
        }
        const btnCloudDisconnect = document.getElementById('btn-cloud-disconnect');
        if (btnCloudDisconnect) {
            btnCloudDisconnect.addEventListener('click', () => this.disconnectGoogleDrive());
        }
        const btnCloudSyncNow = document.getElementById('btn-cloud-sync-now');
        if (btnCloudSyncNow) {
            btnCloudSyncNow.addEventListener('click', () => this.syncGoogleDriveNow());
        }
        const chkAutoSync = document.getElementById('cloud-auto-sync-checkbox');
        if (chkAutoSync) {
            chkAutoSync.addEventListener('change', (e) => this.toggleAutoSync(e.target.checked));
        }
    },

    startLiveClock() {
        const updateClock = () => {
            const clockEl = document.getElementById('live-clock');
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            // Format Portuguese
            clockEl.textContent = now.toLocaleDateString('pt-BR', options);
        };
        updateClock();
        setInterval(updateClock, 30000); // Update every 30s
    },

    toggleTheme() {
        const body = document.body;
        const themeBtn = document.getElementById('theme-toggle');
        const themeText = document.getElementById('theme-text');
        
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        
        localStorage.setItem('condosafe_theme', isLight ? 'light' : 'dark');
        
        if (isLight) {
            themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i><span id="theme-text">Modo Escuro</span>';
        } else {
            themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i><span id="theme-text">Modo Claro</span>';
        }
    },

    switchTab(tabId) {
        // Toggle Sidebar state
        document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Toggle Tab View
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`tab-${tabId}`);
        targetPanel.classList.add('active');

        // Dynamic page titles
        const pageTitleDisplay = document.getElementById('page-title-display');
        const pageSubtitleDisplay = document.getElementById('page-subtitle-display');

        switch(tabId) {
            case 'dashboard':
                pageTitleDisplay.textContent = 'Portaria / Painel';
                pageSubtitleDisplay.textContent = 'Controle de entrada e saída de mercadorias em tempo real.';
                this.renderPendingPackages();
                this.renderStats();
                break;
            case 'residents':
                pageTitleDisplay.textContent = 'Gestão de Moradores';
                pageSubtitleDisplay.textContent = 'Cadastre, consulte e gerencie as unidades do condomínio.';
                this.renderResidents();
                break;
            case 'resident-portal':
                pageTitleDisplay.textContent = 'Portal do Morador';
                pageSubtitleDisplay.textContent = 'Simulação de autoatendimento do morador para encomendas.';
                this.renderResidentPortalSelector();
                this.loadResidentPortalView();
                break;
            case 'history':
                pageTitleDisplay.textContent = 'Histórico & Auditoria';
                pageSubtitleDisplay.textContent = 'Log cronológico detalhado de todas as movimentações e assinaturas.';
                this.renderLogs();
                break;
            case 'cloud-sync':
                pageTitleDisplay.textContent = 'Nuvem & Sincronização';
                pageSubtitleDisplay.textContent = 'Gerencie a sincronização de dados entre múltiplos aparelhos.';
                this.updateCloudSyncUI();
                break;
        }

        this.currentTab = tabId;
        
        // Safely turn off camera scanner if switching away from portaria panel
        if (tabId !== 'dashboard' && this.html5QrcodeScanner) {
            this.toggleCameraScanner(false);
        }
    },

    // ==========================================
    // 4. SMART SCANNING & PROCESSING FLOW
    // ==========================================
    
    // Intercept physical keyboard inputs from external USB barcode guns
    setupKeyboardBarcodeScanInterception() {
        let barcodeBuffer = '';
        let lastKeyTime = Date.now();
        
        window.addEventListener('keypress', (e) => {
            // Skip logging inputs if focus is inside any real form input text box
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }

            const currentTime = Date.now();
            
            // Barcode scanners type extremely quickly (often < 25ms between characters)
            if (currentTime - lastKeyTime > 50) {
                barcodeBuffer = ''; // Too slow, reset
            }
            
            lastKeyTime = currentTime;
            
            if (e.key === 'Enter') {
                if (barcodeBuffer.length >= 4) { // Valid tracking code length
                    console.log('Intercepted barcode gun scan:', barcodeBuffer);
                    this.processScannedCode(barcodeBuffer.trim());
                    barcodeBuffer = '';
                }
            } else {
                barcodeBuffer += e.key;
            }
        });
    },

    processBarcodeManualInput() {
        const inputEl = document.getElementById('barcode-input');
        const code = inputEl.value.trim();
        
        if (!code) {
            showToast('Aviso', 'Digite um código de rastreamento válido.', false);
            return;
        }
        
        this.processScannedCode(code);
        inputEl.value = '';
    },

    toggleCameraScanner(forceState) {
        const modal = document.getElementById('barcode-modal');
        const shouldStart = (forceState !== undefined) ? forceState : !modal.classList.contains('active');
        
        if (shouldStart) {
            modal.classList.add('active');
            playNotificationSound('beep');
            
            this.html5QrcodeScanner = new Html5Qrcode("scanner-camera-element");
            
            this.html5QrcodeScanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 120 }
                },
                (decodedText) => {
                    this.toggleCameraScanner(false);
                    this.processScannedCode(decodedText);
                },
                (errorMessage) => {
                }
            ).catch(err => {
                console.error("Camera open failed:", err);
                this.toggleCameraScanner(false);
                showToast('Erro de Câmera', 'Não foi possível acessar a câmera do dispositivo.', false);
            });
            
        } else {
            modal.classList.remove('active');
            if (this.html5QrcodeScanner) {
                this.html5QrcodeScanner.stop().then(() => {
                    this.html5QrcodeScanner.clear();
                    this.html5QrcodeScanner = null;
                }).catch(err => {
                    console.error("Camera stop failed:", err);
                    this.html5QrcodeScanner = null;
                });
            }
        }
    },

    processScannedCode(code) {
        code = code.toUpperCase();
        console.log("Processando código de rastreamento:", code);
        
        const packages = DB.getPackages();
        const residents = DB.getResidents();
        
        // 1. CHECK IF PACKAGE IS ALREADY AT THE FRONT-DESK ("Aguardando Retirada")
        // IF YES: This is a DELIVER-OUT scan flow!
        const existingPendingPkg = packages.find(p => p.code === code && p.status === 'Aguardando Retirada');
        if (existingPendingPkg) {
            playNotificationSound('beep');
            this.openDeliveryModal(existingPendingPkg);
            return;
        }

        // 2. CHECK IF PACKAGE WAS PRE-REGISTERED BY RESIDENT ("Pré-cadastrada")
        const preRegisteredPkg = packages.find(p => p.code === code && p.status === 'Pré-cadastrada');
        if (preRegisteredPkg) {
            // Autolink validated! Auto input!
            preRegisteredPkg.status = 'Aguardando Retirada';
            preRegisteredPkg.receivedAt = new Date().toISOString();
            preRegisteredPkg.receivedBy = 'Portaria A';
            
            DB.savePackages(packages);
            
            // Log entry
            const resident = residents.find(r => r.id === preRegisteredPkg.residentId);
            const residentName = resident ? resident.name : 'Morador Não Localizado';
            const location = resident ? `Quadra ${resident.quadra}, Lote ${resident.lote}` : '-';
            
            const logs = DB.getLogs();
            logs.unshift({
                id: 'log-' + Date.now(),
                timestamp: new Date().toISOString(),
                type: 'ENTRADA',
                packageCode: code,
                description: `Entrada inteligente por bipe. Destinatário: ${residentName} (${location}). Encomenda pré-cadastrada.`
            });
            DB.saveLogs(logs);
            
            showToast('Identificado!', `Encomenda de ${residentName} (${location}) recebida com sucesso!`, true);
            
            // Trigger automated email notification in background (no photo is attached in fast barcode scan)
            if (resident) {
                this.enviarEmailNotificacao(preRegisteredPkg, resident, null);
            }
            
            this.renderStats();
            this.renderPendingPackages();
            return;
        }

        // 3. UNREGISTERED FLOW: Open dialog to manually assign package
        playNotificationSound('beep');
        this.scannedCodeToAssign = code;
        
        const handlerEl = document.getElementById('unregistered-package-handler');
        const codeInput = document.getElementById('manual-assign-code-input');
        
        if (codeInput) codeInput.value = code;
        handlerEl.style.display = 'block';
        
        // Pre-focus the search field inside the assignment card
        document.getElementById('resident-search-picker').focus();
        
        // Populate selection list
        this.renderResidentsPickerList();
    },

    resetUnregisteredFlow() {
        document.getElementById('unregistered-package-handler').style.display = 'none';
        document.getElementById('resident-search-picker').value = '';
        this.scannedCodeToAssign = null;
        this.selectedResidentToAssign = null;
        document.getElementById('btn-confirm-assignment').disabled = true;
    },

    // ==========================================
    // 4.1 OCR LABEL READING
    // ==========================================
    ocrStream: null,
    
    async openOcrModal() {
        const modal = document.getElementById('ocr-modal');
        const video = document.getElementById('ocr-video');
        const resultText = document.getElementById('ocr-result-text');
        
        resultText.textContent = '';
        modal.classList.add('active');
        
        try {
            this.ocrStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            video.srcObject = this.ocrStream;
        } catch (err) {
            console.error("OCR Camera error:", err);
            showToast('Erro de Câmera', 'Não foi possível acessar a câmera para OCR.', false);
            this.closeOcrModal();
        }
    },

    closeOcrModal() {
        document.getElementById('ocr-modal').classList.remove('active');
        if (this.ocrStream) {
            this.ocrStream.getTracks().forEach(track => track.stop());
            this.ocrStream = null;
        }
    },

    async captureAndProcessOcr() {
        const video = document.getElementById('ocr-video');
        const canvas = document.getElementById('ocr-canvas');
        const overlay = document.getElementById('ocr-loading-overlay');
        const resultText = document.getElementById('ocr-result-text');
        
        // Capture frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg');
        
        // Show loading
        overlay.style.display = 'flex';
        resultText.textContent = '';
        
        try {
            // Tesseract OCR
            const result = await Tesseract.recognize(
                imageData,
                'por', // Portuguese
                { logger: m => console.log(m) }
            );
            
            const extractedText = result.data.text.toLowerCase();
            const extractedTextUpper = result.data.text.toUpperCase();
            console.log("OCR Result:", extractedText);
            
            // Tenta achar código de rastreio por Regex
            const barcodeRegex = /\b[A-Z0-9]{10,16}\b/g;
            let foundBarcode = '';
            const matches = extractedTextUpper.match(barcodeRegex);
            if (matches) {
                // Tracking codes generally have some numbers
                const validCodes = matches.filter(m => /[0-9]/.test(m));
                if (validCodes.length > 0) {
                    foundBarcode = validCodes[0];
                    console.log("Barcode extracted from OCR:", foundBarcode);
                }
            }
            
            // Fuzzy Match logic
            const residents = DB.getResidents();
            let matchedResident = null;
            let maxScore = 0;
            
            // Very simple fuzzy matching: search for names, or quadra/lote combos
            residents.forEach(res => {
                let score = 0;
                
                // Match name parts
                const nameParts = res.name.toLowerCase().split(' ');
                nameParts.forEach(part => {
                    if (part.length > 3 && extractedText.includes(part)) score += 2;
                });
                
                // Match Quadra/Lote
                if (extractedText.includes('quadra ' + res.quadra.toLowerCase()) || extractedText.includes(' q' + res.quadra.toLowerCase() + ' ')) score += 3;
                if (extractedText.includes('lote ' + res.lote.toLowerCase()) || extractedText.includes(' l' + res.lote.toLowerCase() + ' ') || extractedText.includes('apt ' + res.lote) || extractedText.includes('apto ' + res.lote)) score += 3;
                
                if (score > maxScore && score >= 2) {
                    maxScore = score;
                    matchedResident = res;
                }
            });
            
            overlay.style.display = 'none';
            
            if (matchedResident) {
                resultText.textContent = `Morador encontrado: ${matchedResident.name} (Confiança alta)`;
                resultText.style.color = 'var(--success)';
                playNotificationSound('success');
                
                // Wait a second, then auto-trigger unregistered flow with this resident pre-selected
                setTimeout(() => {
                    this.closeOcrModal();
                    
                    // Auto-attach the OCR captured image as evidence photo!
                    this.setEvidencePhoto(imageData);
                    
                    // Trigger manual assignment flow
                    this.scannedCodeToAssign = foundBarcode || '';
                    const handlerEl = document.getElementById('unregistered-package-handler');
                    const codeInput = document.getElementById('manual-assign-code-input');
                    if (codeInput) codeInput.value = this.scannedCodeToAssign;
                    
                    handlerEl.style.display = 'block';
                    
                    // Pre-fill search picker
                    const searchPicker = document.getElementById('resident-search-picker');
                    searchPicker.value = matchedResident.name;
                    this.renderResidentsPickerList();
                    
                    // Auto-select the matched resident
                    this.selectedResidentToAssign = matchedResident.id;
                    const listItems = document.getElementById('residents-picker-list').querySelectorAll('.selection-item');
                    if (listItems.length > 0) {
                        listItems.forEach(el => el.classList.remove('selected'));
                        listItems[0].classList.add('selected');
                    }
                    document.getElementById('btn-confirm-assignment').disabled = false;
                    
                    showToast('OCR Concluído', `Morador auto-selecionado: ${matchedResident.name} e imagem anexada!`, true);
                }, 1500);
            } else {
                resultText.textContent = 'Não foi possível encontrar o morador com exatidão.';
                resultText.style.color = 'var(--danger)';
                playNotificationSound('error');
            }
            
        } catch (err) {
            console.error(err);
            overlay.style.display = 'none';
            resultText.textContent = 'Erro ao analisar a imagem.';
            resultText.style.color = 'var(--danger)';
        }
    },

    renderResidentsPickerList() {
        const query = document.getElementById('resident-search-picker').value.toLowerCase();
        const residents = DB.getResidents();
        const container = document.getElementById('residents-picker-list');
        
        container.innerHTML = '';
        
        const filteredResidents = residents.filter(r => 
            r.name.toLowerCase().includes(query) ||
            r.quadra.toLowerCase().includes(query) ||
            r.lote.toLowerCase().includes(query) ||
            r.cpf.replace(/\D/g, '').includes(query)
        );

        if (filteredResidents.length === 0) {
            container.innerHTML = '<div style="padding: 12px; color: var(--text-muted); text-align: center; font-size: 0.85rem;">Nenhum morador encontrado.</div>';
            return;
        }

        filteredResidents.forEach(res => {
            const item = document.createElement('div');
            item.className = 'selection-item';
            if (this.selectedResidentToAssign === res.id) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <div>
                    <strong style="color: var(--text-primary);">${res.name}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">CPF: ${res.cpf}</div>
                </div>
                <span class="resident-location">Q. ${res.quadra} - L. ${res.lote}</span>
            `;
            
            item.addEventListener('click', () => {
                this.selectedResidentToAssign = res.id;
                
                // Toggle active style
                container.querySelectorAll('.selection-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                
                // Enable button
                document.getElementById('btn-confirm-assignment').disabled = false;
            });
            
            container.appendChild(item);
        });
    },

    confirmManualAssignment() {
        const codeInput = document.getElementById('manual-assign-code-input');
        if (codeInput) {
            this.scannedCodeToAssign = codeInput.value.trim() || 'S/N (Etiqueta Lida)';
        }
        
        if (!this.scannedCodeToAssign || !this.selectedResidentToAssign) {
            showToast('Atenção', 'Selecione um morador destinatário.', false);
            return;
        }
        
        const packages = DB.getPackages();
        const residents = DB.getResidents();
        const resident = residents.find(r => r.id === this.selectedResidentToAssign);
        
        if (!resident) return;
        
        // Add new package record
        const newPkg = {
            id: 'pkg-' + Date.now(),
            code: this.scannedCodeToAssign,
            residentId: this.selectedResidentToAssign,
            description: 'Recebimento Portaria (Manual)',
            status: 'Aguardando Retirada',
            receivedAt: new Date().toISOString(),
            receivedBy: 'Portaria A',
            deliveredAt: null,
            signature: null,
            packagePhoto: this.capturedPackagePhoto || null
        };
        
        packages.unshift(newPkg);
        DB.savePackages(packages);
        
        // Create log entry
        const logs = DB.getLogs();
        logs.unshift({
            id: 'log-' + Date.now(),
            timestamp: new Date().toISOString(),
            type: 'ENTRADA',
            packageCode: this.scannedCodeToAssign,
            description: `Entrada registrada (Vínculo Manual). Destinatário: ${resident.name} (Quadra ${resident.quadra}, Lote ${resident.lote}).`
        });
        DB.saveLogs(logs);
        
        showToast('Sucesso', `Encomenda vinculada e registrada para ${resident.name}!`, true);
        
        // Trigger automated email notification in background
        this.enviarEmailNotificacao(newPkg, resident, this.capturedPackagePhoto);
        
        // Reset photo capture
        this.removeEvidencePhoto();
        
        this.resetUnregisteredFlow();
        this.renderStats();
        this.renderPendingPackages();
    },

    // ==========================================
    // 5. SIGNATURE CANVAS & DELIVERY FLOW
    // ==========================================
    setupSignatureCanvas() {
        const canvas = document.getElementById('signature-pad');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // Make strokes smoother and support high DPI screens
        ctx.strokeStyle = '#0f172a'; // Deep dark ink
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const getCoordinates = (e) => {
            const rect = canvas.getBoundingClientRect();
            // Client coordinates handling both Touch and Mouse inputs
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const startDrawing = (e) => {
            isDrawing = true;
            const coords = getCoordinates(e);
            lastX = coords.x;
            lastY = coords.y;
            
            // Draw a dot if just clicked/tapped without moving
            ctx.beginPath();
            ctx.arc(lastX, lastY, ctx.lineWidth / 2, 0, Math.PI * 2);
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
        };

        const draw = (e) => {
            if (!isDrawing) return;
            // Prevent scrolling on touch screens
            if (e.touches) e.preventDefault();
            
            const coords = getCoordinates(e);
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            
            lastX = coords.x;
            lastY = coords.y;
        };

        const stopDrawing = () => {
            isDrawing = false;
        };

        // Desktop mouse events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', stopDrawing);

        // Mobile touch events
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        window.addEventListener('touchend', stopDrawing);

        // Clear canvas
        document.getElementById('btn-clear-signature').addEventListener('click', (e) => {
            e.preventDefault();
            this.clearCanvas();
        });
    },

    clearCanvas() {
        const canvas = document.getElementById('signature-pad');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    openDeliveryModal(pkg) {
        this.currentDeliveryPackage = pkg;
        const residents = DB.getResidents();
        const resident = residents.find(r => r.id === pkg.residentId);
        
        if (!resident) return;
        
        document.getElementById('modal-summary-name').textContent = resident.name;
        document.getElementById('modal-summary-location').textContent = `Q. ${resident.quadra} - L. ${resident.lote}`;
        document.getElementById('modal-summary-code').textContent = pkg.code;
        
        const dateOpt = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById('modal-summary-date').textContent = new Date(pkg.receivedAt).toLocaleDateString('pt-BR', dateOpt);
        
        // Open overlay
        const modal = document.getElementById('delivery-modal');
        modal.classList.add('active');
        
        // Clear canvas and reset signature
        this.clearCanvas();
    },

    closeDeliveryModal() {
        document.getElementById('delivery-modal').classList.remove('active');
        this.currentDeliveryPackage = null;
    },

    submitDeliveryConfirmation() {
        if (!this.currentDeliveryPackage) return;
        
        const canvas = document.getElementById('signature-pad');
        
        // Check if canvas is completely empty (basic validator)
        const isCanvasBlank = (c) => {
            const context = c.getContext('2d');
            const buffer = new Uint32Array(
                context.getImageData(0, 0, c.width, c.height).data.buffer
            );
            return !buffer.some(color => color !== 0);
        };
        
        if (isCanvasBlank(canvas)) {
            showToast('Atenção', 'Coleta de assinatura obrigatória. Por favor, solicite a assinatura do morador.', false);
            return;
        }

        const dataURL = canvas.toDataURL(); // Export signature image
        
        const packages = DB.getPackages();
        const pkgIndex = packages.findIndex(p => p.id === this.currentDeliveryPackage.id);
        
        if (pkgIndex === -1) return;
        
        // Update package record
        packages[pkgIndex].status = 'Entregue';
        packages[pkgIndex].deliveredAt = new Date().toISOString();
        packages[pkgIndex].signature = dataURL;
        
        DB.savePackages(packages);
        
        // Add log audit entry
        const residents = DB.getResidents();
        const resident = residents.find(r => r.id === packages[pkgIndex].residentId);
        const name = resident ? resident.name : '-';
        
        const logs = DB.getLogs();
        logs.unshift({
            id: 'log-' + Date.now(),
            timestamp: new Date().toISOString(),
            type: 'SAIDA',
            packageCode: packages[pkgIndex].code,
            description: `Retirada efetuada por ${name}. Entrega concluída por Portaria A.`
        });
        DB.saveLogs(logs);
        
        showToast('Sucesso', 'Mercadoria entregue e termo de retirada assinado com sucesso!', true);
        
        this.closeDeliveryModal();
        this.renderStats();
        this.renderPendingPackages();
    },

    // ==========================================
    // 6. VIEW RENDERING ENGINE
    // ==========================================
    renderAll() {
        this.renderStats();
        this.renderPendingPackages();
        this.renderResidents();
        this.renderResidentPortalSelector();
        this.loadResidentPortalView();
        this.renderLogs();
    },

    renderStats() {
        const packages = DB.getPackages();
        const todayStr = new Date().toISOString().split('T')[0];
        
        const receivedToday = packages.filter(p => p.receivedAt && p.receivedAt.split('T')[0] === todayStr).length;
        const pending = packages.filter(p => p.status === 'Aguardando Retirada').length;
        const deliveredToday = packages.filter(p => p.status === 'Entregue' && p.deliveredAt && p.deliveredAt.split('T')[0] === todayStr).length;
        
        document.getElementById('stats-received-today').textContent = receivedToday;
        document.getElementById('stats-pending').textContent = pending;
        document.getElementById('stats-delivered-today').textContent = deliveredToday;
    },

    renderPendingPackages() {
        const query = document.getElementById('pending-packages-search').value.toLowerCase();
        const packages = DB.getPackages();
        const residents = DB.getResidents();
        const tbody = document.getElementById('pending-packages-list');
        
        tbody.innerHTML = '';
        
        const pendingPkgs = packages.filter(p => p.status === 'Aguardando Retirada');
        
        const filteredPkgs = pendingPkgs.filter(pkg => {
            const resident = residents.find(r => r.id === pkg.residentId);
            const resName = resident ? resident.name.toLowerCase() : '';
            const resLocation = resident ? `q${resident.quadra} l${resident.lote}`.toLowerCase() : '';
            const resCpf = resident ? resident.cpf.replace(/\D/g, '') : '';
            const code = pkg.code.toLowerCase();
            
            return code.includes(query) || resName.includes(query) || resLocation.includes(query) || resCpf.includes(query);
        });

        if (filteredPkgs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px 0;">
                        <i class="fa-solid fa-boxes-packing" style="font-size: 1.8rem; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
                        Nenhuma encomenda pendente de retirada.
                    </td>
                </tr>
            `;
            return;
        }

        filteredPkgs.forEach(pkg => {
            const resident = residents.find(r => r.id === pkg.residentId);
            const tr = document.createElement('tr');
            
            const dateOpt = { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' };
            const formattedDate = new Date(pkg.receivedAt).toLocaleDateString('pt-BR', dateOpt);
            
            tr.innerHTML = `
                <td style="font-family: var(--font-heading); font-weight: 700; color: var(--text-primary);">${pkg.code}</td>
                <td>
                    <div style="font-weight: 600;">${resident ? resident.name : 'Desconhecido'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">${resident ? 'CPF: ' + resident.cpf : ''}</div>
                </td>
                <td>
                    <span class="resident-location">Q. ${resident ? resident.quadra : '-'} - L. ${resident ? resident.lote : '-'}</span>
                </td>
                <td style="color: var(--text-secondary); font-size: 0.85rem;">${formattedDate}</td>
                <td style="text-align: right;">
                    <button class="btn btn-primary btn-sm btn-deliver-action" data-id="${pkg.id}">
                        <i class="fa-solid fa-signature"></i>
                        <span>Entregar</span>
                    </button>
                </td>
            `;
            
            tr.querySelector('.btn-deliver-action').addEventListener('click', () => {
                this.openDeliveryModal(pkg);
            });
            
            tbody.appendChild(tr);
        });
    },

    renderResidents() {
        const query = document.getElementById('residents-search').value.toLowerCase();
        const residents = DB.getResidents();
        const grid = document.getElementById('residents-grid');
        
        grid.innerHTML = '';
        
        const filteredResidents = residents.filter(r => 
            r.name.toLowerCase().includes(query) ||
            r.quadra.toLowerCase().includes(query) ||
            r.lote.toLowerCase().includes(query) ||
            r.cpf.replace(/\D/g, '').includes(query)
        );

        if (filteredResidents.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 48px 0; width: 100%;">
                    <i class="fa-solid fa-users-slash" style="font-size: 2.2rem; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
                    Nenhum morador localizado.
                </div>
            `;
            return;
        }

        filteredResidents.forEach(res => {
            const card = document.createElement('div');
            card.className = 'resident-card';
            
            // Calculate active packages count
            const pkgs = DB.getPackages();
            const activeCount = pkgs.filter(p => p.residentId === res.id && p.status === 'Aguardando Retirada').length;
            
            card.innerHTML = `
                <div class="resident-header">
                    <div class="resident-name">${res.name}</div>
                    <span class="resident-location">Q. ${res.quadra} - L. ${res.lote}</span>
                </div>
                <div class="resident-details">
                    <div><strong>CPF:</strong> ${res.cpf}</div>
                    <div><strong>E-mail:</strong> ${res.email || 'Não cadastrado'}</div>
                    <div><strong>Unidade:</strong> Quadra ${res.quadra}, Lote ${res.lote}</div>
                    <div style="margin-top: 4px; display: flex; align-items: center; gap: 6px;">
                        <span class="badge ${activeCount > 0 ? 'badge-pending' : 'badge-success'}" style="font-size: 0.7rem;">
                            ${activeCount > 0 ? `${activeCount} pendente(s)` : 'Sem pendências'}
                        </span>
                    </div>
                </div>
                <div class="resident-actions">
                    <button class="btn btn-secondary btn-sm edit-res-btn" data-id="${res.id}">
                        <i class="fa-regular fa-pen-to-square"></i> Editar
                    </button>
                    <button class="btn btn-secondary btn-sm delete-res-btn" data-id="${res.id}" style="color: var(--danger);">
                        <i class="fa-regular fa-trash-can"></i> Excluir
                    </button>
                </div>
            `;
            
            // Edit callback
            card.querySelector('.edit-res-btn').addEventListener('click', () => {
                this.editResident(res);
            });
            
            // Delete callback
            card.querySelector('.delete-res-btn').addEventListener('click', () => {
                this.deleteResident(res.id);
            });

            grid.appendChild(card);
        });
    },

    toggleResidentForm(forceState) {
        const formContainer = document.getElementById('resident-form-container');
        const formBtn = document.getElementById('btn-toggle-resident-form');
        const form = document.getElementById('resident-form');
        
        const shouldOpen = (forceState !== undefined) ? forceState : (formContainer.style.display === 'none');
        
        if (shouldOpen) {
            formContainer.style.display = 'block';
            formBtn.style.display = 'none';
            document.getElementById('res-name-input').focus();
        } else {
            formContainer.style.display = 'none';
            formBtn.style.display = 'inline-flex';
            form.reset();
            document.getElementById('resident-id-input').value = '';
            document.getElementById('resident-form-title').innerHTML = '<i class="fa-solid fa-user-plus"></i> Cadastrar Novo Morador';
            document.getElementById('btn-save-resident').textContent = 'Salvar Morador';
        }
    },

    editResident(res) {
        document.getElementById('resident-id-input').value = res.id;
        document.getElementById('res-name-input').value = res.name;
        document.getElementById('res-cpf-input').value = res.cpf;
        document.getElementById('res-email-input').value = res.email || '';
        document.getElementById('res-quadra-input').value = res.quadra;
        document.getElementById('res-lote-input').value = res.lote;
        
        document.getElementById('resident-form-title').innerHTML = '<i class="fa-solid fa-user-pen"></i> Editar Informações do Morador';
        document.getElementById('btn-save-resident').textContent = 'Atualizar Cadastro';
        
        this.toggleResidentForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteResident(resId) {
        const residents = DB.getResidents();
        const res = residents.find(r => r.id === resId);
        
        if (!res) return;
        
        // Verify outstanding packages
        const packages = DB.getPackages();
        const hasPending = packages.some(p => p.residentId === resId && p.status === 'Aguardando Retirada');
        
        if (hasPending) {
            alert('Não é possível excluir este morador pois ele possui mercadorias aguardando retirada na portaria.');
            return;
        }

        if (confirm(`Tem certeza de que deseja excluir permanentemente o morador ${res.name}?`)) {
            const updated = residents.filter(r => r.id !== resId);
            DB.saveResidents(updated);
            
            // Clean up pre-registered packages linked to this resident too
            const cleanedPackages = packages.filter(p => !(p.residentId === resId && p.status === 'Pré-cadastrada'));
            DB.savePackages(cleanedPackages);
            
            showToast('Morador Excluído', `Cadastro de ${res.name} removido com sucesso.`, true);
            this.renderResidents();
            this.renderStats();
        }
    },

    handleResidentSubmit() {
        const id = document.getElementById('resident-id-input').value;
        const name = document.getElementById('res-name-input').value.trim();
        const cpf = document.getElementById('res-cpf-input').value.trim();
        const email = document.getElementById('res-email-input').value.trim();
        const quadra = document.getElementById('res-quadra-input').value.trim();
        const lote = document.getElementById('res-lote-input').value.trim();
        
        const residents = DB.getResidents();
        
        if (id) {
            // Edit mode
            const index = residents.findIndex(r => r.id === id);
            if (index !== -1) {
                residents[index] = { id, name, cpf, email, quadra, lote };
                showToast('Atualizado', 'Cadastro do morador atualizado com sucesso!', true);
            }
        } else {
            // Check duplicates
            const isDuplicate = residents.some(r => r.cpf === cpf || (r.quadra.toLowerCase() === quadra.toLowerCase() && r.lote.toLowerCase() === lote.toLowerCase() && r.name.toLowerCase() === name.toLowerCase()));
            
            if (isDuplicate) {
                showToast('Alerta', 'Este morador ou CPF já está cadastrado no sistema.', false);
                return;
            }

            // Create mode
            const newRes = {
                id: 'res-' + Date.now(),
                name,
                cpf,
                email,
                quadra,
                lote
            };
            residents.push(newRes);
            showToast('Cadastrado', 'Novo morador registrado com sucesso!', true);
        }
        
        DB.saveResidents(residents);
        this.toggleResidentForm(false);
        this.renderResidents();
    },

    // ==========================================
    // 7. SIMULATED RESIDENT SELF-SERVICE PORTAL
    // ==========================================
    renderResidentPortalSelector() {
        const residents = DB.getResidents();
        const select = document.getElementById('resident-portal-selector');
        
        select.innerHTML = '<option value="">-- Selecione o Morador --</option>';
        
        residents.forEach(res => {
            const opt = document.createElement('option');
            opt.value = res.id;
            opt.textContent = `${res.name} (Q. ${res.quadra} - L. ${res.lote})`;
            select.appendChild(opt);
        });
    },

    loadResidentPortalView() {
        const residentId = document.getElementById('resident-portal-selector').value;
        const profileEl = document.getElementById('resident-portal-profile');
        const contentEl = document.getElementById('portal-packages-content');
        const placeholderEl = document.getElementById('portal-packages-placeholder');
        
        if (!residentId) {
            profileEl.style.display = 'none';
            contentEl.style.display = 'none';
            placeholderEl.style.display = 'flex';
            return;
        }

        const residents = DB.getResidents();
        const resident = residents.find(r => r.id === residentId);
        
        if (!resident) return;

        // Load profile headers
        document.getElementById('portal-resident-name').textContent = resident.name;
        document.getElementById('portal-resident-location').textContent = `Quadra ${resident.quadra}, Lote ${resident.lote}`;
        
        profileEl.style.display = 'flex';
        contentEl.style.display = 'flex';
        placeholderEl.style.display = 'none';

        // Render resident's packages lists
        this.renderPortalPackages(residentId);
    },

    renderPortalPackages(residentId) {
        const packages = DB.getPackages();
        const tbody = document.getElementById('portal-packages-list');
        
        tbody.innerHTML = '';
        
        const myPkgs = packages.filter(p => p.residentId === residentId);
        
        if (myPkgs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px 0;">
                        Você não possui encomendas cadastradas ou recebidas.
                    </td>
                </tr>
            `;
            return;
        }

        myPkgs.forEach(pkg => {
            const tr = document.createElement('tr');
            
            const dateOpt = { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' };
            const entryDate = pkg.receivedAt ? new Date(pkg.receivedAt).toLocaleDateString('pt-BR', dateOpt) : '—';
            const deliveryDate = pkg.deliveredAt ? new Date(pkg.deliveredAt).toLocaleDateString('pt-BR', dateOpt) : '—';
            
            let statusBadge = '';
            if (pkg.status === 'Pré-cadastrada') {
                statusBadge = '<span class="badge" style="background-color: rgba(99, 102, 241, 0.1); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.2);">Pré-cadastrada</span>';
            } else if (pkg.status === 'Aguardando Retirada') {
                statusBadge = '<span class="badge badge-pending">Pendente Retirada</span>';
            } else {
                statusBadge = '<span class="badge badge-success">Entregue</span>';
            }

            tr.innerHTML = `
                <td style="font-family: var(--font-heading); font-weight: 700; color: var(--text-primary);">${pkg.code}</td>
                <td>${pkg.description || '—'}</td>
                <td style="font-size: 0.8rem; color: var(--text-secondary);">${entryDate}</td>
                <td>${statusBadge}</td>
                <td style="font-size: 0.8rem; color: var(--text-secondary);">${deliveryDate}</td>
            `;
            
            tbody.appendChild(tr);
        });
    },

    handlePreRegisterSubmit() {
        const code = document.getElementById('pre-code-input').value.trim().toUpperCase();
        const desc = document.getElementById('pre-desc-input').value.trim();
        const residentId = document.getElementById('resident-portal-selector').value;
        
        if (!code) return;
        
        const packages = DB.getPackages();
        
        // Check duplicate tracking code
        const isDuplicate = packages.some(p => p.code === code && p.status !== 'Entregue');
        if (isDuplicate) {
            showToast('Alerta', 'Código de rastreamento já cadastrado e ativo no sistema.', false);
            return;
        }

        const newPrePkg = {
            id: 'pkg-' + Date.now(),
            code,
            residentId,
            description: desc || 'Pré-cadastro Morador',
            status: 'Pré-cadastrada',
            receivedAt: null,
            receivedBy: null,
            deliveredAt: null,
            signature: null
        };
        
        packages.unshift(newPrePkg);
        DB.savePackages(packages);
        
        showToast('Pré-cadastrado!', 'Código registrado. Quando a encomenda chegar, a portaria será notificada.', true);
        
        // Clean inputs and refresh views
        document.getElementById('pre-register-form').reset();
        this.renderPortalPackages(residentId);
    },

    // ==========================================
    // 8. AUDIT LOGS TIMELINE RENDERER
    // ==========================================
    renderLogs() {
        const query = document.getElementById('history-search').value.toLowerCase();
        const logs = DB.getLogs();
        const packages = DB.getPackages();
        const timeline = document.getElementById('logs-timeline-list');
        
        timeline.innerHTML = '';
        
        const filteredLogs = logs.filter(log => 
            log.packageCode.toLowerCase().includes(query) ||
            log.description.toLowerCase().includes(query) ||
            log.type.toLowerCase().includes(query)
        );

        if (filteredLogs.length === 0) {
            timeline.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding: 48px 0;">
                    <i class="fa-solid fa-list-check" style="font-size: 2.2rem; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
                    Nenhum log de auditoria encontrado.
                </div>
            `;
            return;
        }

        filteredLogs.forEach(log => {
            const item = document.createElement('div');
            item.className = 'log-item';
            
            const dateOpt = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            const formattedTime = new Date(log.timestamp).toLocaleDateString('pt-BR', dateOpt);
            
            const isIn = log.type === 'ENTRADA';
            
            // Check if there is an associated signature
            let signatureBlock = '';
            if (log.type === 'SAIDA') {
                const pkg = packages.find(p => p.code === log.packageCode && p.status === 'Entregue');
                if (pkg && pkg.signature) {
                    signatureBlock = `<img src="${pkg.signature}" class="log-sign-preview" alt="Assinatura" title="Clique para ampliar" onclick="window.open(this.src)">`;
                }
            }

            item.innerHTML = `
                <div class="log-icon ${isIn ? 'log-icon-in' : 'log-icon-out'}">
                    <i class="fa-solid ${isIn ? 'fa-arrow-down-long' : 'fa-arrow-up-long'}"></i>
                </div>
                <div class="log-details">
                    <div class="log-title">${log.description}</div>
                    <div class="log-subtext">Código de Rastreio: <strong style="color: var(--text-primary); font-family: var(--font-heading);">${log.packageCode}</strong></div>
                </div>
                <div class="log-meta">
                    <span class="log-time">${formattedTime}</span>
                    <span class="badge ${isIn ? 'badge-success' : 'badge-pending'}" style="font-size: 0.65rem; width: fit-content; align-self: flex-end;">
                        ${log.type}
                    </span>
                    ${signatureBlock}
                </div>
            `;
            
            timeline.appendChild(item);
        });
    },

    // ==========================================
    // 9. GOOGLE DRIVE SYNC ENGINE
    // ==========================================
    initCloudSync() {
        // Load settings from localStorage
        this.googleClientId = localStorage.getItem('condosafe_google_client_id') || '';
        this.googleAccessToken = localStorage.getItem('condosafe_google_access_token') || '';
        
        // Populate inputs
        const clientIdInput = document.getElementById('google-client-id-input');
        if (clientIdInput) {
            clientIdInput.value = this.googleClientId;
        }

        const autoSyncCheckbox = document.getElementById('cloud-auto-sync-checkbox');
        const autoSyncEnabled = localStorage.getItem('condosafe_auto_sync') !== 'false'; // default true
        if (autoSyncCheckbox) {
            autoSyncCheckbox.checked = autoSyncEnabled;
        }

        // Load GIS Library dynamically
        this.loadGisLibrary();

        // Update UI
        this.updateCloudSyncUI();

        // If access token already exists, try to sync and start auto-sync
        if (this.googleAccessToken) {
            this.syncGoogleDriveNow().then(() => {
                if (autoSyncEnabled) {
                    this.toggleAutoSync(true);
                }
            });
        }
    },

    loadGisLibrary() {
        if (document.getElementById('google-gis-script')) {
            this.gisScriptLoaded = true;
            return;
        }
        const script = document.createElement('script');
        script.id = 'google-gis-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            this.gisScriptLoaded = true;
            console.log('Google Identity Services SDK loaded.');
        };
        document.body.appendChild(script);
    },

    saveGoogleClientId() {
        const input = document.getElementById('google-client-id-input');
        const value = input ? input.value.trim() : '';
        
        if (!value) {
            showToast('Aviso', 'Por favor, insira um Client ID válido.', false);
            return;
        }
        
        this.googleClientId = value;
        localStorage.setItem('condosafe_google_client_id', value);
        showToast('Configuração Salva', 'Google Client ID registrado com sucesso!', true);
        
        // Rebuild token client
        this.googleTokenClient = null;
    },

    toggleClientIdVisibility() {
        const input = document.getElementById('google-client-id-input');
        const btn = document.getElementById('btn-toggle-client-id-visibility');
        
        if (input) {
            if (input.type === 'password') {
                input.type = 'text';
                if (btn) btn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
            } else {
                input.type = 'password';
                if (btn) btn.innerHTML = '<i class="fa-regular fa-eye"></i>';
            }
        }
    },

    connectGoogleDrive() {
        if (!this.googleClientId) {
            showToast('Erro', 'Por favor, insira e salve o seu Google Client ID nas configurações antes de conectar.', false);
            const tabId = 'cloud-sync';
            this.switchTab(tabId);
            const clientIdInput = document.getElementById('google-client-id-input');
            if (clientIdInput) clientIdInput.focus();
            return;
        }

        if (!this.gisScriptLoaded) {
            showToast('Aguarde', 'Carregando biblioteca do Google. Tente novamente em alguns segundos.', false);
            this.loadGisLibrary();
            return;
        }

        try {
            if (!this.googleTokenClient) {
                this.googleTokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this.googleClientId,
                    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.send',
                    callback: async (response) => {
                        if (response.error) {
                            console.error("Auth Error:", response);
                            showToast('Erro de Conexão', `Falha ao autenticar: ${response.error_description || response.error}`, false);
                            return;
                        }
                        this.googleAccessToken = response.access_token;
                        localStorage.setItem('condosafe_google_access_token', this.googleAccessToken);
                        showToast('Conectado!', 'Aplicativo conectado ao Google Drive com sucesso!', true);
                        this.updateCloudSyncUI();
                        await this.syncGoogleDriveNow();
                        
                        const autoSyncCheckbox = document.getElementById('cloud-auto-sync-checkbox');
                        if (autoSyncCheckbox && autoSyncCheckbox.checked) {
                            this.toggleAutoSync(true);
                        }
                    }
                });
            }
            this.googleTokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
            console.error("GIS Token Client Init Failed:", err);
            showToast('Erro', 'Não foi possível inicializar o cliente do Google. Verifique se o seu Client ID está correto.', false);
        }
    },

    disconnectGoogleDrive() {
        this.googleAccessToken = null;
        localStorage.removeItem('condosafe_google_access_token');
        this.cloudFileId = null;
        this.toggleAutoSync(false);
        this.updateCloudSyncUI();
        showToast('Desconectado', 'Sua conta do Google foi desconectada.', true);
    },

    toggleAutoSync(enabled) {
        localStorage.setItem('condosafe_auto_sync', enabled);
        if (this.autoSyncIntervalId) {
            clearInterval(this.autoSyncIntervalId);
            this.autoSyncIntervalId = null;
        }
        
        if (enabled && this.googleAccessToken) {
            this.autoSyncIntervalId = setInterval(() => {
                this.syncGoogleDriveNow(true); // Silent background sync
            }, 30000); // 30 seconds
            console.log('Background Auto-sync activated.');
        }
    },

    updateCloudSyncUI() {
        const container = document.getElementById('cloud-status-container');
        const iconWrapper = document.getElementById('cloud-status-icon-wrapper');
        const icon = document.getElementById('cloud-status-icon');
        const title = document.getElementById('cloud-status-title');
        const desc = document.getElementById('cloud-status-desc');
        const btnConnect = document.getElementById('btn-cloud-connect');
        const btnDisconnect = document.getElementById('btn-cloud-disconnect');
        const syncControls = document.getElementById('cloud-sync-controls');

        if (this.googleAccessToken) {
            // Connected UI
            if (iconWrapper) {
                iconWrapper.className = 'cloud-success';
                iconWrapper.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                iconWrapper.style.color = 'var(--success)';
            }
            if (icon) icon.className = 'fa-solid fa-cloud-arrow-up cloud-active';
            if (title) title.textContent = 'Conectado ao Google Drive';
            if (desc) desc.textContent = 'A sincronização em nuvem está ativa. Seus dados estão protegidos.';
            if (btnConnect) btnConnect.style.display = 'none';
            if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';
            if (syncControls) syncControls.style.display = 'flex';
        } else {
            // Disconnected UI
            if (iconWrapper) {
                iconWrapper.className = '';
                iconWrapper.style.backgroundColor = 'rgba(148, 163, 184, 0.1)';
                iconWrapper.style.color = 'var(--text-muted)';
            }
            if (icon) icon.className = 'fa-solid fa-cloud';
            if (title) title.textContent = 'Nuvem Desconectada';
            if (desc) desc.textContent = 'Os dados estão sendo salvos apenas localmente neste aparelho.';
            if (btnConnect) btnConnect.style.display = 'inline-flex';
            if (btnDisconnect) btnDisconnect.style.display = 'none';
            if (syncControls) syncControls.style.display = 'none';
        }
    },

    async syncGoogleDriveNow(silent = false) {
        if (!this.googleAccessToken) return;
        if (this.isSyncing) return;
        
        this.isSyncing = true;
        const syncIcon = document.getElementById('btn-sync-icon');
        if (syncIcon) syncIcon.classList.add('fa-spin');
        
        console.log('Iniciando sincronização com o Google Drive...');
        
        try {
            // 1. Search for existing file
            let fileId = this.cloudFileId;
            if (!fileId) {
                fileId = await this.findDbFileOnDrive();
                this.cloudFileId = fileId;
            }
            
            const localData = {
                residents: DB.getResidents(),
                packages: DB.getPackages(),
                logs: DB.getLogs()
            };
            
            // 2. If file not found, create new one
            if (!fileId) {
                console.log('Banco de dados remoto não localizado no Drive. Criando novo arquivo...');
                fileId = await this.createDbFileOnDrive();
                this.cloudFileId = fileId;
                await this.uploadToDrive(fileId, localData);
                
                const timeStr = new Date().toLocaleTimeString('pt-BR');
                const lastSyncEl = document.getElementById('cloud-last-sync-time');
                if (lastSyncEl) lastSyncEl.textContent = `Última sincronização (upload inicial): ${timeStr}`;
                
                if (!silent) showToast('Nuvem Inicializada', 'Banco de dados criado e carregado no Google Drive!', true);
            } else {
                // 3. File exists, download and merge
                console.log(`Banco de dados remoto localizado (ID: ${fileId}). Baixando dados...`);
                const remoteData = await this.downloadFromDrive(fileId);
                
                if (remoteData && remoteData.residents && remoteData.packages) {
                    console.log('Mesclando dados locais com remotos...');
                    const mergedData = this.mergeDatabases(localData, remoteData);
                    
                    // Save locally
                    DB.saveResidents(mergedData.residents);
                    DB.savePackages(mergedData.packages);
                    DB.saveLogs(mergedData.logs);
                    
                    // Upload merged data back
                    await this.uploadToDrive(fileId, mergedData);
                    
                    // Refresh current UI
                    this.renderAll();
                    
                    const timeStr = new Date().toLocaleTimeString('pt-BR');
                    const lastSyncEl = document.getElementById('cloud-last-sync-time');
                    if (lastSyncEl) lastSyncEl.textContent = `Última sincronização bem sucedida: ${timeStr}`;
                    
                    if (!silent) showToast('Sincronizado!', 'Seus dados foram mesclados e sincronizados com a nuvem.', true);
                } else {
                    // Corrupted or empty file? Just write local data
                    await this.uploadToDrive(fileId, localData);
                }
            }
        } catch (err) {
            console.error("Cloud Sync Error:", err);
            if (!silent) showToast('Erro de Sincronização', 'Não foi possível sincronizar com o Google Drive.', false);
        } finally {
            this.isSyncing = false;
            if (syncIcon) syncIcon.classList.remove('fa-spin');
        }
    },

    handleExpiredToken() {
        console.warn('Google Access Token expired or unauthorized.');
        this.googleAccessToken = null;
        localStorage.removeItem('condosafe_google_access_token');
        this.updateCloudSyncUI();
        showToast('Sessão Expirada', 'Conexão com Google Drive expirou. Clique em Conectar Conta novamente.', false);
    },

    async findDbFileOnDrive() {
        const query = encodeURIComponent("name = 'condosafe_db.json' and trashed = false");
        const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.googleAccessToken}`
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                this.handleExpiredToken();
                return null;
            }
            throw new Error(`Search failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.files && data.files.length > 0 ? data.files[0].id : null;
    },

    async downloadFromDrive(fileId) {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.googleAccessToken}`
            }
        });
        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }
        return await response.json();
    },

    async createDbFileOnDrive() {
        const url = 'https://www.googleapis.com/drive/v3/files';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.googleAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'condosafe_db.json',
                mimeType: 'application/json'
            })
        });
        if (!response.ok) {
            throw new Error(`Create failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.id;
    },

    async uploadToDrive(fileId, dbData) {
        const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.googleAccessToken}`,
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify(dbData)
        });
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        return await response.json();
    },

    mergeDatabases(local, remote) {
        // 1. Merge Residents
        const residentsMap = new Map();
        [...remote.residents, ...local.residents].forEach(r => {
            residentsMap.set(r.id, r);
        });
        const mergedResidents = Array.from(residentsMap.values());

        // 2. Merge Packages
        const packagesMap = new Map();
        const getStatusPriority = (status) => {
            if (status === 'Entregue') return 3;
            if (status === 'Aguardando Retirada') return 2;
            return 1; // Pré-cadastrada
        };

        [...remote.packages, ...local.packages].forEach(p => {
            if (packagesMap.has(p.id)) {
                const existing = packagesMap.get(p.id);
                const p1Priority = getStatusPriority(existing.status);
                const p2Priority = getStatusPriority(p.status);
                if (p2Priority > p1Priority) {
                    packagesMap.set(p.id, p);
                }
            } else {
                packagesMap.set(p.id, p);
            }
        });
        const mergedPackages = Array.from(packagesMap.values());

        // 3. Merge Logs
        const logsMap = new Map();
        [...remote.logs, ...local.logs].forEach(l => {
            logsMap.set(l.id, l);
        });
        const mergedLogs = Array.from(logsMap.values());
        mergedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return {
            residents: mergedResidents,
            packages: mergedPackages,
            logs: mergedLogs
        };
    },

    // ==========================================
    // 10. EVIDENCE PHOTO CAMERA & GMAIL NOTIFICATION ENGINE
    // ==========================================
    async openEvidenceModal() {
        const modal = document.getElementById('evidence-modal');
        const video = document.getElementById('evidence-video');
        
        modal.classList.add('active');
        
        try {
            this.evidenceStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            video.srcObject = this.evidenceStream;
        } catch (err) {
            console.error("Evidence Camera error:", err);
            showToast('Erro de Câmera', 'Não foi possível acessar a câmera para foto de evidência.', false);
            this.closeEvidenceModal();
        }
    },

    closeEvidenceModal() {
        document.getElementById('evidence-modal').classList.remove('active');
        if (this.evidenceStream) {
            this.evidenceStream.getTracks().forEach(track => track.stop());
            this.evidenceStream = null;
        }
    },

    captureEvidencePhoto() {
        const video = document.getElementById('evidence-video');
        const canvas = document.getElementById('evidence-canvas');
        
        // Shrink canvas resolution for lightweight storage and email attachments
        canvas.width = 400;
        canvas.height = 300;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Compressed JPEG
        const dataURL = canvas.toDataURL('image/jpeg', 0.7);
        
        this.setEvidencePhoto(dataURL);
        this.closeEvidenceModal();
        showToast('Foto Anexada', 'Imagem do pacote registrada como evidência!', true);
    },

    setEvidencePhoto(dataURL) {
        this.capturedPackagePhoto = dataURL;
        
        const preview = document.getElementById('package-photo-preview');
        const container = document.getElementById('package-photo-preview-container');
        const status = document.getElementById('package-photo-status');
        
        if (preview) preview.src = dataURL;
        if (container) container.style.display = 'block';
        if (status) status.textContent = 'Foto anexada com sucesso!';
    },

    removeEvidencePhoto() {
        this.capturedPackagePhoto = null;
        
        const container = document.getElementById('package-photo-preview-container');
        const status = document.getElementById('package-photo-status');
        const preview = document.getElementById('package-photo-preview');
        
        if (preview) preview.src = '';
        if (container) container.style.display = 'none';
        if (status) status.textContent = 'Nenhuma imagem anexada.';
    },

    async enviarEmailNotificacao(pkg, resident, photoDataUrl) {
        // Validate if cloud/gmail login is active
        if (!this.googleAccessToken) {
            console.log('Sincronização em nuvem inativa. E-mail de notificação pulado.');
            return;
        }

        if (!resident || !resident.email) {
            console.warn(`Morador ${resident ? resident.name : 'Desconhecido'} não possui e-mail cadastrado.`);
            const logs = DB.getLogs();
            logs.unshift({
                id: 'log-' + Date.now(),
                timestamp: new Date().toISOString(),
                type: 'ENTRADA',
                packageCode: pkg.code,
                description: `Aviso de e-mail cancelado: Morador ${resident ? resident.name : ''} sem e-mail cadastrado.`
            });
            DB.saveLogs(logs);
            this.renderLogs();
            return;
        }

        console.log(`Disparando e-mail de notificação para ${resident.email}...`);

        try {
            // Build modern HTML email
            const emailSubject = `CondoSafe - Encomenda Recebida na Portaria (${pkg.code})`;
            const emailBody = `
                <div style="font-family: sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #0f172a; text-align: center;">
                    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); text-align: left;">
                        <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; color: white; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">CondoSafe</h1>
                            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.85; text-transform: uppercase; letter-spacing: 1px;">Mercadoria Recebida</p>
                        </div>
                        <div style="padding: 30px;">
                            <h2 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Olá, ${resident.name}!</h2>
                            <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                Informamos que uma nova mercadoria para sua unidade (<strong>Quadra ${resident.quadra}, Lote ${resident.lote}</strong>) foi recebida e encontra-se guardada em segurança na portaria do condomínio.
                            </p>
                            
                            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 14px; border-left: 4px solid #6366f1;">
                                <div style="margin-bottom: 8px;"><strong>Código de Rastreio:</strong> <span style="font-family: monospace; font-weight: bold; color: #4f46e5;">${pkg.code}</span></div>
                                <div style="margin-bottom: 8px;"><strong>Data e Hora:</strong> ${new Date(pkg.receivedAt || Date.now()).toLocaleString('pt-BR')}</div>
                                <div><strong>Operador:</strong> Portaria A</div>
                            </div>
                            
                            ${photoDataUrl ? `
                            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #475569;">Foto de Evidência do Pacote:</p>
                            <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px; background: #000; text-align: center;">
                                <img src="cid:pacote_anexo" style="max-width: 100%; display: block; margin: 0 auto; max-height: 250px; object-fit: contain;" alt="Foto do Pacote">
                            </div>` : ''}
                            
                            <p style="margin: 0 0 5px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                Por favor, dirija-se à portaria com um dispositivo móvel ou documento de identificação para retirar seu pacote. Será solicitada sua assinatura digital na entrega.
                            </p>
                        </div>
                        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                            CondoSafe &copy; 2026 - Controle Inteligente de Portaria
                        </div>
                    </div>
                </div>
            `;

            // Compile MIME multipart message
            const rawMessage = this.buildMimeMessage(resident.email, emailSubject, emailBody, photoDataUrl);

            // Fetch to Gmail API send endpoint
            const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.googleAccessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    raw: rawMessage
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleExpiredToken();
                    return;
                }
                throw new Error(`Gmail API response error: ${response.statusText}`);
            }

            console.log(`E-mail de notificação enviado para ${resident.email}.`);
            
            // Log entry success
            const logs = DB.getLogs();
            logs.unshift({
                id: 'log-' + Date.now(),
                timestamp: new Date().toISOString(),
                type: 'ENTRADA',
                packageCode: pkg.code,
                description: `Notificação enviada por e-mail para ${resident.name} (${resident.email})${photoDataUrl ? ' contendo imagem de evidência' : ''}.`
            });
            DB.saveLogs(logs);
            this.renderLogs();

        } catch (err) {
            console.error("Failed to dispatch Gmail Notification:", err);
            const logs = DB.getLogs();
            logs.unshift({
                id: 'log-' + Date.now(),
                timestamp: new Date().toISOString(),
                type: 'ENTRADA',
                packageCode: pkg.code,
                description: `Erro ao disparar e-mail de notificação para ${resident.email}: ${err.message}`
            });
            DB.saveLogs(logs);
            this.renderLogs();
        }
    },

    buildMimeMessage(to, subject, bodyHtml, imageBase64DataUrl) {
        const boundary = "boundary_condosafe_" + Date.now().toString(16);
        let mail = [
            `To: ${to}`,
            `Subject: ${subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            ``,
            `--${boundary}`,
            `Content-Type: text/html; charset="UTF-8"`,
            `Content-Transfer-Encoding: 7bit`,
            ``,
            bodyHtml,
            ``
        ];

        if (imageBase64DataUrl) {
            const parts = imageBase64DataUrl.split(',');
            const mimeType = parts[0].match(/:(.*?);/)[1];
            const base64Data = parts[1];
            
            mail = mail.concat([
                `--${boundary}`,
                `Content-Type: ${mimeType}; name="pacote.jpg"`,
                `Content-ID: <pacote_anexo>`,
                `Content-Disposition: inline; filename="pacote.jpg"`,
                `Content-Transfer-Encoding: base64`,
                ``,
                base64Data,
                ``
            ]);
        }

        mail.push(`--${boundary}--`);

        // Safe Base64URL encoding compliant with Gmail REST API
        const rawMimeString = mail.join('\r\n');
        const raw = btoa(unescape(encodeURIComponent(rawMimeString)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        return raw;
    }
};

// Start application when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
