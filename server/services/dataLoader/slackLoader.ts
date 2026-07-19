const BASE_URL = 'https://lev-boots-slack-api.jona-581.workers.dev/';
const CHANNELS = ['lab-notes', 'engineering', 'offtopic'] as const;

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const DELAY_BETWEEN_REQUESTS_MS = 300;

export interface SlackMessage {
  id: string;
  channel: string;
  user: string;
  role: string;
  ts: string;
  text: string;
  thread_ts: string;
}

interface SlackPageResponse {
  channel: string;
  page: number;
  limit: number;
  total: number;
  items: SlackMessage[];
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status: number): boolean =>
  status === 429 || status >= 500;

const fetchWithRetry = async (url: string): Promise<SlackPageResponse> => {
  let attempt = 0;

  while (true) {
    const response = await fetch(url);
    if (response.ok) {
      return response.json() as Promise<SlackPageResponse>;
    }

    attempt += 1;
    if (!isRetryableStatus(response.status) || attempt > MAX_RETRIES) {
      throw new Error(
        `Slack API request failed: ${response.status} ${response.statusText} (${url})`
      );
    }

    const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
    console.warn(
      `Slack API request failed with status ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`
    );
    await sleep(delay);
  }
};

const fetchChannelMessages = async (
  channel: string
): Promise<SlackMessage[]> => {
  const messages: SlackMessage[] = [];
  let page = 1;

  while (true) {
    const url = `${BASE_URL}?channel=${channel}&page=${page}`;
    const response = await fetchWithRetry(url);

    if (response.items.length === 0) {
      break;
    }

    messages.push(...response.items);
    page += 1;
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }

  return messages;
};

export const fetchAllSlackMessages = async (): Promise<SlackMessage[]> => {
  const messages: SlackMessage[] = [];

  for (const channel of CHANNELS) {
    const channelMessages = await fetchChannelMessages(channel);
    console.log(`Fetched ${channelMessages.length} messages from #${channel}`);
    messages.push(...channelMessages);
  }

  return messages;
};
