type FileActionType = "move" | "copy" | "delete" | "rename";
type ActionType = FileActionType | "compress";

interface BaseAction<T extends ActionType> {
  action: T;
}

interface FileAction extends BaseAction<FileActionType> {
  source: string;
  destination: string;
}

export interface CompressAction extends BaseAction<"compress"> {
  sources: string[];
  destination: string;
}

export type Action = FileAction | CompressAction;
