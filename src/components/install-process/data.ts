export enum Step {
    Back,
    Next,
}

export interface BaseTabContentProps {
    title: string;
    display?: boolean; // 是否展示
    style?: object;
    onStep?: (step: Step) => void;
}

export enum Direction {
    Row, // 水平排列
    Column, // 垂直排列
}

export enum ReadWriteType {
    Read,
    Write,
}

export const configSettingWidth = 370; // 设置项的宽度（Input、Select等）
