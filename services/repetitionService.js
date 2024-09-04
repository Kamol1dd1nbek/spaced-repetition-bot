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
  // if (!custom) repetition = await newRepetition.getState();
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
};
