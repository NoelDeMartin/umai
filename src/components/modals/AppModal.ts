export default interface IAppModal<Result = unknown> {
    close(result: Result): void;
}
