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

function getFutureDate(days = 0, hours = 0) {
  let futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  futureDate.setHours(futureDate.getHours() + hours);
  return futureDate;
}

function updateEFactor(eFactor, response) {
  let newEFactor = eFactor + (0.1 - (5 - response) * (0.08 + (5 - response) * 0.02));
  return newEFactor < 1.3 ? 1.3 : newEFactor;
}

async function updateCard(userId, cardId, response) {
  const card = await Repetition.findOne({ _id: cardId });
  if (!card) return false;

  if(response < 3) {
    card.interval = 1;
    card.repetitions = 0;

    card.nextRepetition = getFutureDate(0, 1);
  } else {
    card.repetitions++;
    if(card.repetitions === 1) {
      card.interval = 1;
    } else if (card.repetitions === 2) {
      card.interval = 6;
    } else {
      card.eFactor = updateEFactor(card.eFactor, response);
      card.interval = Math.ceil(card.interval * card.eFactor);
    }
    card.nextRepetition = getFutureDate(card.interval);
  }

  await card.save();
}

async function getNextReview(db, cardId) {
  const card = await db.collection("cards").findOne({ _id: new ObjectId(cardId) });
  return card ? new Date(card.nextRepetition) : null;
}
