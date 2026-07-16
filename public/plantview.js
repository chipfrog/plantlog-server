const mainApp = document.getElementById("app")

const infoView = document.getElementById("info-view")
const careView = document.getElementById("care-view")
const historyView = document.getElementById("history-view")
const fertilizeView = document.getElementById("fertilize-view")

const deleteConfirmation = document.getElementById("delete-confirmation")
const cancelConfirmationBtn = document.getElementById("cancel-confirmation-btn")
const deleteConfirmationBtn = document.getElementById("delete-confirmation-btn")
const deleteType = document.querySelector(".delete-type")
const deleteDate = document.querySelector(".delete-date")

const lastWateredAmount = document.getElementById("last-watered-amount")
const lastWateredDate = document.getElementById("last-watered-date")

const lastMistedAmount = document.getElementById("last-misted-amount")
const lastMistedDate = document.getElementById("last-misted-date")

const lastFertAmount = document.getElementById("last-fert-amount")
const lastFertDate = document.getElementById("last-fert-date")

const mistedText = document.getElementById("last-misted")
const waterRect = document.getElementById("water_rect")
const waterSVG = document.getElementById("water-drop-svg")
const waterAmountText = document.getElementById("water-amount")

const showerSVG = document.getElementById("shower-icon")
const glassSVG = document.getElementById("glass-icon")
const spraySVG = document.getElementById("spray-icon")

const actionList = document.getElementById("action-list")
const historyItemTemplate = document.getElementById("history-item-template")

const toggleViewBtn = document.getElementById("toggle-view-btn")
const closeWaterViewBtn = document.getElementById("close-water-btn")

const timelineBtn = document.getElementById("timeline-btn")
const closeTimelineViewBtn = document.getElementById("close-history-btn")

const waterSwiper = document.getElementById("water-swiper")
const waterSwiperHandle = document.getElementById("water-swiper-handle") 

const fertSliderHandle = document.getElementById("fert-handle")
const fertSlider = document.getElementById("fert-slider")

const fertilizeBtn = document.getElementById("fertilize-btn")
const closeFertilizeBtn = document.getElementById("close-fertilize-btn")

const cycleIcon = document.getElementById("cycle-icon")
const unitTypeBtn = document.getElementById("unit-types-btn")

const decreaseFert = document.getElementById("decrease-fert");
const increaseFert = document.getElementById("increase-fert")
const fertCount = document.getElementById("fert-count")
const fertSelect = document.getElementById("fertilizer-select")

const plantCode = mainApp.dataset.plantCode
const initWaterAmount = mainApp.dataset.waterAmount
const initMistAmount = mainApp.dataset.mistAmount
const initFertAmount = mainApp.dataset.fertAmount

const root = document.querySelector(':root')

const waterAmountDesc = {
    xxs: "Nothing",
    xs: "Sprinkle",
    s: "Light",
    m: "Moderate",
    l: "Generous",
    xl: "Soaking",
    xxl: "Flood"
}

const wateringType = {
    top: 'top',
    bottom: 'bottom',
    mist: 'mist'
}

const descMap = new Map([
    [waterAmountDesc.xxs, 0], [waterAmountDesc.xs, 1], [waterAmountDesc.s, 2], [waterAmountDesc.m, 3],
    [waterAmountDesc.l, 4], [waterAmountDesc.xl, 5], [waterAmountDesc.xxl, 6]
])

const waterTitleMap = new Map([
    [wateringType.top, 'Top Watering'], [wateringType.bottom, 'Bottom Watering'], [wateringType.mist, 'Misting']
])

const wateringIcons = new Map([
    ['top', '/icons/shower.svg'], ['bottom', '/icons/glass.svg'], ['mist', '/icons/spray.svg'], ['fert', '/icons/tractor.svg']
])

const maxDeg = 280 // For progress circles in degrees
const startDeg = 80

const waterMax = 2000
const waterMin = 0
let emptying = false

let careViewOpen = false

