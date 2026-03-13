import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import carsRouter from "./cars.js";
import announcementsRouter from "./announcements.js";
import driverReportsRouter from "./driver-reports.js";
import notificationsRouter from "./notifications.js";
import pushRouter from "./push.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/cars", carsRouter);
router.use("/announcements", announcementsRouter);
router.use("/driver-reports", driverReportsRouter);
router.use("/notifications", notificationsRouter);
router.use("/push", pushRouter);

export default router;
