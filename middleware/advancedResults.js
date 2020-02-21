const advancedResults = (model, populate) => async (req, res, next) => {
    const reqQuery = { ...req.query };

    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryString = JSON.stringify(reqQuery);
    queryString = queryString.replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        match => `$${match}`
    );

    let query = model.find(JSON.parse(queryString));

    if (req.query.select) {
        const selectFields = req.query.select.split(",").join(" ");
        query.select(selectFields);
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        query.sort(sortBy);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalCount = await model.countDocuments(query);

    query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    const results = await query;

    let pagination = {};
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    if (endIndex < totalCount) {
        pagination.next = {
            page: page + 1,
            limit: limit
        };
    }

    res.advancedResults = {
        sucess: true,
        count: results.length,
        totalRecords: totalCount,
        pagination,
        data: results
    };

    next();
};

module.exports = advancedResults;
