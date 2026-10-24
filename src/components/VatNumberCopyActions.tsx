import { Action, Icon } from "@raycast/api";
import { KEYBOARD_SHORTCUTS } from "../constants";
import { copyVatNumberToClipboard, type NorwegianVatFormat } from "../utils/entity";

interface VatNumberCopyActionsProps {
  orgNumber: string;
  name: string;
  vatStatus: boolean | undefined;
}

/**
 * Shared copy actions for the two Norwegian VAT number formats.
 * Prefixed: `NO{orgnr}MVA`. Unprefixed: `{orgnr}MVA`.
 */
export default function VatNumberCopyActions({ orgNumber, name, vatStatus }: VatNumberCopyActionsProps) {
  const copy = (format: NorwegianVatFormat) => () => copyVatNumberToClipboard(orgNumber, name, vatStatus, { format });

  return (
    <>
      <Action
        title="Copy Vat Number"
        icon={Icon.Clipboard}
        onAction={copy("prefixed")}
        shortcut={KEYBOARD_SHORTCUTS.COPY_VAT_NUMBER}
      />
      <Action
        title="Copy Vat Number Without Prefix"
        icon={Icon.Clipboard}
        onAction={copy("unprefixed")}
        shortcut={KEYBOARD_SHORTCUTS.COPY_VAT_NUMBER_WITHOUT_PREFIX}
      />
    </>
  );
}
