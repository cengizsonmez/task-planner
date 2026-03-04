import {
  LeftOutlined,
  MoonOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Segmented, Space, Typography } from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { openDrawer, toggleTheme } from "../../features/ui/slice";
import {
  nextYear,
  prevYear,
  setTimelineView,
} from "../../features/timeline/slice";
import {
  CenterGroup,
  LeftGroup,
  RightGroup,
  Toolbar,
} from "./PlannerToolbar.styles";
import type { TimelineView } from "../../features/timeline";

export function PlannerToolbar() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.ui.theme);
  const timeline = useAppSelector((state) => state.timeline);

  return (
    <Toolbar>
      <LeftGroup>
        <Button
          type="primary"
          icon={<PlusOutlined />}
            onClick={() => dispatch(openDrawer({ mode: "MAIN" }))}
        >
          Yeni Ekle
        </Button>
      </LeftGroup>

      <CenterGroup>
        <Button
          size="small"
          icon={<LeftOutlined />}
          aria-label="Önceki yıl"
            onClick={() => dispatch(prevYear())}
        />
        <Typography.Text strong>{timeline.year}</Typography.Text>
        <Button
          size="small"
          icon={<RightOutlined />}
          aria-label="Sonraki yıl"
            onClick={() => dispatch(nextYear())}
        />

        <Segmented<TimelineView>
          options={[
            { label: "Gün", value: "DAY" },
            { label: "Hafta", value: "WEEK" },
            { label: "Ay", value: "MONTH" },
          ]}
          value={timeline.view}
          onChange={(value) => dispatch(setTimelineView(value))}
        />
      </CenterGroup>

      <RightGroup>
        <Space>
          <Typography.Text type="secondary">
            {dayjs().format("DD MMM YYYY")}
          </Typography.Text>
          <Button
            type={themeMode === "DARK" ? "primary" : "default"}
            icon={<MoonOutlined />}
            aria-label="Tema değiştir"
            onClick={() => dispatch(toggleTheme())}
          />
        </Space>
      </RightGroup>
    </Toolbar>
  );
}
