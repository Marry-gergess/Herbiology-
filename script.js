function showPhase(phaseId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    if(phaseId) document.getElementById(phaseId).classList.add('active');
}

// ================= المرحلة 1 =================
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
        alert("انتبه! هذه الأداة خاطئة. (المرجل والبيوتر مخصصين لجرعات أخرى)");
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

// ================= المرحلة 2 =================
document.getElementById('btn-enter-greenhouse').addEventListener('click', () => {
    showPhase(''); 
    const doors = document.getElementById('door-transition');
    doors.classList.remove('hidden');
    
    setTimeout(() => doors.classList.add('door-open'), 100);
    setTimeout(() => {
        doors.classList.add('hidden');
        showPhase('phase-3');
    }, 2000);
});

// ================= المرحلة 3 =================
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
        document.getElementById(toolId).style.display = 'none'; // اخفاء الأداة بعد استخدامها
        
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
                document.getElementById('btn-next-quiz').classList.remove('hidden');
            }, 10000); 
        }
    } else {
        alert("ترتيب خاطئ! (مجرفة -> بذرة -> ري -> سماد)");
    }
});

// ================= المرحلة 4 (الأسئلة) =================
const questions = [
    { q: "أي الأحواض ممنوع استخدامه لخطورته وتفاعله مع الحرارة؟", options: ["الحوض الفضي", "حوض الذهب المزيف", "الحوض النحاسي الخالص"], answer: 1 },
    { q: "إذا بدأت أوراق النبتة بالذبول بعد الري المتكرر، ماذا يعني ذلك؟", options: ["تحتاج المزيد من الماء", "تحتاج إلى التعرض للشمس", "تحتاج إلى الراحة ولا مزيد من الماء"], answer: 2 },
    { q: "ما هي التعويذة المستخدمة لحصاد الناردين؟", options: ["ألوهومورا", "ديفيندو", "لوموس"], answer: 1 }
];
let currentQ = 0;

document.getElementById('btn-next-quiz').addEventListener('click', () => {
    showPhase('phase-4');
    loadQuestion();
});

function loadQuestion() {
    if (currentQ >= questions.length) {
        showPhase('phase-5'); // خلص الأسئلة، روح للبازل
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
        currentQ++;
        loadQuestion();
    } else {
        alert("إجابة خاطئة، ركز جيداً!");
    }
}

// ================= المرحلة 5 (البازل) =================
const piecesContainer = document.getElementById('puzzle-pieces');
let pieces = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

pieces.forEach(num => {
    let div = document.createElement('div');
    div.className = 'puzzle-piece';
    div.draggable = true;
    div.dataset.id = num;
    // لما تجهزي الصور سميها puzzle_1.jpg لحد 9
    div.style.backgroundImage = `url('images/puzzle_${num}.jpg')`; 
    div.innerText = num; // الرقم مكتوب للتسهيل، تقدري تمسحي السطر ده بعدين
    
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
            piece.style.width = '100px'; // يكبر عشان يملى المربع
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

document.getElementById('btn-boss-fight').addEventListener('click', () => showPhase('phase-6'));

// ================= المرحلة 6 (رسم ديفيندو) =================
const canvas = document.getElementById('spell-canvas');
const ctx = canvas.getContext('2d');
const feedbackText = document.getElementById('spell-feedback');
const bossPlant = document.getElementById('boss-plant');

let isDrawing = false;
let points = [];

ctx.lineWidth = 8;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.strokeStyle = '#b89758';
ctx.shadowBlur = 15;
ctx.shadowColor = '#d4af37';

function startDrawing(e) {
    isDrawing = true;
    points = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pos = getPos(e);
    points.push(pos);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    points.push(pos);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    evaluateSpell();
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return { x: clientX - rect.left, y: clientY - rect.top };
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

function evaluateSpell() {
    if (points.length < 15) {
        failSpell("التعويذة ضعيفة جداً! ارسم بشكل أوضح.");
        return;
    }
    let highestY = Math.min(...points.map(p => p.y)); 
    let lowestY = Math.max(...points.map(p => p.y)); 
    const startPt = points[0];
    const endPt = points[points.length - 1];
    
    let bottomY = points[0].y;
    let bottomIndex = 0;
    for (let i = 1; i < points.length; i++) {
        if (points[i].y > bottomY) {
            bottomY = points[i].y;
            bottomIndex = i;
        }
    }
    const startDiff = bottomY - startPt.y;
    const endDiff = bottomY - endPt.y;
    const totalHeight = lowestY - highestY;

    if (startDiff > totalHeight * 0.4 && endDiff > totalHeight * 0.4 && bottomIndex > points.length * 0.1 && bottomIndex < points.length * 0.9) {
        successSpell();
    } else {
        failSpell("حركة العصا خاطئة! ارسم حرف V.");
    }
}

function failSpell(msg) {
    feedbackText.innerText = `❌ ${msg}`;
    feedbackText.style.color = 'var(--danger)';
    setTimeout(() => { ctx.clearRect(0, 0, canvas.width, canvas.height); feedbackText.innerText = ''; }, 2000);
}

function successSpell() {
    feedbackText.innerText = "✨ ديفيندو!! تم قطع النبتة بنجاح!";
    feedbackText.style.color = 'var(--success)';
    bossPlant.style.transition = "all 1s ease";
    bossPlant.style.transform = "scale(0) rotate(180deg)";
    bossPlant.style.opacity = "0";
    setTimeout(() => { alert("🎉 لقد نجوت من الدفيئة السحرية! أحسنت."); }, 1500);
}
