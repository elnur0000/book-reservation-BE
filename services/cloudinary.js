const cloudinary = require('cloudinary').v2
const config = require('../config')
cloudinary.config({
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  cloud_name: config.cloudinary.cloudName
})

exports.uploadImage = (path) => {
  return cloudinary.uploader.upload(path)
}