let activeWateringType = wateringType.top
let waterUnit = 'approximate'

let iconRotation = 0
let waterDesc = waterAmountDesc.xxs

let dragging = false
let waterAmount = 0 // send to db, 100 ml accuracy
let waterSliderVal = 0 // for animating slider, 1 ml accuracy for smoother animation
let wateringSuccess = false

let tempDelBtn = null

let fertDragging = false
let waterDragging = false
let fertSavingInProcess = false
let waterSavingInProcess = false


init()

function init() {
    updateLastWateredInfo(initWaterAmount)
    updateLastMistedInfo(initMistAmount)
    updateLastFertilizedInfo(initFertAmount)
}

function updateLastWateredInfo(amount) {
    if (isNumeric(amount)) {
        lastWateredAmount.innerText = `${parseInt(amount)} ml`
    } else {
        lastWateredAmount.innerText = amount
    }
    updateWaterProgressBar(amount) 
}

function updateLastMistedInfo(amount) {
    if (isNumeric(amount)) {
        lastMistedAmount.innerText = `${parseInt(amount)} ml`
    } else {
        lastMistedAmount.innerText = amount
    }
    updateMistProgressBar(amount)
}

function updateLastFertilizedInfo(amount) {
    if (isNumeric(amount)) {
        lastFertAmount.innerText = `${parseInt(amount)} cups`
    } else {
        lastFertAmount.innerText = amount
    }
}

async function addFertilization() {
    fertSavingInProcess = true
    const fertId = Number(fertSelect.value)
    const amount = Number(fertCount.textContent)

    const payload = {
        fertId: fertId,
        amount: amount,
        plantCode: plantCode
    }

    const url = `/plant/${encodeURIComponent(plantCode)}/fertilizations`

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type":  "application/json "},
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }
        
        fertSlider.querySelector('p').textContent = "Saved!"

        const updateData = await res.json()
        const amount = updateData.fertilization.amount
        const daysSince = updateData.daysSince

        updateLastFertilizedInfo(amount)
        lastFertDate.innerText = daysSince
        addHistoryEntry(updateData, 'fertilization')

        setTimeout(() => {
            fertSliderHandle.classList.add('spring-back')
            fertSlider.classList.add("spring-back-bg")
            fertSliderHandle.style.left = "1px"
            root.style.setProperty("--slider-before-width", '50px')
            fertSavingInProcess = false
            fertSlider.querySelector('p').textContent = "Swipe to Save"
        }, 1000)

    } catch(e) {
        console.log(e)
        alert("Failed to log fertilization.");
    }
}
 
async function addWatering() {
    waterSavingInProcess = true

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
        
        wateringSuccess = true
        waterSwiper.querySelector('p').textContent = "Saved!"

        const amount = updateData.watering.amount
        const daysSince = updateData.daysSince 

        if (updateData.type == 'water') {
            updateLastWateredInfo(amount)
            lastWateredDate.innerText = daysSince
            addHistoryEntry(updateData, 'water')

        } else if (updateData.type == 'mist') {
            updateLastMistedInfo(amount)
            lastMistedDate.innerText = daysSince
            addHistoryEntry(updateData, 'water')
        }

         setTimeout(() => {
            waterSwiperHandle.classList.add('spring-back')
            waterSwiper.classList.add("spring-back-bg")
            waterSwiperHandle.style.left = "1px"
            root.style.setProperty("--slider-before-width", '50px')
            waterSavingInProcess = false
            waterSwiper.querySelector('p').textContent = "Swipe to Save"
        }, 1000)

    } catch(e) {
        console.error(e);
        wateringSuccess = false
        alert("Failed to log watering.");
    }
}

