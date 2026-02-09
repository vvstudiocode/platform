
import { startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns'

export function getDateRangeFromParams(searchParams: { from?: string; to?: string } | URLSearchParams) {
    const today = new Date()
    let from = startOfMonth(today)
    let to = endOfMonth(today)

    const params = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams as Record<string, string>)

    const fromParam = params.get('from')
    const toParam = params.get('to')

    if (fromParam && isValid(parseISO(fromParam))) {
        from = parseISO(fromParam)
    }

    if (toParam && isValid(parseISO(toParam))) {
        to = parseISO(toParam)
    }

    // Adjust 'to' to end of day if it's not already (for inclusive filtering)
    // Actually, usually easier to handle this in SQL query ( < next day), but for simple usage let's keep it as is.
    // However, if the URL param is just YYYY-MM-DD, parsing it as ISO usually gives 00:00:00 (local or UTC).
    // Let's ensure 'to' creates a range covering the full day if needed. For now just return Date objects.

    return { from, to }
}
