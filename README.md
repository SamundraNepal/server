# server
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

You can access it from the server itself using `http://localhost` or from other devices on your home network using the server's local IP address.

Keep Docker Engine running while using Memories. The application containers can then continue operating in the background.
