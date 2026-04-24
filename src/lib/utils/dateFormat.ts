import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const dateFormat = (
  date: Date | string,
  pattern: string = "DD MMM, YYYY",
): string => {
  return dayjs(date).utc().format(pattern);
};

export default dateFormat;