function addHistoryEntry(update, type) {
    let amount
    const instance = historyItemTemplate.content.cloneNode(true)
    
    if (type === 'water') {
        amount = update.watering.amount
        
        if (isNumeric(amount)) {
            amount = parseInt(amount)
            amount += ' ml' 
        }

        instance.querySelector('.history-title').textContent = waterTitleMap.get(update.watering.method)
        instance.querySelector('.watering-icon').src = wateringIcons.get(update.watering.method)
        instance.querySelector('.date-val').textContent = update.watering.date
        instance.querySelector('.time-val').textContent = update.watering.time
        instance.querySelector('.water-amount').textContent = amount
        instance.querySelector('.delete-btn').id = `watering-${update.watering.id}`

    } else if (type === 'fertilization') {
        amount = update.fertilization.amount
        amount += ' cups'

        instance.querySelector('.history-title').textContent = 'Fertilization'
        instance.querySelector('.watering-icon').src = wateringIcons.get('fert')
        instance.querySelector('.date-val').textContent = update.fertilization.date
        instance.querySelector('.time-val').textContent = update.fertilization.time
        instance.querySelector('.water-amount').textContent = amount
        instance.querySelector('.delete-btn').id = `fertilization-${update.fertilization.id}`

    }
    actionList.prepend(instance)
}

function showDeleteConfirmation(btn) {
    const historyItem = btn.closest('.history-item')
    const title = historyItem.querySelector('.history-title')
    const date = historyItem.querySelector('.date-val')

    deleteType.textContent = title.textContent
    deleteDate.textContent = date.textContent
    deleteConfirmation.classList.add('increase-Zindex')
    deleteConfirmation.classList.add('increase-opacity')
}

function hideDeleteConfirmation() {
    deleteConfirmation.classList.remove('increase-opacity')
    setTimeout(() => {
        deleteConfirmation.classList.remove('increase-Zindex')
    }, 500)
}

actionList.addEventListener('click', (e) => {
    tempDelBtn = e.target.closest('.delete-btn')
    if (tempDelBtn) {
        console.log(`clicked delete for id: ${tempDelBtn.id}`)
        showDeleteConfirmation(tempDelBtn)
    }
})

deleteConfirmationBtn.addEventListener('click', (e) => {
    hideDeleteConfirmation()
    deleteCareEvent()
})

cancelConfirmationBtn.addEventListener('click', (e) => {
    hideDeleteConfirmation()
    tempDelBtn = null
})

async function deleteCareEvent() {
    let url
    const [type, id] = tempDelBtn.id.split("-")
    console.log('wateringId: ' + id)
    
    if (type === 'watering') {
        url = `/plant/${encodeURIComponent(plantCode)}/waterings/${encodeURIComponent(id)}`
    }
    else if (type === 'fertilization') {
        url = `/plant/${encodeURIComponent(plantCode)}/fertilizations/${encodeURIComponent(id)}`
    } 

    try {
        const res = await fetch(url, { method: "DELETE" })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.message || `HTTP ${res.status}`)
        }
        const historyCard = tempDelBtn.closest('.history-item')
        historyCard.classList.add('deleting-history-item')
        setTimeout(() => {
            historyCard.remove()
            tempDelBtn = null
        }, 500)

    } catch(e) {
        console.error(e);
        alert("Failed to delete watering");
    }
}

function isNumeric(val) {
    return !isNaN(val) && isFinite(val)
}

function getMlToDeg(ml) {
    const deg = (maxDeg / waterMax) * ml + startDeg
    return deg
}

function getDescToDeg(desc) {
    const deg = (maxDeg / (Object.keys(waterAmountDesc).length - 1)) * descMap.get(desc) + startDeg
    return deg
}

function getDeg(amount) {
    if (isNumeric(amount)) {
        return `${getMlToDeg(amount)}deg`

    } else {
        return `${getDescToDeg(amount)}deg`
    }
}

function updateWaterProgressBar(amount) {
    root.style.setProperty('--water-progress', getDeg(amount))
}

function updateMistProgressBar(amount) {
    root.style.setProperty('--mist-progress', getDeg(amount))
}

