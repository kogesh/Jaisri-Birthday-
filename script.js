// --- 3D Character Setup ---
let scene, camera, renderer, model, mixer, actions = {};
let activeAction;
let isHappy = false;
let mouseX = 0, mouseY = 0;

function init3D() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const loader = new THREE.GLTFLoader();
    // Using a cute princess/girl model from a reliable source
    loader.load('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/character-female-g/model.gltf', (gltf) => {
        model = gltf.scene;
        model.scale.set(1.5, 1.5, 1.5);
        model.position.y = -1.2;
        scene.add(model);

        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach(clip => {
                actions[clip.name] = mixer.clipAction(clip);
            });
            
            // Find an idle animation
            const idleAction = actions['Idle'] || actions['idling'] || Object.values(actions)[0];
            if (idleAction) {
                idleAction.play();
                activeAction = idleAction;
            }
        }
    }, undefined, (error) => {
        console.error('Error loading 3D model:', error);
    });

    animate3D();
}

function fadeToAction(name, duration) {
    const nextAction = actions[name];
    if (!nextAction || nextAction === activeAction) return;

    if (activeAction) {
        activeAction.fadeOut(duration);
    }

    nextAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();

    activeAction = nextAction;
}

function animate3D() {
    requestAnimationFrame(animate3D);
    const time = Date.now() * 0.001;

    if (model) {
        // Idle floating
        model.position.y = -0.8 + Math.sin(time * 2) * 0.08;
        
        // Breathing scale effect
        const scale = 0.3 + Math.sin(time * 3) * 0.008;
        model.scale.set(scale, scale, scale);

        // Mouse tilt
        model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, (mouseX / window.innerWidth - 0.5) * 0.6, 0.1);
        model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, (mouseY / window.innerHeight - 0.5) * 0.3, 0.1);

        if (isHappy) {
            model.rotation.y += 0.15;
            model.scale.set(scale * 1.4, scale * 1.4, scale * 1.4);
        }
    }

    if (mixer) mixer.update(0.016);
    renderer.render(scene, camera);
}

// --- Interaction Triggers ---
function triggerWave() {
    if (actions['Wave']) {
        fadeToAction('Wave', 0.2);
        setTimeout(() => fadeToAction('Idling', 0.5), 2000);
    }
}

function triggerBounce() {
    if (model) {
        const bounce = Math.sin(Date.now() * 0.01) * 0.1;
        model.position.y += bounce;
    }
}

function triggerHappy() {
    isHappy = true;
    // Initial burst of happiness: Spin and Jump/Dance
    const jumpAction = actions['Jump'] || actions['jump'] || actions['Wave'] || actions['wave'];
    if (jumpAction) {
        fadeToAction(jumpAction._clip.name, 0.1);
    }
    
    // Transition to celebratory dance after the initial jump/spin
    setTimeout(() => {
        const danceAction = actions['Dance'] || actions['dance'] || actions['Running'] || actions['running'];
        if (danceAction) {
            fadeToAction(danceAction._clip.name, 0.8);
        }
    }, 1500);
}

// --- Cursor Trail ---
const trail = document.getElementById('cursor-trail');
const dot = document.getElementById('cursor-dot');

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    setTimeout(() => {
        trail.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
    }, 50);
});

window.addEventListener('scroll', () => {
    triggerBounce();
});

// --- Scroll Animation Logic ---
function openScroll() {
    const wrapper = document.getElementById('scroll-wrapper');
    const paper = document.getElementById('scroll-paper');
    const heading = document.getElementById('scroll-heading');
    const trigger = document.getElementById('scroll-trigger-container');
    const rollers = document.querySelectorAll('.scroll-roller');
    
    trigger.style.display = 'none';
    wrapper.classList.add('active');
    
    setTimeout(() => {
        heading.classList.add('show');
        paper.classList.add('open');
        rollers.forEach(r => r.classList.add('open'));
        
        // Start typing the letter inside the scroll
        setTimeout(startScrollTyping, 2000);
    }, 100);
}

function startScrollTyping() {
    const text = `Jaisri…

Naa enna solla start panrathunu konjam yosichen…
Because unna pathi sollanum na words konjam kammi dhaan 😅  

Life la romba per varuvaanga… povanga…
And nee… nee than different 💯  

Un kooda pesina time epdi pogudhu nu theriyadhu…
Sometimes nee romba annoying ah iruppa 🤭  
Aana athuve enakku pudikkum 😌  

Namma rendu perum photos edukkala…
Aana namma moments? Adhu romba adhigam 💙  

Enna nadandhaalum…
Naa unna vida maaten…
Because nee just bestie illa…
Konjam more 😌  

Indha website perusa onnum illa…
But nee enakku evlo important nu solla try pannadhu 💯  

Happy Birthday Jaisri 🎂💫`;

    const container = document.getElementById('scroll-letter-text');
    let charIndex = 0;

    function type() {
        if (charIndex < text.length) {
            container.innerHTML += text.charAt(charIndex);
            charIndex++;
            // Scroll down as we type to keep text visible if it overflows
            const paper = document.getElementById('scroll-paper');
            paper.scrollTop = paper.scrollHeight;
            
            setTimeout(type, 30);
        } else {
            document.getElementById('after-scroll-btn').style.display = 'block';
        }
    }
    type();
}

