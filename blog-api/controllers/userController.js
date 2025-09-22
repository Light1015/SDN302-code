const User = require('../models/User');
exports.createUser = async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json(user);
};
exports.searchUser = async (req, res) => {
    const q = req.query.q;
    const users = await User.find({
        $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ]
    });
    res.json(users);
};