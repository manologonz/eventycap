import {Router} from "express";
import {createEvent, addAdminToEvent, subscribeToEvent, unsubscribeToEvent, listEvents, removeAdminFromEvent} from "../controllers/event";
import { isAuthenticated, isUserCreator, isEventOwnerOrAdmin, isSubscribedToEvent} from "../permissions";
import { eventCreateValidators , adminsValidators} from "../validators/event";
import { upload } from "../../utils/constants";
import {bodyToJSON} from "../../utils/helpers";

const router = Router();

const createPerms = [isAuthenticated, isUserCreator];
const addAdminPerms = [isAuthenticated, isEventOwnerOrAdmin];
const unsubscribePerms = [isAuthenticated, isSubscribedToEvent];

router.post("/",
    createPerms,
    upload.single("banner"),
    bodyToJSON,
    eventCreateValidators(),
    createEvent
);

router.post("/:eventId/add/admin", addAdminPerms, adminsValidators(), addAdminToEvent);
router.post("/:eventId/subscribe", isAuthenticated, subscribeToEvent);
router.post("/:eventId/unsuscribe", isAuthenticated, unsubscribeToEvent);
router.get("/", listEvents);
router.delete("/:eventId/remove/:adminId/admin", removeAdminFromEvent);

export default router;
