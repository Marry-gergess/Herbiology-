function showPhase(phaseId) {
    // 1. إجبار كل الشاشات على الاختفاء التام عبر CSS المباشر
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    
    // 2. إجبار الشاشة المطلوبة على الظهور
    if(phaseId) {
        let activeScreen = document.getElementById(phaseId);
        if (activeScreen) {
            activeScreen.classList.remove('hidden'); 
            activeScreen.style.display = 'block'; // فرض الظهور الإجباري
            
            // تأخير بسيط جداً للسماح للمتصفح بتحديث الشاشة
            setTimeout(() => {
                activeScreen.classList.add('active');
            }, 50);
        } else {
            alert("خطأ: المرحلة " + phaseId + " غير موجودة في ملف HTML!");
        }
    }
}

// ================= المرحلة 1: تجهيز الساحر =================
let collectedCorrect = 0;
const dropzone = document.getElementById('wizard-dropzone');

document.querySelectorAll('.draggable').forEach(item => {
    item.addEventListener('dragstart', e => {
        e.dataTransfer.setData('type', item.getAttribute('data-type'));
        item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
});

dropzone.addEventListener('dragover', e => e.preventDefault());
dropzone.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    const draggedEl = document.querySelector('.dragging');
    
    if (type === 'trap') {
        alert("انتبه! هذه الأداة ليست للنباتات.");
    } else if (type === 'correct') {
        draggedEl.style.display = 'none'; 
        collectedCorrect++;
        if (collectedCorrect >= 6) { 
            document.getElementById('wizard-img').src = 'images/wizard-ready.png'; 
            document.getElementById('wizard-text').innerText = 'أنت مستعد الآن!';
            document.getElementById('wizard-img').style.display = 'block';
            document.getElementById('btn-enter-greenhouse').classList.remove('hidden');
        }
    }
});

// ================= المرحلة 2: انتقال مباشر للدفيئة =================
document.getElementById('btn-enter-greenhouse').addEventListener('click', () => {
    // النقل الفوري للمرحلة الثالثة (الزراعة) لتجنب أي أعطال
    showPhase('phase-3');
});


// ================= المرحلة 3: الزراعة =================
const expectedSequence = ['tool-spade', 'tool-seed', 'tool-water', 'tool-dung'];
let currentPlantStep = 0;
const pot = document.getElementById('pot-dropzone');
const plantImg = document.getElementById('plant-visual');
const potText = document.getElementById('pot-text');

document.querySelectorAll('.draggable-tool').forEach(tool => {
    tool.addEventListener('dragstart', e => e.dataTransfer.setData('id', tool.id));
});

pot.addEventListener('dragover', e => e.preventDefault());
pot.addEventListener('drop', e => {
    e.preventDefault();
    const toolId = e.dataTransfer.getData('id');
    
    if (toolId === expectedSequence[currentPlantStep]) {
        currentPlantStep++;
        document.getElementById(toolId).style.display = 'none';
        
        if (toolId === 'tool-spade') {
            potText.innerText = "تم تجهيز التربة";
        } else if (toolId === 'tool-seed') {
            plantImg.src = 'images/plant-stage1.png';
            plantImg.style.display = 'block';
            potText.innerText = "تم وضع البذرة";
        } else if (toolId === 'tool-water') {
            plantImg.src = 'images/plant-stage2.png';
            potText.innerText = "تم الري.. تنمو قليلاً";
        } else if (toolId === 'tool-dung') {
            potText.innerText = "تم وضع السماد.. انتظر 10 ثواني";
            setTimeout(() => {
                plantImg.src = 'images/plant-stage3.png';
                potText.innerText = "النبتة مكتملة النمو!";
                document.getElementById('btn-next-harvest').classList.remove('hidden');
            }, 10000); 
        }
    } else {
        alert("ترتيب خاطئ! (مجرفة -> بذرة -> ري -> سماد)");
    }
});

