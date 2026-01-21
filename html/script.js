let fontSize = 12;
let listVisible = true;
let categoryStates = {};
let talkingPlayers = {};
let Config = null;
let tagOrder = [];
let emsTagOrder = [];
let backgroundOpacity = 0.9;
let listWidth = 385;
let currentJobType = "police";

window.addEventListener('message', function(event) {
    const data = event.data;
    if (data.action === "setConfig") {
        Config = data.config;
        tagOrder = Object.keys(Config.TagColors);
        emsTagOrder = Object.keys(Config.EMSTagColors);
    } else if (data.action === "openPanel") {
        document.getElementById("panel").style.display = "block";
        updatePanelMode();
    } else if (data.action === "updateList") {
        updateLists(data.policeList || [], data.emsList || []);
        updatePanelMode();
    } else if (data.action === "updateTalking") {
        if (data.isTalking) {
            talkingPlayers[data.playerId] = true;
        } else {
            delete talkingPlayers[data.playerId];
        }
        updateRadioColors();
    } else if (data.action === "closeAll") {
        document.getElementById("panel").style.display = "none";
        document.getElementById("policeList").style.display = "none";
    } else if (data.action === "closePanel") {
        document.getElementById("panel").style.display = "none";
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
        fetchNui("closePanel", {});
        document.getElementById("panel").style.display = "none";
    }
});

function updatePanelMode() {
    const panel = document.getElementById("panel");
    const policeListElement = document.getElementById("policeList");
    
    panel.classList.remove("police-mode", "ems-mode", "mixed-mode");
    
    if (policeListElement.classList.contains("ems-mode")) {
        panel.classList.add("ems-mode");
        currentJobType = "ambulance";
    } else if (policeListElement.classList.contains("mixed-mode")) {
        panel.classList.add("mixed-mode");
        currentJobType = "mixed";
    } else {
        panel.classList.add("police-mode");
        currentJobType = "police";
    }
}

