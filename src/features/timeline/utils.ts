import dayjs, { type Dayjs } from 'dayjs'
import '../../lib/dayjs'
import type { TimelineCell, TimelineView } from './types'

// Yıl bazlı tarih hesaplarında tekrar eden dayjs üretimini tek noktada toplar.
const buildYearDate = (year: number, month: number, day: number): Dayjs =>
  dayjs(new Date(year, month, day))

// Seçili yılın kaç ISO haftadan oluştuğunu hesaplar.
const getWeekCount = (year: number): number => buildYearDate(year, 11, 28).isoWeek()

// Seçili yılın 365 mi 366 mı olduğunu gün sayısı üzerinden belirler.
const getDayCount = (year: number): number => (buildYearDate(year, 11, 31).dayOfYear() ?? 365)

// Timeline'ın göstereceği yıl aralığının başlangıç ve bitiş tarihlerini üretir.
export const getYearStartEnd = (year: number): { start: Dayjs; end: Dayjs } => ({
  start: buildYearDate(year, 0, 1).startOf('day'),
  end: buildYearDate(year, 11, 31).endOf('day'),
})

// Verilen tarihi seçili yılın dışına taşmayacak şekilde yıl sınırlarına sıkıştırır.
export const clampToYear = (date: string | Dayjs, year: number): Dayjs => {
  const parsed = dayjs.isDayjs(date) ? date : dayjs(date)
  const { start, end } = getYearStartEnd(year)

  if (parsed.isBefore(start)) {
    return start
  }

  if (parsed.isAfter(end)) {
    return end
  }

  return parsed
}

// Tarihin cumartesi veya pazara denk gelip gelmediğini kontrol eder.
export const isWeekend = (dateIso: string): boolean => {
  const date = dayjs(dateIso)
  const day = date.day()
  return day === 0 || day === 6
}

// Hafta sonuna gelen tarihi, verilen yöne doğru ilk hafta içine denk gelen güne taşır.
export const snapToWeekday = (
  dateIso: string,
  direction: 'forward' | 'backward',
): string => {
  let date = dayjs(dateIso).startOf('day')

  if (!date.isValid()) {
    return dateIso
  }

  while (isWeekend(date.format('YYYY-MM-DD'))) {
    date = direction === 'forward' ? date.add(1, 'day') : date.subtract(1, 'day')
  }

  return date.format('YYYY-MM-DD')
}

// Aktif görünüm için timeline'da kaç hücre üretileceğini belirler.
export const getTimelineCellCount = (year: number, view: TimelineView): number => {
  if (view === 'DAY') {
    return getDayCount(year)
  }

  if (view === 'WEEK') {
    return getWeekCount(year)
  }

  return 12
}

// Görünüme göre kullanılacak sabit hücre genişliğini döndürür.
export const getCellWidth = (view: TimelineView): number => {
  if (view === 'DAY') {
    return 44
  }

  if (view === 'WEEK') {
    return 64
  }

  return 92
}

// Verilen tarihi, aktif görünümde karşılık geldiği hücre index değerine çevirir.
export const dateToIndex = (
  dateIso: string,
  view: TimelineView,
  year: number,
): number | null => {
  const parsed = dayjs(dateIso)

  if (!parsed.isValid()) {
    return null
  }

  const clamped = clampToYear(parsed, year)

  if (view === 'DAY') {
    return (clamped.dayOfYear() ?? 1) - 1
  }

  if (view === 'WEEK') {
    return clamped.isoWeek() - 1
  }

  return clamped.month()
}

// Hücre index değerinden tekrar tarih üreterek grid üzerindeki günü bulur.
export const indexToDate = (
  index: number,
  view: TimelineView,
  year: number,
): string | null => {
  if (index < 0 || index >= getTimelineCellCount(year, view)) {
    return null
  }

  const { start } = getYearStartEnd(year)

  if (view === 'DAY') {
    return start.add(index, 'day').format('YYYY-MM-DD')
  }

  if (view === 'WEEK') {
    return start.add(index, 'week').startOf('isoWeek').format('YYYY-MM-DD')
  }

  return start.month(index).startOf('month').format('YYYY-MM-DD')
}

// Başlangıç ve bitiş tarihini, bar çizimi için piksel tabanlı sol konum ve genişliğe çevirir.
export const rangeToPixels = (
  startIso: string,
  endIso: string,
  view: TimelineView,
  year: number,
  cellWidth: number,
): { left: number; width: number } | null => {
  const parsedStart = dayjs(startIso)
  const parsedEnd = dayjs(endIso)

  if (!parsedStart.isValid() || !parsedEnd.isValid()) {
    return null
  }

  const normalizedStart = parsedStart.isBefore(parsedEnd) ? parsedStart : parsedEnd
  const normalizedEnd = parsedStart.isBefore(parsedEnd) ? parsedEnd : parsedStart
  const { start: yearStart, end: yearEnd } = getYearStartEnd(year)

  if (normalizedEnd.isBefore(yearStart) || normalizedStart.isAfter(yearEnd)) {
    return null
  }

  const clampedStart = clampToYear(normalizedStart, year).format('YYYY-MM-DD')
  const clampedEnd = clampToYear(normalizedEnd, year).format('YYYY-MM-DD')

  const startIndex = dateToIndex(clampedStart, view, year)
  const endIndex = dateToIndex(clampedEnd, view, year)

  if (startIndex === null || endIndex === null) {
    return null
  }

  const leftIndex = Math.min(startIndex, endIndex)
  const rightIndex = Math.max(startIndex, endIndex)

  return {
    left: leftIndex * cellWidth,
    width: (rightIndex - leftIndex + 1) * cellWidth,
  }
}

// Başlıkta kullanılacak timeline hücrelerini yıl ve görünüm bilgisine göre üretir.
export const buildTimelineCells = (year: number, view: TimelineView): TimelineCell[] => {
  const count = getTimelineCellCount(year, view)

  return Array.from({ length: count }, (_, index) => {
    const date = indexToDate(index, view, year)

    if (!date) {
      return { index, label: '-', date: '' }
    }

    if (view === 'DAY') {
      return {
        index,
        label: dayjs(date).format('DD MMM'),
        date,
      }
    }

    if (view === 'WEEK') {
      return {
        index,
        label: `W${index + 1}`,
        date,
      }
    }

    return {
      index,
      label: dayjs(date).format('MMM'),
      date,
    }
  })
}
