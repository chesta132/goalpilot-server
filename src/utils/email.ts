import nodemailer from "nodemailer";
import { capitalEachWords } from "./stringManip";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "goalpilot.official@gmail.com",
    pass: process.env.EMAIL_AUTH_PASS,
  },
});

export const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

export const sendOTPEmail = async (email: string, otpCode: string, name: string) => {
  try {
    await transporter.sendMail({
      from: "GoalPilot Team",
      to: email,
      subject: "GoalPilot One-Time Password (OTP)",
      html: emailTemplate({
        title: "Your One-Time Password (OTP)",
        subtitle: "",
        message: `Dear ${capitalEachWords(
          name
        )},\n\nYou have requested a One-Time Password (OTP) to complete your action on GoalPilot. Please use the following code to proceed:\n\nFor your security, please do not share this OTP with anyone, including GoalPilot employees.`,
        name,
        infoMessage: otpCode,
      }),
    });
  } catch (error) {
    console.error("Email error", error);
  }
};

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
  try {
    await transporter.sendMail({
      from: "GoalPilot Team",
      to: email,
      subject: "GoalPilot Email Verification",
      html: emailTemplate({
        title: "Verify your email",
        subtitle: "",
        message: "",
        name,
        infoMessage: `Dear ${capitalEachWords(
          name
        )},\n\nYou have requested to verify your email address for your GoalPilot account. To complete this action, please click the button below.\n\nFor your security, please do not share this email or its link with anyone, including GoalPilot employees.`,
        button: {
          buttonText: "Verify your email",
          buttonHref: `${process.env.CLIENT_URL_DEV}/verify/email/?token=${token}`,
        },
      }),
    });
  } catch (error) {
    console.error("Email error", error);
  }
};

export function emailTemplate(props: {
  title: string;
  subtitle: string;
  name: string;
  message: string;
  infoMessage: string;
  button?: {
    buttonText: string;
    buttonHref: string;
  };
}) {
  const { title, subtitle, name, message, infoMessage, button } = props;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        /* Reset styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
        }
        
        /* Container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        /* Header */
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .email-header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .email-header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        /* Content */
        .email-content {
            padding: 40px 30px;
        }
        
        .email-content h2 {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 20px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        
        .email-content p {
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 1.8;
        }
        
        .email-content ul {
            margin-bottom: 20px;
            padding-left: 20px;
        }
        
        .email-content li {
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        /* Button */
        .email-button {
            text-align: center;
            margin: 30px 0;
        }
        
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }
        
        /* Info Box */
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        
        .info-box h3 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        /* Footer */
        .email-footer {
            background-color: #34495e;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .email-footer p {
            margin-bottom: 10px;
            opacity: 0.8;
        }
        
        .email-footer a {
            color: #3498db;
            text-decoration: none;
        }
        
        .email-footer a:hover {
            text-decoration: underline;
        }
        
        /* Social Links */
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: white;
            text-decoration: none;
            font-size: 18px;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: 0 !important;
                border-radius: 0 !important;
            }
            
            .email-content {
                padding: 20px !important;
            }
            
            .email-header {
                padding: 20px !important;
            }
            
            .email-header h1 {
                font-size: 24px !important;
            }
            
            .email-content h2 {
                font-size: 20px !important;
            }
            
            .btn {
                padding: 12px 25px !important;
                font-size: 14px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>${title}</h1>
            <p>${subtitle}</p>
        </div>
        
        <!-- Content -->
        <div class="email-content">
            <h2>Hello ${capitalEachWords(name)},</h2>
            
            <p>${message}</p>
            
            <div class="info-box">
                <h3>Important Information</h3>
                <p>${infoMessage}</p>
            </div>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            
            <!-- Call to Action Button -->
            ${
              button &&
              `<div class="email-button">
                <a href="${button.buttonHref}" class="btn">${button.buttonText}</a>
              </div>`
            }
            
            <p>Best regards,<br>
            <strong>GoalPilot Team</strong></p>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} GoalPilot. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}
