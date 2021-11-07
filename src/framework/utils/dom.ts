export function hasAncestor(element: HTMLElement | null, selector: string): boolean {
    while (element) {
        if (element.matches(selector)) {
            return true;
        }

        element = element.parentElement;
    }

    return false;
}
