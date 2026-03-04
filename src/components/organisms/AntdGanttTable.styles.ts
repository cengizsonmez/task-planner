import styled from 'styled-components'

export const BAR_HEIGHT = 30
const HEADER_TOTAL_HEIGHT = 77

export const TableWrapper = styled.div`
  .ant-table-thead > tr > th {
    background: ${({ theme }) => theme.colors.gridHeaderBackground};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  .gantt-day .ant-table-thead > tr > th[rowspan],
  .gantt-week .ant-table-thead > tr > th,
  .gantt-month .ant-table-thead > tr > th {
    height: ${HEADER_TOTAL_HEIGHT}px;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.gridLine};
    background: ${({ theme }) => theme.colors.panel};
    transition-duration: 0s;
  }

  .timeline-anchor-cell {
    z-index: 1;
  }

  .ant-table-tbody > tr > td.weekend-column {
    background: ${({ theme }) => theme.colors.weekendCellBackground};
  }
`

export const SortHeaderButton = styled.button`
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: inherit;
  cursor: pointer;
`

export const TaskNameCell = styled.div<{ $isMain: boolean }>`
  padding-left: ${({ $isMain }) => $isMain ? 0 : 40}px;
`

export const TaskNameText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const TimelineTrack = styled.div<{ $totalWidth: number }>`
  position: absolute;
  inset: 0;
  width: ${({ $totalWidth }) => $totalWidth}px;
`

export const MainBarSurface = styled.div`
  position: absolute;
  top: 5px;
  height: ${BAR_HEIGHT}px;
  border-radius: 6px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  pointer-events: none;
  background: ${({ theme }) => theme.colors.mainBarBackground};
  color: ${({ theme }) => theme.colors.mainBarText};
`

export const SubBarDragHandle = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  cursor: move;
`

export const SubBarSegment = styled.div<{ $left: string; $width: string }>`
  position: absolute;
  top: 0;
  left: ${({ $left }) => $left};
  width: ${({ $width }) => $width};
  height: ${BAR_HEIGHT}px;
  border-radius: 6px;
  padding: 0 8px;
  background: ${({ theme }) => theme.colors.subBarBackground};
  color: ${({ theme }) => theme.colors.subBarText};
  border: 1px solid ${({ theme }) => theme.colors.subBarBorder};
`

export const SubBarConnector = styled.div<{ $left: string; $width: string }>`
  position: absolute;
  top: 50%;
  left: ${({ $left }) => $left};
  width: ${({ $width }) => $width};
  border-top: 2px dashed ${({ theme }) => theme.colors.subBarBorder};
  pointer-events: none;
`

export const BarTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
`
