import "dotenv/config";
import app from "./app";
import { startNotificationScheduler } from "./services/notification-scheduler";

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  startNotificationScheduler();
});
