export enum Step {
    Back,
    Next,
}

export interface BaseTabContentProps {
    title: string;
    style?: object;
    onStep?: (step: Step) => void;
}
