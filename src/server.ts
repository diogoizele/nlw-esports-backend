import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

const prisma = new PrismaClient({
  log: ["query"],
});

app.get("/games", async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return response.json(games);
});

app.get("/games/:id/ads", async (request, response) => {
  const { id } = request.params;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourEnd: true,
      hourStart: true,
    },
    where: {
      gameId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return response.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(",").map((weekDay) => Number(weekDay)),
        hourStart: convertMinutesToHourString(ad.hourStart),
        hourEnd: convertMinutesToHourString(ad.hourEnd),
      };
    })
  );
});

app.post("/games/:id/ads", async (request, response) => {
  const { id } = request.params;

  const payload = request.body;

  // Validação - Zod Javascript

  const ad = await prisma.ad.create({
    data: {
      gameId: id,
      name: payload.name,
      yearsPlaying: payload.yearsPlaying,
      discord: payload.discord,
      weekDays: payload.weekDays.join(","),
      hourStart: convertHourStringToMinutes(payload.hourStart),
      hourEnd: convertHourStringToMinutes(payload.hourEnd),
      useVoiceChannel: payload.useVoiceChannel,
    },
  });

  return response.status(201).json(ad);
});

app.get("/ads/:id/discord", async (request, response) => {
  const { id } = request.params;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: { id },
  });

  return response.status(200).json({
    discord: ad.discord,
  });
});

app.listen(3333);
