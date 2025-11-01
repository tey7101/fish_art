// Drawing logic
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true }); // 性能优化：频繁读取画布
ctx.lineWidth = 6; // Make lines thicker for better visibility
let drawing = false;
let canvasRect = null; // Cache canvas rect to prevent layout thrashing

// ===== 绘画粒子效果 =====
let particles = [];

function createDrawingParticle(x, y) {
    const particlesContainer = document.getElementById('drawing-particles');
    if (!particlesContainer) return;
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.position = 'absolute';
    
    // 紫色系粒子
    const colors = ['#6366F1', '#A5B4FC', '#C7D2FE'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const size = Math.random() * 6 + 3;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.background = color;
    particle.style.borderRadius = '50%';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
    particle.style.setProperty('--ty', -(Math.random() * 100 + 50) + 'px');
    particle.style.animation = 'explode 0.8s ease-out forwards';
    
    particlesContainer.appendChild(particle);
    
    // 移除粒子
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 800);
}

// ===== 庆祝纸屑效果（紫色系）=====
function createConfetti(x, y, count = 30) {
    const particlesContainer = document.getElementById('drawing-particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'particle';
        confetti.style.position = 'absolute';
        
        // 紫色系纸屑
        const colors = ['#6366F1', '#A5B4FC', '#C7D2FE', '#EEF2FF'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const size = Math.random() * 8 + 4;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.background = color;
        confetti.style.borderRadius = '50%';
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        
        // 随机方向
        const angle = (Math.PI * 2 * i) / count;
        const velocity = Math.random() * 150 + 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 100; // 向上偏移
        
        confetti.style.setProperty('--tx', tx + 'px');
        confetti.style.setProperty('--ty', ty + 'px');
        confetti.style.animation = 'confetti 1.2s ease-out forwards';
        
        particlesContainer.appendChild(confetti);
        
        // 移除纸屑
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 1200);
    }
}


// Mouse events
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    canvasRect = canvas.getBoundingClientRect(); // Cache rect once at start
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        
        // 添加绘画粒子效果（降低频率以提升性能）
        // offsetX/Y 已经是相对于canvas元素的坐标，可以直接用于粒子
        if (Math.random() > 0.7) {
            createDrawingParticle(e.offsetX, e.offsetY);
        }
    }
});
canvas.addEventListener('mouseup', () => {
    drawing = false;
    canvasRect = null; // Clear cache
    checkFishAfterStroke();
});
canvas.addEventListener('mouseleave', () => {
    drawing = false;
    canvasRect = null; // Clear cache
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    drawing = true;
    canvasRect = canvas.getBoundingClientRect(); // Cache rect once at start
    const touch = e.touches[0];
    
    // 计算缩放比例（Canvas内部尺寸 vs 显示尺寸）
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    
    // 转换触摸坐标到Canvas坐标系
    const canvasX = (touch.clientX - canvasRect.left) * scaleX;
    const canvasY = (touch.clientY - canvasRect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(canvasX, canvasY);
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing && canvasRect) {
        const touch = e.touches[0];
        
        // 计算触摸点相对于Canvas元素的位置（显示坐标）
        const displayX = touch.clientX - canvasRect.left;
        const displayY = touch.clientY - canvasRect.top;
        
        // 计算缩放比例
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;
        
        // 转换到Canvas内部坐标系用于绘图
        const canvasX = displayX * scaleX;
        const canvasY = displayY * scaleY;
        
        ctx.lineTo(canvasX, canvasY);
        ctx.stroke();
        
        // 添加绘画粒子效果（降低频率以提升性能）
        // 粒子使用显示坐标（相对于canvas元素）
        if (Math.random() > 0.7) {
            createDrawingParticle(displayX, displayY);
        }
    }
});
canvas.addEventListener('touchend', () => {
    drawing = false;
    canvasRect = null; // Clear cache
    checkFishAfterStroke();
});
canvas.addEventListener('touchcancel', () => {
    drawing = false;
    canvasRect = null; // Clear cache
});

// Ctrl + Z to undo
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    }
});

// Swim logic (submission only)
const swimBtn = document.getElementById('swim-btn');

// Modal helpers
function showModal(html, onClose) {
    let modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0, 0, 0, 0.6)';
    modal.style.backdropFilter = 'blur(5px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.style.animation = 'fadeIn 0.3s ease';
    
    const modalContent = document.createElement('div');
    modalContent.style.background = 'white';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '20px';
    modalContent.style.boxShadow = '0 15px 50px rgba(99, 102, 241, 0.3)';
    modalContent.style.border = '3px solid #C7D2FE';
    modalContent.style.minWidth = '320px';
    modalContent.style.maxWidth = '90vw';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflow = 'auto';
    modalContent.style.animation = 'fadeInScale 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    modalContent.innerHTML = html;
    
    modal.appendChild(modalContent);
    
    function close() {
        document.body.removeChild(modal);
        if (onClose) onClose();
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    document.body.appendChild(modal);
    return { close, modal };
}

