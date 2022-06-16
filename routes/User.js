import express from "express";
const router = express.Router();

import {
deleteAll,
deleteUser,
getFollowing,
getUserById,
getUsers,
update
} from "../controller/user";

router.get("/:id/following", function (req, res) {
  getFollowing;
});

router.get("/:_id", getUserById);
router.put("/:_id", update);

router.get("/", getUsers);

router.delete("/:_id", deleteUser);
router.delete("/", deleteAll);

export default router;
