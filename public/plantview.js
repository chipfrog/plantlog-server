const mainApp = document.getElementById("app")
const waterBtn = document.getElementById("water-btn")
const wateredText = document.getElementById("last-watered")

const plantCode = JSON.parse(mainApp.dataset.plantCode)

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
´        if (!res.ok) {
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