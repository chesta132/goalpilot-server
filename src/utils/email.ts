import nodemailer from "nodemailer";
import { capitalEachWords } from "./manipulate";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "goalpilot.official@gmail.com",
    pass: process.env.EMAIL_AUTH_PASS,
  },
  tls: {
    rejectUnauthorized: false,
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
        message: `You have requested a One-Time Password (OTP) to complete your action on GoalPilot. Please use the following code to proceed:\n\nFor your security, please do not share this OTP with anyone, including GoalPilot employees.`,
        name: capitalEachWords(name),
        infoMessage: `<p style="font-weight: bold; font-size: 18px;">${otpCode}</p>`,
      }),
    });
  } catch (error) {
    console.error("Email error", error);
    throw error as Error;
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
        message: "",
        name: capitalEachWords(name),
        infoMessage: `You have requested to verify your email address for your GoalPilot account. To complete this action, please click the button below.\n\nFor your security, please do not share this email or its link with anyone, including GoalPilot employees.`,
        button: {
          buttonText: "Verify your email",
          buttonHref: `${process.env.CLIENT_URL_DEV}/verify/email/?token=${token}`,
        },
      }),
    });
  } catch (error) {
    console.error("Email error", error);
    throw error as Error;
  }
};

/**
 * @param credentials Default is "password"
 */
export const sendCredentialChanges = async (email: string, name: string, credentials = "password") => {
  try {
    await transporter.sendMail({
      from: "GoalPilot Team",
      to: email,
      subject: `GoalPilot ${capitalEachWords(credentials)} Has Been Changed`,
      html: emailTemplate({
        title: `${capitalEachWords(credentials)} change`,
        message: "",
        name,
        infoMessage: `Dear ${capitalEachWords(
          name
        )},\n\nYour GoalPilot account ${credentials.toLowerCase()} has been successfully updated. If you did not make this change, please contact GoalPilot support immediately.\n\nFor your security, please do not share your login credentials with anyone, including GoalPilot employees.`,
      }),
    });
  } catch (error) {
    console.error("Email error", error);
    throw error as Error;
  }
};

export function emailTemplate(props: {
  title: string;
  name: string;
  message: string;
  infoMessage: string;
  button?: {
    buttonText: string;
    buttonHref: string;
  };
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${props.title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles for email clients */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        
        /* Base styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #334155;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        /* Header styles */
        .header {
            background: linear-gradient(135deg, #66b2ff 0%, #ff8c42 100%);
            padding: 30px 20px;
            text-align: center;
        }
        
        .logo-container {
            display: inline-flex;
            align-items: center !important;
            gap: 12px;
            margin-bottom: 10px;
        }
        
        .logo {
            width: 40px;
            height: 40px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
        }
        
        .brand-name {
            font-size: 24px;
            font-weight: bold;
            color: white;
            margin: 0;
            text-decoration: none;
        }
        
        /* Content styles */
        .content {
            padding: 40px 30px;
        }
        
        .title {
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
            margin: 0 0 8px 0;
            line-height: 1.3;
        }
        
        .greeting {
            font-size: 18px;
            color: #1e293b;
            margin: 0 0 20px 0;
            font-weight: 500;
        }
        
        .message {
            font-size: 16px;
            color: #334155;
            margin: 0 0 25px 0;
            line-height: 1.6;
        }
        
        .info-message {
            background-color: #f1f5f9;
            border-left: 4px solid #66b2ff;
            padding: 16px 20px;
            margin: 25px 0;
            border-radius: 0 6px 6px 0;
        }
        
        .info-message p {
            margin: 0;
            font-size: 14px;
            color: #475569;
            line-height: 1.5;
        }
        
        /* Button styles */
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #66b2ff 0%, #4f46e5 100%);
            color: white !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            border: none;
            box-shadow: 0 4px 12px rgba(102, 178, 255, 0.3);
        }
        
        .button:hover {
            background: linear-gradient(135deg, #5aa3f0 0%, #4338ca 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(102, 178, 255, 0.4);
        }
        
        /* Footer styles */
        .footer {
            background-color: #1e293b;
            color: #94a3b8;
            padding: 30px 20px;
            font-size: 14px;
        }
        
        .footer-content {
            max-width: 560px;
            margin: 0 auto;
        }
        
        .footer-brand {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .footer-brand .logo-container {
            justify-content: center;
            margin-bottom: 8px;
        }
        
        .footer-brand .logo {
            background-color: rgba(102, 178, 255, 0.2);
            color: #66b2ff;
        }
        
        .footer-brand .brand-name {
            color: white;
            font-size: 18px;
        }
        
        .footer-description {
            text-align: center;
            font-size: 13px;
            line-height: 1.5;
            color: #64748b;
            margin: 10px 0 25px 0;
        }
        
        .footer-links {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .footer-links a {
            color: #66b2ff;
            text-decoration: none;
            margin: 0 8px;
            font-size: 13px;
        }
        
        .footer-links a:hover {
            color: #9fcfff;
            text-decoration: underline;
        }
        
        .footer-contact {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .footer-contact a {
            color: #9fcfff;
            text-decoration: none;
            font-size: 13px;
        }
        
        .footer-contact a:hover {
            color: #66b2ff;
            text-decoration: underline;
        }
        
        .footer-bottom {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #334155;
            font-size: 12px;
            color: #64748b;
        }
        
        /* Mobile responsive */
                    @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .title {
                font-size: 24px;
            }
            
            .greeting {
                font-size: 17px;
            }
            
            .message {
                font-size: 15px;
            }
            
            .button {
                padding: 12px 28px;
                font-size: 15px;
            }
            
            .footer {
                padding: 25px 15px;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: #ffffff;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo-container">
                <div class="logo">
                    <img src="https://raw.githubusercontent.com/chesta132/goalpilot-client/main/public/favicon.png" alt="goalpilot_logo" class="logo" />
                </div>
                <div class="brand-name">GoalPilot</div>
            </div>  
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h1 class="title">${props.title}</h1>
            
            <p class="greeting">Hi ${props.name}</p>
            
            <div class="message">${props.message}</div>
            
            <div class="info-message">
                <p>${props.infoMessage}</p>
            </div>
            
            ${
              props.button
                ? `
            <div class="button-container">
                <a href="${props.button.buttonHref}" class="button">${props.button.buttonText}</a>
            </div>
            `
                : ""
            }
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo-container">
                        <img src="https://raw.githubusercontent.com/chesta132/goalpilot-client/main/public/favicon.png" alt="goalpilot_logo" class="logo" />
                        <div class="brand-name">GoalPilot</div>
                    </div>
                    <div class="footer-description">
                        A personal goal management app that helps you plan, track, and achieve your dreams with better focus and organization.
                    </div>
                </div>
                
                <div class="footer-links">
                    <a href="${process.env.CLIENT_URL_DEV}/about">About Us</a>
                    <a href="${process.env.CLIENT_URL_DEV}/privacy">Privacy Policy</a>
                    <a href="${process.env.CLIENT_URL_DEV}/terms">Terms of Service</a>
                </div>
                
                <div class="footer-contact">
                    <p style="margin: 0 0 8px 0; font-size: 13px;">Need help? Contact us:</p>
                    <a href="mailto:goalpilot.official@gmail.com">goalpilot.official@gmail.com</a>
                </div>
                
                <div class="footer-bottom">
                    <p style="margin: 0;">© ${new Date().getFullYear()} GoalPilot. All rights reserved.</p>
                    <p style="margin: 5px 0 0 0;">Made with ❤️ for goal achievers</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}
