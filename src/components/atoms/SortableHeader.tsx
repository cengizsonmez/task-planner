import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import { SortHeaderButton } from '../organisms/AntdGanttTable.styles'

type SortKey = 'TITLE' | 'START' | 'DURATION'

type SortableHeaderProps = {
  label: string
  sortKey: SortKey
  activeKey: SortKey
  direction: 'ASC' | 'DESC'
  onSort: (key: SortKey) => void
}

export function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: SortableHeaderProps) {
  const icon =
    activeKey === sortKey ? direction === 'ASC' ? <CaretUpOutlined /> : <CaretDownOutlined /> : null

  return (
    <SortHeaderButton type="button" onClick={() => onSort(sortKey)}>
      {label} {icon}
    </SortHeaderButton>
  )
}
