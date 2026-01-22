import { Action, Clipboard, Icon, showToast, Toast } from "@raycast/api";
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";
import { Enhet } from "../types";
import { KEYBOARD_SHORTCUTS } from "../constants";
import React from "react";
import { formatNorwegianVatNumber, getBregUrl, getVatRegistrationStatus } from "../utils/entity";

/**
 * Props for the EntityActions component
 */
interface EntityActionsProps {
  /** The entity to display actions for */
  entity: Enhet;
  /** Optional formatted address string */
  addressString?: string;
  /** Callback when view details is clicked */
  onViewDetails: (entity: Enhet) => void;
}

/**
 * EntityActions component provides common actions for any entity
 * including view details, copy to clipboard, and open in browser
 */
function EntityActions({ entity, addressString, onViewDetails }: EntityActionsProps) {
  const bregUrl = getBregUrl(entity.organisasjonsnummer);

  const copyVatNumber = async () => {
    const isVatRegistered = getVatRegistrationStatus(entity);
    if (isVatRegistered !== true) {
      const title = isVatRegistered === false ? "Not VAT Registered" : "VAT Status Unknown";
      const message =
        isVatRegistered === false
          ? `${entity.navn} is not registered for VAT`
          : `VAT registration status for ${entity.navn} is unknown`;
      await showToast({
        style: Toast.Style.Failure,
        title,
        message,
      });
      return;
    }

    const vatNumber = formatNorwegianVatNumber(entity.organisasjonsnummer);
    await Clipboard.copy(vatNumber);
    await showToast({
      style: Toast.Style.Success,
      title: "VAT Number Copied",
      message: vatNumber,
    });
  };

  return (
    <>
      <Action title="View Details" icon={Icon.AppWindowSidebarLeft} onAction={() => onViewDetails(entity)} />
      <Action.CopyToClipboard
        content={entity.organisasjonsnummer}
        title="Copy Organization Number"
        shortcut={KEYBOARD_SHORTCUTS.COPY_ORG_NUMBER}
      />
      <Action
        title="Copy Vat Number"
        icon={Icon.Clipboard}
        onAction={copyVatNumber}
        shortcut={KEYBOARD_SHORTCUTS.COPY_VAT_NUMBER}
      />
      {addressString && (
        <Action.CopyToClipboard
          content={addressString}
          title="Copy Business Address"
          shortcut={KEYBOARD_SHORTCUTS.COPY_ADDRESS}
        />
      )}
      <Action.OpenInBrowser
        shortcut={KEYBOARD_SHORTCUTS.OPEN_IN_BROWSER}
        title="Open in Brønnøysundregistrene"
        url={bregUrl}
      />
      <Action.Push title="Keyboard Shortcuts" target={<KeyboardShortcutsHelp />} />
    </>
  );
}

// Memoize component for better performance
export default React.memo(EntityActions);
