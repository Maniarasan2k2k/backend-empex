const Bookmark = require("../../models/Bookmark");

/**
 * GET ALL BOOKMARKS (ADMIN)
 */
const getAllBookmarksAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, candidateId, jobId } = req.query;

        const filter = {};
        if (candidateId) filter.candidateId = candidateId;
        if (jobId) filter.jobId = jobId;

        const skip = (page - 1) * limit;

        const bookmarks = await Bookmark.find(filter)
            .populate({
                path: "jobId",
                select: "jobTit cmpName jobCity salMin salMax status",
            })
            .populate({
                path: "candidateId",
                select: "canemail canphone isVerified",
            })
            .sort({ savedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Bookmark.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: bookmarks,
        });
    } catch (error) {
        console.error("ADMIN BOOKMARK FETCH ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookmarks",
        });
    }
};

module.exports = {
    getAllBookmarksAdmin,
};
