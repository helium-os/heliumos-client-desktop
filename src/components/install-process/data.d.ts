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
