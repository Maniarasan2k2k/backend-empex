const Permission = require("../../models/Permission");

const createPermission = async (req, res) => {
    try {
        const { key, name, module, description } = req.body;

        const exists = await Permission.findOne({ key: key.toUpperCase() });
        if (exists) {
            return res.status(400).json({ message: "Permission already exists" });
        }

        const permission = await Permission.create({
            key: key.toUpperCase(),
            name,
            module,
            description,
        });

        res.status(201).json(permission);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find();
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createPermission,
    getPermissions,
};
