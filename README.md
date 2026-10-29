# media server
A self-hosted media server for managing and organizing your personal media library, featuring AI-powered media analysis and automated tagging. Run it on your own hardware, customize your local copy, and contribute improvements through pull requests for review by the project maintainer.


# Memories Server — System Requirements

Before installing the Memories Server, make sure your computer meets the minimum hardware and software requirements listed below.

These requirements are intended to run the Memories application, Docker containers, database, media processing services, and local AI image-tagging system comfortably.

## Minimum Hardware Requirements

| Component | Minimum Requirement |
|---|---|
| **Processor (CPU)** | Intel Core i7, 4th Generation or newer |
| **CPU Cores** | Minimum 4 physical cores |
| **Memory (RAM)** | 16 GB |
| **Graphics Card (GPU)** | Dedicated GPU with a minimum of 4 GB VRAM |
| **Available Storage** | Minimum 100 GB of free disk space |

## Software Requirements

- **Operating System:** A supported 64-bit operating system, such as Windows or Linux.
- **Docker:** Docker Engine or Docker Desktop, depending on your operating system.
- **Docker Compose:** Required to run the application services together.
- **Internet Connection:** Required during initial setup to download Docker images and dependencies.

## Why Are These Requirements Needed?

- **CPU:** Handles application operations, database requests, media processing, and background tasks.
- **RAM:** Provides enough memory to run multiple Docker containers and supporting services simultaneously.
- **GPU:** Provides the graphics memory needed by the local AI image-tagging service. Compatible GPU hardware, drivers, and Docker GPU configuration are required for acceleration.
- **Storage:** Provides room for Docker images, containers, application dependencies, temporary processing files, and logs.

## Storage Recommendations

The minimum 100 GB of free storage is intended for the application, Docker environment, and associated services.

**Your photo and video library requires additional storage.** The amount needed depends on the size of your media collection and how much it grows over time.

For larger libraries, consider using a separate storage drive dedicated to your photos and videos.

## Important Notes

- These specifications represent the recommended minimum for this project, not a guarantee of performance for every workload.
- AI image-tagging performance depends on the GPU, available VRAM, model configuration, and image resolution.
- A compatible NVIDIA GPU and correctly configured GPU support may be required for GPU acceleration with the current AI service.
- Systems with more RAM, CPU cores, and storage may perform better when processing large media libraries or serving multiple users.
- Ensure Docker has sufficient memory and disk space allocated to run all required services.

## Pre-Installation Checklist

Before proceeding with installation, verify that your system has:

- [ ] Intel Core i7, 4th Generation or newer
- [ ] At least 4 physical CPU cores
- [ ] 16 GB RAM or more
- [ ] A dedicated GPU with at least 4 GB VRAM
- [ ] At least 100 GB of free disk space
- [ ] A supported 64-bit operating system
- [ ] Docker and Docker Compose installed

Once your system meets these requirements, proceed to the installation guide to configure and run the Memories Server.





# SERVER — Linux Setup Guide

Follow these steps to configure and run the Memories SERVER application on Linux.

## Prerequisites

Before starting, make sure you have:

- A Linux operating system.
- Docker Engine installed and running.
- Docker Compose available through `docker compose`.
- Git installed if you plan to clone the project.
- An internet connection to download the required Docker images and dependencies.

Unlike Windows, Linux does not require Docker Desktop. Docker Engine runs natively on Linux.

If Docker is not installed, follow the official installation instructions for your Linux distribution:

https://docs.docker.com/engine/install/

Verify that Docker is installed:

```bash
docker --version
docker compose version
```

If your Linux user does not have permission to access Docker, you may need to use `sudo` with Docker commands or configure Docker permissions according to the official documentation.

**Important:** Make sure the Docker service is running before continuing.

---

## Step 1: Configure Media Storage

Open a terminal in the root `MEDIA_SERVER` directory.

### 1.1 Run the storage setup script

Run:

```bash
chmod +x setup-storage.sh
./setup-storage.sh
```

The script will ask you for two storage paths.

**MEDIA_STORAGE_PATH**

