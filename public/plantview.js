const mainApp = document.getElementById("app")

const infoView = document.getElementById("info-view")
const careView = document.getElementById("care-view")

const waterCanvas = document.getElementById("water-canvas")
const ctx = waterCanvas.getContext("2d")

waterCanvas.width = 50
waterCanvas.height = 300

let canWidth = 50
let canHeight = 300

const waterBtn = document.getElementById("water-btn")
const wateredText = document.getElementById("last-watered")
const toggleViewBtn = document.getElementById("toggle-view-btn")
const plantCode = JSON.parse(mainApp.dataset.plantCode)

toggleViewBtn.addEventListener('click', (e) => {
    e.preventDefault()
    careView.classList.toggle('open')
})

waterBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addWatering()
})

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


function animateWaterJug(now) {


    requestAnimationFrame(now)
}