import React from "react";
import { FileCodeIcon, FileCogIcon, FileIcon, FileImageIcon, FileMusicIcon, FileTerminalIcon, FileTextIcon, FileVideo2Icon, FolderArchiveIcon, FolderIcon, ImageIcon, Music2Icon, VideoIcon } from "lucide-react";
import { cvt } from "../../../util/styler";

const ItemIcon = ({ file }: { file: FileInfo }) => {
    return file.isDirectory ? <FolderIcon stroke={cvt("folder")} size={32} /> :
    file.name.endsWith('.jpg') || file.name.endsWith('.png') || file.name.endsWith('.jpeg') ||
    file.name.endsWith('.gif') || file.name.endsWith('.webp') || file.name.endsWith('.svg')
    ? <FileImageIcon stroke={cvt("picture")} size={32} /> :
    file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.name.endsWith('.mov') ||
    file.name.endsWith('.avi') || file.name.endsWith('.mkv') || file.name.endsWith('.m4v') ||
    file.name.endsWith('.wmv') || file.name.endsWith('.mpg') || file.name.endsWith('.mpeg')
    ? <FileVideo2Icon stroke={cvt("video")} size={32} /> :
    file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.flac') ||
    file.name.endsWith('.m4a') || file.name.endsWith('.aac') || file.name.endsWith('.ogg') ||
    file.name.endsWith('.wma') || file.name.endsWith('.aiff') || file.name.endsWith('.alac')
    ? <FileMusicIcon stroke={cvt("audio")} size={32} /> :
    file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx') ||
    file.name.endsWith('.xls') || file.name.endsWith('.xlsx') || file.name.endsWith('.ppt') ||
    file.name.endsWith('.pptx') || file.name.endsWith('.txt') || file.name.endsWith('.rtf') ||
    file.name.endsWith('.md') || file.name.endsWith('.xml')
    ? <FileTextIcon stroke={cvt("pdf")} size={32} /> :
    file.name.endsWith('.zip') || file.name.endsWith('.rar') || file.name.endsWith('.7z') ||
    file.name.endsWith('.tar') || file.name.endsWith('.gz') || file.name.endsWith('.bz2') ||
    file.name.endsWith('.xz') || file.name.endsWith('.lz') || file.name.endsWith('.lzma')
    ? <FolderArchiveIcon stroke={cvt("zip")} size={32} /> :
    file.name.endsWith('.sh') || file.name.endsWith('.bat') || file.name.endsWith('.cmd')
    ? <FileTerminalIcon stroke={cvt("file")} size={32} /> :
    file.name.endsWith('.config') || file.name.endsWith('.yaml') || file.name.endsWith('.yml') ||
    file.name.endsWith('.toml') || file.name.endsWith('.ini') || file.name.endsWith('.cfg') ||
    file.name.endsWith('.conf') || file.name.endsWith('.env') || file.name.endsWith('.properties')
    ? <FileCogIcon stroke={cvt("file")} size={32} /> :
    file.name.endsWith('.json') || file.name.endsWith('.js') || file.name.endsWith('.ts') ||
    file.name.endsWith('.jsx') || file.name.endsWith('.tsx') || file.name.endsWith('.html') ||
    file.name.endsWith('.css') || file.name.endsWith('.scss') || file.name.endsWith('.less') ||
    file.name.endsWith('.styl') || file.name.endsWith('.php') || file.name.endsWith('.java') ||
    file.name.endsWith('.py') || file.name.endsWith('.rb') || file.name.endsWith('.go') ||
    file.name.endsWith('.c') || file.name.endsWith('.cpp') || file.name.endsWith('.h') ||
    file.name.endsWith('.hpp') || file.name.endsWith('.cs') || file.name.endsWith('.swift') ||
    file.name.endsWith('.kt') || file.name.endsWith('.rs') || file.name.endsWith('.pl') ||
    file.name.endsWith('.sql') || file.name.endsWith('.sh') || file.name.endsWith('.vbs')
    ? <FileCodeIcon stroke={cvt("code")} size={32} /> :
    <FileIcon stroke={cvt("file")} size={32} />
}

export default ItemIcon;