function updateLists(policeList, emsList) {
    if (!Config) {
        console.warn("Config not loaded yet");
        return;
    }

    const listContent = document.getElementById("listContent");
    const totalOfficers = document.getElementById("totalOfficers");
    const listTitle = document.querySelector(".list-title h3");
    const policeListElement = document.getElementById("policeList");
    
    policeList = policeList || [];
    emsList = emsList || [];
    
    const totalCount = policeList.length + emsList.length;
    
    policeListElement.classList.remove("police-mode", "ems-mode", "mixed-mode");
    
    if (emsList.length > 0 && policeList.length > 0) {
        listTitle.textContent = "👮🚑 כוחות פעילים";
        policeListElement.classList.add("mixed-mode");
        currentJobType = "mixed";
    } else if (emsList.length > 0) {
        listTitle.textContent = "🚑 פראמדיקים פעילים";
        policeListElement.classList.add("ems-mode");
        currentJobType = "ambulance";
    } else {
        listTitle.textContent = "👮 שוטרים פעילים";
        policeListElement.classList.add("police-mode");
        currentJobType = "police";
    }
    
    if (totalCount === 0) {
        listContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👮</div>
                <div class="empty-state-text">אין כוחות פעילים כרגע</div>
            </div>
        `;
        totalOfficers.innerHTML = `<span dir="rtl">0 פעילים</span>`;
        return;
    }

    totalOfficers.innerHTML = `<span dir="rtl">${totalCount} פעילים</span>`;

    let html = "";
    
    if (policeList.length > 0) {
        html += generateListHTML(policeList, "police", Config.RadioCategories, tagOrder);
    }
    
    if (emsList.length > 0) {
        html += generateListHTML(emsList, "ems", Config.EMSRadioCategories, emsTagOrder);
    }

    listContent.innerHTML = html;
    applyFontSize();
    applyBackgroundOpacity();
    updateRadioColors();
}

function generateListHTML(list, type, radioCategories, orderArray) {
    list.sort((a, b) => {
        const tagA = a.tag.split('-')[0];
        const tagB = b.tag.split('-')[0];
        const indexA = orderArray.indexOf(tagA);
        const indexB = orderArray.indexOf(tagB);
        return indexA - indexB;
    });

    let categories = {};
    list.forEach(player => {
        const channel = player.radio || 0;
        const cat = radioCategories[channel] || `קשר ${channel}`;
        if (!categories[cat]) {
            categories[cat] = {
                channel: channel,
                officers: []
            };
        }
        categories[cat].officers.push(player);
    });

    const sortedCategories = Object.keys(categories).sort((a, b) => {
        return categories[a].channel - categories[b].channel;
    });

    let html = "";

    for (const catName of sortedCategories) {
        const category = categories[catName];
        const isCollapsed = categoryStates[catName] === true;
        const count = category.officers.length;

        html += `
            <div class="category">
                <div class="category-header" onclick="toggleCategory('${catName}')">
                    <div class="category-title">
                        ${catName}
                        <span class="category-count ${type}">${count}</span>
                    </div>
                    <span class="category-arrow ${isCollapsed ? 'collapsed' : ''}">▼</span>
                </div>
                <div class="category-content ${isCollapsed ? 'collapsed' : ''}" id="cat-${catName.replace(/\s/g, '-')}">
        `;

        category.officers.forEach(officer => {
            const tagColor = getTagColor(officer.tag, type);
            const radioDisplay = officer.radio > 0 ? `${officer.radio} Hz` : "אין קשר";
            const isTalking = talkingPlayers[officer.serverId] === true;

            html += `
                <div class="officer-card" data-server-id="${officer.serverId}">
                    <div class="officer-tag" style="background: ${tagColor}">
                        ${officer.tag}
                    </div>
                    <div class="officer-info">
                        <div class="officer-name">${officer.name}</div>
                        <div class="officer-rank">${officer.rank || "לא ידוע"}</div>
                    </div>
                    <div class="officer-radio ${isTalking ? 'talking' : ''}">
                        <span class="radio-icon">📻</span>
                        <span>${radioDisplay}</span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    return html;
}

function updateRadioColors() {
    const cards = document.querySelectorAll(".officer-card");
    cards.forEach(card => {
        const radioDiv = card.querySelector(".officer-radio");
        if (radioDiv) {
            const serverId = parseInt(card.dataset.serverId);
            const isTalking = talkingPlayers[serverId] === true;
            const isNoRadio = radioDiv.textContent.includes("אין קשר");
            
            if (isTalking && !isNoRadio) {
                radioDiv.classList.add("talking");
            } else {
                radioDiv.classList.remove("talking");
            }
        }
    });
}

function getTagColor(tag, type) {
    const prefix = tag.split('-')[0] || tag;
    
    if (type === "ems" && Config && Config.EMSTagColors[prefix]) {
        const color = Config.EMSTagColors[prefix];
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    } else if (type === "police" && Config && Config.TagColors[prefix]) {
        const color = Config.TagColors[prefix];
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }
    
    return type === "ems" ? "rgb(220, 20, 60)" : "rgb(59, 130, 246)";
}

function toggleCategory(catName) {
    categoryStates[catName] = !categoryStates[catName];
    const catId = 'cat-' + catName.replace(/\s/g, '-');
    const content = document.getElementById(catId);
    const arrow = content.parentElement.querySelector('.category-arrow');
    
    if (categoryStates[catName]) {
        content.classList.add('collapsed');
        arrow.classList.add('collapsed');
    } else {
        content.classList.remove('collapsed');
        arrow.classList.remove('collapsed');
    }
}

function applyFontSize() {
    const policeList = document.getElementById("policeList");
    const allTextElements = document.querySelectorAll(`
        .officer-card,
        .officer-name,
        .officer-rank,
        .officer-radio,
        .category-title,
        .list-title h3,
        .list-stats,
        .empty-state-text,
        .department-header
    `);
    
    allTextElements.forEach(element => {
        element.style.fontSize = fontSize + "px";
    });
    
    listWidth = 305 + (fontSize * 10);
    policeList.style.width = listWidth + "px";
}

function applyBackgroundOpacity() {
    const policeListElement = document.getElementById("policeList");
    const panel = document.getElementById("panel");
    const listHeader = document.querySelector(".list-header");
    const listContent = document.querySelector(".list-content");
    const categories = document.querySelectorAll(".category");
    const officerCards = document.querySelectorAll(".officer-card");
    
    updatePanelMode();
    
    let headerBg, contentBg;
    
    if (policeListElement.classList.contains("ems-mode")) {
        headerBg = `rgba(60, 20, 30, ${backgroundOpacity})`;
        contentBg = `rgba(50, 25, 35, ${backgroundOpacity})`;
    } else if (policeListElement.classList.contains("mixed-mode")) {
        headerBg = `rgba(40, 30, 40, ${backgroundOpacity})`;
        contentBg = `rgba(35, 27, 42, ${backgroundOpacity})`;
    } else {
        headerBg = `rgba(15, 23, 42, ${backgroundOpacity})`;
        contentBg = `rgba(20, 30, 50, ${backgroundOpacity})`;
    }
    
    const categoryBg = policeListElement.classList.contains("ems-mode") ? 
        `rgba(80, 30, 40, ${backgroundOpacity * 0.6})` :
        policeListElement.classList.contains("mixed-mode") ?
        `rgba(50, 40, 55, ${backgroundOpacity * 0.6})` :
        `rgba(30, 41, 59, ${backgroundOpacity * 0.6})`;
    
    const cardBg = policeListElement.classList.contains("ems-mode") ? 
        `rgba(80, 30, 40, ${backgroundOpacity * 0.4})` :
        policeListElement.classList.contains("mixed-mode") ?
        `rgba(50, 40, 55, ${backgroundOpacity * 0.4})` :
        `rgba(30, 41, 59, ${backgroundOpacity * 0.4})`;
    
    if (listHeader) {
        listHeader.style.background = headerBg;
    }
    if (listContent) {
        listContent.style.background = contentBg;
    }
    
    categories.forEach(cat => {
        cat.style.background = categoryBg;
    });
    
    officerCards.forEach(card => {
        card.style.background = cardBg;
    });
}

document.getElementById("toggleList").addEventListener("click", function() {
    listVisible = !listVisible;
    const policeList = document.getElementById("policeList");
    policeList.style.display = listVisible ? "flex" : "none";
    this.innerHTML = listVisible 
        ? '<span class="btn-icon">👁️</span>כבה רשימה' 
        : '<span class="btn-icon">👁️</span>הפעל רשימה';
});

document.getElementById("fontUp").addEventListener("click", function() {
    fontSize = Math.min(18, fontSize + 1);
    applyFontSize();
});

document.getElementById("fontDown").addEventListener("click", function() {
    fontSize = Math.max(10, fontSize - 1);
    applyFontSize();
});

document.getElementById("opacityUp").addEventListener("click", function() {
    backgroundOpacity = Math.max(0.6, backgroundOpacity - 0.05);
    applyBackgroundOpacity();
});

document.getElementById("opacityDown").addEventListener("click", function() {
    backgroundOpacity = Math.min(1, backgroundOpacity + 0.05);
    applyBackgroundOpacity();
});

document.getElementById("saveTag").addEventListener("click", function() {
    const tag = document.getElementById("tagInput").value.trim();
    if (tag) {
        fetchNui("saveTag", {tag: tag});
        document.getElementById("tagInput").value = "";
        
        this.textContent = "✓ נשמר";
        setTimeout(() => {
            this.textContent = "שמור";
        }, 2000);
    }
});

document.getElementById("closePanel").addEventListener("click", function() {
    document.getElementById("panel").style.display = "none";
    fetchNui("closePanel", {});
});

let isDragging = false;
let currentX, currentY, initialX, initialY;
const policeList = document.getElementById("policeList");
const listHeader = policeList.querySelector(".list-header");

listHeader.addEventListener("mousedown", startDragging);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", stopDragging);

function startDragging(e) {
    isDragging = true;
    initialX = e.clientX - policeList.offsetLeft;
    initialY = e.clientY - policeList.offsetTop;
    policeList.style.cursor = "grabbing";
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    policeList.style.left = currentX + "px";
    policeList.style.top = currentY + "px";
}

function stopDragging() {
    isDragging = false;
    policeList.style.cursor = "move";
}

function fetchNui(event, data) {
    fetch(`https://${GetParentResourceName()}/${event}`, {
        method: "POST",
        body: JSON.stringify(data)
    }).catch(() => {});
}

applyBackgroundOpacity();

document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.innerHTML = `
        * {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
        }
        input, textarea {
            user-select: text !important;
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
        }
        .officer-name,
        .officer-rank,
        .officer-radio span,
        .category-title,
        .list-title h3,
        .list-stats span,
        .empty-state-text {
            cursor: default;
        }
    `;
    document.head.appendChild(style);
});