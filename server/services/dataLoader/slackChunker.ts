import { SlackMessage } from './slackLoader';

const WINDOW_SIZE = 10;
const OVERLAP = 2;
const SLACK_MAX_CHUNK_WORDS = 400;

const wordCount = (text: string): number =>
  text.split(/\s+/).filter(Boolean).length;

const groupByThread = (
  messages: SlackMessage[]
): Map<string, SlackMessage[]> => {
  const groups = new Map<string, SlackMessage[]>();

  for (const message of messages) {
    const group = groups.get(message.thread_ts);
    if (group) {
      group.push(message);
    } else {
      groups.set(message.thread_ts, [message]);
    }
  }

  return groups;
};

const buildWindows = (sorted: SlackMessage[]): SlackMessage[][] => {
  const windows: SlackMessage[][] = [];
  let i = 0;

  while (i < sorted.length) {
    const window: SlackMessage[] = [];
    let words = 0;
    let j = i;

    while (j < sorted.length && window.length < WINDOW_SIZE) {
      const msgWords = wordCount(sorted[j].text);
      if (window.length > 0 && words + msgWords > SLACK_MAX_CHUNK_WORDS) {
        break;
      }
      window.push(sorted[j]);
      words += msgWords;
      j++;
    }

    windows.push(window);
    if (j >= sorted.length) break;

    // Guarantee progress even if the word-count guard cut the window down
    // to fewer messages than the overlap size.
    i = Math.max(i + 1, j - OVERLAP);
  }

  return windows;
};

const formatMessageLine = (message: SlackMessage): string =>
  `[${message.ts}] #${message.channel} ${message.user} (${message.role}): ${message.text}`;

const formatWindow = (
  threadId: string,
  openingMessage: SlackMessage,
  window: SlackMessage[]
): string => {
  const openingInWindow = window.some((m) => m.id === openingMessage.id);
  const header = `Slack thread ${threadId} (opened in #${openingMessage.channel})`;
  const messageLines = window.map(formatMessageLine).join('\n');

  if (openingInWindow) {
    return `${header}\n\n[Messages]\n${messageLines}`;
  }

  return `${header}\n\n[Thread opening message]\n${formatMessageLine(openingMessage)}\n\n[Messages]\n${messageLines}`;
};

export const groupAndWindowMessages = (
  messages: SlackMessage[]
): Map<string, string[]> => {
  const threadGroups = groupByThread(messages);
  const result = new Map<string, string[]>();

  for (const [threadId, group] of threadGroups) {
    const sorted = [...group].sort(
      (a, b) => Date.parse(a.ts) - Date.parse(b.ts)
    );

    const openingMessage =
      sorted.find((m) => m.id === threadId) ?? sorted[0];

    const windows = buildWindows(sorted);
    const chunks = windows.map((window) =>
      formatWindow(threadId, openingMessage, window)
    );

    result.set(threadId, chunks);
  }

  return result;
};