// Enhanced success modal with social sharing
function showSuccessModal(fishImageUrl, needsModeration) {
    const config = window.SOCIAL_CONFIG;
    const overlay = document.createElement('div');
    overlay.className = 'success-modal-overlay';
    
    const modalHTML = `
        <div class="success-modal-content">
            <h2 style="color: #27ae60; margin-bottom: 20px;">🎉 ${needsModeration ? 'Fish Submitted!' : 'Your Fish is Swimming!'}</h2>
            
            <div class="fish-preview">
                <img src="${fishImageUrl}" alt="Your fish" style="max-width: 200px; border-radius: 10px; border: 3px solid #27ae60;">
            </div>
            
            <p class="cta-text" style="font-size: 16px; margin: 20px 0;">
                ${needsModeration 
                    ? 'Your fish will appear in the tank after review.' 
                    : 'Love creating with AI? Join our community!'}
            </p>
            
            <div class="social-actions" style="display: flex; gap: 12px; justify-content: center; margin: 20px 0;">
                <a href="${config.twitter.url}" target="_blank" rel="noopener noreferrer" class="btn btn-twitter" style="display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: #000; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Follow on X
                </a>
                <a href="${config.discord.inviteUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-discord" style="display: flex; align-items: center; gap: 6px; padding: 10px 20px; background: #5865F2; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Join Discord
                </a>
            </div>
            
            <div class="cta-text" style="margin-top: 24px; font-weight: 600;">
                Share your creation:
            </div>
            
            <div id="share-buttons-container"></div>
            
            <div style="margin-top: 24px; text-align: center;">
                <button onclick="goToTankWithMyFish()" class="cute-button cute-button-primary" style="padding: 12px 30px;">
                    View Fish Tank →
                </button>
            </div>
        </div>
    `;
    
    overlay.innerHTML = modalHTML;
    document.body.appendChild(overlay);
    
    // Add share buttons using the social share module
    const shareContainer = overlay.querySelector('#share-buttons-container');
    if (shareContainer && window.socialShare) {
        const shareMenu = window.socialShare.createShareMenu('success-modal-share');
        shareContainer.appendChild(shareMenu);
    }
    
    // Close modal when clicking outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

// --- Helper function to navigate to tank with my fish highlighted ---
function goToTankWithMyFish() {
    const myFishId = localStorage.getItem('myLastFishId');
    const myFishTime = localStorage.getItem('myLastFishTime');
    
    if (myFishId) {
        window.location.href = `tank.html?myFish=${myFishId}`;
    } else if (myFishTime) {
        window.location.href = `tank.html?myFishTime=${myFishTime}`;
    } else {
        window.location.href = 'tank.html';
    }
}

// --- Fish submission modal handler ---
async function submitFish(artist, needsModeration = false) {
    function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
        return new Blob([u8arr], { type: mime });
    }
    const fishImgData = canvas.toDataURL('image/png');
    const imageBlob = dataURLtoBlob(fishImgData);
    const formData = new FormData();
    formData.append('image', imageBlob, 'fish.png');
    formData.append('artist', artist);
    formData.append('needsModeration', needsModeration.toString());
    if(localStorage.getItem('userId')) {
        formData.append('userId', localStorage.getItem('userId'));
    }
    // Retro loading indicator
    let submitBtn = document.getElementById('submit-fish');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class='spinner' style='display:inline-block;width:18px;height:18px;border:3px solid #3498db;border-top:3px solid #fff;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;'></span>`;
    }
    // Add spinner CSS
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`;
        document.head.appendChild(style);
    }
    try {
        // Prepare headers with auth data if user is logged in
        const headers = {};
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            headers['Authorization'] = `Bearer ${userToken}`;
        }
        
        // Await server response
        const resp = await fetch(`${window.BACKEND_URL}/uploadfish`, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        const result = await resp.json();
        // Remove spinner and re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
        if (result && result.data && result.data.Image) {
            // Save today's date to track fish submission
            const today = new Date().toDateString();
            localStorage.setItem('lastFishDate', today);
            localStorage.setItem('userId', result.data.userId);
            
            // Save the fish ID or timestamp to identify "my fish" in the tank
            if (result.data.id) {
                localStorage.setItem('myLastFishId', result.data.id);
            } else {
                // If no ID, save timestamp for approximate matching
                localStorage.setItem('myLastFishTime', Date.now().toString());
            }
            
            // Show enhanced success modal with social sharing
            showSuccessModal(result.data.Image, needsModeration);
        } else {
            alert('Sorry, there was a problem uploading your fish. Please try again.');
        }
    } catch (err) {
        alert('Failed to submit fish: ' + err.message);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }
}

// Add flag to prevent multiple simultaneous submissions
let isSubmitting = false;

