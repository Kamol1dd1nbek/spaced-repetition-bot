import Repetition from "../models/Repetition.js";
import { context } from "../states/state.js";

async function getRepetitions(page = 1, filter = {}, limit = 10) {
  const currentTime = new Date();

  const skip = (page - 1) * limit;

  const repetitions = await Repetition.aggregate([
    {
      $match: filter,
    },
    {
      $addFields: {
        isOld: {
          $lt: ["$nextRepetition", currentTime],
        },
      },
    },
    {
      $sort: {
        nextRepetition: 1,
      },
    },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        title: 1,
        subtitle: 1,
        body: 1,
        step: 1,
        createdDate: 1,
        nextRepetition: 1,
        isOld: 1,
      },
    },
  ]);

  const totalCount = await Repetition.countDocuments(filter);

  return {
    repetitions,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}

async function getFarthestOverdueRepetition(chatId) {
  try {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    return await Repetition.findOne({
      chatId,
      nextRepetition: { $lt: oneWeekAgo },
    }).sort({ nextRepetition: -1 });
  } catch (error) {
    console.error(error);
  }
}

async function getOldRepetitions(chatId, page = 1, limit = 10) {
  const currentTime = new Date();

  const skip = (page - 1) * limit;

  const data = await Repetition.aggregate([
    {
      $match: {
        chatId,
        nextRepetition: { $lt: currentTime },
      },
    },
    {
      $sort: {
        nextRepetition: 1,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);

  const totalCount = await Repetition.countDocuments({
    chatId,
    nextRepetition: { $lt: currentTime },
  });

  return {
    data,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    totalCount,
  };
}

async function saveRepetition(chatId, custom) {
  let repetition = custom;
  if (!custom) repetition = await context.getContext(chatId, "newRepetition");
  const newRepe = await new Repetition({ ...repetition }).save();
  return newRepe;
}

async function findRepetitionById(repetitionId, chatId) {
  try {
    return await Repetition.findOne({ _id: repetitionId, chatId });
  } catch (error) {
    console.error("Repetition not found:", error.message);
  }
}

async function getNextRepetition(chatId) {
  const currentTime = new Date();

  const nextRepetition = await Repetition.aggregate([
    {
      $match: {
        chatId,
        nextRepetition: { $gte: currentTime },
      },
    },
    {
      $sort: {
        nextRepetition: 1,
      },
    },
    {
      $limit: 1,
    },
  ]);

  return nextRepetition[0];
}

export {
  getRepetitions,
  saveRepetition,
  findRepetitionById,
  getOldRepetitions,
  getNextRepetition,
  getFarthestOverdueRepetition,
  updateCard
};

//  ----- new feature

const WAKE_UP_TIME = 4 * 60; // 04:00 → 240 minut
const SLEEP_TIME = 24 * 60; // 00:00 → 1440 minut

async function updateCard(userId, cardId, response, ) {
  const card = await Repetition.findOne({ _id: cardId });
  if (!card) return false;
  
  const now = new Date();
  
  let newStep = card.step;
  let newStability = card.stability || 1;
  let responseHistory = card.responseHistory || [];
  
  responseHistory.push(response);
  if (responseHistory.length > 3) responseHistory.shift();
  
  const lastResponses = responseHistory.map((r) => r.response);
  const avgResponse = lastResponses.reduce((a, b) => a + b, 0) / lastResponses.length;
  
  switch (response) {
    case 0: // **Hech eslay olmadim**
    newStability = Math.max(1, newStability * 0.5);
    newStep = Math.max(1, newStep * 0.5);
    break;
    case 1: // **Zo‘rg‘a esladim**
    newStability = Math.max(1, newStability * 0.8);
    newStep *= 1.2;
    break;
    case 2: // **Oson esladim**
    newStability += 1;
    newStep *= 1.5;
    break;
    case 3: // **Juda yaxshi bilaman**
    newStability += 2;
    newStep *= 2;
    break;
  }
  
  if (avgResponse >= 2) newStep *= 1.3;
  else if (avgResponse < 1) newStep *= 0.7;
  
  let nextReviewTime = new Date(now.getTime() + newStep * 60 * 1000);
  let nextReviewMinutes = nextReviewTime.getHours() * 60 + nextReviewTime.getMinutes();
  
  if (nextReviewMinutes > SLEEP_TIME || nextReviewMinutes < WAKE_UP_TIME) {
    nextReviewTime.setHours(WAKE_UP_TIME / 60, WAKE_UP_TIME % 60, 0, 0);
  }

  // Update data
  await Repetition.updateOne(
    { _id: cardId },
    {
      $set: {
        step: newStep,
        stability: newStability,
        lastInterval: newStep,
        lastReview: now,
        nextRepetition: nextReviewTime,
        responseHistory: responseHistory,
      },
    }
  );
}

async function getNextReview(db, cardId) {
  const card = await db.collection("cards").findOne({ _id: new ObjectId(cardId) });
  return card ? new Date(card.nextRepetition) : null;
}
