const mainApp = document.getElementById("app")

const infoView = document.getElementById("info-view")
const careView = document.getElementById("care-view")

const waterBtn = document.getElementById("water-btn")
const waterBtnInternals = document.getElementsByClassName("water-btn-internals")[0]
const wateredText = document.getElementById("last-watered")
const waterRect = document.getElementById("water_rect")
const waterSVG = document.getElementById("water-drop-svg")
const waterAmountText = document.getElementById("water-amount")

const toggleViewBtn = document.getElementById("toggle-view-btn")
const closeWaterViewBtn = document.getElementById("close-water-btn")
const plantCode = JSON.parse(mainApp.dataset.plantCode)

const WateringType = {
   top: "Top Watering",
   bottom: "Bottom Watering",
   mist: "Misting"
}

const waterMax = 2000
const waterMin = 0

let dragging = false
let waterAmount = 0 // send to db, 100 ml accuracy
let waterSliderVal = 0 // for animating slider, 1 ml accuracy for smoother animation
let wateringSuccess = false

async function addWatering() {
    const url = `/plant/${encodeURIComponent(plantCode)}/waterings`

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                plantCode: plantCode,
                amountMl: waterAmount,
                method: WateringType.top
            })
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }
        const updateData = await res.json()
        wateringSuccess = true
        wateredText.innerHTML = updateData.lastWatered
        showSuccessBtn()

    } catch(e) {
        console.error(e);
        alert("Failed to log watering.");
    }
}

function showSuccessBtn() {
    waterBtn.innerText = "Plant watered!"
    waterBtn.classList.add('success')
    setTimeout(() => {
        waterBtn.classList.remove('success')
        waterBtn.innerText = "Hold to Water"
    }, 2500)
    // waterBtnInternals.classList.add("success")
}

function emptyWaterMeter() {
    waterSliderVal -= 10
    waterAmount = waterSliderVal - (waterSliderVal % 100)
    waterAmountText.innerText = `${waterAmount} ml`

    if (waterSliderVal <= 0) {
        wateringSuccess = false
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
    waterAmountText.innerText = `${waterAmount} ml`

    toggleWaterBtnActivity()
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
    careView.classList.toggle('open')
})

waterBtn.addEventListener('transitionend', (e) => {
    e.preventDefault()
    const style = getComputedStyle(waterBtn, '::before')
    if (waterAmount > 0 && parseInt(style.width) > 0) {
        addWatering()
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