swimBtn.addEventListener('click', async () => {
    // Prevent multiple clicks while processing
    if (isSubmitting) {
        console.log('Already processing a submission, please wait...');
        return;
    }
    
    // Check if canvas is empty
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let hasDrawing = false;
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] !== 0) { // Check alpha channel
            hasDrawing = true;
            break;
        }
    }
    
    if (!hasDrawing) {
        showModal(`<div style='text-align:center; padding: 20px;'>
            <div style='color:#ff6b35; font-weight:bold; font-size: 18px; margin-bottom:16px;'>📝 Canvas is Empty</div>
            <div style='margin-bottom:20px; line-height:1.6; color: #666;'>Please draw a fish first!</div>
            <div style='display: flex; gap: 12px; justify-content: center;'>
                <button onclick="this.closest('[style*=\\'z-index: 9999\\']')?.remove()" class='cute-button cute-button-primary' style='padding: 10px 24px;'>OK</button>
            </div>
        </div>`, () => { });
        return;
    }
    
    try {
        // Set processing flag and disable button
        isSubmitting = true;
        swimBtn.disabled = true;
        swimBtn.style.opacity = '0.6';
        swimBtn.style.cursor = 'wait';
        const originalHTML = swimBtn.innerHTML;
        swimBtn.innerHTML = '<span class="button-icon">⏳</span><span class="button-text">Processing...</span>';
        
        // Check if model is loaded, if not try to load it
        if (!ortSession) {
            console.log('Model not loaded, attempting to load...');
            try {
                await loadFishModel();
            } catch (loadError) {
                console.error('Failed to load model:', loadError);
                // Model load failed, but allow submission without AI validation
                showModal(`<div style='text-align:center; padding: 20px;'>
                    <div style='color:#ffa500; font-weight:bold; font-size: 18px; margin-bottom:16px;'>⚠️ AI Unavailable</div>
                    <div style='margin-bottom:20px; line-height:1.6; color: #666;'>AI validation is currently unavailable. Your drawing will be submitted for manual review.</div>
                    <div style='margin-bottom:20px;'>
                        <label style='display: block; margin-bottom: 8px; font-weight: 500;'>Sign your art:</label>
                        <input id='artist-name' value='Anonymous' style='margin:0; padding:10px; width:80%; max-width:250px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;' placeholder='Your name'>
                    </div>
                    <div style='display: flex; gap: 12px; justify-content: center;'>
                        <button id='submit-fish' class='cute-button cute-button-primary' style='padding: 10px 24px;'>Submit for Review</button>
                        <button id='cancel-fish' class='cute-button' style='padding: 10px 24px; background: #e0e0e0;'>Cancel</button>
                    </div>
                </div>`, () => {
                    // Reset button state when modal closes
                    isSubmitting = false;
                    swimBtn.disabled = false;
                    swimBtn.style.opacity = '1';
                    swimBtn.style.cursor = 'pointer';
                    swimBtn.innerHTML = originalHTML;
                });
                
                document.getElementById('submit-fish').onclick = async () => {
                    const artist = document.getElementById('artist-name').value.trim() || 'Anonymous';
                    localStorage.setItem('artistName', artist);
                    await submitFish(artist, true); // Force moderation
                };
                document.getElementById('cancel-fish').onclick = () => {
                    document.querySelector('div[style*="z-index: 9999"]')?.remove();
                };
                return;
            }
        }
        
        // Check fish validity for warning purposes
        const isFish = await verifyFishDoodle(canvas);
        lastFishCheck = isFish;
        showFishWarning(!isFish);
        
        // Reset button state
        swimBtn.disabled = false;
        swimBtn.style.opacity = '1';
        swimBtn.style.cursor = 'pointer';
        swimBtn.innerHTML = originalHTML;
        
        // Get saved artist name or use Anonymous
        const savedArtist = localStorage.getItem('artistName');
        const defaultName = (savedArtist && savedArtist !== 'Anonymous') ? savedArtist : 'Anonymous';
        
        // Show different modal based on fish validity
        if (!isFish) {
            // Show moderation warning modal for low-scoring fish
            showModal(`<div style='text-align:center; padding: 20px;'>
                <div style='color:#ff6b35; font-weight:bold; font-size: 18px; margin-bottom:16px;'>⚠️ Low Fish Score</div>
                <div style='margin-bottom:20px; line-height:1.6; color: #666;'>I don't think this is a fish, but you can submit it anyway and I'll review it.</div>
                <div style='margin-bottom:20px;'>
                    <label style='display: block; margin-bottom: 8px; font-weight: 500;'>Sign your art:</label>
                    <input id='artist-name' value='${escapeHtml(defaultName)}' style='margin:0; padding:10px; width:80%; max-width:250px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px;' placeholder='Your name'>
                </div>
                <div style='display: flex; gap: 12px; justify-content: center;'>
                    <button id='submit-fish' class='cute-button cute-button-primary' style='padding: 10px 24px;'>Submit for Review</button>
                    <button id='cancel-fish' class='cute-button' style='padding: 10px 24px; background: #e0e0e0;'>Cancel</button>
                </div>
            </div>`, () => {
                isSubmitting = false;
            });
        } else {
            // Show normal submission modal for good fish
            showModal(`<div style='text-align:center; padding: 20px;'>
                <div style='color:#27ae60; font-weight:bold; font-size: 18px; margin-bottom:16px;'>✨ Great Fish!</div>
                <div style='margin-bottom:20px;'>
                    <label style='display: block; margin-bottom: 8px; font-weight: 500;'>Sign your art:</label>
                    <input id='artist-name' value='${escapeHtml(defaultName)}' style='margin:0; padding:10px; width:80%; max-width:250px; border: 2px solid #27ae60; border-radius: 6px; font-size: 14px;' placeholder='Your name'>
                </div>
                <div style='display: flex; gap: 12px; justify-content: center;'>
                    <button id='submit-fish' class='cute-button cute-button-primary' style='padding: 10px 24px; background:#27ae60;'>Submit</button>
                    <button id='cancel-fish' class='cute-button' style='padding: 10px 24px; background: #e0e0e0;'>Cancel</button>
                </div>
            </div>`, () => {
                isSubmitting = false;
            });
        }
        
        document.getElementById('submit-fish').onclick = async () => {
            const artist = document.getElementById('artist-name').value.trim() || 'Anonymous';
            // Save artist name to localStorage for future use
            localStorage.setItem('artistName', artist);
            await submitFish(artist, !isFish); // Pass moderation flag
        };
        document.getElementById('cancel-fish').onclick = () => {
            document.querySelector('div[style*="z-index: 9999"]')?.remove();
        };
        
    } catch (error) {
        console.error('Error processing fish submission:', error);
        
        // Reset button state
        swimBtn.disabled = false;
        swimBtn.style.opacity = '1';
        swimBtn.style.cursor = 'pointer';
        swimBtn.innerHTML = '<span class="button-icon">🌊</span><span class="button-text">Make it Swim!</span><span class="button-icon">🐟</span>';
        
        // Show error modal
        showModal(`<div style='text-align:center; padding: 20px;'>
            <div style='color:#ff6b35; font-weight:bold; font-size: 18px; margin-bottom:16px;'>❌ Error</div>
            <div style='margin-bottom:20px; line-height:1.6; color: #666;'>Failed to process your drawing. Please try again.</div>
            <div style='margin-bottom:12px; font-size: 12px; color: #999;'>${error.message}</div>
            <div style='display: flex; gap: 12px; justify-content: center;'>
                <button onclick="this.closest('[style*=\\'z-index: 9999\\']')?.remove()" class='cute-button cute-button-primary' style='padding: 10px 24px;'>OK</button>
            </div>
        </div>`, () => {
            isSubmitting = false;
        });
    }
});

