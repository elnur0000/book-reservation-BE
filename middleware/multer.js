const multer = require('multer')
const { ValidationError } = require('../errors')
const options = {
  dest: 'uploads/',
  fileFilter (req, file, cb) {
    const mimeType = file.mimetype.split('/')[0]
    if (file.fieldname === 'img' && mimeType === 'image') {
      cb(null, true)
    } else {
      cb(new ValidationError('invalid mime type or field name'))
    }
  },
  limits: {
    files: 1,
    fileSize: 1024 * 1024 // 1 MB
  }
}
exports.upload = multer(options)
