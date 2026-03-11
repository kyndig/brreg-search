import { List, ActionPanel, Action, useNavigation } from "@raycast/api";
import { formatShortcut, KEYBOARD_SHORTCUTS } from "../constants";

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    action: string;
    shortcut: string;
    description: string;
  }>;
}

const SHORTCUT_TEXT = {
  OPEN_IN_BROWSER: formatShortcut(KEYBOARD_SHORTCUTS.OPEN_IN_BROWSER),
  ADD_TO_FAVORITES: formatShortcut(KEYBOARD_SHORTCUTS.ADD_TO_FAVORITES),
  REMOVE_FROM_FAVORITES: formatShortcut(KEYBOARD_SHORTCUTS.REMOVE_FROM_FAVORITES),
  TOGGLE_MOVE_MODE: formatShortcut(KEYBOARD_SHORTCUTS.TOGGLE_MOVE_MODE),
  MOVE_UP: formatShortcut(KEYBOARD_SHORTCUTS.MOVE_UP),
  MOVE_DOWN: formatShortcut(KEYBOARD_SHORTCUTS.MOVE_DOWN),
  COPY_ORG_NUMBER: formatShortcut(KEYBOARD_SHORTCUTS.COPY_ORG_NUMBER),
  COPY_VAT_NUMBER: formatShortcut(KEYBOARD_SHORTCUTS.COPY_VAT_NUMBER),
  COPY_ADDRESS: formatShortcut(KEYBOARD_SHORTCUTS.COPY_ADDRESS),
  COPY_REVENUE: formatShortcut(KEYBOARD_SHORTCUTS.COPY_REVENUE),
  COPY_NET_RESULT: formatShortcut(KEYBOARD_SHORTCUTS.COPY_NET_RESULT),
} as const;

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Search & Navigation",
    shortcuts: [
      {
        action: "Search",
        shortcut: "Type to search",
        description: "Search by company name or organization number",
      },
      {
        action: "View Details",
        shortcut: "Enter",
        description: "View detailed company information",
      },
      {
        action: "Open in Browser",
        shortcut: SHORTCUT_TEXT.OPEN_IN_BROWSER,
        description: "Open company in Brønnøysundregistrene",
      },
    ],
  },
  {
    title: "Favorites Management",
    shortcuts: [
      {
        action: "⭐ Add to Favorites",
        shortcut: SHORTCUT_TEXT.ADD_TO_FAVORITES,
        description: "Add company to favorites",
      },
      {
        action: "Remove from Favorites",
        shortcut: SHORTCUT_TEXT.REMOVE_FROM_FAVORITES,
        description: "Remove company from favorites",
      },
      {
        action: "Toggle Move Mode",
        shortcut: SHORTCUT_TEXT.TOGGLE_MOVE_MODE,
        description: "Enable/disable favorites reordering",
      },
    ],
  },
  {
    title: "Favorites Reordering",
    shortcuts: [
      {
        action: "Move Up",
        shortcut: SHORTCUT_TEXT.MOVE_UP,
        description: "Move favorite up in the list",
      },
      {
        action: "Move Down",
        shortcut: SHORTCUT_TEXT.MOVE_DOWN,
        description: "Move favorite down in the list",
      },
    ],
  },
  {
    title: "Copy Actions",
    shortcuts: [
      {
        action: "Copy Organization Number",
        shortcut: SHORTCUT_TEXT.COPY_ORG_NUMBER,
        description: "Copy organization number to clipboard",
      },
      {
        action: "Copy Vat Number",
        shortcut: SHORTCUT_TEXT.COPY_VAT_NUMBER,
        description: "Copy Norwegian VAT number (NO {orgnr} MVA) to clipboard",
      },
      {
        action: "Copy Address",
        shortcut: SHORTCUT_TEXT.COPY_ADDRESS,
        description: "Copy business address to clipboard",
      },
      {
        action: "Copy Revenue",
        shortcut: SHORTCUT_TEXT.COPY_REVENUE,
        description: "Copy revenue to clipboard",
      },
      {
        action: "Copy Net Result",
        shortcut: SHORTCUT_TEXT.COPY_NET_RESULT,
        description: "Copy net result to clipboard",
      },
    ],
  },
  {
    title: "Emoji Management",
    shortcuts: [
      {
        action: "Set Emoji",
        shortcut: "No shortcut",
        description: "Set custom emoji for company",
      },
      {
        action: "Reset to Favicon",
        shortcut: "No shortcut",
        description: "Reset to default favicon",
      },
      {
        action: "Refresh Favicon",
        shortcut: "No shortcut",
        description: "Refresh company favicon",
      },
    ],
  },
];

export default function KeyboardShortcutsHelp() {
  const { pop } = useNavigation();

  return (
    <List
      actions={
        <ActionPanel>
          <Action title="Back" onAction={pop} />
        </ActionPanel>
      }
    >
      {SHORTCUT_GROUPS.map((group) => (
        <List.Section key={group.title} title={group.title}>
          {group.shortcuts.map((shortcut) => (
            <List.Item
              key={shortcut.action}
              title={shortcut.action}
              subtitle={shortcut.description}
              accessories={[{ text: shortcut.shortcut }]}
              icon="⌨️"
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
