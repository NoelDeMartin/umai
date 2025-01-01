export function setFrameInterval(callback: () => unknown): () => void {
    let running = true;

    function renderFrame() {
        callback();

        running && requestAnimationFrame(renderFrame);
    }

    requestAnimationFrame(renderFrame);

    return () => running = false;
}
