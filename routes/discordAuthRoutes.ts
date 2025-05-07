import { Router } from "express";
import { discordCallback, discordLogin } from "../controllers/discordAuthController";

const router = Router();

router.get("/discord", discordLogin);
router.get("/discord/callback", discordCallback); // This should be the actual callback handler

export default router;