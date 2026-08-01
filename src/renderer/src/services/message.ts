import { ElMessage } from "element-plus";

type AppErrorMessage = {
  title: string;
  detail: string;
  duration?: number;
};

/**
 * Displays application errors through the active UI library.
 */
export const showErrorMessage = ({
  title,
  detail,
  duration = 6000,
}: AppErrorMessage) =>
  ElMessage.error({
    message: `${title}: ${detail}`,
    duration,
    showClose: true,
  });
