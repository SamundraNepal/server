import { ResetPasswordDTO } from '../dto/resetPassword.dto';

export default function ResetPasswordHtml(data: ResetPasswordDTO) {
  // Removed the accidental 'html' text from the backtick
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f4f6f8; padding: 40px 16px;"
  >
    <tr>
      <td align="center">

        <!-- Email Container -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 520px;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          "
        >

          <!-- Header -->
          <tr>
            <td
              style="
                padding: 32px 40px 20px;
                text-align: center;
                border-bottom: 1px solid #eef0f2;
              "
            >
              <h1 style="
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                color: #111827;
              ">
                Password Reset
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 40px;">

              <p style="
                margin: 0 0 18px;
                font-size: 16px;
                line-height: 1.6;
                color: #374151;
              ">
                Hi ${data.userName},
              </p>

              <p style="
                margin: 0 0 28px;
                font-size: 16px;
                line-height: 1.6;
                color: #4b5563;
              ">
                We received a request to reset your password.
                Click the button below to create a new password.
              </p>

              <!-- Button -->
              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin: 0 auto 28px;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      border-radius: 8px;
                      background-color: #111827;
                    "
                  >
                    <a
                      href="${data.resetLink}"
                      style="
                        display: inline-block;
                        padding: 14px 28px;
                        font-size: 15px;
                        font-weight: 600;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                      "
                    >
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiration Notice -->
              <p style="
                margin: 0 0 20px;
                padding: 14px 16px;
                background-color: #f9fafb;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.5;
                color: #6b7280;
              ">
                ⏱ This password reset link will expire in
                <strong style="color: #374151;">15 minutes</strong>.
              </p>

              <p style="
                margin: 0;
                font-size: 13px;
                line-height: 1.6;
                color: #9ca3af;
              ">
                If you didn't request a password reset, you can safely ignore
                this email. Your password will remain unchanged.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              style="
                padding: 20px 40px;
                text-align: center;
                background-color: #f9fafb;
                border-top: 1px solid #eef0f2;
              "
            >
              <p style="
                margin: 0;
                font-size: 12px;
                color: #9ca3af;
              ">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}
