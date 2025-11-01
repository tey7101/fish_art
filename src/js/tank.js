// Fish Tank Only JS
// This file contains only the logic for displaying and animating the fish tank.

const swimCanvas = document.getElementById('swim-canvas');
const swimCtx = swimCanvas.getContext('2d');
const fishes = [];

// Food system
const foodPellets = [];
const FOOD_SIZE = 8; // Increased size for better visibility
const FOOD_FALL_SPEED = .01;
const FOOD_DETECTION_RADIUS = 200; // Moderate detection radius
const FOOD_LIFESPAN = 15000; // 15 seconds
const FOOD_ATTRACTION_FORCE = 0.003; // Moderate attraction force

// Food pellet creation and management
function createFoodPellet(x, y) {
    return {
        x: x,
        y: y,
        vy: 0, // Initial vertical velocity
        createdAt: Date.now(),
        consumed: false,
        size: FOOD_SIZE
    };
}

function dropFoodPellet(x, y) {
    // Create a small cluster of food pellets for more realistic feeding
    const pelletCount = Math.floor(Math.random() * 3) + 2; // 2-4 pellets
    for (let i = 0; i < pelletCount; i++) {
        const offsetX = (Math.random() - 0.5) * 20; // Spread pellets around click point
        const offsetY = (Math.random() - 0.5) * 10;
        foodPellets.push(createFoodPellet(x + offsetX, y + offsetY));
    }

    // Add visual feedback for feeding
    createFeedingEffect(x, y);
}

function createFeedingEffect(x, y) {
    // Create a colorful splash effect when food is dropped
    const effect = {
        x: x,
        y: y,
        particles: [],
        createdAt: Date.now(),
        duration: 500,
        type: 'feeding'
    };

    // Create purple splash particles
    const colors = ['#6366F1', '#A5B4FC', '#C7D2FE', '#EEF2FF'];
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const velocity = Math.random() * 3 + 2;
        effect.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 4 + 2
        });
    }

    // Store effect for rendering
    if (!window.feedingEffects) window.feedingEffects = [];
    window.feedingEffects.push(effect);
}

function updateFoodPellets() {
    for (let i = foodPellets.length - 1; i >= 0; i--) {
        const pellet = foodPellets[i];

        // Remove consumed or expired pellets
        if (pellet.consumed || Date.now() - pellet.createdAt > FOOD_LIFESPAN) {
            foodPellets.splice(i, 1);
            continue;
        }

        // Apply gravity
        pellet.vy += FOOD_FALL_SPEED; // Slower gravity acceleration
        pellet.y += pellet.vy;

        // Stop at bottom of tank
        if (pellet.y > swimCanvas.height - pellet.size) {
            pellet.y = swimCanvas.height - pellet.size;
            pellet.vy = 0;
        }

        // Check for fish consumption
        for (let fish of fishes) {
            if (fish.isDying || fish.isEntering) continue;

            const fishCenterX = fish.x + fish.width / 2;
            const fishCenterY = fish.y + fish.height / 2;
            const dx = pellet.x - fishCenterX;
            const dy = pellet.y - fishCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If fish is close enough, consume the pellet
            if (distance < fish.width / 2 + pellet.size) {
                pellet.consumed = true;
                // Add a small visual effect when food is consumed
                createFoodConsumptionEffect(pellet.x, pellet.y);
                break;
            }
        }
    }
}

function createFoodConsumptionEffect(x, y) {
    // Create a small particle effect when food is consumed
    const effect = {
        x: x,
        y: y,
        particles: [],
        createdAt: Date.now(),
        duration: 500
    };

    // Create small particles
    for (let i = 0; i < 5; i++) {
        effect.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1
        });
    }

    // Store effect for rendering (we'll add this to the animation loop)
    if (!window.foodEffects) window.foodEffects = [];
    window.foodEffects.push(effect);
}

function renderFoodPellets() {
    if (foodPellets.length > 0) {
        swimCtx.fillStyle = '#FF6B35'; // Orange color for better visibility

        for (const pellet of foodPellets) {
            if (!pellet.consumed) {
                swimCtx.beginPath();
                swimCtx.arc(pellet.x, pellet.y, pellet.size, 0, Math.PI * 2);
                swimCtx.fill();
            }
        }
    }
}

function renderFoodEffects() {
    if (!window.foodEffects) return;

    for (let i = window.foodEffects.length - 1; i >= 0; i--) {
        const effect = window.foodEffects[i];
        const elapsed = Date.now() - effect.createdAt;
        const progress = elapsed / effect.duration;

        if (progress >= 1) {
            window.foodEffects.splice(i, 1);
            continue;
        }

        swimCtx.save();
        swimCtx.globalAlpha = 1 - progress;
        swimCtx.fillStyle = '#FFD700'; // Gold color for consumption effect

        for (const particle of effect.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98; // Slight drag
            particle.vy *= 0.98;

            swimCtx.beginPath();
            swimCtx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
            swimCtx.fill();
        }

        swimCtx.restore();
    }
}

function renderFeedingEffects() {
    if (!window.feedingEffects) return;

    for (let i = window.feedingEffects.length - 1; i >= 0; i--) {
        const effect = window.feedingEffects[i];
        const elapsed = Date.now() - effect.createdAt;
        const progress = elapsed / effect.duration;

        if (progress >= 1) {
            window.feedingEffects.splice(i, 1);
            continue;
        }

        swimCtx.save();
        swimCtx.globalAlpha = 1 - progress;

        for (const particle of effect.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.96; // Slight drag
            particle.vy *= 0.96;

            // Use particle's own color
            swimCtx.fillStyle = particle.color || '#4CAF50';
            swimCtx.beginPath();
            swimCtx.arc(particle.x, particle.y, particle.size || 2, 0, Math.PI * 2);
            swimCtx.fill();
        }

        swimCtx.restore();
    }
}

// Calculate optimal fish size based on tank size
function calculateFishSize() {
    const tankWidth = swimCanvas.width;
    const tankHeight = swimCanvas.height;

    // Detect if mobile device
    const isMobile = window.innerWidth <= 768;

    // Scale fish size based on tank dimensions
    // Use smaller dimension to ensure fish fit well on all screen ratios
    const baseDimension = Math.min(tankWidth, tankHeight);

    // Fish width should be larger on mobile for better visibility
    // Mobile: 15% of smaller dimension, Desktop: 10%
    const sizePercentage = isMobile ? 0.15 : 0.1;
    const fishWidth = Math.floor(baseDimension * sizePercentage);
    const fishHeight = Math.floor(fishWidth * 0.6); // Maintain 3:5 aspect ratio

    // Set reasonable bounds with different limits for mobile vs desktop
    // Mobile: 50-120px, Desktop: 30-150px
    const minWidth = isMobile ? 50 : 30;
    const maxWidth = isMobile ? 120 : 150;
    const minHeight = isMobile ? 30 : 18;
    const maxHeight = isMobile ? 72 : 90;
    
    const finalWidth = Math.max(minWidth, Math.min(maxWidth, fishWidth));
    const finalHeight = Math.max(minHeight, Math.min(maxHeight, fishHeight));

    return {
        width: finalWidth,
        height: finalHeight
    };
}