// ================= المرحلة 3.5: حصاد ديفيندو =================
document.getElementById('btn-next-harvest').addEventListener('click', () => {
    showPhase('phase-harvest');
});

const hCanvas = document.getElementById('harvest-canvas');
const hCtx = hCanvas.getContext('2d');
const hFeedback = document.getElementById('harvest-feedback');
const hPlant = document.getElementById('harvest-plant');

let hIsDrawing = false;
let hPoints = [];

hCtx.lineWidth = 8;
hCtx.lineCap = 'round';
hCtx.lineJoin = 'round';
hCtx.strokeStyle = '#8bc34a'; 
hCtx.shadowBlur = 15;
hCtx.shadowColor = '#4caf50';

function hStart(e) {
    hIsDrawing = true; hPoints = [];
    hCtx.clearRect(0, 0, hCanvas.width, hCanvas.height);
    const pos = hGetPos(e); hPoints.push(pos);
    hCtx.beginPath(); hCtx.moveTo(pos.x, pos.y);
}
function hDraw(e) {
    if (!hIsDrawing) return; e.preventDefault();
    const pos = hGetPos(e); hPoints.push(pos);
    hCtx.lineTo(pos.x, pos.y); hCtx.stroke();
}
function hStop() { if (!hIsDrawing) return; hIsDrawing = false; hEvaluate(); }
function hGetPos(e) {
    const rect = hCanvas.getBoundingClientRect();
    const cx = e.clientX || (e.touches && e.touches[0].clientX);
    const cy = e.clientY || (e.touches && e.touches[0].clientY);
    return { x: cx - rect.left, y: cy - rect.top };
}

hCanvas.addEventListener('mousedown', hStart); hCanvas.addEventListener('mousemove', hDraw);
hCanvas.addEventListener('mouseup', hStop); hCanvas.addEventListener('mouseout', hStop);
hCanvas.addEventListener('touchstart', hStart); hCanvas.addEventListener('touchmove', hDraw);
hCanvas.addEventListener('touchend', hStop);

function hEvaluate() {
    if (hPoints.length < 10) { hFail("التعويذة غير مكتملة!"); return; }
    
    let minY = Math.min(...hPoints.map(p => p.y)); 
    let maxY = Math.max(...hPoints.map(p => p.y)); 
    let minIndex = hPoints.findIndex(p => p.y === minY);
    let maxIndex = hPoints.findIndex(p => p.y === maxY);
    
    if (minIndex < maxIndex && maxIndex < hPoints.length - 2 && (maxY - minY) > 50) {
        hSuccess();
    } else {
        hFail("حركة خاطئة! ارسم الزجزاج (ديفيندو).");
    }
}
function hFail(msg) {
    hFeedback.innerText = `❌ ${msg}`; hFeedback.style.color = 'var(--danger)';
    setTimeout(() => { hCtx.clearRect(0, 0, hCanvas.width, hCanvas.height); hFeedback.innerText = ''; }, 2000);
}
function hSuccess() {
    hFeedback.innerText = "✨ ديفيندو!! تم الحصاد بنجاح.";
    hFeedback.style.color = 'var(--success)';
    hPlant.style.transition = "transform 1s";
    hPlant.style.transform = "translateY(50px) rotate(90deg)"; 
    setTimeout(() => { document.getElementById('btn-next-quiz').classList.remove('hidden'); }, 1500);
}

// ================= المرحلة 4: الأسئلة =================
document.getElementById('btn-next-quiz').addEventListener('click', () => {
    showPhase('phase-4');
    loadQuestion();
});

const questions = [
    { q: "أي الأحواض ممنوع استخدامه لخطورته وتفاعله مع الحرارة؟", options: ["الحوض الفضي", "حوض الذهب المزيف", "الحوض النحاسي الخالص"], answer: 1 },
    { q: "إذا بدأت أوراق النبتة بالذبول بعد الري المتكرر، ماذا يعني ذلك؟", options: ["تحتاج المزيد من الماء", "تحتاج إلى التعرض للشمس", "تحتاج إلى الراحة ولا مزيد من الماء"], answer: 2 },
    { q: "ما هي التعويذة المستخدمة لحصاد الناردين؟", options: ["ألوهومورا", "ديفيندو", "لوموس"], answer: 1 }
];
let currentQ = 0;