// Paint options UI - 简化配色方案
const colors = [
    '#000000', // 黑色
    '#FFFFFF', // 白色
    '#FF6B6B', // 红色
    '#FFA500', // 橙色
    '#FFD54F', // 黄色
    '#A5D6A7', // 浅绿色
    '#4FC3F7', // 浅蓝色
    '#4169E1', // 深蓝色
    '#FF6B9D', // 粉红色
    '#9B59B6', // 紫色
    '#8B4513', // 棕色
    '#95A5A6'  // 灰色
];
let currentColor = colors[0];
let currentLineWidth = 6;
let undoStack = [];

function createPaintOptions() {
    let paintBar = document.getElementById('paint-bar');
    if (!paintBar) {
        paintBar = document.createElement('div');
        paintBar.id = 'paint-bar';
        paintBar.style.display = 'flex';
        paintBar.style.flexWrap = 'wrap';
        paintBar.style.gap = '8px';
        paintBar.style.margin = '8px auto';
        paintBar.style.alignItems = 'center';
        paintBar.style.justifyContent = 'center';
        paintBar.style.padding = '6px 10px';
        paintBar.style.maxWidth = '100%';
        paintBar.style.overflowX = 'auto';
        // Insert at the top of draw-ui
        const drawUI = document.getElementById('draw-ui');
        if (drawUI) drawUI.insertBefore(paintBar, drawUI.firstChild);
    } else {
        paintBar.innerHTML = '';
    }
    
    // Create a container for colors to make them wrap better on mobile
    const colorContainer = document.createElement('div');
    colorContainer.style.display = 'flex';
    colorContainer.style.flexWrap = 'wrap';
    colorContainer.style.gap = '4px';
    colorContainer.style.alignItems = 'center';
    
    // Color buttons
    colors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'cute-color-button';
        btn.style.background = color;
        btn.title = color;
        btn.onclick = () => {
            // 移除其他按钮的active类
            document.querySelectorAll('.cute-color-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            ctx.globalCompositeOperation = 'source-over';
            currentColor = color;
            ctx.strokeStyle = color;
        };
        colorContainer.appendChild(btn); 
    });
    
    // 默认选中第一个颜色
    if (colorContainer.firstChild) {
        colorContainer.firstChild.classList.add('active');
    }
    paintBar.appendChild(colorContainer);

    // Create a controls container for better mobile layout
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.flexWrap = 'nowrap'; // 强制单行
    controlsContainer.style.gap = '4px'; // 减小间距
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.justifyContent = 'center';
    controlsContainer.style.marginTop = '6px';

    // Eraser
    const eraserBtn = document.createElement('button');
    eraserBtn.textContent = 'Eraser';
    eraserBtn.style.padding = '3px 6px';
    eraserBtn.style.height = '22px';
    eraserBtn.style.fontSize = '11px';
    eraserBtn.style.borderRadius = '4px';
    eraserBtn.style.cursor = 'pointer';
    eraserBtn.style.whiteSpace = 'nowrap'; // 防止文字换行
    eraserBtn.style.flexShrink = '0'; // 防止被压缩
    eraserBtn.onclick = () => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = currentLineWidth;
    };
    controlsContainer.appendChild(eraserBtn);

    // Line width container
    const widthContainer = document.createElement('div');
    widthContainer.style.display = 'flex';
    widthContainer.style.alignItems = 'center';
    widthContainer.style.gap = '3px';
    widthContainer.style.flexShrink = '0'; // 防止被压缩
    
    const widthLabel = document.createElement('span');
    widthLabel.textContent = 'Size:';
    widthLabel.style.fontSize = '11px';
    widthLabel.style.whiteSpace = 'nowrap';
    widthContainer.appendChild(widthLabel);
    
    const widthSlider = document.createElement('input');
    widthSlider.type = 'range';
    widthSlider.min = 1;
    widthSlider.max = 20;
    widthSlider.value = currentLineWidth;
    widthSlider.style.width = '60px'; // 缩小滑块宽度
    widthSlider.oninput = () => {
        currentLineWidth = widthSlider.value;
    };
    widthContainer.appendChild(widthSlider);
    controlsContainer.appendChild(widthContainer);
    
    paintBar.appendChild(controlsContainer);
}
createPaintOptions();

