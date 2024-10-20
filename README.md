# Chula Software Renewal Automation

This project helps Chula students automate the renewal process for borrowed software like Adobe CC, Zoom, and Foxit PDF Reader.  It uses Firebase Cloud Functions (v2) to schedule automatic renewals, preventing interruptions and the frustration of expired licenses.

## Problem

Chulalongkorn University provides various software benefits for students, including Adobe CC, Zoom, and Foxit PDF Reader. These licenses have expiration dates and require manual renewal.  Often, students need to use the software urgently only to find out the license has expired. Remembering to renew these licenses can be a hassle.

## Solution

This project leverages Firebase Cloud Functions (v2) to schedule a function that automatically re-borrows the software before it expires. This eliminates the need for manual renewal and ensures uninterrupted access to these essential tools.

## Features

* **Automated Renewal:** Scheduled Firebase Cloud Functions automatically renew specified software licenses.
* **Support for Multiple Software:** Currently supports Adobe CC, Zoom, and Foxit PDF Reader.  More software can be added with minor modifications.
* **Easy Setup:**  Clear instructions and scripts are provided to simplify the setup process.
* **Open Source:** Contribute to the project and improve it for everyone!

## Prerequisites

* **Chulalongkorn University Account:**  You must have a valid Chula account to access and borrow the software.
* **Firebase Account:** You will need a Firebase project to deploy the Cloud Function.
* **Node.js and npm (or yarn):** Required for local development and deployment.

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone hhttps://github.com/ratchanonp/chula-licence-auto-renewal.git
   ```

2. **Install Dependencies:**

   ```bash
   cd chula-licence-auto-renewal
   npm install

   cd functions
   npm install
   ```

3. **Configure Firebase:**
   * Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/). Firebase project have to use blaze plan!
   * Initialize Firebase in your project directory:

     ```bash
     firebase init functions
     ```

   * Select the Firebase project you created.
   * Choose TypeScript for the language.
   * Install the Firebase CLI tools if prompted.

4. **Set up Environment Variables:**
   * Create a `.env` file in the `functions` directory.
   * Add the following environment variables, replacing the placeholders with your actual credentials and desired settings:

     ```
     STUDENT_EMAIL = <your_student_id>@chula.ac.th
     STUDENT_PASSWORD = <your-cunet-password>
     AZURE_USER_ID = <your-azure-AD-id>
     ```

     * You can find `your-azure-AD-id` in [Borrow Page](https://licenseportal.it.chula.ac.th/Home/Borrow). Use Inspection tools or press `F12` and find for `AzureUserId` you will found a HTML tag look like this

        ```HTML
        <input id="AzureUserId" name="AzureUserId" type="hidden" value="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx">
        ```

        Your azure user id is the value in double quote `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx`
     * **Important:** Securely store your Chula credentials.  Consider using a secrets management service for production environments.

5. **Deploy the Cloud Function:**

   ```bash
   firebase deploy --only functions
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any suggestions, bug fixes, or new features to add.

## Disclaimer

This project is not affiliated with Chulalongkorn University. Use it at your own risk.  Ensure you comply with Chula's terms of service for software usage.
