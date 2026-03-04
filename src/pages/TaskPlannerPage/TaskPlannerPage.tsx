import { PlannerToolbar } from '../../components/organisms'
import { Layout } from 'antd'
import styled from 'styled-components'
import { AntdGanttTable } from '../../components/organisms/AntdGanttTable'
import { useAppSelector } from '../../app/hooks'
import { DrawerTaskForm } from '../../components/organisms/DrawerTaskForm'
import { useMemo } from 'react'
import { selectMainTasksSorted } from '../../features/tasks/selectors'
import { buildTimelineCells } from '../../features/timeline'

const Page = styled(Layout)`
  min-height: 100vh;
  height: 100vh;
  min-width: 0;
  padding: 16px;
  gap: 12px;
  background: transparent;
  overflow: hidden;
`

export function TaskPlannerPage() {

  const timeline = useAppSelector((state) => state.timeline)
  const mainTasks = useAppSelector(selectMainTasksSorted)

    const timelineCells = useMemo(
    () => buildTimelineCells(timeline.year, timeline.view),
    [timeline.year, timeline.view],
  )
  return (
    <Page>
      <PlannerToolbar />
      <AntdGanttTable
          year={timeline.year}
          view={timeline.view}
          cells={timelineCells}
          mainTasks={mainTasks}
        />
      <DrawerTaskForm />
    </Page>
  )
}
