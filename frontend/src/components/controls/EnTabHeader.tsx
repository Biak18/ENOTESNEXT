import { Tabs, Tab } from "@mui/material";

export interface EnTabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface EnTabHeaderProps {
  tabs: EnTabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export default function EnTabHeader({
  tabs,
  value,
  onChange,
  ariaLabel = "Content tabs",
}: EnTabHeaderProps) {
  return (
    <Tabs
      value={value}
      onChange={(_event, nextValue: string) => onChange(nextValue)}
      aria-label={ariaLabel}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ minHeight: 32, "& .MuiTab-root": { minHeight: 32, py: 0 } }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          id={`en-tab-${tab.id}`}
          aria-controls={`en-tabpanel-${tab.id}`}
          value={tab.id}
          label={tab.label}
          disabled={tab.disabled}
        />
      ))}
    </Tabs>
  );
}
