const buildDateFilter = (startDate, endDate) => {
    if (!startDate || !endDate) return {};

    return {
        createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        },
    };
};

module.exports = { buildDateFilter };
