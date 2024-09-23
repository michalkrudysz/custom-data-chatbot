import express from "express";

const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
  // @ts-ignore
  const username = req.user;
  console.log(`Użytkownik ${username} uzyskał dostęp do dashboardu.`);
  res.json({ message: `Witaj na dashboardzie, ${username}!` });
});

export default router;
