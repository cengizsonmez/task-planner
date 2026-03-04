import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { TaskNameCell, TaskNameText } from '../organisms/AntdGanttTable.styles'

type TaskNameContentProps = {
  title: string
  isMain: boolean
  isCollapsed?: boolean
  onToggle?: () => void
}

export const TaskNameContent = ({
  title,
  isMain,
  isCollapsed,
  onToggle,
}: TaskNameContentProps) => {
  return (
    <TaskNameCell $isMain={isMain}>
      {isMain ? (
        <Button
          size="small"
          type="text"
          icon={isCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
          onClick={onToggle}
        />
      ) : null}
      <TaskNameText>{title}</TaskNameText>
    </TaskNameCell>
  )
}