Enter the absolute Linux directory where your media files will be stored.

Example:

```text
/mnt/server-drive/Storage
```

Replace this example with the actual directory where you want your media stored.

**MEDIA_STORAGE_TARGET**

Enter the corresponding path used by the application inside the Docker environment.

Example:

```text
/mnt/server-drive/Storage
```

Use the container path that matches your Docker Compose volume configuration. Do not copy the example blindly if your configured container path is different.

### Important

The host storage path and the Docker container path serve different purposes. They must point to the same underlying storage through the Docker volume mapping.

Once both values have been entered, the script saves the storage configuration in the root `.env` file.

---

## Step 2: Create the Backend Environment File

Open a terminal in the `backend` directory.

Run:

```bash
chmod +x create-env.sh
./create-env.sh
```

The script creates a `.env` file if one does not already exist.

If the file already exists, the script will leave it unchanged.

Open the newly created `.env` file using your preferred text editor.

For example:

```bash
nano .env
```

---

## Step 3: Configure the Backend Environment Variables

Your backend `.env` file contains the configuration required by the application.

### 3.1 Application Configuration

Check the following variables:

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

**Important:** Keep the existing values unchanged unless your application's configuration requires otherwise.

The storage paths must match your Docker volume configuration. `STORAGE_PATH_WINDOWS` may be unnecessary on a Linux-only installation, depending on how your backend uses it.

Also, verify that `AI_QWEN_API_URL` matches the actual Qwen service name in your Docker Compose file. Do not change it without checking the service configuration.

### 3.2 Generate Application Secrets

Find these variables:

```dotenv
JWT_SECRET=
COOKIE_SECRET_KEY=
```

Generate two separate, strong, random secrets.

You can generate a secret in the terminal with:

```bash
openssl rand -hex 32
```

Run the command twice, generating a different value for each variable.

Add the results to your backend `.env` file:

```dotenv
JWT_SECRET=YOUR_GENERATED_JWT_SECRET
COOKIE_SECRET_KEY=YOUR_GENERATED_COOKIE_SECRET
```

Replace the placeholders with your generated values.

Keep these secrets private. Never commit your real `.env` file to GitHub or share it publicly.

### 3.3 Configure Email Sending

Find:

```dotenv
EMAIL_API=
```

Memories uses an email service to send application emails, such as password-reset messages.

To configure email sending:

1. Visit https://resend.com/
2. Create an account or sign in.
3. Open the API Keys section in the Resend dashboard.
4. Create an API key and copy it securely.
5. Verify your sender domain if required for your intended use.

Open the backend `.env` file and set:

```dotenv
EMAIL_API=YOUR_EMAIL_API_KEY
```

Replace the placeholder with your actual API key.

Use a sender address permitted by your email provider and associated with a verified domain where required.

If your backend supports a separate sender-address environment variable, configure it according to your application's requirements. Do not add unsupported variables.

### 3.4 Configure Google Authentication

Memories supports Google authentication, allowing users to sign in with their Google accounts.

To enable this feature, you must create OAuth credentials through Google Cloud Console.

#### Step 1: Open Google Cloud Console

1. Visit https://console.cloud.google.com/
2. Sign in with your Google account.
3. Select an existing project or create a new one.
4. Make sure the correct project is selected.

#### Step 2: Configure Google Auth Platform

Open:

https://console.cloud.google.com/auth/overview

Follow the setup prompts to configure your application.

- Enter an application name, such as `Memories`.
- Select an appropriate support email.
- Choose **External** if users outside your Google Workspace organization need to sign in.
- Choose **Internal** only if access should be restricted to users within your Google Workspace organization.
- Add test users if your application is in testing mode and requires them.

Save your configuration.

#### Step 3: Create OAuth Credentials

Open:

https://console.cloud.google.com/auth/clients

1. Click **Create client**.
2. Select **Web application** as the application type.
3. Enter a name, such as `Memories Web Client`.

#### Step 4: Configure Authorized JavaScript Origins

Add the browser-facing origin used to access your application.

For example, during local development:

```text
http://localhost
```

If your frontend runs directly on port 3000, the origin may instead be:

