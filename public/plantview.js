const mainApp = document.getElementById("app")

const infoView = document.getElementById("info-view")
const careView = document.getElementById("care-view")
const historyView = document.getElementById("history-view")

const waterBtn = document.getElementById("water-btn")
const waterBtnInternals = document.getElementsByClassName("water-btn-internals")[0]
const wateredText = document.getElementById("last-watered")
const mistedText = document.getElementById("last-misted")
const waterRect = document.getElementById("water_rect")
const waterSVG = document.getElementById("water-drop-svg")
const waterAmountText = document.getElementById("water-amount")

const actionList = document.getElementById("action-list")
const historyItemTemplate = document.getElementById("history-item-template")

const toggleViewBtn = document.getElementById("toggle-view-btn")
const closeWaterViewBtn = document.getElementById("close-water-btn")

const timelineBtn = document.getElementById("timeline-btn")
const closeTimelineViewBtn = document.getElementById("close-history-btn")

const unitTypeSelect = document.getElementById("unit-types")
const wateringTypeSelect = document.getElementById("watering-types")

const plantCode = JSON.parse(mainApp.dataset.plantCode)
const careActions = JSON.parse(mainApp.dataset.careActions)

const waterAmountDesc = {
    xxs: "Nothing",
    xs: "Sprinkle",
    s: "Light",
    m: "Moderate",
    l: "Generous",
    xl: "Soaking",
    xxl: "Flood"
}

const waterMax = 2000
const waterMin = 0

let waterUnit = unitTypeSelect.value
let waterMethod = wateringTypeSelect.value
let waterDesc = waterAmountDesc.xxs

let dragging = false
let waterAmount = 0 // send to db, 100 ml accuracy
let waterSliderVal = 0 // for animating slider, 1 ml accuracy for smoother animation
let wateringSuccess = false

async function addWatering() {
    const url = `/plant/${encodeURIComponent(plantCode)}/waterings`
    const payload = getPayload()

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }

        // Update plant info view if res.ok
        const updateData = await res.json()
        console.log(updateData)
        wateringSuccess = true

        if (updateData.type == 'water') {
            wateredText.innerHTML = updateData.watering.date
            addHistoryEntry(updateData)
        } else if (updateData.type == 'mist') {
            mistedText.innerHTML = updateData.watering.date
            addHistoryEntry(updateData)
        }

    } catch(e) {
        console.error(e);
        wateringSuccess = false
        alert("Failed to log watering.");
    }
    showStatusInBtn(wateringSuccess)
}

function addHistoryEntry(update) {
    console.log('adding history entry')
    console.log(update)
    const instance = historyItemTemplate.content.cloneNode(true)
    instance.querySelector('.care-action-name').textContent = update.watering.method
    instance.querySelector('.care-action-timestamp').textContent = update.watering.time
    instance.querySelector('.water-amount').textContent = update.watering.amount
    console.log(instance)
    actionList.prepend(instance)
}

function getPayload() {
    let payload = {
        plantCode: plantCode,
        method: waterMethod,
    }

    if (waterUnit === 'approximate') {
        payload.amount = waterDesc
    } else {
        payload.amount = waterAmount
    }
    
    return payload
}

function showStatusInBtn(success) {
    if (success) {
        waterBtn.innerText = "Plant watered!"
        waterBtn.classList.add('success', 'show-result')
    } else {
        waterBtn.innerText = "Watering failed!"
        waterBtn.classList.add('failure', 'show-result')
    }
    setTimeout(() => {
        waterBtn.classList.remove('success', 'failure', 'filled', 'show-result')
        waterBtn.innerText = "Hold to Water"
    }, 2500)
}

function emptyWaterMeter() {
    waterSliderVal -= 10
    waterAmount = waterSliderVal - (waterSliderVal % 100)
    waterAmountText.innerText = `${waterAmount} ml`
    waterBtn.classList.add('inactive')

    if (waterSliderVal <= 0) {
        wateringSuccess = false
        waterBtn.classList.remove('inactive')
        waterBtn.disabled = true
    }
}

