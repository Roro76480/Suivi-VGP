const BaserowService = require('../services/baserowService');

const FilesController = {
    uploadFile: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Aucun fichier fourni" });
            }

            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;

            const result = await BaserowService.uploadFile(fileBuffer, fileName);

            res.json(result);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de l'upload", error: error.message });
        }
    }
};

module.exports = FilesController;
