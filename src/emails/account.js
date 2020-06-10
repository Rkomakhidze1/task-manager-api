const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rezokomakhidze1@gmail.com',
        subject: 'Welcome',
        text: `Hello ${name}, nice to meet you !`
    })
}

const sendCancelMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rezokomakhidze1@gmail.com',
        subject: 'Good bye',
        text: `hope not to see you again ${name}`
    })
}

module.exports = {
    sendWelcomeMail,
    sendCancelMail
}