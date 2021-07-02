import {Router} from "express";
import {createEvent, addAdminToEvent, subscribeToEvent, unsubscribeToEvent} from "../controllers/event";
import { isAuthenticated, isUserCreator, isEventOwnerOrAdmin, isSubscribedToEvent} from "../permissions";
import { eventCerateValidators } from "../validators/event";

const router = Router();

const createPerms = [isAuthenticated, isUserCreator];
const addAdminPerms = [isAuthenticated, isEventOwnerOrAdmin];
const unsubscribePerms = [isAuthenticated, isSubscribedToEvent];

router.post("/", createPerms, eventCerateValidators(), createEvent);
router.post("/:eventId/add/admin", addAdminPerms, addAdminToEvent);
router.post("/:eventId/subscribe", isAuthenticated, subscribeToEvent);
router.post("/:eventId/unsuscribe", isAuthenticated, unsubscribeToEvent);

export default router;
