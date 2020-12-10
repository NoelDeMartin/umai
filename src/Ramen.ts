type Listener = () => void;

class Ramen {

    private listeners: Listener[] = [];

    isItAvailable(): boolean {
        return false;
    }

    public letMeKnowWhenItIsAvailable(listener: Listener): void {
        this.listeners.push(listener);
    }

}

export default new Ramen();