function loadQuestion() {
    if (currentQ >= questions.length) {
        showPhase('phase-5'); 
        return;
    }
    document.getElementById('question-text').innerText = questions[currentQ].q;
    const container = document.getElementById('answers-container');
    container.innerHTML = '';
    questions[currentQ].options.forEach((opt, index) => {
        let btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index);
        container.appendChild(btn);
    });
}
function checkAnswer(index) {
    if (index === questions[currentQ].answer) {
        currentQ++; loadQuestion();
    } else {
        alert("إجابة خاطئة، ركز جيداً!");
    }
}

// ================= المرحلة 5: البازل =================
// ================= المرحلة 5: البازل =================
const piecesContainer = document.getElementById('puzzle-pieces');
let pieces = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

pieces.forEach(num => {
    let div = document.createElement('div');
    div.className = 'puzzle-piece';
    div.draggable = true;
    div.dataset.id = num;
    // تم تغيير الامتداد هنا لـ png
    div.style.backgroundImage = `url('images/puzzle_${num}.png')`; 
    div.addEventListener('dragstart', e => e.dataTransfer.setData('id', num));
    piecesContainer.appendChild(div);
});

let correctPieces = 0;
document.querySelectorAll('.puzzle-slot').forEach(slot => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('id');
        const slotId = slot.dataset.slot;
        
        if (draggedId === slotId) {
            const piece = document.querySelector(`.puzzle-piece[data-id="${draggedId}"]`);
            slot.appendChild(piece);
            piece.draggable = false;
            piece.style.width = '100px'; 
            piece.style.height = '100px';
            correctPieces++;
            if(correctPieces === 9) {
                document.getElementById('btn-boss-fight').classList.remove('hidden');
            }
        } else {
            alert("هذه القطعة لا تنتمي هنا!");
        }
    });
});

// الانتقال من البازل إلى مرحلة التوصيل
document.getElementById('btn-boss-fight').addEventListener('click', () => showPhase('phase-matching'));

// الانتقال من البازل إلى مرحلة التوصيل
document.getElementById('btn-boss-fight').addEventListener('click', () => showPhase('phase-matching'));

// ================= المرحلة 5.5: التوصيل =================
let correctMatches = 0;
const draggablePlants = document.querySelectorAll('.draggable-plant');
const matchDropzones = document.querySelectorAll('.match-dropzone');

draggablePlants.forEach(plant => {
    plant.addEventListener('dragstart', e => {
        e.dataTransfer.setData('match', plant.getAttribute('data-match'));
        plant.classList.add('dragging-match');
    });
    plant.addEventListener('dragend', () => plant.classList.remove('dragging-match'));
});

matchDropzones.forEach(zone => {
    zone.addEventListener('dragover', e => e.preventDefault());
    zone.addEventListener('drop', e => {
        e.preventDefault();
        const draggedMatch = e.dataTransfer.getData('match');
        const zoneMatch = zone.getAttribute('data-match');
        
        if (draggedMatch === zoneMatch) {
            const draggedEl = document.querySelector('.dragging-match');
            zone.appendChild(draggedEl); // نقل الكلمة للمربع
            draggedEl.draggable = false; // منع سحبها تاني
            
            // تظبيط شكلها جوه المربع
            draggedEl.style.border = "none";
            draggedEl.style.background = "none";
            draggedEl.style.padding = "0";
            draggedEl.style.color = "var(--accent-hover)";
            
            zone.classList.add('correct');
            correctMatches++;
            
            // لو خلص الـ 4 صح، يظهر زرار الزعيم
            if (correctMatches === 4) {
                document.getElementById('btn-enter-boss').classList.remove('hidden');
            }
        } else {
            alert("إجابة خاطئة! هذه الخاصية لا تنتمي لهذه النبتة.");
        }
    });
});

