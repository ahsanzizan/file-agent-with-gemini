export interface FileAction {
  action: string;
  source: string;
  destination: string;
}

export interface CompressAction {
  action: "compress";
  sources: string[];
  destination: string;
}

export type Action = FileAction | CompressAction;
