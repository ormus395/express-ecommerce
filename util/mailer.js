const mailKey = require("../keys/mailer");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(mailKey);

module.exports = sgMail;
