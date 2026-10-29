import { IconButton } from "@mui/material";
import { useState } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EnSharedForm from "./EnSharedForm";
import type { EnSharedFormProps } from "./EnSharedForm";

export interface EnFreeFormProps extends EnSharedFormProps {
  collapsible?: boolean;
  initiallyExpanded?: boolean;
}

export default function EnFreeForm({
  collapsible = true,
  initiallyExpanded = true,
  ...props
}: EnFreeFormProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  return (
    <section className="min-w-0">
      {collapsible && (
        <div className="flex justify-end">
          <IconButton
            size="small"
            aria-label={expanded ? "Collapse form" : "Expand form"}
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </div>
      )}
      <div hidden={!expanded}>
        <EnSharedForm {...props} />
      </div>
    </section>
  );
}