// Rescale all existing fish to maintain consistency
function rescaleAllFish() {
    const newSize = calculateFishSize();

    fishes.forEach(fish => {
        // Store original image source
        const originalCanvas = fish.fishCanvas;

        // Create a temporary canvas to extract the original image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = originalCanvas.width;
        tempCanvas.height = originalCanvas.height;
        tempCanvas.getContext('2d').drawImage(originalCanvas, 0, 0);

        // Create new resized canvas
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = newSize.width;
        resizedCanvas.height = newSize.height;
        const resizedCtx = resizedCanvas.getContext('2d');

        // Scale the fish image to new size
        resizedCtx.imageSmoothingEnabled = true;
        resizedCtx.imageSmoothingQuality = 'high';
        resizedCtx.drawImage(tempCanvas, 0, 0, newSize.width, newSize.height);

        // Update fish properties
        const oldWidth = fish.width;
        const oldHeight = fish.height;
        fish.fishCanvas = resizedCanvas;
        fish.width = newSize.width;
        fish.height = newSize.height;

        // Adjust position to prevent fish from going off-screen
        fish.x = Math.max(0, Math.min(swimCanvas.width - newSize.width, fish.x));
        fish.y = Math.max(0, Math.min(swimCanvas.height - newSize.height, fish.y));
    });
}

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
            if (a > 16 && !(r > 240 && g > 240 && b > 240)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }
    if (!found) return srcCanvas;
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const cropped = document.createElement('canvas');
    cropped.width = cropW;
    cropped.height = cropH;
    cropped.getContext('2d').drawImage(srcCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropped;
}

function makeDisplayFishCanvas(img, width = 80, height = 48) {
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = width;
    displayCanvas.height = height;
    const displayCtx = displayCanvas.getContext('2d');
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

function createFishObject({
    fishCanvas,
    x,
    y,
    direction = 1,
    phase = 0,
    amplitude = 24,
    speed = window.innerWidth <= 768 ? 1.2 : 2, // Slower on mobile for better viewing
    vx = 0,
    vy = 0,
    width = 80,
    height = 48,
    artist = 'Anonymous',
    createdAt = null,
    docId = null,
    peduncle = .4,
    upvotes = 0,
    downvotes = 0,
    score = 0,
    userId = null
}) {
    return {
        fishCanvas,
        x,
        y,
        direction,
        phase,
        amplitude,
        speed,
        vx,
        vy,
        width,
        height,
        artist,
        createdAt,
        docId,
        peduncle,
        upvotes,
        downvotes,
        score,
        userId,
    };
}

function loadFishImageToTank(imgUrl, fishData, onDone) {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        // Calculate dynamic size based on current tank and fish count
        const fishSize = calculateFishSize();
        const displayCanvas = makeDisplayFishCanvas(img, fishSize.width, fishSize.height);
        if (displayCanvas && displayCanvas.width && displayCanvas.height) {
            const maxX = Math.max(0, swimCanvas.width - fishSize.width);
            const maxY = Math.max(0, swimCanvas.height - fishSize.height);
            
            // Check if this is "my fish" - support both ID and timestamp matching
            // Use a global flag to ensure only ONE fish is marked
            let isMyFish = false;
            
            // Try to match by ID first (most reliable)
            if (window.myFishId && fishData.docId === window.myFishId) {
                // Only mark if we haven't found "my fish" yet
                if (!window.myFishAlreadyFound) {
                    isMyFish = true;
                    window.myFishAlreadyFound = true;
                    console.log('🎯 [Fish Match] Found my fish by ID:', fishData.docId);
                }
            }
            // If no ID match, try to match by timestamp (less reliable, only as fallback)
            else if (window.myFishTime && !window.myFishAlreadyFound) {
                const myTime = parseInt(window.myFishTime);
                
                // Try different timestamp field names
                const createdAtValue = fishData.createdAt || fishData.CreatedAt || fishData.created_at;
                
                if (createdAtValue) {
                    // Parse timestamp - could be number, string, or Date object
                    let fishTime;
                    if (typeof createdAtValue === 'number') {
                        fishTime = createdAtValue;
                    } else if (typeof createdAtValue === 'string') {
                        fishTime = new Date(createdAtValue).getTime();
                    } else if (createdAtValue instanceof Date) {
                        fishTime = createdAtValue.getTime();
                    }
                    
                    if (fishTime && !isNaN(fishTime)) {
                        const timeDiff = Math.abs(fishTime - myTime);
                        
                        // Debug log for first few fish
                        if (fishes.length < 3) {
                            console.log('🔍 [Fish Time Check]', {
                                artist: fishData.artist || 'Anonymous',
                                fishTime,
                                myTime,
                                diff: timeDiff,
                                diffSeconds: (timeDiff / 1000).toFixed(1) + 's'
                            });
                        }
                        
                        // Match ONLY if created within 5 seconds (very strict)
                        // This prevents false positives from multiple fish
                        if (timeDiff < 5000) {
                            isMyFish = true;
                            window.myFishAlreadyFound = true;
                            console.log('🎯 [Fish Match] Found my fish by timestamp! Diff:', (timeDiff / 1000).toFixed(1) + 's');
                            console.log('   Fish time:', new Date(fishTime).toISOString());
                            console.log('   My time:', new Date(myTime).toISOString());
                        }
                    }
                }
            }
            
            let x, y;
            if (isMyFish) {
                // Place in the center middle row (vertical center)
                x = Math.floor(Math.random() * maxX); // Random horizontal position
                y = Math.floor((swimCanvas.height - fishSize.height) / 2); // Center vertical position
                console.log('🎯 [Fish Position] My fish placed at center y:', y);
            } else {
                // Random position for other fish
                x = Math.floor(Math.random() * maxX);
                y = Math.floor(Math.random() * maxY);
            }
            
            const direction = Math.random() < 0.5 ? -1 : 1;
            // Adjust speed for mobile devices
            const isMobile = window.innerWidth <= 768;
            const defaultSpeed = isMobile ? 1.2 : 2;
            const speed = fishData.speed ? (isMobile ? fishData.speed * 0.6 : fishData.speed) : defaultSpeed;
            const fishObj = createFishObject({
                fishCanvas: displayCanvas,
                x,
                y,
                direction: direction,
                phase: fishData.phase || 0,
                amplitude: fishData.amplitude || 32,
                speed: speed,
                vx: speed * direction * 0.1, // Initialize with base velocity
                vy: (Math.random() - 0.5) * 0.5, // Small random vertical velocity
                artist: fishData.artist || fishData.Artist || 'Anonymous',
                createdAt: fishData.createdAt || fishData.CreatedAt || null,
                docId: fishData.docId || null,
                peduncle: fishData.peduncle || .4,
                width: fishSize.width,
                height: fishSize.height,
                upvotes: fishData.upvotes || 0,
                downvotes: fishData.downvotes || 0,
                score: fishData.score || 0,
                userId: fishData.userId || fishData.UserId || null
            });
            
            // Mark as "my fish" if it matches
            if (isMyFish) {
                fishObj.isMyFish = true;
            }

            // Add entrance animation for new fish
            if (fishData.docId && fishes.length >= maxTankCapacity - 1) {
                fishObj.isEntering = true;
                fishObj.enterStartTime = Date.now();
                fishObj.enterDuration = 1000; // 1 second entrance
                fishObj.opacity = 0;
                fishObj.scale = 0.3;
            }

            fishes.push(fishObj);

            if (onDone) onDone(fishObj);
        } else {
            console.warn('Fish image did not load or is blank:', imgUrl);
        }
    };
    img.src = imgUrl;
}

// Using shared utility function from fish-utils.js

// Global variable to track the newest fish timestamp and listener
let newestFishTimestamp = null;
let newFishListener = null;
let maxTankCapacity = 50; // Dynamic tank capacity controlled by slider
let isUpdatingCapacity = false; // Prevent multiple simultaneous updates

// Update page title based on sort type
function updatePageTitle(sortType) {
    const titles = {
        'recent': `Fish Tank - ${maxTankCapacity} Most Recent`,
        'popular': `Fish Tank - ${maxTankCapacity} Most Popular`,
        'random': `Fish Tank - ${maxTankCapacity} Random Fish`
    };
    document.title = titles[sortType] || 'Fish Tank';
}

