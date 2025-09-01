const mainApp = document.getElementById("app")

const infoView = document.getElementById("info-view")
const careView = document.getElementById("care-view")

const waterBtn = document.getElementById("water-btn")
const wateredText = document.getElementById("last-watered")
const waterRect = document.getElementById("water_rect")
const waterSVG = document.getElementById("water-drop-svg")
const waterAmountText = document.getElementById("water-amount")

const toggleViewBtn = document.getElementById("toggle-view-btn")
const closeWaterViewBtn = document.getElementById("close-water-btn")
const plantCode = JSON.parse(mainApp.dataset.plantCode)

let dragging = false
let mouseMoving = false
let mouseOver = false
let waterAmount = 0

closeWaterViewBtn.addEventListener('click', (e) => {
    e.preventDefault()
    careView.classList.toggle('open')
})

toggleViewBtn.addEventListener('click', (e) => {
    e.preventDefault()
    careView.classList.toggle('open')
})

waterBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addWatering()
})

function convertYToSvgCoordinates(y) {
    const rect = waterSVG.getBoundingClientRect()
    const max = 2000
    const bottom = rect.bottom

    const relPos = bottom - y
    let temp = parseInt(max / 300 * relPos)
    waterAmount = temp
    let mod = temp % 100
    waterAmountText.innerText = `${temp - mod} ml`
} 

waterSVG.addEventListener('mouseenter', (e) => {
    e.preventDefault()
    mouseOver = true
})

waterSVG.addEventListener('mouseleave', (e) => {
    e.preventDefault()
    mouseOver = false
})

waterSVG.addEventListener('mousedown', (e) => {
    e.preventDefault()
    dragging = true
})

document.addEventListener('mouseup', (e) => {
    e.preventDefault()
    dragging = false
})

waterSVG.addEventListener('mousemove', (e) => {
    e.preventDefault()
    if (mouseOver && dragging) {
        convertYToSvgCoordinates(e.clientY)
    }
})

function animate() {
    const y = waterAmount/ 2000 * 64
    const invertedY = 64 - y
    waterRect.setAttribute("y", `${invertedY}`)

    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)

async function addWatering() {
    const url = `/plant/${encodeURIComponent(plantCode)}/waterings`

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                plantCode: plantCode,
                amountMl: 200,
                method: "mist"
            })
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }
        const updateData = await res.json()
        wateredText.innerHTML = updateData.lastWatered

    } catch(e) {
        console.error(e);
        alert("Failed to log watering.");
    }
}