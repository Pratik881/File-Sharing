const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/fileMode');
const { v4: uuidv4 } = require('uuid');
const sendMail = require('../services/emailService');
const emailTemplate = require('../services/emailTemplate');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage, limits: { fileSize: 1000000 * 10 } }).single('myfile');

router.post('/', upload, async (req, res) => {
    try {
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });
        await file.save();
        const filelink = `${process.env.APP_BASE_URL}/files/${file.uuid}`;
        res.render('sendemail', { link: filelink, uuid: file.uuid });
    } catch (error) {
        res.status(500).send({ error: 'Failed to upload file.' });
    }
});

router.post('/send', async (req, res) => {
    try {
        const { uuid, emailTo, emailFrom } = req.body;
        if (!uuid || !emailTo || !emailFrom) {
            return res.status(422).send({ error: 'All fields are required except expiry.' });
        }

        const file = await File.findOne({ uuid });
        if (file.sender) {
            return res.status(422).send({ error: 'Email already sent once.' });
        }

        file.sender = emailFrom;
        file.receiver = emailTo;
        await file.save();

        await sendMail({
            from: emailFrom,
            to: emailTo,
            subject: 'inShare file sharing',
            text: `${emailFrom} shared a file with you.`,
            html: emailTemplate({ emailFrom, downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`, size: parseInt(file.size / 1000) + ' KB', expires: '24 hours' })
        });

        res.send('Success');
    } catch (error) {
        console.error('Error occurred while processing file sharing:', error);
        res.status(500).send({ error: 'An unexpected error occurred.' });
    }
});

module.exports = router;