function pushUndo() {
    // Save current canvas state as image data
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    // Limit stack size
    if (undoStack.length > 30) undoStack.shift();
}

function undo() {
    if (undoStack.length > 0) {
        const imgData = undoStack.pop();
        ctx.putImageData(imgData, 0, 0);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    // Recalculate fish probability after undo
    checkFishAfterStroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    checkFishAfterStroke();
}

function createUndoButton() {
    let paintBar = document.getElementById('paint-bar');
    if (paintBar) {
        // Find the controls container
        let controlsContainer = paintBar.querySelector('div:last-child');
        if (controlsContainer) {
            const undoBtn = document.createElement('button');
            undoBtn.textContent = 'Undo';
            undoBtn.style.padding = '3px 6px';
            undoBtn.style.height = '22px';
            undoBtn.style.fontSize = '11px';
            undoBtn.style.borderRadius = '4px';
            undoBtn.style.cursor = 'pointer';
            undoBtn.style.whiteSpace = 'nowrap';
            undoBtn.style.flexShrink = '0';
            undoBtn.onclick = undo;
            controlsContainer.appendChild(undoBtn);
        }
    }
}

function createClearButton() {
    let paintBar = document.getElementById('paint-bar');
    if (paintBar) {
        // Find the controls container
        let controlsContainer = paintBar.querySelector('div:last-child');
        if (controlsContainer) {
            const clearBtn = document.createElement('button');
            clearBtn.textContent = 'Clear';
            clearBtn.style.padding = '4px 8px';
            clearBtn.style.height = '24px';
            clearBtn.style.fontSize = '12px';
            clearBtn.style.borderRadius = '4px';
            clearBtn.style.cursor = 'pointer';
            clearBtn.onclick = clearCanvas;
            controlsContainer.appendChild(clearBtn);
        }
    }
}

function createFlipButton() {
    let paintBar = document.getElementById('paint-bar');
    if (paintBar) {
        // Find the controls container
        let controlsContainer = paintBar.querySelector('div:last-child');
        if (controlsContainer) {
            const flipBtn = document.createElement('button');
            flipBtn.textContent = 'Flip';
            flipBtn.style.padding = '4px 8px';
            flipBtn.style.height = '24px';
            flipBtn.style.fontSize = '12px';
            flipBtn.style.borderRadius = '4px';
            flipBtn.style.cursor = 'pointer';
            flipBtn.onclick = flipCanvas;
            controlsContainer.appendChild(flipBtn);
        }
    }
}

// Push to undo stack before every new stroke
canvas.addEventListener('mousedown', pushUndo);
canvas.addEventListener('touchstart', pushUndo);

// Add undo button to paint bar
createUndoButton();

// Add clear button to paint bar
createClearButton();

// Update drawing color and line width
canvas.addEventListener('mousedown', () => {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
});
canvas.addEventListener('touchstart', () => {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
});

// Helper to crop whitespace (transparent or white) from a canvas
function cropCanvasToContent(srcCanvas) {
    const ctx = srcCanvas.getContext('2d');
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = imgData.data[i];
            const g = imgData.data[i + 1];
            const b = imgData.data[i + 2];
            const a = imgData.data[i + 3];
            // Consider non-transparent and not white as content
            if (a > 16 && !(r > 240 && g > 240 && b > 240)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }
    if (!found) return srcCanvas; // No content found
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const cropped = document.createElement('canvas');
    cropped.width = cropW;
    cropped.height = cropH;
    cropped.getContext('2d').drawImage(srcCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropped;
}

// Helper to crop, scale, and center a fish image into a display canvas
function makeDisplayFishCanvas(img, width = 80, height = 48) {
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = width;
    displayCanvas.height = height;
    const displayCtx = displayCanvas.getContext('2d');
    // Draw image to temp canvas at its natural size
    const temp = document.createElement('canvas');
    temp.width = img.width;
    temp.height = img.height;
    temp.getContext('2d').drawImage(img, 0, 0);
    const cropped = cropCanvasToContent(temp);
    displayCtx.clearRect(0, 0, width, height);
    const scale = Math.min(width / cropped.width, height / cropped.height);
    const drawW = cropped.width * scale;
    const drawH = cropped.height * scale;
    const dx = (width - drawW) / 2;
    const dy = (height - drawH) / 2;
    displayCtx.drawImage(cropped, 0, 0, cropped.width, cropped.height, dx, dy, drawW, drawH);
    return displayCanvas;
}

// ONNX fish doodle classifier integration
let ortSession = null;
let lastFishCheck = true;
let isModelLoading = false;
let modelLoadPromise = null;

// UI元素引用
const loadingStatusEl = document.getElementById('model-loading-status');
const loadingTextEl = document.getElementById('loading-text');
const progressBarEl = document.getElementById('model-progress-bar');
const progressPercentageEl = document.getElementById('progress-percentage');
const loadingTipEl = document.getElementById('loading-tip');
const swimButton = document.getElementById('swim-btn');

// 检测网络速度
function getNetworkSpeed() {
    if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
            const downlink = connection.downlink; // Mbps
            return { effectiveType, downlink };
        }
    }
    return null;
}

