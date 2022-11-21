const jwt =  require('jsonwebtoken');
const mailer = require("nodemailer");
var bp = require('./Path.js');

const transporter = mailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_LOGIN,
      pass: process.env.EMAIL_PASS,
    },
  });

exports.sendConfirmationEmail = function ( username, password, email )
{
  return _sendConfirmationEmail( username, password, email );
}

exports.sendPwResetEmail = function ( id, email )
{
  return _sendPwResetEmail( id, email );
}

_sendConfirmationEmail = function ( username, password, email )
{
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

_sendPwResetEmail = function ( id, email )
{
    try
    {
        const emailToken = jwt.sign(
            {
                id: id,
            },
            process.env.EMAIL_SECRET,
            {
            expiresIn: '1d',
            },  
        );

        const url = bp.buildPath(`pages/ConfirmationPage/${emailToken}`);

        transporter.sendMail({
            to: email,
            subject: "Facebetter Password Recovery",
            html: `Finish registration for Facebetter by clicking this link to confirm your email!: <a href="${url}">${url}</a>`,
        });
    } catch (e) {
      console.log("Error: " + e.toString())
      return e;
    }
    return null;
}