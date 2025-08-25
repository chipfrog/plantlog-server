const mainApp = document.getElementById("app")
const waterBtn = document.getElementById("water-btn")
const plantCode = JSON.parse(mainApp.dataset.plantCode)

waterBtn.addEventListener('click', (e) => {
    e.preventDefault()
    addWatering()
})

async function addWatering() {
    const url = `/plant/${encodeURIComponent(plantCode)}/waterings`

    console.log(url)

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

        console.log(res)

        // if (!res.ok) {
        //     const err = await res.json().catch(() => ({}));
        //     throw new Error(err.message || `HTTP ${res.status}`);
        // }
        // const data = await res.json();
        // console.log("Watered:", data);
        // update UI (toast, badge, etc.)

    } catch(e) {
        console.error(e);
        alert("Failed to log watering.");
    }
    
}