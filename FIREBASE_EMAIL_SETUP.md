# Firebase Professional Email Setup Guide

By default, Firebase Auth sends password reset and verification emails from a generic `noreply@<project-id>.firebaseapp.com` address. To make your application feel premium, official, and professional, follow these steps to configure a custom domain and SMTP settings.

---

## Step 1: Customize the Email Templates
To change the copy, subject line, and sender name:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project and navigate to **Authentication** > **Templates** in the left menu.
3. Click on the **Password reset** tab.
4. Customize the following fields:
   - **Sender display name**: Set this to your app name (e.g., `Clyra`).
   - **Subject**: Enter a clear, professional subject line (e.g., `Reset your Clyra account password`).
   - **Body (HTML)**: Edit the content of your message. Ensure the URL placeholder (usually `%LINK%`) is preserved, as this is the link the user clicks to reset their password.

---

## Step 2: Use a Custom Sending Domain (Recommended)
Sending from a custom domain (like `noreply@yourdomain.com`) prevents your emails from ending up in users' spam folders and establishes trust.
1. In the **Templates** tab, next to the **Sender address** field, click **Customize domain** (or edit icon).
2. Enter the domain name you own (e.g., `yourdomain.com`).
3. Firebase will generate a set of DNS records (TXT, CNAME).
4. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add these records to your DNS settings.
5. Wait for the DNS propagation (usually takes 10-30 minutes), then click **Verify** in the Firebase Console.

---

## Step 3: Configure Custom SMTP (For Premium Delivery)
Using custom SMTP (via SendGrid, Resend, Mailgun, or Amazon SES) allows you to send beautiful HTML-styled emails with 100% control over deliverability.
1. Sign up for an email provider (e.g., **Resend** or **SendGrid**).
2. Generate an SMTP credential:
   - **SMTP Server**: e.g., `smtp.resend.com` or `smtp.sendgrid.net`
   - **Port**: Usually `587` (TLS) or `465` (SSL)
   - **Username**: API user or key name
   - **Password**: The API key secret
3. In the Firebase Console, go to **Authentication** > **Templates** > **Password reset**.
4. Scroll down to the **SMTP settings** toggle and switch it to **Enabled**.
5. Input your SMTP Server, Port, Username, and Password.
6. Click **Save**.

---

## Step 4: Test the Flow
1. Open your Clyra app.
2. Go to the login page and click **Forgot password?**.
3. Input your email and request the reset link.
4. Verify that you receive the email from your custom official sender name/address, and that the branding is consistent.
