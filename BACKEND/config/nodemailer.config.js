const nodemailer = require('nodemailer');
const sendinBlue = require('nodemailer-sendinblue-transport');
const Email = require('email-templates');

/*transport = nodemailer.createTransport(sendinBlue({
    apiKey: "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",
}));*/

const transport = nodemailer.createTransport({
    service: 'SendinBlue', // no need to set host or port etc.
    auth: {
        user: 'laid.dabbabi@etudiant-enit.utm.tn',
        pass: 'w3EnZL9JF1gIyUYC'
    }
});

const emailsender = new Email({
    transport: transport,
    send: true,
    preview: false,
});

exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    emailsender.send({
        template: 'confirmation',
        message: {
            from: 'ENIT TIC <support@tic-enit.tn>',
            to: email,
        },
        locals: {
            name: name,
            confirmationCode: confirmationCode,
        }
    }).then(() => {
        console.log("Email has been sent!");
    });

};

exports.sendSearchEmail = (maillist, object, message) => {
    maillist.forEach(function (to, i, array) {
        var msg = {
            template: 'search',
            message: {
                from: 'ENIT TIC <support@tic-enit.tn>',
            },
            locals: {
                object: object,
                message: message,
            }
        }
        msg.message.to = to;
        emailsender.send(msg);
    });
};