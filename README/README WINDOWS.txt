
# SERVER — Windows Setup Guide

Follow these steps to configure the SERVER application on Windows.


#Prerequisites


## Step 1: Install and Start Docker Desktop (Windows)

After downloading or cloning the Memories project to your computer, you must install Docker Desktop before starting the server.

### 1.1 Download Docker Desktop

1. Open the official Docker website:
   https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows.
3. Run the installer and follow the installation instructions.
4. Restart your computer if the installer asks you to do so.
5. Open Docker Desktop and wait until Docker has finished starting.

### 1.2 Keep Docker Desktop Running

Once Docker Desktop has started successfully, **leave Docker Desktop open while setting up and running the Memories server.**

Docker runs the application inside containers, including the frontend and backend services. Docker Desktop must be running so these containers can start and operate.

Make sure Docker Desktop indicates that the Docker Engine is running before continuing.

### 1.3 Open PowerShell in the Project Folder

1. Open the folder where you downloaded or cloned the Memories project.
2. Navigate to the main `MEDIA_SERVER` directory, where the `docker-compose.yml` file is located.
3. Open PowerShell in that directory.

You are now ready to continue with the next setup steps, including configuring media storage and creating the required environment files.

**Important:** Keep Docker Desktop running while using Memories. If Docker Desktop is not running, your application containers may not start or remain available.




This guide covers:
1. Configuring media storage paths.
2. Creating the backend environment file.
3. Configuring application secrets.
4. Setting up email and Google authentication.

---

## Step 1: Configure Media Storage

Open PowerShell in the root `MEDIA_SERVER` directory.

### 1.1 Allow the setup script to run

Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

This allows scripts to run in the current PowerShell session without permanently changing your execution policy.

### 1.2 Run the storage setup script

```powershell
.\setup-storage-windows.ps1
```

The script will ask you for two storage paths.

**MEDIA_STORAGE_PATH**

Enter the Windows directory where your media files will be stored.

Example:

```text
C:/Users/samun/Desktop/Storage
```

Replace `samun` with your own Windows username and use the directory where you want your media stored.

**MEDIA_STORAGE_TARGET**

Enter the corresponding path used by the application inside the Docker environment.

Example:

```text
/home/samundra/Desktop/Storage
```

Use the Linux path that matches your Docker volume configuration. Do not copy this example blindly; your configured container path may be different.

### Important

The Windows storage path and the Docker container path serve different purposes. They must point to the same underlying storage through the Docker volume mapping.

Once both values have been entered, the script saves the storage configuration in the `.env` file in the current directory.

---

## Step 2: Create the Backend Environment File

Open a new PowerShell terminal in the `backend` directory.

Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\create-env-windows.ps1
```

The script creates a `.env` file if one does not already exist.

If the file already exists, the script will leave it unchanged.

Open the newly created `.env` file using Notepad or your preferred text editor.

---

## Step 3: Configure the Environment Variables

Your `.env` file will contain several variables.

### 3.1 Application Configuration

Leave the following values unchanged unless you understand the relevant Docker or application configuration:

```dotenv
STORAGE_PATH_LINUX=
STORAGE_PATH_WINDOWS=
STORAGE_PROFILE_PATH=Profile

FRONTEND_URL=http://frontend:3000
FRONTEND_DOMAIN_RESET_PASSWORD=/api/pages/resetPassword

MONGODB_URL=mongodb://mongodb:27017/mydatabase

GOOGLE_CALLBACK_URL=/api/auth/google/callback