function convertYToSvgCoordinates(y) {
    const rect = waterSVG.getBoundingClientRect()
    const bottom = rect.bottom

    const relPos = bottom - y
    let temp = parseInt(waterMax / 300 * relPos)

    if (temp >= waterMax) {
        temp = waterMax
    } else if (temp <= waterMin) {
        temp = waterMin
    }

    waterSliderVal = temp
    waterAmount = temp - (temp % 100)

    if (waterUnit === 'approximate') {
        convertMlToDescription(temp)
    } else {
        waterAmountText.innerText = `${waterAmount} ml`
    }

    toggleWaterBtnActivity()
}

function convertMlToDescription(ml) {
    if (ml <= 0) {
        waterDesc = waterAmountDesc.xxs
    } else if (ml > 0 && ml <= 300) {
        waterDesc = waterAmountDesc.xs
    } else if (ml > 300 && ml <= 600) {
        waterDesc = waterAmountDesc.s
    } else if (ml > 600 && ml <= 900) {
        waterDesc = waterAmountDesc.m
    } else if (ml > 900 && ml <= 1200) {
        waterDesc = waterAmountDesc.l
    } else if (ml > 1200 && ml <= 1500) {
        waterDesc = waterAmountDesc.xl
    } else if (ml > 1500) {
        waterDesc = waterAmountDesc.xxl
    }
    waterAmountText.innerText = waterDesc
}

function toggleWaterBtnActivity () {
    if (waterAmount <= 0) {
        waterBtn.disabled = true
    } else {
        waterBtn.disabled = false
    }
}

// TODO: Stop animation when watering screen not active !!
function animate() {
    if (wateringSuccess) {
        emptyWaterMeter()
    }
    const y = waterSliderVal/ 2000 * 64
    const invertedY = 64 - y
    waterRect.setAttribute("y", `${invertedY}`)

    requestAnimationFrame(animate)
}
requestAnimationFrame(animate)


closeWaterViewBtn.addEventListener('click', (e) => {
    e.preventDefault()
    careView.classList.toggle('open')
})

toggleViewBtn.addEventListener('click', (e) => {
    e.preventDefault()
    // careView.classList.toggle('open')
})

timelineBtn.addEventListener('click', (e) => {
    e.preventDefault()
    historyView.classList.toggle('open')
})

closeTimelineViewBtn.addEventListener('click', (e) => {
    e.preventDefault()
    historyView.classList.toggle('open')
})

unitTypeSelect.addEventListener('change', (e) => {
    waterUnit = unitTypeSelect.value
    if (waterUnit === 'ml') {
        waterAmountText.innerText = `${waterAmount} ml`
    } else if (waterUnit === 'approximate') {
        convertMlToDescription(waterAmount)
    }
})

wateringTypeSelect.addEventListener('change', (e) => {
    waterMethod = wateringTypeSelect.value
})

waterBtn.addEventListener('transitionend', (e) => {
    e.preventDefault()
    const style = getComputedStyle(waterBtn, '::before')
    if (waterAmount > 0 && parseInt(style.width) > 0) {
        addWatering()
        waterBtn.classList.add('filled')
    }
})

// Handle mouse & touch input to water slider
waterSVG.addEventListener('mousedown', (e) => {
    e.preventDefault()
    dragging = true
})

document.addEventListener('mouseup', (e) => {
    e.preventDefault()
    dragging = false
})

document.addEventListener('mousemove', (e) => {
    e.preventDefault()
    if (dragging && !wateringSuccess) {
        convertYToSvgCoordinates(e.clientY)
    }
})

waterSVG.addEventListener('touchstart', (e) => {
    dragging = true
})

document.addEventListener('touchend', (e) => {
    dragging = false
})

waterSVG.addEventListener('touchmove', (e) => {
    if (dragging && !wateringSuccess) {
        convertYToSvgCoordinates(e.touches[0].clientY)
    }
})