// --- Existing Logic Updated ---
// Star Background Generation
const bg = document.getElementById('particles-js');
const starCount = 120;
for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
    bg.appendChild(star);
}

// Section Navigation
function nextSection(id) {
    const current = document.querySelector('section.active');
    const next = document.getElementById(id);

    triggerWave(); // Character waves on button click

    if (current) {
        current.style.opacity = '0';
        current.style.transform = 'translateY(-30px)';
        setTimeout(() => {
            current.classList.remove('active');
            current.style.display = 'none';
            
            next.style.display = 'flex';
            setTimeout(() => {
                next.classList.add('active');
                handleSectionEntry(id);
            }, 50);
        }, 800);
    }

    // Start music on first interaction
    if (id === 'intro') {
        const music = document.getElementById('bg-music');
        music.play().catch(e => console.log("Autoplay blocked"));
    }
}

// Handle specific logic when entering a section
function handleSectionEntry(id) {
    if (id === 'intro') {
        startTyping();
    } else if (id === 'special') {
        showSpecialItems();
    } else if (id === 'final') {
        triggerConfetti();
        startFinalAnimations();
    }
}

function startFinalAnimations() {
    const card = document.getElementById('final-card');
    const title = document.getElementById('final-title');
    const nameSpan = document.getElementById('name-span');
    const flash = document.getElementById('cinematic-flash');
    const q1 = document.getElementById('q1');
    const q2 = document.getElementById('q2');
    const q3 = document.getElementById('q3');
    const small = document.getElementById('final-small');

    // 1. Start slow cinematic zoom
    setTimeout(() => card.classList.add('zooming'), 100);

    // 2. Sequential Reveal
    setTimeout(() => {
        title.classList.add('show');
        
        setTimeout(() => {
            nameSpan.classList.add('pulse');
            triggerHappy(); // Character reacts to the reveal
            
            // Screen Flash
            flash.style.opacity = '0.3';
            setTimeout(() => flash.style.opacity = '0', 200);
        }, 1000);
    }, 800);

    // 3. Quote Reveal (Timed for cinematic pacing)
    setTimeout(() => q1.classList.add('show'), 4500);
    setTimeout(() => q2.classList.add('show'), 6500);
    setTimeout(() => q3.classList.add('show'), 8500);
    setTimeout(() => small.classList.add('show'), 11000);
}

// Typing Effect
function startTyping() {
    const text = [
        "Today is not just a normal day...",
        "Because someone very special was born...",
        "And that person is you, Jaisri 💙"
    ];
    const container = document.getElementById('typing-text');
    let lineIndex = 0;
    let charIndex = 0;

    function type() {
        if (lineIndex < text.length) {
            if (charIndex < text[lineIndex].length) {
                if (charIndex === 0 && lineIndex > 0) {
                    container.innerHTML += '<br>';
                }
                container.innerHTML += text[lineIndex].charAt(charIndex);
                charIndex++;
                setTimeout(type, 70);
            } else {
                lineIndex++;
                charIndex = 0;
                setTimeout(type, 1000);
            }
        } else {
            document.getElementById('intro-btn').style.display = 'block';
        }
    }
    type();
}

// Special Items Animation
function showSpecialItems() {
    const items = document.querySelectorAll('.special-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('show');
            if (index === items.length - 1) {
                setTimeout(() => {
                    document.getElementById('final-trigger').style.display = 'block';
                }, 1000);
            }
        }, index * 800);
    });
}

// Confetti
function triggerConfetti() {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
}

// Music Control
const musicBtn = document.getElementById('music-btn');
const music = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');

musicBtn.onclick = () => {
    if (music.paused) {
        music.play();
        musicIcon.innerHTML = '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>';
    } else {
        music.pause();
        musicIcon.innerHTML = '<line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>';
    }
};

// Initialize 3D
window.onload = () => {
    init3D();
    initFloatingElements();
};

// Floating Background Elements Logic
function initFloatingElements() {
    const container = document.createElement('div');
    container.className = 'floating-container';
    document.body.appendChild(container);

    const types = ['bubble', 'star-mini', 'heart-mini', 'particle-mini'];
    const count = 25;

    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Limit hearts to keep it subtle
        if (type === 'heart-mini' && Math.random() > 0.3) {
            i--; continue; 
        }

        item.className = `floating-item ${type} pulse-glow`;
        
        const size = Math.random() * 20 + 5;
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 15;
        const delay = Math.random() * 20;
        const drift = (Math.random() - 0.5) * 200;
        const rotation = (Math.random() - 0.5) * 360;
        const opacity = Math.random() * 0.4 + 0.2;
        const blur = Math.random() * 4;

        item.style.width = `${size}px`;
        item.style.height = `${size}px`;
        item.style.left = `${left}%`;
        item.style.setProperty('--duration', `${duration}s`);
        item.style.setProperty('--delay', `${delay}s`);
        item.style.setProperty('--drift', `${drift}px`);
        item.style.setProperty('--rotation', `${rotation}deg`);
        item.style.setProperty('--opacity', opacity);
        item.style.setProperty('--blur', `${blur}px`);
        
        // Depth layers (Parallax feel)
        if (blur > 2) item.style.zIndex = -2;
        else if (blur > 1) item.style.zIndex = -1;
        else item.style.zIndex = 0;

        container.appendChild(item);
    }
}