// Debounce function to prevent rapid-fire calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update current fish count display
function updateCurrentFishCount() {
    const currentCountElement = document.getElementById('current-fish-count');
    if (currentCountElement) {
        const aliveFishCount = fishes.filter(f => !f.isDying).length;
        const dyingFishCount = fishes.filter(f => f.isDying).length;
        if (dyingFishCount > 0) {
            currentCountElement.textContent = `(${aliveFishCount} swimming, ${dyingFishCount} leaving)`;
        } else {
            currentCountElement.textContent = `(${aliveFishCount} swimming)`;
        }
    }
}

// Handle tank capacity changes
async function updateTankCapacity(newCapacity) {
    // Prevent multiple simultaneous updates
    if (isUpdatingCapacity) {
        return;
    }

    isUpdatingCapacity = true;

    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
        loadingIndicator.textContent = 'updating tank...';
    }

    const oldCapacity = maxTankCapacity;
    maxTankCapacity = newCapacity;

    // Update the display
    const displayElement = document.getElementById('fish-count-display');
    if (displayElement) {
        displayElement.textContent = newCapacity;
    }

    // Update current fish count display
    updateCurrentFishCount();

    // Update page title
    const sortSelect = document.getElementById('tank-sort');
    if (sortSelect) {
        updatePageTitle(sortSelect.value);
    }

    // Update URL parameter
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('capacity', newCapacity);
    window.history.replaceState({}, '', newUrl);

    // If capacity decreased, remove excess fish with death animation
    if (newCapacity < fishes.length) {
        const currentFishCount = fishes.filter(f => !f.isDying).length;
        const excessCount = Math.max(0, currentFishCount - newCapacity);

        // Get references to fish that are not already dying, sorted by creation date (oldest first)
        const aliveFish = fishes.filter(f => !f.isDying).sort((a, b) => {
            const dateA = a.createdAt;
            const dateB = b.createdAt;
            if (!dateA && !dateB) return 0;
            if (!dateA) return -1; // Fish without creation date go first
            if (!dateB) return 1;
            
            // Handle both Date objects and string timestamps
            const timeA = dateA instanceof Date ? dateA.getTime() : new Date(dateA).getTime();
            const timeB = dateB instanceof Date ? dateB.getTime() : new Date(dateB).getTime();
            
            return timeA - timeB; // Oldest first
        });

        // Remove the oldest fish first
        const fishToRemove = aliveFish.slice(0, excessCount);

        // Stagger the death animations to avoid overwhelming the system
        fishToRemove.forEach((fishObj, i) => {
            setTimeout(() => {
                // Find the current index of this fish object
                const currentIndex = fishes.indexOf(fishObj);
                if (currentIndex !== -1 && !fishObj.isDying) {
                    animateFishDeath(currentIndex);
                }
            }, i * 200); // 200ms delay between each death
        });
    }
    // If capacity increased, try to add more fish (if available from current sort)
    else if (newCapacity > fishes.length && newCapacity > oldCapacity) {
        const sortSelect = document.getElementById('tank-sort');
        const currentSort = sortSelect ? sortSelect.value : 'recent';
        const neededCount = newCapacity - fishes.length;

        // Load additional fish
        await loadAdditionalFish(currentSort, neededCount);
    }

    // Hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }

    isUpdatingCapacity = false;
}

// Load additional fish when capacity is increased
async function loadAdditionalFish(sortType, count) {
    try {
        // Get existing fish IDs to prevent duplicates
        const existingIds = new Set(fishes.map(f => f.docId).filter(id => id));

        // Get additional fish, accounting for potential duplicates
        const additionalFishDocs = await getFishBySort(sortType, count * 2); // Get more to account for duplicates

        let addedCount = 0;

        for (const doc of additionalFishDocs) {
            // Stop if we've reached the capacity or added enough fish
            if (fishes.length >= maxTankCapacity || addedCount >= count) {
                break;
            }

            // Handle different possible backend API formats
            let data, fishId;

            if (typeof doc.data === 'function') {
                // Firestore-style document with data() function
                data = doc.data();
                fishId = doc.id;
            } else if (doc.data && typeof doc.data === 'object') {
                // Backend returns {id: '...', data: {...}}
                data = doc.data;
                fishId = doc.id;
            } else if (doc.id && (doc.image || doc.Image)) {
                // Backend returns fish data directly as properties
                data = doc;
                fishId = doc.id;
            } else {
                // Unknown format, skip
                continue;
            }

            // Skip if data is still undefined or null
            if (!data) {
                continue;
            }

            const imageUrl = data.image || data.Image; // Try lowercase first, then uppercase

            // Skip if invalid image or already exists
            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                continue;
            }

            if (existingIds.has(fishId)) {
                continue;
            }

            loadFishImageToTank(imageUrl, {
                ...data,
                docId: fishId
            });

            addedCount++;
        }
    } catch (error) {
        console.error('Error loading additional fish:', error);
    }
}

// Animate a fish death (turn upside down, fade, and fall)
function animateFishDeath(fishIndex, onComplete) {
    if (fishIndex < 0 || fishIndex >= fishes.length) {
        if (onComplete) onComplete();
        return;
    }

    const dyingFish = fishes[fishIndex];
    const deathDuration = 2000; // 2 seconds
    const startTime = Date.now();

    // Store original values
    const originalDirection = dyingFish.direction;
    const originalY = dyingFish.y;
    const originalOpacity = 1;

    // Death animation properties
    dyingFish.isDying = true;
    dyingFish.deathStartTime = startTime;
    dyingFish.deathDuration = deathDuration;
    dyingFish.originalY = originalY;
    dyingFish.opacity = originalOpacity;

    // Set fish upside down
    dyingFish.direction = -Math.abs(dyingFish.direction); // Ensure it's negative (upside down)

    // Animation will be handled in the main animation loop
    // After the animation completes, remove the fish
    setTimeout(() => {
        const index = fishes.indexOf(dyingFish);
        if (index !== -1) {
            fishes.splice(index, 1);
        }
        if (onComplete) onComplete();
    }, deathDuration);
}