// 更新加载UI
function updateLoadingUI(state, progress = 0, message = '') {
    if (!loadingStatusEl) return;
    
    switch (state) {
        case 'show':
            loadingStatusEl.style.display = 'block';
            loadingStatusEl.className = 'model-loading-container';
            if (swimButton) swimButton.disabled = true;
            
            // 统一显示AI Loading，不显示网络类型
            loadingTextEl.textContent = 'AI Loading';
            break;
            
        case 'progress':
            if (progressBarEl) progressBarEl.style.width = progress + '%';
            if (progressPercentageEl) progressPercentageEl.textContent = Math.round(progress) + '%';
            // 不更新文字，保持简洁
            break;
            
        case 'loaded':
            loadingStatusEl.className = 'model-loading-container loaded';
            if (loadingTextEl) loadingTextEl.textContent = '✅ AI Ready';
            if (progressBarEl) progressBarEl.style.width = '100%';
            if (progressPercentageEl) progressPercentageEl.textContent = '100%';
            if (swimButton) swimButton.disabled = false;
            
            // 1.5秒后隐藏加载提示
            setTimeout(() => {
                if (loadingStatusEl) loadingStatusEl.style.display = 'none';
            }, 1500);
            break;
            
        case 'error':
            loadingStatusEl.className = 'model-loading-container error';
            if (loadingTextEl) loadingTextEl.textContent = '❌ Loading Failed';
            if (loadingTipEl) loadingTipEl.textContent = message || 'Please refresh and try again';
            if (swimButton) swimButton.disabled = false; // 仍然允许提交，但没有AI验证
            break;
            
        case 'hide':
            if (loadingStatusEl) loadingStatusEl.style.display = 'none';
            break;
    }
}

// Load ONNX model with progress tracking
async function loadFishModel() {
    // If already loaded, return immediately
    if (ortSession) {
        return ortSession;
    }
    
    // If already loading, return the existing promise
    if (isModelLoading && modelLoadPromise) {
        return modelLoadPromise;
    }
    
    // Start loading
    isModelLoading = true;
    console.log('Loading fish model...');
    updateLoadingUI('show');
    
    modelLoadPromise = (async () => {
        try {
            // 使用 Fetch API 下载模型文件并跟踪进度
            const modelUrl = 'fish_doodle_classifier.onnx';
            const response = await fetch(modelUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentLength = response.headers.get('content-length');
            if (!contentLength) {
                // 如果无法获取文件大小，显示不确定进度
                updateLoadingUI('progress', 50, 'AI模型下载中...');
            }
            
            const total = parseInt(contentLength, 10);
            let loaded = 0;
            
            // 使用 ReadableStream 跟踪下载进度
            const reader = response.body.getReader();
            const chunks = [];
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                loaded += value.length;
                
                // 更新进度条
                if (total) {
                    const progress = (loaded / total) * 100;
                    updateLoadingUI('progress', progress, 'AI模型下载中...');
                }
            }
            
            // 合并所有chunk
            const blob = new Blob(chunks);
            const arrayBuffer = await blob.arrayBuffer();
            
            // 加载到 ONNX Runtime
            updateLoadingUI('progress', 95, '正在初始化AI模型...');
            ortSession = await window.ort.InferenceSession.create(arrayBuffer);
            
            console.log('Fish model loaded successfully');
            updateLoadingUI('loaded');
            
            return ortSession;
        } catch (error) {
            console.error('Failed to load fish model:', error);
            updateLoadingUI('error', 0, error.message);
            throw error;
        } finally {
            isModelLoading = false;
        }
    })();
    
    return modelLoadPromise;
}

// Updated preprocessing to match new grayscale model (3-channel) with ImageNet normalization
function preprocessCanvasForONNX(canvas) {
    const SIZE = 224; // Standard ImageNet input size
    
    // Create a temporary canvas for resizing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = SIZE;
    tempCanvas.height = SIZE;
    
    // Fill with white background (matching WhiteBgLoader in Python)
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, SIZE, SIZE);
    
    // Draw the original canvas onto the temp canvas (resized)
    tempCtx.drawImage(canvas, 0, 0, SIZE, SIZE);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, SIZE, SIZE);
    const data = imageData.data;
    
    // Create input tensor array [1, 3, 224, 224] - CHW format
    const input = new Float32Array(1 * 3 * SIZE * SIZE);
    
    // ImageNet normalization values (same as in Python code)
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    
    // Convert RGBA to RGB and normalize
    for (let i = 0; i < SIZE * SIZE; i++) {
        const pixelIndex = i * 4; // RGBA format
        
        // Extract RGB values (0-255)
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        // Convert to [0, 1] range
        const rNorm = r / 255.0;
        const gNorm = g / 255.0;
        const bNorm = b / 255.0;
        
        // Apply ImageNet normalization: (pixel - mean) / std
        const rStandardized = (rNorm - mean[0]) / std[0];
        const gStandardized = (gNorm - mean[1]) / std[1];
        const bStandardized = (bNorm - mean[2]) / std[2];
        
        // Store in CHW format (Channel-Height-Width)
        // R channel: indices 0 to SIZE*SIZE-1
        // G channel: indices SIZE*SIZE to 2*SIZE*SIZE-1  
        // B channel: indices 2*SIZE*SIZE to 3*SIZE*SIZE-1
        input[i] = rStandardized;                    // R channel
        input[i + SIZE * SIZE] = gStandardized;      // G channel
        input[i + 2 * SIZE * SIZE] = bStandardized;  // B channel
    }
    
    return new window.ort.Tensor('float32', input, [1, 3, SIZE, SIZE]);
}

