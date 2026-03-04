import { Button, DatePicker, Drawer, Form, Input, Radio, Select, Space, message } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectMainTasksSorted } from '../../features/tasks/selectors'
import { addTask, updateTask } from '../../features/tasks/slice'
import { isWeekend } from '../../features/timeline/utils'
import type { TaskType } from '../../features/tasks/types'
import { closeDrawer } from '../../features/ui/slice'
import { hasSubTaskOverlapInParent } from '../../features/tasks'

type TaskFormValues = {
  title: string
  start?: Dayjs
  end?: Dayjs
  type: TaskType
  parentId?: string
}

// Ekleme ve düzenleme işlemlerinde kullanılan drawer formunu render eder.
export function DrawerTaskForm() {
  const dispatch = useAppDispatch()
  const [form] = Form.useForm<TaskFormValues>()

  const drawer = useAppSelector((state) => state.ui.drawer)
  const mainTasks = useAppSelector(selectMainTasksSorted)
  const tasksState = useAppSelector((state) => state.tasks)

  const editingTask = useAppSelector((state) =>
    drawer.editTaskId ? state.tasks.entities[drawer.editTaskId] : undefined,
  )

  useEffect(() => {
    if (!drawer.open) {
      return
    }

    if (drawer.mode === 'EDIT' && editingTask) {
      form.setFieldsValue({
        title: editingTask.title,
        start: editingTask.type === 'SUB' ? dayjs(editingTask.start) : undefined,
        end: editingTask.type === 'SUB' ? dayjs(editingTask.end) : undefined,
        type: editingTask.type,
        parentId: editingTask.type === 'SUB' ? editingTask.parentId : undefined,
      })
      return
    }

    if (drawer.mode === 'SUB') {
      form.setFieldsValue({
        title: undefined,
        start: undefined,
        end: undefined,
        type: 'SUB',
        parentId: drawer.presetParentId,
      })
      return
    }

    form.setFieldsValue({
      title: undefined,
      start: undefined,
      end: undefined,
      type: 'MAIN',
      parentId: undefined,
    })
  }, [drawer, editingTask, form])

  const selectedType = Form.useWatch('type', form) ??
    (drawer.mode === 'SUB'
      ? 'SUB'
      : drawer.mode === 'EDIT' && editingTask
        ? editingTask.type
        : 'MAIN')

  const isEditMode = drawer.mode === 'EDIT'
  const disabledWeekendDate = (current: Dayjs) =>
    isWeekend(current.format('YYYY-MM-DD'))
  const needsDateRange = selectedType === 'SUB'

  const handleClose = () => {
    form.resetFields()
    dispatch(closeDrawer())
  }

  const handleSubmit = (values: TaskFormValues) => {
    const title = values.title.trim()

    if (isEditMode && editingTask) {
      if (editingTask.type === 'SUB') {
        if (!values.start || !values.end) {
          return
        }

        const start = values.start.format('YYYY-MM-DD')
        const end = values.end.format('YYYY-MM-DD')

        if (isWeekend(start) || isWeekend(end)) {
          message.error('Haftasonu gunlerinde islem yapilamaz.')
          return
        }

        const parentId = values.parentId ?? editingTask.parentId

        const collision = hasSubTaskOverlapInParent({
          tasksState,
          parentId,
          start,
          end,
          taskId: editingTask.id,
        })

        if (collision) {
          message.error('Aynı ana görev ait alt görevlerde tarih aralığı çakışması var.')
          return
        }

        dispatch(
          updateTask({
            id: editingTask.id,
            title,
            type: 'SUB',
            start,
            end,
            parentId,
          }),
        )
      } else {
        dispatch(
          updateTask({
            id: editingTask.id,
            title,
            type: 'MAIN',
          }),
        )
      }

      handleClose()
      return
    }

    if (values.type === 'SUB') {
      if (!values.parentId || !values.start || !values.end) {
        return
      }

      const start = values.start.format('YYYY-MM-DD')
      const end = values.end.format('YYYY-MM-DD')

      if (isWeekend(start) || isWeekend(end)) {
        message.error('Haftasonu gunlerinde islem yapilamaz.')
        return
      }

      const collision = hasSubTaskOverlapInParent({
        tasksState,
        parentId: values.parentId,
        start,
        end,
      })

      if (collision) {
        message.error('Aynı ana görev ait alt görevlerde tarih aralığı çakışması var.')
        return
      }

      dispatch(
        addTask({
          title,
          start,
          end,
          type: 'SUB',
          parentId: values.parentId,
        }),
      )
    } else {
      dispatch(
        addTask({
          title,
          type: 'MAIN',
        }),
      )
    }

    handleClose()
  }

  return (
    <Drawer
      title={isEditMode ? 'Görevi Güncelle' : 'Yeni Görev Ekle'}
      open={drawer.open}
      onClose={handleClose}
      destroyOnClose
      width={420}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Title zorunlu' }]}
        >
          <Input placeholder="Task başlığı" />
        </Form.Item>

        {needsDateRange ? (
          <>
            <Form.Item
              label="Başlangıç tarihi"
              name="start"
              rules={[{ required: true, message: 'Başlangıç tarihi zorunlu' }]}
            >
              <DatePicker style={{ width: '100%' }} disabledDate={disabledWeekendDate} />
            </Form.Item>

            <Form.Item
              label="Bitiş tarihi"
              name="end"
              dependencies={['start']}
              rules={[
                { required: true, message: 'Bitiş tarihi zorunlu' },
                ({ getFieldValue }) => ({
                  validator(_, value: Dayjs | undefined) {
                    const startDate = getFieldValue('start') as Dayjs | undefined

                    if (!startDate || !value || !value.isBefore(startDate, 'day')) {
                      return Promise.resolve()
                    }

                    return Promise.reject(new Error('Bitiş tarihi başlangıçtan önce olamaz'))
                  },
                }),
              ]}
            >
              <DatePicker style={{ width: '100%' }} disabledDate={disabledWeekendDate} />
            </Form.Item>
          </>
        ) : null}

        <Form.Item label="Tip seçimi" name="type">
          <Radio.Group>
            <Radio value="MAIN" disabled={drawer.mode === 'SUB' || isEditMode}>
              Main
            </Radio>
            <Radio value="SUB" disabled={isEditMode && editingTask?.type === 'MAIN'}>
              Sub
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="Top Task"
          name="parentId"
          rules={
            selectedType === 'SUB'
              ? [{ required: true, message: 'Sub için Top Task seçimi zorunlu' }]
              : []
          }
        >
          <Select
            placeholder="Main task seç"
            disabled={drawer.mode === 'SUB' || selectedType === 'MAIN'}
            options={mainTasks.map((task) => ({ label: task.title, value: task.id }))}
          />
        </Form.Item>

        <Space>
          <Button onClick={handleClose}>Vazgeç</Button>
          <Button type="primary" htmlType="submit">
            {isEditMode ? 'Güncelle' : 'Ekle'}
          </Button>
        </Space>
      </Form>
    </Drawer>
  )
}