// Show a subtle notification when new fish arrive
function showNewFishNotification(artistName) {
    // Notifications are always enabled (notification toggle removed)

    // Create retro notification element
    const notification = document.createElement('div');
    notification.textContent = `New fish from ${artistName}!`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        color: #000000;
        background: #c0c0c0;
        border: 2px outset #808080;
        padding: 4px 8px;
        font-size: 11px;
        font-family: "MS Sans Serif", sans-serif;
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds (no animation)
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Load initial fish into tank based on sort type
async function loadInitialFish(sortType = 'recent') {
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }

    // Clear existing fish
    fishes.length = 0;

    try {
        // Load initial fish from Firestore using shared utility
        const allFishDocs = await getFishBySort(sortType, maxTankCapacity); // Load based on current capacity

        // Track the newest timestamp for the listener
        if (allFishDocs.length > 0) {
            const sortedByDate = allFishDocs.filter(doc => {
                // Handle different possible backend API formats for filtering
                let data;
                if (typeof doc.data === 'function') {
                    data = doc.data();
                } else if (doc.data && typeof doc.data === 'object') {
                    data = doc.data;
                } else if (doc.id && (doc.image || doc.Image)) {
                    data = doc;
                } else {
                    return false;
                }
                return data && (data.CreatedAt || data.createdAt);
            }).sort((a, b) => {
                // Handle backend response format - fish data may need extraction
                let aData, bData;
                if (typeof a.data === 'function') {
                    aData = a.data();
                } else if (a.data && typeof a.data === 'object') {
                    aData = a.data;
                } else {
                    aData = a;
                }

                if (typeof b.data === 'function') {
                    bData = b.data();
                } else if (b.data && typeof b.data === 'object') {
                    bData = b.data;
                } else {
                    bData = b;
                }

                const aDate = aData.CreatedAt || aData.createdAt;
                const bDate = bData.CreatedAt || bData.createdAt;

                // Handle both Date objects and ISO strings
                const aTime = aDate instanceof Date ? aDate.getTime() : new Date(aDate).getTime();
                const bTime = bDate instanceof Date ? bDate.getTime() : new Date(bDate).getTime();

                return bTime - aTime;
            });

            if (sortedByDate.length > 0) {
                const newestFish = sortedByDate[0];
                let newestData;
                if (typeof newestFish.data === 'function') {
                    newestData = newestFish.data();
                } else if (newestFish.data && typeof newestFish.data === 'object') {
                    newestData = newestFish.data;
                } else {
                    newestData = newestFish;
                }
                newestFishTimestamp = newestData.CreatedAt || newestData.createdAt;
            }
        }

        allFishDocs.forEach(doc => {

            // Handle different possible backend API formats
            let data, fishId;

            if (typeof doc.data === 'function') {
                // Firestore-style document with data() function
                data = doc.data();
                fishId = doc.id;
            } else if (doc.data && typeof doc.data === 'object') {
                // Backend returns {id: '...', data: {...}}
                data = doc.data;
                fishId = doc.id;
            } else if (doc.id && (doc.image || doc.Image)) {
                // Backend returns fish data directly as properties
                data = doc;
                fishId = doc.id;
            } else {
                // Unknown format
                console.warn('Skipping fish with unknown format:', doc);
                return;
            }

            // Skip if data is still undefined or null
            if (!data) {
                console.warn('Skipping fish with no data after extraction:', fishId, doc);
                return;
            }

            const imageUrl = data.image || data.Image; // Try lowercase first, then uppercase
            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                console.warn('Skipping fish with invalid image:', fishId, data);
                return;
            }
            loadFishImageToTank(imageUrl, {
                ...data,
                docId: fishId
            });
        });
    } catch (error) {
        console.error('Error loading initial fish:', error);
    } finally {
        // Hide loading indicator
        if (loadingIndicator) {
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 500);
        }
    }
}

// Set up periodic polling instead of real-time listener to reduce costs
function setupNewFishListener() {
    // Remove existing listener if any
    if (newFishListener) {
        clearInterval(newFishListener);
        newFishListener = null;
    }

    // Use polling every 30 seconds instead of real-time listener
    newFishListener = setInterval(async () => {
        try {
            await checkForNewFish();
        } catch (error) {
            console.error('Error checking for new fish:', error);
        }
    }, 30000); // Poll every 30 seconds
}

// Check for new fish using backend API instead of real-time listener
async function checkForNewFish() {
    try {
        // Build query parameters for backend API
        const params = new URLSearchParams({
            orderBy: 'CreatedAt',
            order: 'desc',
            limit: '5',
            isVisible: 'true',
            deleted: 'false'
        });

        const response = await fetch(`${BACKEND_URL}/api/fish?${params}`);

        if (!response.ok) {
            throw new Error(`Backend API failed: ${response.status}`);
        }

        const data = await response.json();

        data.data.forEach((fishItem) => {
            // Handle different possible backend API formats
            let fishData, fishId;

            if (typeof fishItem.data === 'function') {
                // Firestore-style document with data() function
                fishData = fishItem.data();
                fishId = fishItem.id;
            } else if (fishItem.data && typeof fishItem.data === 'object') {
                // Backend returns {id: '...', data: {...}}
                fishData = fishItem.data;
                fishId = fishItem.id;
            } else if (fishItem.id && (fishItem.image || fishItem.Image)) {
                // Backend returns fish data directly as properties
                fishData = fishItem;
                fishId = fishItem.id;
            } else {
                // Unknown format
                console.warn('Skipping fish with unknown format in checkForNewFish:', fishItem);
                return;
            }

            // Skip if data is still undefined or null
            if (!fishData) {
                console.warn('Skipping fish with no data in checkForNewFish:', fishId, fishItem);
                return;
            }

            const imageUrl = fishData.image || fishData.Image; // Try lowercase first, then uppercase

            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                console.warn('Skipping fish with invalid image:', fishId, fishData);
                return;
            }

            // Only add if we haven't seen this fish before
            if (!fishes.some(f => f.docId === fishId)) {
                // Update newest timestamp
                const fishDate = fishData.CreatedAt || fishData.createdAt;
                if (!newestFishTimestamp || (fishDate && new Date(fishDate) > new Date(newestFishTimestamp))) {
                    newestFishTimestamp = fishDate;
                }

                // If at capacity, animate death of oldest fish, then add new one
                if (fishes.length >= maxTankCapacity) {
                    // Find the oldest fish by creation date (excluding dying fish)
                    const aliveFish = fishes.filter(f => !f.isDying);
                    let oldestFishIndex = -1;
                    let oldestDate = null;

                    aliveFish.forEach((fish, index) => {
                        const fishDate = fish.createdAt;
                        if (!oldestDate) {
                            // First fish or no previous date found
                            oldestDate = fishDate;
                            oldestFishIndex = fishes.indexOf(fish);
                        } else if (!fishDate) {
                            // Fish without creation date should be considered oldest
                            oldestDate = null;
                            oldestFishIndex = fishes.indexOf(fish);
                        } else if (oldestDate && new Date(fishDate) < new Date(oldestDate)) {
                            // Found an older fish
                            oldestDate = fishDate;
                            oldestFishIndex = fishes.indexOf(fish);
                        }
                    });

                    if (oldestFishIndex !== -1) {
                        animateFishDeath(oldestFishIndex, () => {
                            // After death animation completes, add new fish
                            loadFishImageToTank(imageUrl, {
                                ...fishData,
                                docId: fishId
                            }, (newFish) => {
                                // Show subtle notification
                                showNewFishNotification(fishData.Artist || fishData.artist || 'Anonymous');
                            });
                        });
                    }
                } else {
                    // Tank not at capacity, add fish immediately
                    loadFishImageToTank(imageUrl, {
                        ...fishData,
                        docId: fishId
                    }, (newFish) => {
                        // Show subtle notification
                        showNewFishNotification(fishData.Artist || fishData.artist || 'Anonymous');
                    });
                }
            }
        });
    } catch (error) {
        console.error('Error checking for new fish:', error);
    }
}