function getPayload() {
    let payload = {
        plantCode: plantCode,
        method: activeWateringType,
    }

    if (waterUnit === 'approximate') {
        payload.amount = waterDesc
    } else {
        payload.amount = waterAmount
    }
    
    return payload
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

    if (waterUnit === 'approximate') {
        const desc = convertMlToDescription(temp)
        waterAmountText.innerText = desc
    } else {
        waterAmountText.innerText = `${waterAmount} ml`
    }
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

    return waterDesc
}

function animate() {
    if (!careViewOpen) return

    if (wateringSuccess) {
        emptyWaterMeter()
    }
    updateAnimation()
    requestAnimationFrame(animate)
}

function startAnimation() {
    if (!careViewOpen) {
        careViewOpen = true
        requestAnimationFrame(animate)
    }
}

function updateAnimation() {
    const y = waterSliderVal/ 2000 * 64
    const invertedY = 64 - y
    waterRect.setAttribute("y", `${invertedY}`)
}

closeWaterViewBtn.addEventListener('click', (e) => {
    e.preventDefault()
    careView.classList.toggle('open')
    careViewOpen = false
})

toggleViewBtn.addEventListener('click', (e) => {
    e.preventDefault()
    careView.classList.toggle('open')
    startAnimation()
})

fertilizeBtn.addEventListener('click', (e) => {
    e.preventDefault()
    fertilizeView.classList.toggle('open')
})

closeFertilizeBtn.addEventListener('click', (e) => {
    e.preventDefault()
    fertilizeView.classList.toggle('open')
})

timelineBtn.addEventListener('click', (e) => {
    e.preventDefault()
    historyView.classList.toggle('open')
})

closeTimelineViewBtn.addEventListener('click', (e) => {
    e.preventDefault()
    historyView.classList.toggle('open')
})

unitTypeBtn.addEventListener('click', (e) => {
    iconRotation += 180
    cycleIcon.style.transform = `translate(-50%,-50%) rotate(${iconRotation}deg)`

    if (waterUnit === 'ml') {
        waterUnit = 'approximate'
        const desc = convertMlToDescription(waterAmount)
        waterAmountText.innerText = desc
        
    } else if (waterUnit === 'approximate') {
        waterUnit = 'ml'
        waterAmountText.innerText = `${waterAmount} ml`
    }
})

showerSVG.addEventListener('click', (e) => {
    if (activeWateringType !== wateringType.top) {
        activeWateringType = wateringType.top
        showerSVG.setAttribute('fill', 'black')
        glassSVG.setAttribute('fill', 'darkgray')
        spraySVG.setAttribute('fill', 'darkgray')
    }
})

glassSVG.addEventListener('click', (e) => {
    if (activeWateringType !== wateringType.bottom) {
        activeWateringType = wateringType.bottom
        showerSVG.setAttribute('fill', 'darkgray')
        glassSVG.setAttribute('fill', 'black')
        spraySVG.setAttribute('fill', 'darkgray')
    }
})

spraySVG.addEventListener('click', (e) => {
    if (activeWateringType !== wateringType.mist) {
        activeWateringType = wateringType.mist
        showerSVG.setAttribute('fill', 'darkgray')
        glassSVG.setAttribute('fill', 'darkgray')
        spraySVG.setAttribute('fill', 'black')
    }
})

// Handle mouse & touch input to water slider
waterSVG.addEventListener('mousedown', (e) => {
    e.preventDefault()
    dragging = true
})

waterSVG.addEventListener('touchstart', (e) => {
    dragging = true
})

waterSVG.addEventListener('touchmove', (e) => {
    if (dragging && !wateringSuccess) {
        convertYToSvgCoordinates(e.touches[0].clientY)
    }
})

