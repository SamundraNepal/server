export default function AccountActivatedHtml(data: {
  userName: string;
  storage: number;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Update</title>
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
                Account Update
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
                margin: 0 0 24px;
                font-size: 16px;
                line-height: 1.6;
                color: #4b5563;
              ">
                Your account has been updated and is now active.
              </p>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin: 0 0 28px;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 24px 20px;
                      background-color: #f9fafb;
                      border: 1px solid #eef0f2;
                      border-radius: 8px;
                    "
                  >
                    <p style="
                      margin: 0 0 8px;
                      font-size: 14px;
                      color: #6b7280;
                    ">
                      Available Storage
                    </p>

                    <p style="
                      margin: 0;
                      font-size: 32px;
                      font-weight: 700;
                      color: #111827;
                    ">
                      ${data.storage} GB
                    </p>
                  </td>
                </tr>
              </table>

              <p style="
                margin: 0 0 20px;
                padding: 14px 16px;
                background-color: #f9fafb;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.5;
                color: #6b7280;
              ">
                Your account is ready to use. You can now log in and start
                uploading and managing your files.
              </p>

              <p style="
                margin: 0;
                font-size: 13px;
                line-height: 1.6;
                color: #9ca3af;
              ">
                If you did not expect this account update, please contact
                support.
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

export function AccountDeactivatedHtml(data: { userName: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deactivated</title>
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
                Account Deactivated
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
                margin: 0 0 24px;
                font-size: 16px;
                line-height: 1.6;
                color: #4b5563;
              ">
                Your account has been deactivated and is currently unavailable.
              </p>

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin: 0 0 28px;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 24px 20px;
                      background-color: #f9fafb;
                      border: 1px solid #eef0f2;
                      border-radius: 8px;
                    "
                  >
                    <p style="
                      margin: 0 0 8px;
                      font-size: 14px;
                      color: #6b7280;
                    ">
                      Account Status
                    </p>

                    <p style="
                      margin: 0;
                      font-size: 28px;
                      font-weight: 700;
                      color: #111827;
                    ">
                      Deactivated
                    </p>
                  </td>
                </tr>
              </table>

              <p style="
                margin: 0 0 20px;
                padding: 14px 16px;
                background-color: #f9fafb;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.5;
                color: #6b7280;
              ">
                You will not be able to log in or access your files while
                your account is deactivated.
              </p>

              <p style="
                margin: 0;
                font-size: 13px;
                line-height: 1.6;
                color: #9ca3af;
              ">
                If you believe this was done in error or need assistance,
                please contact support.
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

export function AccountDeletedHtml(data: { userName: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deleted</title>
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
                Account Deleted
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
                margin: 0 0 24px;
                font-size: 16px;
                line-height: 1.6;
                color: #4b5563;
              ">
                Your Memories account has been permanently deleted.
              </p>

              <!-- Deletion Status -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin: 0 0 28px;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 24px 20px;
                      background-color: #f9fafb;
                      border: 1px solid #eef0f2;
                      border-radius: 8px;
                    "
                  >
                    <p style="
                      margin: 0 0 8px;
                      font-size: 14px;
                      color: #6b7280;
                    ">
                      Account Status
                    </p>

                    <p style="
                      margin: 0;
                      font-size: 28px;
                      font-weight: 700;
                      color: #111827;
                    ">
                      Permanently Deleted
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Files Deleted -->
              <p style="
                margin: 0 0 20px;
                padding: 14px 16px;
                background-color: #f9fafb;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              ">
                All files and data associated with your account have also
                been permanently deleted. This includes your uploaded
                photos, videos, and other stored files.
              </p>

              <p style="
                margin: 0;
                font-size: 13px;
                line-height: 1.6;
                color: #9ca3af;
              ">
                This action cannot be undone, and your account and files
                cannot be recovered.
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

export function StorageCapacityUpdatedHtml(data: {
  userName: string;
  storage: number;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Storage Capacity Updated</title>
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
                Storage Capacity Updated
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
                margin: 0 0 24px;
                font-size: 16px;
                line-height: 1.6;
                color: #4b5563;
              ">
                Your account's storage capacity has been updated.
              </p>

              <!-- Storage -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin: 0 0 28px;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 24px 20px;
                      background-color: #f9fafb;
                      border: 1px solid #eef0f2;
                      border-radius: 8px;
                    "
                  >
                    <p style="
                      margin: 0 0 8px;
                      font-size: 14px;
                      color: #6b7280;
                    ">
                      New Storage Capacity
                    </p>

                    <p style="
                      margin: 0;
                      font-size: 32px;
                      font-weight: 700;
                      color: #111827;
                    ">
                      ${data.storage} GB
                    </p>
                  </td>
                </tr>
              </table>

              <p style="
                margin: 0 0 20px;
                padding: 14px 16px;
                background-color: #f9fafb;
                border-radius: 8px;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              ">
                Your new storage capacity is now active and available for
                uploading and managing your files.
              </p>

              <p style="
                margin: 0;
                font-size: 13px;
                line-height: 1.6;
                color: #9ca3af;
              ">
                If you did not expect this change, please contact support.
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