// Combined function to load tank with streaming capability
async function loadFishIntoTank(sortType = 'recent') {
    // Load initial fish
    await loadInitialFish(sortType);

    // Set up real-time listener for new fish (only for recent mode)
    if (sortType === 'recent') {
        setupNewFishListener();
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    const sortSelect = document.getElementById('tank-sort');
    const refreshButton = document.getElementById('refresh-tank');

    // Check for URL parameters to set initial sort and capacity
    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get('sort');
    const capacityParam = urlParams.get('capacity');
    const myFishParam = urlParams.get('myFish'); // Get "my fish" ID from URL
    const myFishTimeParam = urlParams.get('myFishTime'); // Get "my fish" timestamp from URL
    let initialSort = 'recent'; // default
    
    // Reset the "my fish found" flag at page load
    window.myFishAlreadyFound = false;
    
    // Store "my fish" ID globally so loadFishImageToTank can access it
    // Priority: URL parameter > localStorage
    if (myFishParam) {
        window.myFishId = myFishParam;
        console.log('🐟 [Tank Init] Looking for my fish from URL:', myFishParam);
    } else if (myFishTimeParam) {
        window.myFishTime = myFishTimeParam;
        console.log('🐟 [Tank Init] Looking for my fish by time from URL:', myFishTimeParam);
    } else {
        // Check localStorage for recently drawn fish
        const localFishId = localStorage.getItem('myLastFishId');
        const localFishTime = localStorage.getItem('myLastFishTime');
        
        if (localFishId) {
            window.myFishId = localFishId;
            console.log('🐟 [Tank Init] Found my fish ID in localStorage:', localFishId);
        } else if (localFishTime) {
            window.myFishTime = localFishTime;
            console.log('🐟 [Tank Init] Found my fish time in localStorage:', localFishTime);
        }
    }

    // Validate sort parameter and set dropdown
    if (sortParam && ['recent', 'popular', 'random'].includes(sortParam)) {
        initialSort = sortParam;
        sortSelect.value = sortParam;
    }

    // Initialize capacity from URL parameter
    if (capacityParam) {
        const capacity = parseInt(capacityParam);
        if (capacity >= 1 && capacity <= 100) {
            maxTankCapacity = capacity;
            const fishCapacitySelect = document.getElementById('fish-capacity');
            if (fishCapacitySelect) {
                fishCapacitySelect.value = capacity.toString();
            }
        }
    }

    // Update page title based on initial selection
    updatePageTitle(initialSort);

    // Handle sort change
    sortSelect.addEventListener('change', () => {
        const selectedSort = sortSelect.value;

        // Reset the "my fish found" flag when changing sort
        window.myFishAlreadyFound = false;

        // Clean up existing listener before switching modes
        if (newFishListener) {
            clearInterval(newFishListener);
            newFishListener = null;
        }

        loadFishIntoTank(selectedSort);

        // Update page title based on selection
        updatePageTitle(selectedSort);

        // Update URL without reloading the page
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('sort', selectedSort);
        window.history.replaceState({}, '', newUrl);
    });

    // Handle refresh button
    refreshButton.addEventListener('click', () => {
        // Reset the "my fish found" flag when refreshing
        window.myFishAlreadyFound = false;
        const selectedSort = sortSelect.value;
        loadFishIntoTank(selectedSort);
    });

    // Handle fish capacity selector
    const fishCapacitySelect = document.getElementById('fish-capacity');
    if (fishCapacitySelect) {
        fishCapacitySelect.addEventListener('change', (e) => {
            const newCapacity = parseInt(e.target.value);
            updateTankCapacity(newCapacity);
        });

        // Initialize the display
        updateTankCapacity(maxTankCapacity);
    }

    // Load initial fish based on URL parameter or default
    await loadFishIntoTank(initialSort);
    
    // Check if we should show welcome modal after fish submission
    checkAndShowWelcomeModal();

    // Clean up listener when page is unloaded
    window.addEventListener('beforeunload', () => {
        if (newFishListener) {
            clearInterval(newFishListener);
            newFishListener = null;
        }
    });
});

// Show welcome modal for newly submitted fish
function checkAndShowWelcomeModal() {
    const showModal = localStorage.getItem('showWelcomeModal');
    
    if (showModal === 'true') {
        const fishImage = localStorage.getItem('newFishImage');
        const needsModeration = localStorage.getItem('needsModeration') === 'true';
        
        // Clear the flags
        localStorage.removeItem('showWelcomeModal');
        localStorage.removeItem('newFishImage');
        localStorage.removeItem('needsModeration');
        
        // Show the modal
        if (fishImage) {
            showWelcomeModalInTank(fishImage, needsModeration);
        }
    }
}