```text
http://localhost:3000
```

Use the origin that matches how users access your application. Do not include the API callback path here.

#### Step 5: Configure Authorized Redirect URIs

Your backend environment template contains:

```dotenv
GOOGLE_CALLBACK_URL=/api/auth/google/callback
```

This is a relative path. Determine the full callback URL your backend actually sends to Google.

For example, depending on your application's routing configuration, it might be:

```text
http://localhost/api/auth/google/callback
```

For production, use your actual HTTPS domain and callback path.

**Important:** These are examples, not interchangeable values. Register the exact full callback URL generated by your backend. The protocol, hostname, port, and path must match.

#### Step 6: Create and Save Your Credentials

1. Create the OAuth client.
2. Copy the generated Client ID.
3. Copy the generated Client Secret.
4. Keep both credentials private.

#### Step 7: Add the Credentials to the Backend `.env`

Find:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=/api/auth/google/callback
```

Enter your credentials:

```dotenv
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=/api/auth/google/callback
```

Replace the placeholders with your actual credentials.

**Leave `GOOGLE_CALLBACK_URL` unchanged if your application expects this relative path.** The full URL registered with Google must still match the URL generated by your backend.

### 3.5 Configure the Administrator Email

Find:

```dotenv
ADMIN_EMAIL=
```

Enter the email address you want to use for the administrator-related functionality supported by your application.

Use an email address you control.

---

## Step 4: Create the Frontend Environment File

Open a terminal in the `frontend` directory.

Run:

```bash
chmod +x create-env.sh
./create-env.sh
```

The script creates a `.env` file if one does not already exist. If the file already exists, it will leave it unchanged.

Open the file:

```bash
nano .env
```

Configure the required variables:

```dotenv
NEXT_PUBLIC_URL=/api
INTERNAL_API_URL=/api
```

**Important:** Do not copy your backend `JWT_SECRET` into the frontend environment unless your application has a verified, specific server-side requirement for it. A JWT signing secret must never be exposed to browser-side code. `NEXT_PUBLIC_` variables in Next.js are exposed to the browser, so never use that prefix for secrets.

If your existing frontend environment template includes `JWT_SECRET`, verify how the frontend uses it before deciding whether it is required.

Save the file and exit your editor.

For Nano, press `Ctrl + O`, then `Enter` to save, followed by `Ctrl + X` to exit.

---

## Step 5: Verify Your Configuration

Before starting the application, check that:

- [ ] Docker Engine is installed and running.
- [ ] The media storage directory exists.
- [ ] The root `.env` contains the correct storage paths.
- [ ] Docker Compose maps the storage directory correctly.
- [ ] The backend `.env` has the required application settings.
- [ ] Separate JWT and cookie secrets have been generated.
- [ ] Email credentials are configured if email functionality is required.
- [ ] Google OAuth credentials are configured if Google login is required.
- [ ] The frontend `.env` contains the required frontend settings.
- [ ] All required environment variables match the application's configuration.
- [ ] `.env` files are excluded from Git.

---

## Step 6: Build and Start Your Memories Server

Open a terminal in the root `MEDIA_SERVER` directory, where your Docker Compose file is located.

Run:

```bash
docker compose up --build -d
```

Docker will download the required images, build your application containers, and start the services in the background.

The first startup may take some time, depending on your internet speed, hardware, and the models or dependencies that need to be downloaded.

### 6.1 Check Your Containers

Run:

```bash
docker compose ps
```

To view application logs if a service fails to start, run:

```bash
docker compose logs --tail=100
```

To follow the logs continuously:

```bash
docker compose logs -f
```

Press `Ctrl + C` to stop following the logs. This does not stop the containers.

---

## Step 7: Access Your Memories Server

### 7.1 Access It on the Same Computer

Open your browser and visit:

```text
http://localhost
```

Your Memories application should now load.

### 7.2 Access It From Other Devices on the Same Network

You can also access Memories from other computers, phones, and tablets connected to the same local network.

Open a terminal on the Linux server and run:

```bash
hostname -I
```

This displays the machine's assigned IP addresses. Identify the local IPv4 address associated with your active network connection.

For example:

```text
192.168.1.100
```

On another device connected to the same network, open a browser and enter:

```text
http://192.168.1.100
```

Replace the example IP address with your server's actual local IPv4 address.

**Important:** Your firewall and network configuration must allow incoming connections to the application. Devices on guest Wi-Fi or isolated networks may be unable to connect.

### 7.3 Keep Your Local IP Address Permanent

Your local IP address may change when your router assigns a new address.

To avoid repeatedly checking the address, configure **DHCP Reservation** on your router.

The general process is:

1. Open your router's administration page.
2. Find **DHCP Reservation**, **Address Reservation**, or a similar setting.
3. Identify your server's network adapter and MAC address.
4. Reserve a local IP address for that device.
5. Save the settings and reconnect if necessary.

Your server should then receive the same local IP address from your router.

---

## Security Warning

Never publish your real `.env` files, OAuth client secrets, JWT secrets, cookie secrets, or email API credentials.

Make sure your `.env` files are excluded from Git. If a secret is accidentally exposed, rotate it immediately.

---

## You're All Set!

Your Memories server should now be running on Linux through Docker Engine.


## Start Your Memories Server

Once you have completed the setup and configured your environment files, follow these steps to build and start Memories.

### Step 1: Open the Main Project Directory

Open a terminal or PowerShell window in the root `MEDIA_SERVER` directory, where your `docker-compose.yml` file is located.

If you are already in that directory, continue to the next step.

### Step 2: Build and Start the Server

Run the following command:

```bash
docker compose up --build -d
```

This command builds the application images if necessary and starts the required services in the background.

**Note:** The first startup may take several minutes because Docker needs to download images, install dependencies, and build the application.

### Step 3: Verify That the Server Is Running

Run:

```bash
docker compose ps
```

Check that the required services have started successfully.

If a service fails to start, inspect the logs using:

```bash
docker compose logs --tail=100
```

### Step 4: Access Memories

Open your web browser and visit:

```text
http://localhost
```

If you have configured a different port or domain in your Docker Compose configuration, use the corresponding address instead.

### Starting Memories Again Later

After the initial setup, you do not need to repeat the environment configuration every time you use the server.

1. Start Docker Engine on Linux or open Docker Desktop on Windows.
2. Open a terminal in the main `MEDIA_SERVER` directory.
3. Run:

```bash
docker compose up -d
```

Your existing containers will start in the background.

**Important:** Keep Docker running while using Memories. Your media files and application data should remain available according to your configured storage and database persistence settings.




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

You can access it from the server itself using `http://localhost` or from other devices on your home network using the server's local IP address.

