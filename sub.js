export default class Sub {
    constructor(key, callbackFunc) {
        this.key = key;
        this.callbackFunc = callbackFunc;
    }
    update(newValue) {
        //同步视图
        this.callbackFunc(newValue);
    }

}