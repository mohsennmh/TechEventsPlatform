const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'your-email@gmail.com', 
    pass: 'your-email-password'  
  }
});

// Function to send email
const sendNotification = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: '"Your App Name" <your-email@gmail.com>', 
      to, 
      subject, 
      text, 
      html 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

module.exports = sendNotification;
