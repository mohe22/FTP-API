import { JSX } from "react";
import {
  FileIcon,
  ImageIcon,
  PdfIcon,
  ProgrammingIcons,
  ScriptIcon,
  VideoIcon,
} from "./data";

export const FileExtensionIcon = ({
  file_name,
  className,
}: {
  file_name: string;
  className?: string;
}): JSX.Element => {
  const ext = file_name?.split(".").pop();
  
  if (ext) {
    switch (ext) {
      case "py":
        return ProgrammingIcons[ext];
      case "js":
        return ProgrammingIcons[ext];
      case "ts":
        return ProgrammingIcons[ext];
      case "tsx":
        return ProgrammingIcons[ext];
      case "go":
        return ProgrammingIcons[ext];
      case "html":
        return ProgrammingIcons[ext];
      case "css":
        return ProgrammingIcons[ext];
      case "cpp":
        return ProgrammingIcons[ext];
      case "db":
        return ProgrammingIcons[ext];
      case "ps1":
        return ProgrammingIcons[ext];
      case "sh":
        return <ScriptIcon />;
      case "png":
      case "jpg":
      case "jpeg":
        return <ImageIcon className={className} />;
      case "pdf":
        return <PdfIcon />;
      case "mp4":
      case "avi":
      case "mkv":
      case "mov":
      case "wmv":
      case "flv":
      case "webm":
      case "mpeg":
      case "mpg":
      case "3gp":
      case "m4v":
      case "vob":
      case "ogv":
      case "rmvb":
        return <VideoIcon />;
      case "doc":
      case "docx":
        return ProgrammingIcons[ext];
      case "elf":
      case "dll":
      case "exe":
      case "docm":
        return ProgrammingIcons[ext];
      case "json":
        return ProgrammingIcons[ext];
      case "xlsx":
        return ProgrammingIcons[ext];
      default:
        return <FileIcon className={className} />;
    }
  } else {
    return <FileIcon className={className} />;
  }
};