Keep Docker Engine running while using Memories. The application containers can then continue operating in the background.


## Start Your Memories Server

Once you have completed the setup and configured your environment files, follow these steps to build and start Memories.

### Step 1: Open the Main Project Directory

Open a terminal or PowerShell window in the root `MEDIA_SERVER` directory, where your `docker-compose.yml` file is located.

If you are already in that directory, continue to the next step.

### Step 2: Build and Start the Server

Run the following command:

```bash
docker compose up --build -d
```

This command builds the application images if necessary and starts the required services in the background.

**Note:** The first startup may take several minutes because Docker needs to download images, install dependencies, and build the application.

### Step 3: Verify That the Server Is Running

Run:

```bash
docker compose ps
```

Check that the required services have started successfully.

If a service fails to start, inspect the logs using:

```bash
docker compose logs --tail=100
```

### Step 4: Access Memories

Open your web browser and visit:

```text
http://localhost
```

If you have configured a different port or domain in your Docker Compose configuration, use the corresponding address instead.

### Starting Memories Again Later

After the initial setup, you do not need to repeat the environment configuration every time you use the server.

1. Start Docker Engine on Linux or open Docker Desktop on Windows.
2. Open a terminal in the main `MEDIA_SERVER` directory.
3. Run:

```bash
docker compose up -d
```

Your existing containers will start in the background.

**Important:** Keep Docker running while using Memories. Your media files and application data should remain available according to your configured storage and database persistence settings.