// Updated verifyFishDoodle function to match new model output format
async function verifyFishDoodle(canvas) {
    // Model should already be loaded, but check just in case
    if (!ortSession) {
        throw new Error('Fish model not loaded');
    }
    
    // Use updated preprocessing
    const inputTensor = preprocessCanvasForONNX(canvas);
    
    // Run inference
    let feeds = {};
    if (ortSession && ortSession.inputNames && ortSession.inputNames.length > 0) {
        feeds[ortSession.inputNames[0]] = inputTensor;
    } else {
        feeds['input'] = inputTensor;
    }
    const results = await ortSession.run(feeds);
    const outputKey = Object.keys(results)[0];
    const output = results[outputKey].data;
    
    // The model outputs a single logit value
    // During training: labels = 1 - labels, so fish = 0, not_fish = 1
    // Model output > 0.5 means "not_fish", < 0.5 means "fish"
    const logit = output[0];
    const prob = 1 / (1 + Math.exp(-logit));  // Sigmoid activation
    
    // Since the model was trained with inverted labels (fish=0, not_fish=1)
    // A low probability means it's more likely to be a fish
    const fishProbability = 1 - prob;
    const isFish = fishProbability >= 0.60;  // Threshold for fish classification
        
    // Update UI with fish probability
    // Display the probability (element is pre-created in HTML to prevent layout shifts)
    const probDiv = document.getElementById('fish-probability');
    if (probDiv) {
        // 更新文本和样式类
        probDiv.textContent = `🐠 Fish probability: ${(fishProbability * 100).toFixed(1)}% ${isFish ? '✨' : '⚠️'}`;
        probDiv.className = isFish ? 'high-probability' : 'low-probability';
        probDiv.style.opacity = '1';
    }
    
    return isFish;
}

// Show/hide fish warning and update background color
function showFishWarning(show) {
    const drawUI = document.getElementById('draw-ui');
    if (drawUI) {
        drawUI.style.background = show ? '#ffeaea' : '#eaffea'; // red for invalid, green for valid
        drawUI.style.transition = 'background 0.3s';
    }
}

// After each stroke, check if it's a fish
async function checkFishAfterStroke() {
    if (!window.ort) {
        console.warn('ONNX Runtime not available, skipping fish detection');
        return; // ONNX runtime not loaded
    }
    
    // Wait for model to be loaded if it's not ready yet
    if (!ortSession) {
        try {
            console.log('Model not loaded yet, attempting to load...');
            await loadFishModel();
        } catch (error) {
            console.error('Model not available for fish checking:', error);
            // Show a one-time warning to the user
            if (!window.modelLoadErrorShown) {
                window.modelLoadErrorShown = true;
                console.error('AI fish detection is currently unavailable. Your drawing can still be submitted.');
            }
            return;
        }
    }
    
    try {
        const isFish = await verifyFishDoodle(canvas);
        lastFishCheck = isFish;
        showFishWarning(!isFish);
    } catch (error) {
        console.error('Error during fish verification:', error);
    }
}

// Initialize ONNX Runtime and load model when page loads
(function ensureONNXRuntime() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeONNX);
    } else {
        initializeONNX();
    }
    
    function initializeONNX() {
        if (!window.ort) {
            console.error('ONNX Runtime not loaded! Please check if the script is included in HTML.');
            return;
        }
        
        console.log('ONNX Runtime available, starting model load...');
        loadFishModel().catch(error => {
            console.error('Failed to load fish model on startup:', error);
            console.error('Model path: fish_doodle_classifier.onnx');
            console.error('Please ensure the model file exists in the project root directory.');
        });
    }
})();