AI_QWEN_API_URL=http://api.api:8000
```

### 3.2 Generate Application Secrets

Find these two variables:

```dotenv
JWT_SECRET=
COOKIE_SECRET_KEY=
```

Replace the empty values with two separate, strong, randomly generated secrets.

Example format only:

```dotenv
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
COOKIE_SECRET_KEY=REPLACE_WITH_ANOTHER_LONG_RANDOM_SECRET
```

Do not use the example placeholders as actual secrets.


Run the command twice and use a different result for each variable.

Keep these secrets private. Never commit your real `.env` file to GitHub or share it publicly.

### 3.3 Configure Email

Find:

```dotenv
EMAIL_API=
```

### 3.3 Configure Email Sending (EMAIL_API)

SERVER uses an email service to send emails from the application, such as password-reset emails.

To enable email sending, you must configure an email API credential.

1. Visit https://resend.com/
2. Create an account or sign in.
3. Open the API Keys section in the Resend dashboard.
4. Create a new API key.
5. Copy the generated key and keep it private.

#### Step 2: Verify Your Sender Domain

For production email sending, follow your provider's instructions to verify a domain you own.

This typically involves adding DNS records to your domain's DNS provider.

Complete the verification process before using your own domain as the sender address.

#### Step 3: Add the API Key to Your Environment File

Open the backend `.env` file and locate:

```dotenv
EMAIL_API=
```

Paste your API key after the equals sign:

```dotenv
EMAIL_API=YOUR_EMAIL_API_KEY
```

Replace `YOUR_EMAIL_API_KEY` with the actual key generated by your email provider.

Do not include quotation marks unless your application specifically requires them.

Use an address permitted by your email provider and verified domain.

If the backend has a separate environment variable for the sender address, configure it accordingly. Do not add a new variable unless the backend code supports it.


### 3.4 Configure Google Authentication

Find:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 3.4 Configure Google Authentication

Memories supports Google authentication, allowing users to sign in using their Google accounts.

To enable this feature, you must create OAuth credentials through Google Cloud Console and add them to your backend `.env` file.

#### Step 1: Open Google Cloud Console

1. Open https://console.cloud.google.com/
2. Sign in with your Google account.
3. Select an existing Google Cloud project, or click the project selector and create a new project.
4. Give your project a name, for example `Memories App`.
5. Make sure the correct project is selected before continuing.

#### Step 2: Configure Google Auth Platform

1. Open https://console.cloud.google.com/auth/overview
2. Follow the setup prompts to configure your application.
3. Enter your application name, such as `Memories`.
4. Select an appropriate support email.
5. Configure the audience:
   - Choose **External** if people outside your Google Workspace organization need to sign in.
   - Choose **Internal** only if the application is restricted to users within your Google Workspace organization.
6. Enter a contact email if requested.
7. Complete the setup and save your configuration.

If your app is in testing mode with an External audience, add the Google accounts you want to use under the test users section.

#### Step 3: Create OAuth Credentials

1. Open the Clients page:

   https://console.cloud.google.com/auth/clients

2. Click **Create client**.
3. For Application type, select **Web application**.
4. Give the client a name, such as `Memories Web Client`.

#### Step 4: Configure Authorized JavaScript Origins

Under **Authorized JavaScript origins**, add the browser-facing address of your application.

For local development, this might be:

```text
http://localhost:3000
```

If users access the application through another address, add the appropriate origin as well.

Only enter the origin here. Do not include an API path such as `/api/auth/google/callback`.

#### Step 5: Configure Authorized Redirect URIs

Under **Authorized redirect URIs**, add the full callback URL used by your backend.

Your backend environment template contains:

```dotenv
GOOGLE_CALLBACK_URL=/api/auth/google/callback
```

This is a relative path. Determine the full URL your backend actually sends to Google.

For example, if the backend constructs the callback using the local application host, it might be:

```text
http://localhost:7000/api/auth/google/callback
```

If your application uses a reverse proxy, the correct URL might instead be:

```text
http://localhost/api/auth/google/callback
```

**Important:** These are examples, not interchangeable values. Register the exact full callback URL generated by your backend. The protocol, hostname, port, and path must match.

For production, use your actual HTTPS domain and callback path.

#### Step 6: Create the Client

1. Review the OAuth client configuration.
2. Click **Create**.
3. Google will display your OAuth credentials.
4. Copy the **Client ID**.
5. Copy the **Client Secret**.
6. Store both securely.

Treat the Client Secret as a password. Do not publish it or commit it to GitHub.

#### Step 7: Add the Credentials to Your Backend `.env`

Open the `.env` file inside the `backend` directory.

Find these variables:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=/api/auth/google/callback
```

Paste your credentials into the first two variables:

```dotenv
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=/api/auth/google/callback ///>>> LEAVE IT AS IT IS
```

