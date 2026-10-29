import EnDateBox, { type EnDateBoxProps } from "./EnDateBox";

export default function EnDateYearBox(props: EnDateBoxProps) {
  return <EnDateBox {...props} format="YYYY" views={["year"]} />;
}
