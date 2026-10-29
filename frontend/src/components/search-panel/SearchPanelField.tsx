import type { ReactNode } from "react";

type SearchPanelFieldProps = {
  title: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
};

export function SearchPanelField({
  title,
  htmlFor,
  children,
  className = "",
}: SearchPanelFieldProps) {
  return (
    <div className={`search-panel-item ${className}`.trim()}>
      <label className="search-panel-title" htmlFor={htmlFor}>
        {title}
      </label>
      <div className="search-panel-control">{children}</div>
    </div>
  );
}
