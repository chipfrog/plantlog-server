export function formatDate(ms) {
    const date = new Date(ms)
    const day = String(date.getDate())
    const month = String(date.getMonth() + 1)
    const year = String(date.getFullYear())
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    const dateTime = {
        date: `${day}.${month}.${year}`,
        time: `${hours}:${minutes}:${seconds}`
    }

    return dateTime
}

export function getDaysSince(oldTimestamp) {
    console.log('timestamp')
    console.log(oldTimestamp)


    const currentTimeStamp = Date.now()
    const diff = currentTimeStamp - oldTimestamp

    const diffMinutes = Math.floor(diff / (1000 * 60))
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  

    console.log('DAYS SINCE: ')
    console.log(diffDays)
    
    return diffDays
}