import EnDateBox, { type EnDateBoxProps } from "./EnDateBox";

export default function EnDateMonthBox(props: EnDateBoxProps) {
  return <EnDateBox {...props} format="YYYY/MM" views={["year", "month"]} />;
}
