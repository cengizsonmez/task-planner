export type TimelineView = 'DAY' | 'WEEK' | 'MONTH'

export type TimelineState = {
  view: TimelineView
  year: number
}
export type TimelineCell = {
  index: number
  label: string
  date: string
}