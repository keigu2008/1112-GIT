import Sub from "./sub.js";
export default class Dep {
    constructor(key) {
        this.key = key;
        this.subs = [];
    }

    addSub(sub) {
        this.subs.push(sub);
        return this;
    }
    notify(dep, newValue) {
        this.subs.forEach(subItem => {
            subItem.update(newValue)
        })
    }



}