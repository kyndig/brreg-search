import { Detail, ActionPanel, Action, useNavigation } from "@raycast/api";
import { WELCOME_MARKDOWN } from "../constants";

export default function SettingsView() {
  const { pop } = useNavigation();

  return (
    <Detail
      markdown={WELCOME_MARKDOWN}
      actions={
        <ActionPanel>
          <Action title="Back" onAction={pop} />
        </ActionPanel>
      }
    />
  );
}