// الانتقال من مرحلة التوصيل إلى الزعيم النهائي (فخ الشيطان)
document.getElementById('btn-enter-boss').addEventListener('click', () => showPhase('phase-6'));


// ================= المرحلة 6: فخ الشيطان (انسنديو) =================
const bossCanvas = document.getElementById('spell-canvas');
const bossCtx = bossCanvas.getContext('2d');
const bossFeedback = document.getElementById('spell-feedback');
const finalBossPlant = document.getElementById('boss-plant');

let bIsDrawing = false;
let bPoints = [];

bossCtx.lineWidth = 8;
bossCtx.lineCap = 'round';
bossCtx.lineJoin = 'round';
bossCtx.strokeStyle = '#ff9800'; // برتقالي ناري
bossCtx.shadowBlur = 20;
bossCtx.shadowColor = '#ff3d00'; 

function bStart(e) {
    bIsDrawing = true; bPoints = [];
    bossCtx.clearRect(0, 0, bossCanvas.width, bossCanvas.height);
    const pos = bGetPos(e); bPoints.push(pos);
    bossCtx.beginPath(); bossCtx.moveTo(pos.x, pos.y);
}
function bDraw(e) {
    if (!bIsDrawing) return; e.preventDefault();
    const pos = bGetPos(e); bPoints.push(pos);
    bossCtx.lineTo(pos.x, pos.y); bossCtx.stroke();
}
function bStop() { if (!bIsDrawing) return; bIsDrawing = false; bEvaluate(); }
function bGetPos(e) {
    const rect = bossCanvas.getBoundingClientRect();
    const cx = e.clientX || (e.touches && e.touches[0].clientX);
    const cy = e.clientY || (e.touches && e.touches[0].clientY);
    return { x: cx - rect.left, y: cy - rect.top };
}

bossCanvas.addEventListener('mousedown', bStart); bossCanvas.addEventListener('mousemove', bDraw);
bossCanvas.addEventListener('mouseup', bStop); bossCanvas.addEventListener('mouseout', bStop);
bossCanvas.addEventListener('touchstart', bStart); bossCanvas.addEventListener('touchmove', bDraw);
bossCanvas.addEventListener('touchend', bStop);

function bEvaluate() {
    if (bPoints.length < 10) { bFail("التعويذة غير مكتملة!"); return; }

    const startPt = bPoints[0];
    const endPt = bPoints[bPoints.length - 1];
    let lowestY = Math.max(...bPoints.map(p => p.y));
    let highestY = Math.min(...bPoints.map(p => p.y));
    let totalHeight = lowestY - highestY;

    // حركة انسنديو (تصاعدية لأعلى كشعلة اللهب)
    if (startPt.y > highestY && endPt.y < lowestY && totalHeight > 60) {
        bSuccess();
    } else {
        bFail("ارفع عصاك للأعلى بحركة سريعة كاللهب (انسنديو).");
    }
}

function bFail(msg) {
    bossFeedback.innerText = `❌ ${msg}`; bossFeedback.style.color = 'var(--danger)';
    setTimeout(() => { bossCtx.clearRect(0, 0, bossCanvas.width, bossCanvas.height); bossFeedback.innerText = ''; }, 2500);
}

function bSuccess() {
    bossFeedback.innerText = "🔥 انسنديو!! احترق فخ الشيطان!";
    bossFeedback.style.color = '#ff9800';
    
    finalBossPlant.classList.remove('shake-animation');
    finalBossPlant.classList.add('fire-burn');
    
    setTimeout(() => { 
        alert("🎉 مبروك! لقد تغلبت على فخ الشيطان وأكملت الدفيئة بنجاح باهر!"); 
    }, 1500);
}
