import {Router} from "express";
import {
    createEvent,
    addAdminToEvent,
    subscribeToEvent,
    unsubscribeToEvent,
    listEvents,
    removeAdminFromEvent,
    eventDetail
} from "../controllers/event";
import {
    isAuthenticated,
    isUserCreator,
    isEventOwnerOrAdmin,
    isSubscribedToEvent,
    canSubscribeToEvent
} from "../permissions";
import { eventCreateValidators , adminsValidators} from "../validators/event";
import { upload } from "../../utils/constants";
import {bodyToJSON} from "../../utils/helpers";

const router = Router();

const createPerms = [isAuthenticated, isUserCreator];
const administratorPerms = [isAuthenticated, isEventOwnerOrAdmin];
const unsubscribePerms = [isAuthenticated, isSubscribedToEvent];
const subscribePerms = [isAuthenticated, canSubscribeToEvent];

router.post("/",
    createPerms,
    upload.single("banner"),
    bodyToJSON,
    eventCreateValidators(),
    createEvent
);
router.post("/:eventId/add/admin", administratorPerms, adminsValidators(), addAdminToEvent);
router.post("/:eventId/subscribe", subscribePerms, subscribeToEvent);
router.post("/:eventId/unsubscribe", unsubscribePerms, unsubscribeToEvent);
router.get("/", listEvents);
router.get("/:eventId", administratorPerms, eventDetail);
router.delete("/:eventId/remove/:adminId/admin", removeAdminFromEvent);

export default router;
