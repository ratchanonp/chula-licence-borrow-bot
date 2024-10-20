import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/scheduler";
import fetch, { Headers, RequestInit } from "node-fetch";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineSecret } = require("firebase-functions/params");


const studentEmail = defineSecret("STUDENT_EMAIL");
const studentPassword = defineSecret("STUDENT_PASSWORD");
const azureUserID = defineSecret("AZURE_USER_ID");


/**
 * Program License ID from licenseportal.it.chula.ac.th borrow page.
 * - Zoom: 2
 * - AdobeCC: 5
 * - Foxit: 7
 */
enum ProgramLicenseID {
  Zoom = 2,
  AdobeCC = 5,
  Foxit = 7,
}

/**
 * The longest duration that each program can be borrowed in days.
 * - Zoom: 120 days
 * - AdobeCC: 7 days
 * - Foxit: 7 days
 */
const longestBorrowDuration = {
  [ProgramLicenseID.Zoom]: 120,
  [ProgramLicenseID.AdobeCC]: 7,
  [ProgramLicenseID.Foxit]: 7,
};

/**
 * Schedules a cron job to borrow an Adobe license every Sunday at midnight.
 * 
 * This function logs into the Chula License Portal, attempts to borrow an Adobe Creative Cloud license,
 * and logs the result of the operation.
 * 
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export const borrowAdobe = onSchedule("0 0 * * 0", async () => {
  logger.info("Borrowing Adobe license...");

  const cookie = await loginChulaLicensePortal();
  if (cookie === null) {
    logger.error("Login failed");
    return;
  }

  const success = await borrowLicense(cookie, ProgramLicenseID.AdobeCC);
  if (!success) {
    logger.error("Borrow failed");
    return;
  }

  logger.info("Borrowed Adobe license successfully");

  return;
});

/**
 * Schedules a cron job to borrow a Zoom license every 4 months on the 1st day at midnight.
 * 
  * This function logs into the Chula License Portal, attempts to borrow a Zoom license,
 * 
 * @returns {Promise<void>} A promise that resolves when the function completes.
 */
export const borrowZoom = onSchedule("0 0 1 */4 *", async () => {
  logger.info("Borrowing Zoom license...");

  const cookie = await loginChulaLicensePortal();
  if (cookie === null) {
    logger.error("Login failed");
    return;
  }

  const success = await borrowLicense(cookie, ProgramLicenseID.Zoom);
  if (!success) {
    logger.error("Borrow failed");
    return;
  }

  logger.info("Borrowed Zoom license successfully");

  return;
});

export const loginChulaLicensePortal = async (): Promise<string[] | null> => {
  if (!studentEmail.value()) {
    logger.error("Student email is not set"); return null;
  }
  if (!studentPassword.value()) {
    logger.error("Student password is not set"); return null;
  }

  const loginURL = "https://licenseportal.it.chula.ac.th/";

  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const encodedPayload = new URLSearchParams();
  encodedPayload.append("UserName", studentEmail.value());
  encodedPayload.append("Password", studentPassword.value());

  const requestOptions: RequestInit = {
    method: "POST",
    headers: headers,
    body: encodedPayload.toString(),
    redirect: "manual",
  };

  try {
    logger.info("Logging in: ", studentEmail.value());
    logger.debug("Payload: ", encodedPayload.toString());

    const response = await fetch(loginURL, requestOptions);

    if (response.status !== 302) {
      logger.error("Login failed: ", response.status);
      return null;
    }

    const cookies = response.headers.raw()["set-cookie"];
    logger.debug("Cookies: ", cookies.join(", "));

    return cookies;
  } catch (error) {
    logger.error("Something went wrong");
  }

  return null;
};

export const borrowLicense = async (cookie: string[], programID: ProgramLicenseID): Promise<boolean> => {
  if (!azureUserID.value()) {
    logger.error("Azure user ID is not set"); return false;
  }
  if (!studentEmail.value()) {
    logger.error("Student email is not set"); return false;
  }

  const borrowURL = "https://licenseportal.it.chula.ac.th/Home/Borrow";

  const borrowDate = new Date();
  const expiryDate = new Date(borrowDate);

  const duration = longestBorrowDuration[programID];
  expiryDate.setDate(expiryDate.getDate() + duration);

  const borrowDateStr = `${borrowDate.getDate()}/${borrowDate.getMonth() + 1}/${borrowDate.getFullYear()}`;
  const expiryDateStr = `${expiryDate.getDate()}/${expiryDate.getMonth() + 1}/${expiryDate.getFullYear()}`;

  const encodedPayload = new URLSearchParams();
  encodedPayload.append("AzureUserId", azureUserID.value());
  encodedPayload.append("UserPrincipalName", studentEmail.value());
  encodedPayload.append("BorrowStatus", "Borrowing");
  encodedPayload.append("ProgramLicenseID", programID.toString());
  encodedPayload.append("BorrowDateStr", borrowDateStr);
  encodedPayload.append("ExpiryDateStr", expiryDateStr);
  encodedPayload.append("Domain", "student.chula.ac.th");


  const header = new Headers();
  header.append("Content-Type", "application/x-www-form-urlencoded");
  header.append("Cookie", cookie.join("; "));

  const requestOptions: RequestInit = {
    method: "POST",
    headers: header,
    body: encodedPayload.toString(),
    redirect: "manual",
  };

  try {
    logger.info("Borrowing...");
    logger.debug("Payload: ", encodedPayload.toString());

    const response = await fetch(borrowURL, requestOptions);

    if (response.status !== 302) {
      logger.error("Borrow failed: ", response.status);
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Borrow failed: ", error);
  }

  return false;
};
