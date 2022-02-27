export interface BaseInputListItemData {
    id: string;
    value: string;
}

export default interface IBaseInputListItem {
    focus(): void;
    playLeaveAnimation(): Promise<void>;
}