document.addEventListener('mouseup', (e) => {
    e.preventDefault()
    dragging = false
    fertDragging = false
    waterDragging = false

    if (!fertSavingInProcess && !waterSavingInProcess) {
        fertSliderHandle.classList.add('spring-back')
        fertSlider.classList.add('spring-back-bg')
        fertSliderHandle.style.left = '1px'

        waterSwiperHandle.classList.add('spring-back')
        waterSwiper.classList.add('spring-back-bg')
        waterSwiperHandle.style.left = '1px'

        root.style.setProperty('--slider-before-width', '50px')
    }
})

document.addEventListener('mousemove', (e) => {
    e.preventDefault()
    
    // Water slider
    if (dragging && !wateringSuccess && !emptying) {
        convertYToSvgCoordinates(e.clientY)
    }

    // Water swiper
    if (waterDragging && !waterSavingInProcess) {
        handleWaterDragging(e.clientX)
    }

    // Fert swiper
    if (fertDragging && !fertSavingInProcess) {
        handleFertDragging(e.clientX)
    }
})

fertSliderHandle.addEventListener('touchstart', (e) => {
    fertDragging = true
    fertSliderHandle.classList.remove('spring-back')
    fertSlider.classList.remove('spring-back-bg')
})

waterSwiperHandle.addEventListener('touchstart', (e) => {
    waterDragging = true
    waterSwiperHandle.classList.remove('spring-back')
    waterSwiper.classList.remove('spring-back-bg')
})

document.addEventListener('touchend', (e) => {
    dragging = false
    fertDragging = false
    waterDragging = false

    if (!fertSavingInProcess && !waterSavingInProcess) {
        
        fertSliderHandle.classList.add('spring-back')
        fertSlider.classList.add("spring-back-bg")
        fertSliderHandle.style.left = "1px"

        waterSwiperHandle.classList.add('spring-back')
        waterSwiper.classList.add('spring-back-bg')
        waterSwiperHandle.style.left = '1px'

        root.style.setProperty("--slider-before-width", `50px`)
    }
})

document.addEventListener('touchmove', (e) => {
    if (fertDragging && !fertSavingInProcess) {
        handleFertDragging(e.touches[0].clientX)
    }
    if (waterDragging && !waterSavingInProcess) {
        handleWaterDragging(e.touches[0].clientX)
    }
})

const handleFertDragging = (x) => {
    const rect = fertSlider.getBoundingClientRect()
    let relPos = x - rect.left - 23

    if (relPos < 0) {
        relPos = -2
    }
    else if (relPos > rect.width - 80) {
        relPos = rect.width - 72
        addFertilization()
    }
    fertSliderHandle.style.setProperty("left", `${relPos}px`)
    root.style.setProperty("--slider-before-width", `${relPos + 50}px`)
}

const handleWaterDragging = (x) => {
    const rect = waterSwiper.getBoundingClientRect()
    let relPos = x - rect.left - 23

    if (relPos < 0) {
        relPos = -2
    }
    else if (relPos > rect.width - 80) {
        relPos = rect.width - 72

        if (waterAmount > 0) {
            addWatering()
        }
    }
    waterSwiperHandle.style.setProperty("left", `${relPos}px`)
    root.style.setProperty("--slider-before-width", `${relPos + 50}px`)
}

fertSliderHandle.addEventListener('mousedown', (e) => {
    e.preventDefault()
    fertDragging = true
    fertSliderHandle.classList.remove('spring-back')
    fertSlider.classList.remove('spring-back-bg')
})

waterSwiperHandle.addEventListener('mousedown', (e) => {
    e.preventDefault()
    waterDragging = true
    waterSwiperHandle.classList.remove('spring-back')
    waterSwiper.classList.remove('spring-back-bg')
})

increaseFert.addEventListener('click', (e) => {
    e.preventDefault()
    let currCount = Number(fertCount.textContent)
    if (currCount < 9) {
        currCount += 1
        fertCount.textContent = currCount
    }
})

decreaseFert.addEventListener('click', (e)  => {
    e.preventDefault()
    let currCount = Number(fertCount.textContent)
    if (currCount > 1) {
        currCount -= 1
        fertCount.textContent = currCount
    }
})

