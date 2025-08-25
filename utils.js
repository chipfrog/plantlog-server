export function formatDate(ms) {
    const date = new Date(ms)
    const day = String(date.getDate())
    const month = String(date.getMonth() + 1)
    const year = String(date.getFullYear())
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${day}.${month}.${year} ${hours}:${minutes}`
}