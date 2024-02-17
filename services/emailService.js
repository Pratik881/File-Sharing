const nodemailer=require('nodemailer')
const transporter=nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS

    }
})
const sendMail=async({from,to,subject,text,html})=>{
    await transporter.sendMail({
        from: `inShare <${from}>`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
    })
}
module.exports=sendMail