// Check if user already drew a fish today when page loads
// Function to show welcome back message for returning users
function showWelcomeBackMessage() {
    const userId = localStorage.getItem('userId');
    const artistName = localStorage.getItem('artistName');
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    const welcomeElement = document.getElementById('welcome-back-message');
    
    // Only show for users who have interacted before but haven't created an account
    if (userId && artistName && artistName !== 'Anonymous' && !userToken) {
        welcomeElement.innerHTML = `
            Welcome back, <strong>${escapeHtml(artistName)}</strong>! 
            <a href="login.html" style="color: #0066cc; text-decoration: underline;">Create an account</a> 
            to build custom tanks and share with friends.
        `;
        welcomeElement.style.display = 'block';
    } else if (userToken && userData) {
        // For authenticated users, show a simple welcome with their display name
        try {
            const user = JSON.parse(userData);
            const displayName = user.displayName || 'Artist';
            welcomeElement.innerHTML = `Welcome back, <strong>${escapeHtml(displayName)}</strong>! 🎨`;
            welcomeElement.style.background = '#e8f5e8';
            welcomeElement.style.borderColor = '#b3d9b3';
            welcomeElement.style.display = 'block';
        } catch (e) {
            // If userData is malformed, don't show anything
            console.warn('Malformed userData in localStorage');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Show welcome back message for returning users
    showWelcomeBackMessage();
    
    const today = new Date().toDateString();
    const lastFishDate = localStorage.getItem('lastFishDate');
    console.log(`Last fish date: ${lastFishDate}, Today: ${today}`);
    if (lastFishDate === today) {
        showModal(`
            <div style='text-align:center;'>
                <div style='font-size: 3em; margin-bottom: 15px;'>🐠</div>
                <h2 style='color: #4F46E5; margin: 0 0 10px 0; font-size: 1.5em;'>You already drew a fish today!</h2>
                <p style='color: #666; margin-bottom: 25px; font-size: 1em; line-height: 1.5;'>
                    Come back tomorrow to create another masterpiece, or explore the tank now!
                </p>
                <div style='display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;'>
                    <button id='go-to-tank' class='cute-button cute-button-primary' style='padding: 12px 24px; font-size: 1em; border: none; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); transition: all 0.3s ease; font-weight: 600;'>
                        🐠 View Tank
                    </button>
                    <button id='draw-another' class='cute-button' style='padding: 12px 24px; font-size: 1em; border: 2px solid #6366F1; background: white; color: #6366F1; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-weight: 600;'>
                        ✏️ Draw Anyway
                    </button>
                </div>
            </div>
        `, () => { });
        
        // Add hover effects
        const goToTankBtn = document.getElementById('go-to-tank');
        const drawAnotherBtn = document.getElementById('draw-another');
        
        goToTankBtn.onmouseover = () => {
            goToTankBtn.style.transform = 'translateY(-2px)';
            goToTankBtn.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
        };
        goToTankBtn.onmouseout = () => {
            goToTankBtn.style.transform = 'translateY(0)';
            goToTankBtn.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
        };
        goToTankBtn.onclick = () => {
            goToTankWithMyFish();
        };
        
        drawAnotherBtn.onmouseover = () => {
            drawAnotherBtn.style.background = '#6366F1';
            drawAnotherBtn.style.color = 'white';
            drawAnotherBtn.style.transform = 'translateY(-2px)';
        };
        drawAnotherBtn.onmouseout = () => {
            drawAnotherBtn.style.background = 'white';
            drawAnotherBtn.style.color = '#6366F1';
            drawAnotherBtn.style.transform = 'translateY(0)';
        };
        drawAnotherBtn.onclick = () => {
            document.querySelector('div[style*="z-index: 9999"]')?.remove();
        };
    }
});

// ===== 迷你鱼缸预览功能 =====
(function initMiniTankPreview() {
    const previewSection = document.getElementById('mini-tank-preview');
    const previewGrid = document.getElementById('fish-preview-grid');
    
    if (!previewSection || !previewGrid) return;
    
    let previewLoaded = false;
    
    // 使用 Intersection Observer 实现懒加载
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !previewLoaded) {
                previewLoaded = true;
                loadMiniTankPreview();
                observer.disconnect();
            }
        });
    }, {
        rootMargin: '100px' // 提前100px开始加载
    });
    
    observer.observe(previewSection);
    
    // 加载最近的鱼
    async function loadMiniTankPreview() {
        try {
            // 显示预览区域
            previewSection.style.display = 'block';
            
            // 使用backend API获取最近的8条鱼
            const response = await fetch(`${window.BACKEND_URL}/api/fish?sort=recent&limit=8`);
            
            if (!response.ok) {
                throw new Error('Failed to load fish preview');
            }
            
            const result = await response.json();
            const fishList = result.data || [];
            
            if (!fishList || fishList.length === 0) {
                previewGrid.innerHTML = '<div class="preview-empty">No fish yet! Be the first to draw one!</div>';
                return;
            }
            
            // 清空加载提示
            previewGrid.innerHTML = '';
            
            // 渲染鱼缩略图
            fishList.forEach((fish) => {
                const item = document.createElement('div');
                item.className = 'fish-preview-item';
                
                // Handle different backend response formats
                const fishData = fish.data || fish;
                const artist = fishData.artist || fishData.Artist || 'Anonymous';
                const score = fishData.score || 0;
                item.title = `Artist: ${artist}\nScore: ${score}`;
                
                // 创建canvas显示鱼的图像
                const canvas = document.createElement('canvas');
                canvas.width = 80;
                canvas.height = 48;
                const ctx = canvas.getContext('2d');
                
                // 加载图像
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, 80, 48);
                };
                img.onerror = () => {
                    // 如果图像加载失败，显示占位符
                    ctx.fillStyle = '#E3F2FD';
                    ctx.fillRect(0, 0, 80, 48);
                    ctx.fillStyle = '#1565C0';
                    ctx.font = '24px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🐠', 40, 24);
                };
                const imageUrl = fishData.image || fishData.Image;
                if (imageUrl) {
                    img.src = imageUrl;
                }
                
                item.appendChild(canvas);
                
                // 点击跳转到鱼缸页面
                item.onclick = () => {
                    window.location.href = 'tank.html';
                };
                
                previewGrid.appendChild(item);
            });
            
            console.log('[Mini Tank Preview] Loaded', fishList.length, 'fish');
            
        } catch (error) {
            console.error('[Mini Tank Preview] Error:', error);
            previewGrid.innerHTML = '<div class="preview-empty">Loading failed 😢<br>Please try again later</div>';
        }
    }
})();
