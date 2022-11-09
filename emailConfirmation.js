const jwt =  require('jsonwebtoken');
const mailer = require("nodemailer");
var bp = require('./Path.js');

const transporter = mailer.createTransport({
    service: 'Gmail',
    auth: {
      user: "facebetter123",
      pass: "yoyfqvmsxqzelvak",
    },
  });

exports.sendEmail = function ( username, password, email )
{
  return _sendEmail( username, password, email );
}

_sendEmail = function ( username, password, email )
{
  console.log("TESTING");
    try
    {
        const emailToken = jwt.sign(
            {
                name: username,
                pass: password,
            },
            process.env.EMAIL_SECRET,
            {
            expiresIn: '1d',
            },  
        );

        const url = bp.buildPath(`pages/ConfirmationPage/${emailToken}`);

        transporter.sendMail({
            to: email,
            subject: "Facebetter Confirmation Email",
            html: `Finish registration for Facebetter by clicking this link to confirm your email!: <a href="${url}">${url}</a>`,
        });
    } catch (e) {
      console.log("Error: " + e.toString())
      return e;
    }
    return null;
}