Replace the placeholders with the actual credentials from Google Cloud Console.

Keep the callback variable as configured by your project if the backend expects a relative path and constructs the full URL internally. Do not replace it with a full URL unless your backend configuration requires that.

### 3.5 Configure the Administrator Email

Find:

```dotenv
ADMIN_EMAIL=
```

Enter the email address that your application expects for administrator-related functionality.

Use an email address you control.

---

## Step 4: Verify Before Starting

Before starting the application, check that:

- [ ] The storage directory exists on Windows.
- [ ] The storage volume is mapped correctly in Docker Compose.
- [ ] Both application secrets have been generated and saved.
- [ ] Email credentials are configured if email functionality is required.
- [ ] Google OAuth credentials are configured if Google login is required.
- [ ] All required environment variables have valid values.
- [ ] The `.env` file is excluded from Git.

Once configuration is complete, follow the project's Docker Compose instructions to build and start the application.

---

### Configure the Frontend Environment



Open a new PowerShell terminal in the `frontend` directory.

Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\create-env-windows.ps1
```

The script creates a `.env` file if one does not already exist.

If the file already exists, the script will leave it unchanged.

Open the newly created `.env` file using Notepad or your preferred text editor.


```dotenv
NEXT_PUBLIC_URL=/api 
INTERNAL_API_URL=/api

// for this paste your your_existing_backend_secret .env here in fronend .env 
JWT_SECRET=


## Security Warning

Never publish your real `.env` file, OAuth client secret, JWT secret, cookie secret, or email API credentials.

If a secret is accidentally exposed, rotate it immediately.


and that's it your done now...




## 5. Start Your Memories Server

Once you have completed all the previous setup steps, you are ready to start your Memories server!

### Step 1: Build and Start the Server

1. Go to your main `MEDIA_SERVER` project folder.
2. Open PowerShell in that folder.
3. Run the following command:

```powershell
docker compose up --build -d
```

Docker will download the required images, build your application containers, and start your server in the background.

**Note:** The first startup may take some time, depending on your internet speed and computer specifications.

To check whether your containers are running, use:

```powershell
docker compose ps
```

### Step 2: Access Your Server on Your Computer

Open your web browser and enter:

```text
http://localhost
```

Your Memories application should now load!

### Step 3: Access Your Server From Other Devices on the Same Network

You can also access your Memories server from other computers, phones, or tablets connected to the same local network.

First, find your computer's local IP address.

1. Open PowerShell.
2. Run the following command:

```powershell
ipconfig
```

3. Find the `IPv4 Address` under the network adapter you are currently using.

- **Wi-Fi:** Look under `Wireless LAN adapter Wi-Fi`.
- **Ethernet:** Look under `Ethernet adapter Ethernet`.

For example, your IP address might look like this:

```text
192.168.1.100
```

On another device connected to the same network, open a browser and enter your computer's IP address:

```text
http://192.168.1.100
```

Replace `192.168.1.100` with your actual IPv4 address.

**Important:** Your computer's firewall and network configuration must allow connections to the server for other devices to access it.

### Step 4: What If Your IP Address Changes?

Your local IP address may change when your router assigns a new address to your computer.

If the previous address stops working, repeat Step 3 to find your current IPv4 address and use the updated address on your other devices.

### Step 5: Keep Your Local IP Address Permanent (Recommended)

If you want to access your Memories server reliably without checking its IP address repeatedly, you can configure **DHCP Reservation**, also known as **IP-MAC Binding**, on your router.

DHCP Reservation tells your router to assign the same local IP address to your server computer based on its network adapter's MAC address.

The general process is:

1. Open your router's administration page.
2. Find the **DHCP Reservation**, **Address Reservation**, or **IP-MAC Binding** settings.
3. Select your server computer's network adapter and MAC address.
4. Assign a reserved local IP address.
5. Save the settings and reconnect your computer if necessary.

Your server should then keep the same local IP address, making it easier to access from other devices on your home network.

*Note: Router settings vary by manufacturer, so consult your router's documentation for the exact steps.*

---

**You're all set!** Your Memories server is running locally, and other devices on your home network can access it using your computer's local IP address.






