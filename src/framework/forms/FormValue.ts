export default abstract class FormValue<Value extends string | number> {

    public readonly value: Value;

    constructor(value: Value) {
        this.value = value;
    }

    public abstract update(newValue: Value): this;

}
