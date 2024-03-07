const todayOption = { createdAt: { $gte: new Date().setHours(0, 0, 0) } };
const yesterdayOption = { createdAt: { $gte: new Date().setDate(new Date().getDate() - 1) } };
const thisWeekOption = { createdAt: { $gte: new Date().setDate(new Date().getDate() - 7) } };
const monthlyOption = [
    { $project: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } } },
    { $group: { _id: { month: "$month", year: "$year" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 12 },
    { $project: { _id: 0, month: "$_id.month", year: "$_id.year", total: "$count" } },
];

module.exports = {
    todayOption,
    yesterdayOption,
    thisWeekOption,
    monthlyOption,
};
