import { Clipboard, showToast, Toast } from "@raycast/api";
import { getCompanyDetails } from "./brreg-api";
import { formatNorwegianVatNumber } from "./utils/entity";
import { API_CONFIG } from "./constants";

interface Arguments {
  organizationNumber: string;
}

export default async function Command({ arguments: { organizationNumber } }: { arguments: Arguments }) {
  // Normalize organization number (remove whitespace)
  const normalized = organizationNumber.trim().replace(/\s+/g, "");

  // Validate: must be 9 digits
  if (normalized.length !== API_CONFIG.MIN_ORG_NUMBER_LENGTH || !/^\d+$/.test(normalized)) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Invalid Organization Number",
      message: `Organization number must be ${API_CONFIG.MIN_ORG_NUMBER_LENGTH} digits`,
    });
    return;
  }

  try {
    // Fetch company details to check VAT registration status
    const company = await getCompanyDetails(normalized);

    if (!company) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Company Not Found",
        message: `No company found with organization number ${normalized}`,
      });
      return;
    }

    if (company.isVatRegistered !== true) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Not VAT Registered",
        message: `Company ${company.name} is not registered for VAT`,
      });
      return;
    }

    // Format and copy VAT number
    const vatNumber = formatNorwegianVatNumber(normalized);
    await Clipboard.copy(vatNumber);

    await showToast({
      style: Toast.Style.Success,
      title: "VAT Number Copied",
      message: `${vatNumber} copied to clipboard`,
    });
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Error",
      message: error instanceof Error ? error.message : "Failed to copy VAT number",
    });
  }
}