// Display welcome modal in tank page
function showWelcomeModalInTank(fishImageUrl, needsModeration) {
    const config = window.SOCIAL_CONFIG || {};
    const overlay = document.createElement('div');
    overlay.className = 'success-modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalHTML = `
        <div class="success-modal-content" style="
            background: white;
            padding: 30px;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            animation: slideInUp 0.5s ease;
        ">
            <h2 style="color: #27ae60; margin-bottom: 20px; font-size: 24px;">🎉 ${needsModeration ? 'Fish Submitted!' : 'Your Fish is Swimming!'}</h2>
            
            <div class="fish-preview" style="margin: 20px 0;">
                <img src="${fishImageUrl}" alt="Your fish" style="max-width: 200px; border-radius: 10px; border: 3px solid #27ae60;">
            </div>
            
            <p style="font-size: 16px; margin: 20px 0; color: #666;">
                ${needsModeration 
                    ? 'Your fish will appear in the tank after review.' 
                    : 'Love creating with AI? Join our community!'}
            </p>
            
            ${!needsModeration ? `
                <div style="margin: 20px 0; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    ${config.twitterUrl ? `<a href="${config.twitterUrl}" target="_blank" rel="noopener noreferrer" style="background: #1DA1F2; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Follow on X
                    </a>` : ''}
                    ${config.discordUrl ? `<a href="${config.discordUrl}" target="_blank" rel="noopener noreferrer" style="background: #5865F2; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                        Join Discord
                    </a>` : ''}
                </div>
                
                <div style="margin: 25px 0;">
                    <p style="font-size: 14px; color: #888; margin-bottom: 12px; font-weight: 500;">Share your creation:</p>
                    <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                        <button onclick="shareOnTwitter('${fishImageUrl}')" style="background: #000; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            X
                        </button>
                        <button onclick="shareOnFacebook('${fishImageUrl}')" style="background: #1877F2; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Facebook
                        </button>
                        <button onclick="shareOnReddit('${fishImageUrl}')" style="background: #FF4500; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                            Reddit
                        </button>
                        <button onclick="copyPageLink()" style="background: #6B7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            Copy Link
                        </button>
                    </div>
                </div>
            ` : ''}
            
            <button onclick="this.closest('.success-modal-overlay').remove()" style="
                background: #6366F1;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 10px;
                transition: all 0.3s;
            " onmouseover="this.style.background='#4F46E5'" onmouseout="this.style.background='#6366F1'">
                Continue Watching
            </button>
        </div>
    `;
    
    overlay.innerHTML = modalHTML;
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    document.body.appendChild(overlay);
}

// Social share helper functions for welcome modal
function shareOnTwitter(imageUrl) {
    if (window.socialShare) {
        // 使用配置文件中的统一文案
        window.socialShare.shareToX(null, window.location.href);
    }
}

function shareOnFacebook(imageUrl) {
    if (window.socialShare) {
        // 使用配置文件中的统一文案
        window.socialShare.shareToFacebook(window.location.href, null);
    }
}

function shareOnReddit(imageUrl) {
    if (window.socialShare) {
        // 使用配置文件中的统一文案
        window.socialShare.shareToReddit(null, window.location.href);
    }
}

function copyPageLink() {
    if (window.socialShare) {
        window.socialShare.copyLink(window.location.href).then((success) => {
            if (success) {
                alert('Link copied to clipboard!');
            } else {
                alert('Failed to copy link');
            }
        });
    } else {
        // Fallback if socialShare not loaded
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy link');
        });
    }
}

function showFishInfoModal(fish) {
    const fishImgCanvas = document.createElement('canvas');
    fishImgCanvas.width = fish.width;
    fishImgCanvas.height = fish.height;
    fishImgCanvas.getContext('2d').drawImage(fish.fishCanvas, 0, 0);
    const imgDataUrl = fishImgCanvas.toDataURL();

    // Scale display size for modal (max 120x80, maintain aspect ratio)
    const modalWidth = Math.min(120, fish.width);
    const modalHeight = Math.min(80, fish.height);

    let info = `<div style='text-align:center;'>`;

    // Add highlighting if this is the user's fish
    const isCurrentUserFish = isUserFish(fish);
    if (isCurrentUserFish) {
        info += `<div style='margin-bottom: 10px; padding: 8px; background: linear-gradient(135deg, #fff9e6, #fff3d0); border: 2px solid #ffd700; border-radius: 6px; color: #333; font-weight: bold; font-size: 12px; box-shadow: 0 2px 6px rgba(255,215,0,0.3);'>Your Fish</div>`;
    }

    info += `<img src='${imgDataUrl}' width='${modalWidth}' height='${modalHeight}' style='display:block;margin:0 auto 15px auto;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1);background:#ffffff;' alt='Fish'><br>`;
    info += `<div style='margin-bottom:15px;color:#666;line-height:1.8;'>`;

    // Make artist name a clickable link to their profile if userId exists
    const artistName = fish.artist || 'Anonymous';
    const userId = fish.userId;

    if (userId) {
        info += `<strong style="color:#333;">Artist:</strong> <a href="profile.html?userId=${encodeURIComponent(userId)}" target="_blank" style="color: #6366F1; text-decoration: none; font-weight: 600;">${escapeHtml(artistName)}</a><br>`;
    } else {
        info += `<strong style="color:#333;">Artist:</strong> <span style="color:#666;">${escapeHtml(artistName)}</span><br>`;
    }

    if (fish.createdAt) {
        info += `<strong style="color:#333;">Created:</strong> <span style="color:#666;">${formatDate(fish.createdAt)}</span><br>`;
    }
    const score = calculateScore(fish);
    info += `<div style="margin-top:10px;"><strong style="color:#333;">Score:</strong> <span class="modal-score">${score}</span></div>`;
    info += `</div>`;

    // Add voting controls using shared utility
    info += createVotingControlsHTML(fish.docId, fish.upvotes || 0, fish.downvotes || 0, false, 'modal-controls');

    // Action buttons
    info += `<div style='margin-top: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;'>`;
    
    // Feed Fish button (always available)
    info += `<button onclick="feedFishFromModal(${fish.x}, ${fish.y})" class="modal-action-btn modal-feed-btn">
        🐟 Feed Fish
    </button>`;
    
    // Add "Add to Tank" button only if user is logged in
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
        info += `<button onclick="showAddToTankModal('${fish.docId}')" class="modal-action-btn modal-tank-btn">
            🏆 Add to Tank
        </button>`;
    }
    
    info += `</div>`;
    info += `</div>`;

    showModal(info, () => { });
}

// Tank-specific vote handler using shared utilities
function handleVote(fishId, voteType, button) {
    handleVoteGeneric(fishId, voteType, button, (result, voteType) => {
        // Find the fish in the fishes array and update it
        const fish = fishes.find(f => f.docId === fishId);
        if (fish) {
            // Update fish data based on response format
            if (result.upvotes !== undefined && result.downvotes !== undefined) {
                fish.upvotes = result.upvotes;
                fish.downvotes = result.downvotes;
            } else if (result.updatedFish) {
                fish.upvotes = result.updatedFish.upvotes || fish.upvotes || 0;
                fish.downvotes = result.updatedFish.downvotes || fish.downvotes || 0;
            } else if (result.success) {
                if (voteType === 'up') {
                    fish.upvotes = (fish.upvotes || 0) + 1;
                } else {
                    fish.downvotes = (fish.downvotes || 0) + 1;
                }
            }

            // Update the modal display with new counts
            const upvoteCount = document.querySelector('.modal-controls .upvote-count');
            const downvoteCount = document.querySelector('.modal-controls .downvote-count');
            const scoreDisplay = document.querySelector('.modal-score');

            if (upvoteCount) upvoteCount.textContent = fish.upvotes || 0;
            if (downvoteCount) downvoteCount.textContent = fish.downvotes || 0;
            if (scoreDisplay) scoreDisplay.textContent = `Score: ${calculateScore(fish)}`;
        }
    });
}

// Tank-specific report handler using shared utilities  
function handleReport(fishId, button) {
    handleReportGeneric(fishId, button);
}

// Make functions globally available for onclick handlers
window.handleVote = handleVote;
window.handleReport = handleReport;

function showModal(html, onClose) {
    let modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0, 0, 0, 0.6)';
    modal.style.backdropFilter = 'blur(5px)';
    modal.style.animation = 'fadeIn 0.3s ease';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.background = 'white';
    modalContent.style.padding = '30px';
    modalContent.style.width = 'auto';
    modalContent.style.minWidth = '350px';
    modalContent.style.maxWidth = '90vw';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.borderRadius = '20px';
    modalContent.style.boxShadow = '0 15px 50px rgba(99, 102, 241, 0.3)';
    modalContent.style.border = '3px solid #C7D2FE';
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

// Feed fish from modal (called when clicking Feed Fish button)
function feedFishFromModal(fishX, fishY) {
    // Get canvas coordinates
    const rect = swimCanvas.getBoundingClientRect();
    const canvasX = fishX;
    const canvasY = fishY;
    
    // Drop food near the fish
    dropFoodPellet(canvasX, canvasY);
    
    // Close modal
    const modal = document.querySelector('.modal-content')?.parentElement;
    if (modal) {
        document.body.removeChild(modal);
    }
    
    // Show feedback
    console.log('Fed fish at', canvasX, canvasY);
}

function handleTankTap(e) {
    let rect = swimCanvas.getBoundingClientRect();
    let tapX, tapY;
    if (e.touches && e.touches.length > 0) {
        tapX = e.touches[0].clientX - rect.left;
        tapY = e.touches[0].clientY - rect.top;
    } else {
        tapX = e.clientX - rect.left;
        tapY = e.clientY - rect.top;
    }

    // Check if this is a feeding action (right click, or shift+click, or double tap)
    const isFeeding = e.button === 2 || e.shiftKey || e.ctrlKey || e.metaKey;

    if (isFeeding) {
        // Drop food pellets
        dropFoodPellet(tapX, tapY);
        e.preventDefault(); // Prevent context menu on right click
        return;
    }

    // Original scare behavior
    const radius = 120;
    fishes.forEach(fish => {
        const fx = fish.x + fish.width / 2;
        const fy = fish.y + fish.height / 2;
        const dx = fx - tapX;
        const dy = fy - tapY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
            const force = 16 * (1 - dist / radius);
            const norm = Math.sqrt(dx * dx + dy * dy) || 1;
            fish.vx = (dx / norm) * force;
            fish.vy = (dy / norm) * force;
            fish.direction = dx > 0 ? 1 : -1;
        }
    });
}

function handleFishTap(e) {
    let rect = swimCanvas.getBoundingClientRect();
    let tapX, tapY;

    // Handle different event types
    if (e.touches && e.touches.length > 0) {
        // Touch event with active touches
        tapX = e.touches[0].clientX - rect.left;
        tapY = e.touches[0].clientY - rect.top;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        // Touch end event
        tapX = e.changedTouches[0].clientX - rect.left;
        tapY = e.changedTouches[0].clientY - rect.top;
    } else {
        // Mouse event
        tapX = e.clientX - rect.left;
        tapY = e.clientY - rect.top;
    }

    // Check if tap hit any fish (iterate from top to bottom)
    for (let i = fishes.length - 1; i >= 0; i--) {
        const fish = fishes[i];

        // Calculate fish position including any swimming animation
        const time = Date.now() / 500;
        const fishX = fish.x;
        let fishY = fish.y;

        // Account for swimming animation unless fish is dying
        if (!fish.isDying) {
            const foodDetectionData = foodDetectionCache.get(fish.docId || `fish_${i}`);
            const hasNearbyFood = foodDetectionData ? foodDetectionData.hasNearbyFood : false;
            const currentAmplitude = hasNearbyFood ? fish.amplitude * 0.3 : fish.amplitude;
            fishY = fish.y + Math.sin(time + fish.phase) * currentAmplitude;
        }

        // Check if tap is within fish bounds
        if (
            tapX >= fishX && tapX <= fishX + fish.width &&
            tapY >= fishY && tapY <= fishY + fish.height
        ) {
            showFishInfoModal(fish);
            return; // Found a fish, don't handle tank tap
        }
    }

    // No fish was hit, handle tank tap
    handleTankTap(e);
}

swimCanvas.addEventListener('mousedown', handleFishTap);

// Add right-click support for feeding
swimCanvas.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Prevent context menu
    handleTankTap(e);
});

// Enhanced mobile touch support
let lastTapTime = 0;
let touchStartTime = 0;
let touchStartPos = { x: 0, y: 0 };

// Handle touch start for position tracking
swimCanvas.addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
    const rect = swimCanvas.getBoundingClientRect();
    touchStartPos = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
    };
});

// Handle touch end for fish interaction and feeding
swimCanvas.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent default mobile behavior
    const currentTime = Date.now();
    const touchDuration = currentTime - touchStartTime;
    const rect = swimCanvas.getBoundingClientRect();
    const tapX = e.changedTouches[0].clientX - rect.left;
    const tapY = e.changedTouches[0].clientY - rect.top;

    // Debug logging for mobile touch issues

    // Check if finger moved significantly during touch
    const moveDistance = Math.sqrt(
        Math.pow(tapX - touchStartPos.x, 2) +
        Math.pow(tapY - touchStartPos.y, 2)
    );

    // Long press for feeding (500ms+ and minimal movement)
    if (touchDuration >= 500 && moveDistance < 20) {
        dropFoodPellet(tapX, tapY);
        return;
    }

    // Double tap for feeding
    if (currentTime - lastTapTime < 300 && moveDistance < 20) { // Double tap within 300ms
        dropFoodPellet(tapX, tapY);
        return;
    }

    // Single tap - check for fish interaction first, then handle tank tap
    // Create a mock event for handleFishTap with correct coordinates
    const mockEvent = {
        clientX: rect.left + tapX,
        clientY: rect.top + tapY,
        touches: null // Indicate this is from touch end
    };

    handleFishTap(mockEvent);

    lastTapTime = currentTime;
});

function resizeForMobile() {
    const isMobile = window.innerWidth <= 768;
    const oldWidth = swimCanvas.width;
    const oldHeight = swimCanvas.height;

    if (isMobile) {
        // Match the CSS dimensions for mobile
        swimCanvas.width = window.innerWidth;
        swimCanvas.height = window.innerHeight - 120; // Match calc(100vh - 120px)
        swimCanvas.style.width = '100vw';
        swimCanvas.style.height = 'calc(100vh - 120px)';
        swimCanvas.style.maxWidth = '100vw';
        swimCanvas.style.maxHeight = 'calc(100vh - 120px)';
    } else {
        // Desktop dimensions - full screen, controls below
        swimCanvas.width = window.innerWidth;
        swimCanvas.height = window.innerHeight; // Full viewport height
        swimCanvas.style.width = '100vw';
        swimCanvas.style.height = '100vh';
        swimCanvas.style.maxWidth = '100vw';
        swimCanvas.style.maxHeight = '100vh';
    }

    // If canvas size changed significantly, rescale all fish
    const widthChange = Math.abs(oldWidth - swimCanvas.width) / oldWidth;
    const heightChange = Math.abs(oldHeight - swimCanvas.height) / oldHeight;

    // Rescale if size changed by more than 20%
    if (widthChange > 0.2 || heightChange > 0.2) {
        rescaleAllFish();
    }
}
window.addEventListener('resize', resizeForMobile);
resizeForMobile();

// Optimize performance by caching food detection calculations
let foodDetectionCache = new Map();
let cacheUpdateCounter = 0;

function animateFishes() {
    swimCtx.clearRect(0, 0, swimCanvas.width, swimCanvas.height);
    const time = Date.now() / 500;

    // Update fish count display occasionally
    if (Math.floor(time) % 2 === 0) { // Every 2 seconds
        updateCurrentFishCount();
    }

    // Update food pellets
    updateFoodPellets();

    // Clear food detection cache every few frames to prevent stale data
    cacheUpdateCounter++;
    if (cacheUpdateCounter % 5 === 0) {
        foodDetectionCache.clear();
    }

    for (const fish of fishes) {
        // Handle entrance animation
        if (fish.isEntering) {
            const elapsed = Date.now() - fish.enterStartTime;
            const progress = Math.min(elapsed / fish.enterDuration, 1);

            // Fade in and scale up
            fish.opacity = progress;
            fish.scale = 0.3 + (progress * 0.7); // Scale from 0.3 to 1.0

            // Remove entrance flag when done
            if (progress >= 1) {
                fish.isEntering = false;
                fish.opacity = 1;
                fish.scale = 1;
            }
        }

        // Skip movement logic for locked fish (used by Find My Fish feature)
        if (fish.locked) {
            // Still draw the fish, but skip all movement and physics
            drawWigglingFish(fish, time);
            continue;
        }

        // Handle death animation
        if (fish.isDying) {
            const elapsed = Date.now() - fish.deathStartTime;
            const progress = Math.min(elapsed / fish.deathDuration, 1);

            // Fade out
            fish.opacity = 1 - progress;

            // Fall down
            fish.y = fish.originalY + (progress * progress * 200); // Accelerating fall

            // Slow down horizontal movement
            fish.speed = fish.speed * (1 - progress * 0.5);
        } else if (!fish.isEntering) {
            // Normal fish behavior (only if not entering)

            // Use cached food detection to improve performance
            const fishId = fish.docId || `fish_${fishes.indexOf(fish)}`;
            let foodDetectionData = foodDetectionCache.get(fishId);

            if (!foodDetectionData) {
                // Calculate food detection data and cache it
                const fishCenterX = fish.x + fish.width / 2;
                const fishCenterY = fish.y + fish.height / 2;

                let nearestFood = null;
                let nearestDistance = FOOD_DETECTION_RADIUS;
                let hasNearbyFood = false;

                // Optimize: Only check active food pellets
                const activePellets = foodPellets.filter(p => !p.consumed);

                // Find nearest food pellet using more efficient distance calculation
                for (const pellet of activePellets) {
                    const dx = pellet.x - fishCenterX;
                    const dy = pellet.y - fishCenterY;

                    // Use squared distance for initial comparison (more efficient)
                    const distanceSquared = dx * dx + dy * dy;
                    const radiusSquared = FOOD_DETECTION_RADIUS * FOOD_DETECTION_RADIUS;

                    if (distanceSquared < radiusSquared) {
                        hasNearbyFood = true;

                        // Only calculate actual distance if within radius
                        const distance = Math.sqrt(distanceSquared);
                        if (distance < nearestDistance) {
                            nearestFood = pellet;
                            nearestDistance = distance;
                        }
                    }
                }

                foodDetectionData = {
                    nearestFood,
                    nearestDistance,
                    hasNearbyFood,
                    fishCenterX,
                    fishCenterY
                };

                foodDetectionCache.set(fishId, foodDetectionData);
            }

            // Initialize velocity if not set
            if (!fish.vx) fish.vx = 0;
            if (!fish.vy) fish.vy = 0;

            // Always apply base swimming movement
            fish.vx += fish.speed * fish.direction * 0.1; // Continuous base movement

            // Apply food attraction using cached data
            if (foodDetectionData.nearestFood) {
                const dx = foodDetectionData.nearestFood.x - foodDetectionData.fishCenterX;
                const dy = foodDetectionData.nearestFood.y - foodDetectionData.fishCenterY;
                const distance = foodDetectionData.nearestDistance;

                if (distance > 0) {
                    // Calculate attraction force (stronger when closer, with smooth falloff)
                    const distanceRatio = distance / FOOD_DETECTION_RADIUS;
                    const attractionStrength = FOOD_ATTRACTION_FORCE * (1 - distanceRatio * distanceRatio);

                    // Apply force towards food more gently
                    fish.vx += (dx / distance) * attractionStrength;
                    fish.vy += (dy / distance) * attractionStrength;

                    // Update fish direction to face the food (but not too abruptly)
                    if (Math.abs(dx) > 10) { // Only change direction if food is significantly left/right
                        fish.direction = dx > 0 ? 1 : -1;
                    }
                }
            }

            // Always move based on velocity
            fish.x += fish.vx;
            fish.y += fish.vy;

            // Handle edge collisions BEFORE applying friction
            let hitEdge = false;

            // Left and right edges
            if (fish.x <= 0) {
                fish.x = 0;
                fish.direction = 1; // Face right
                fish.vx = Math.abs(fish.vx); // Ensure velocity points right
                hitEdge = true;
            } else if (fish.x >= swimCanvas.width - fish.width) {
                fish.x = swimCanvas.width - fish.width;
                fish.direction = -1; // Face left
                fish.vx = -Math.abs(fish.vx); // Ensure velocity points left
                hitEdge = true;
            }

            // Top and bottom edges
            if (fish.y <= 0) {
                fish.y = 0;
                fish.vy = Math.abs(fish.vy) * 0.5; // Bounce off top, but gently
                hitEdge = true;
            } else if (fish.y >= swimCanvas.height - fish.height) {
                fish.y = swimCanvas.height - fish.height;
                fish.vy = -Math.abs(fish.vy) * 0.5; // Bounce off bottom, but gently
                hitEdge = true;
            }

            // Apply friction - less when attracted to food
            const frictionFactor = foodDetectionData.hasNearbyFood ? 0.88 : 0.85;
            fish.vx *= frictionFactor;
            fish.vy *= frictionFactor;

            // Limit velocity to prevent fish from moving too fast
            const maxVel = fish.speed * 2;
            const velMag = Math.sqrt(fish.vx * fish.vx + fish.vy * fish.vy);
            if (velMag > maxVel) {
                fish.vx = (fish.vx / velMag) * maxVel;
                fish.vy = (fish.vy / velMag) * maxVel;
            }

            // Ensure minimum movement to prevent complete stops
            if (Math.abs(fish.vx) < 0.1) {
                fish.vx = fish.speed * fish.direction * 0.1;
            }

            // If fish hit an edge, give it a small push away from the edge
            if (hitEdge) {
                fish.vx += fish.speed * fish.direction * 0.2;
                // Add small random vertical component to avoid getting stuck
                fish.vy += (Math.random() - 0.5) * 0.3;
            }
        }

        // Calculate swim position - reduce sine wave when fish is attracted to food
        let swimY;
        if (fish.isDying) {
            swimY = fish.y;
        } else {
            // Use cached food detection data for swim animation
            const fishId = fish.docId || `fish_${fishes.indexOf(fish)}`;
            const foodDetectionData = foodDetectionCache.get(fishId);
            const hasNearbyFood = foodDetectionData ? foodDetectionData.hasNearbyFood : false;

            // Reduce sine wave amplitude when attracted to food for more realistic movement
            const currentAmplitude = hasNearbyFood ? fish.amplitude * 0.3 : fish.amplitude;
            swimY = fish.y + Math.sin(time + fish.phase) * currentAmplitude;
        }

        drawWigglingFish(fish, fish.x, swimY, fish.direction, time, fish.phase);
    }

    // Render food pellets
    renderFoodPellets();

    // Render food consumption effects
    renderFoodEffects();

    // Render feeding effects
    renderFeedingEffects();

    requestAnimationFrame(animateFishes);
}

function drawWigglingFish(fish, x, y, direction, time, phase) {
    const src = fish.fishCanvas;
    const w = fish.width;
    const h = fish.height;
    const tailEnd = Math.floor(w * fish.peduncle);

    // Check if this is the current user's fish
    const isCurrentUserFish = isUserFish(fish);

    // Add highlighting effect for user's fish
    if (isCurrentUserFish && !fish.isDying) {
        swimCtx.save();

        // Draw explosive lines radiating from the fish
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        const maxRadius = Math.max(w, h) / 2 + 15;
        const lineCount = 12;
        const lineLength = 15;
        const timeOffset = time * 0.002; // Slow rotation

        swimCtx.strokeStyle = 'rgba(255, 215, 0, 0.8)'; // Bright gold
        swimCtx.lineWidth = 2;
        swimCtx.lineCap = 'round';

        // Draw radiating lines with slight animation
        for (let i = 0; i < lineCount; i++) {
            const angle = (i / lineCount) * Math.PI * 2 + timeOffset;
            const startRadius = maxRadius + 5;
            const endRadius = startRadius + lineLength;

            // Add some variation to line lengths
            const lengthVariation = Math.sin(angle * 3 + timeOffset * 2) * 3;
            const actualEndRadius = endRadius + lengthVariation;

            const startX = centerX + Math.cos(angle) * startRadius;
            const startY = centerY + Math.sin(angle) * startRadius;
            const endX = centerX + Math.cos(angle) * actualEndRadius;
            const endY = centerY + Math.sin(angle) * actualEndRadius;

            // Fade out lines at the edges
            const fadeAlpha = 0.8 - (i % 3) * 0.2;
            swimCtx.strokeStyle = `rgba(255, 215, 0, ${fadeAlpha})`;

            swimCtx.beginPath();
            swimCtx.moveTo(startX, startY);
            swimCtx.lineTo(endX, endY);
            swimCtx.stroke();
        }

        swimCtx.restore();
    }

    // Set opacity for dying or entering fish
    if ((fish.isDying || fish.isEntering) && fish.opacity !== undefined) {
        swimCtx.globalAlpha = fish.opacity;
    }

    // Calculate scale for entering fish
    const scale = fish.scale || 1;

    for (let i = 0; i < w; i++) {
        let isTail, t, wiggle, drawCol, drawX;
        if (direction === 1) {
            isTail = i < tailEnd;
            t = isTail ? (tailEnd - i - 1) / (tailEnd - 1) : 0;
            wiggle = isTail ? Math.sin(time * 3 + phase + t * 2) * t * 12 : 0;
            drawCol = i;
            drawX = x + i + wiggle;
        } else {
            isTail = i >= w - tailEnd;
            t = isTail ? (i - (w - tailEnd)) / (tailEnd - 1) : 0;
            wiggle = isTail ? Math.sin(time * 3 + phase + t * 2) * t * 12 : 0;
            drawCol = w - i - 1;
            drawX = x + i - wiggle;
        }
        swimCtx.save();
        swimCtx.translate(drawX, y);

        // Apply scale for entering fish
        if (fish.isEntering && scale !== 1) {
            swimCtx.scale(scale, scale);
        }

        // Flip upside down for dying fish
        if (fish.isDying) {
            swimCtx.scale(1, -1);
        }

        swimCtx.drawImage(src, drawCol, 0, 1, h, 0, 0, 1, h);
        swimCtx.restore();
    }

    // Reset opacity
    if ((fish.isDying || fish.isEntering) && fish.opacity !== undefined) {
        swimCtx.globalAlpha = 1;
    }
}

// Continue the animation loop
requestAnimationFrame(animateFishes);
