// استبدلي اللينك اللي تحت بلينك الـ Web App URL اللي نسختيه من جوجل سكريبت
const API_URL = "حطي_الرابط_بتاعك_هنا"; 

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

let inventory = JSON.parse(localStorage.getItem('herbology_inventory')) || {};
let activePots = JSON.parse(localStorage.getItem('herbology_pots')) || [];
let plantsData = [];
let recipesData = [];

async function loadAllData() {
    try {
        const plantsRes = await fetch(`${API_URL}?sheet=Plants`);
        plantsData = await plantsRes.json();
        
        const recipesRes = await fetch(`${API_URL}?sheet=Remedies`);
        recipesData = await recipesRes.json();
        
        renderEncyclopedia();
        renderGreenhouse();
        renderApothecary();
        renderInventory();
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

function renderEncyclopedia() {
    const grid = document.getElementById('plants-grid');
    grid.innerHTML = ''; 

    plantsData.forEach(plant => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${plant.name}</h3>
            <span class="danger-badge">${plant.whips_level || 'آمن'}</span>
            <p><strong>الوقت اللازم:</strong> ${plant.grow_time_mins} دقيقة</p>
            <p><strong>الترياق:</strong> ${plant.antidote_needed || 'لا يوجد'}</p>
            <button class="action-btn" onclick="plantSeed('${plant.id}', '${plant.name}', ${plant.grow_time_mins})">
                🌱 ازرع الآن
            </button>
        `;
        grid.appendChild(card);
    });
}

function plantSeed(id, name, growTimeMins) {
    const growTimeMs = growTimeMins * 60 * 1000;
    const finishTime = Date.now() + growTimeMs;

    activePots.push({
        id: id,
        name: name,
        finishTime: finishTime
    });

    saveData();
    renderGreenhouse();
    alert(`تم زراعة ${name}! راقبها في الصوبة.`);
}

function renderGreenhouse() {
    const potsContainer = document.getElementById('pots-container');
    potsContainer.innerHTML = '';

    activePots.forEach((pot, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        const timeLeftMs = pot.finishTime - Date.now();
        
        if (timeLeftMs > 0) {
            const timeLeftSec = Math.ceil(timeLeftMs / 1000);
            card.innerHTML = `
                <h3>${pot.name}</h3>
                <p>⏳ قيد النمو...</p>
                <p>متبقي: ${timeLeftSec} ثانية</p>
            `;
        } else {
            card.innerHTML = `
                <h3>${pot.name}</h3>
                <p>✨ جاهزة للحصاد!</p>
                <button class="action-btn" onclick="harvestPlant(${index}, '${pot.name}')">
                    ✂️ حصاد
                </button>
            `;
        }
        potsContainer.appendChild(card);
    });
}

function harvestPlant(potIndex, plantName) {
    inventory[plantName] = (inventory[plantName] || 0) + 1;
    activePots.splice(potIndex, 1);
    saveData();
    renderGreenhouse();
    renderInventory();
}

function renderApothecary() {
    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = ''; 

    recipesData.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let ingredientsText = `${recipe.req_qty_1}x ${recipe.req_plant_1}`;
        if (recipe.req_plant_2 && recipe.req_qty_2 > 0) {
            ingredientsText += ` + ${recipe.req_qty_2}x ${recipe.req_plant_2}`;
        }

        card.innerHTML = `
            <h3 style="color: #4b0082;">🧪 ${recipe.name}</h3>
            <span class="danger-badge" style="background-color: #555;">${recipe.type}</span>
            <p><strong>المكونات المطلوبة:</strong><br> ${ingredientsText}</p>
            <button class="action-btn" style="background-color: #4b0082;" 
                onclick="craftPotion('${recipe.name}', '${recipe.req_plant_1}', ${recipe.req_qty_1}, '${recipe.req_plant_2 || ''}', ${recipe.req_qty_2 || 0})">
                ✨ خلط المكونات
            </button>
        `;
        grid.appendChild(card);
    });
}

function craftPotion(potionName, plant1, qty1, plant2, qty2) {
    const hasPlant1 = (inventory[plant1] || 0) >= qty1;
    const hasPlant2 = qty2 === 0 || (inventory[plant2] || 0) >= qty2;

    if (hasPlant1 && hasPlant2) {
        inventory[plant1] -= qty1;
        if (qty2 > 0) inventory[plant2] -= qty2;
        
        if (inventory[plant1] === 0) delete inventory[plant1];
        if (plant2 && inventory[plant2] === 0) delete inventory[plant2];

        inventory[potionName] = (inventory[potionName] || 0) + 1;

        saveData();
        renderInventory();
        alert(`نجاح مبهر! ✨ لقد قمت بتحضير [${potionName}] بنجاح.`);
    } else {
        let missingMsg = `انفجار في المرجل! 💥 ليس لديك مكونات كافية.\nتحتاج إلى:\n- ${qty1} ${plant1}`;
        if (qty2 > 0) missingMsg += `\n- ${qty2} ${plant2}`;
        alert(missingMsg);
    }
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    for (const [plant, count] of Object.entries(inventory)) {
        const li = document.createElement('li');
        li.textContent = `${plant}: ${count} وحدة`;
        list.appendChild(li);
    }
}

function saveData() {
    localStorage.setItem('herbology_pots', JSON.stringify(activePots));
    localStorage.setItem('herbology_inventory', JSON.stringify(inventory));
}

setInterval(() => {
    if (activePots.length > 0) renderGreenhouse();
}, 1000);

document.addEventListener('DOMContentLoaded', loadAllData);
