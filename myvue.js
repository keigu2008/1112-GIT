import Dep from "./dep.js";
import Sub from "./sub.js";
export default class Vue {
    constructor(options) {
        this.$options = options;
        this.$data = options.data;
        this.deps = [];
        this.observer(this.$data);
        this.compile();
    }

    addDep(dep) {
        this.deps.push(dep);
    }

    removeDep(dep) {
        let index = this.deps.indexOf(dep);
        if (index !== -1) {
            this.deps.splice(index, 1);
            return true;
        }
        return false;
    }
    // 发布主题更新
    public(dep, newValue) {
        this.deps.forEach(depsItem => depsItem == dep && depsItem.notify(dep, newValue));
    }


    observer(data) {
        // console.log(Object.keys(data));
        Object.keys(data).forEach(key => {
            let value = data[key];
            let dep = new Dep(key);
            let self = this;
            this.addDep(dep);
            Object.defineProperty(data, key, {
                configurable: true,
                enumerable: true,
                get() {
                    return value;
                },
                set(newValue) {
                    // console.log("set...", newValue);
                    self.public(dep, newValue);
                    value = newValue;


                }
            })
        });
    }

    compile() {
        let el = document.querySelector(this.$options.el);
        this.compileNodes(el)
    }

    compileNodes(el) {
        let childNodes = el.childNodes;
        // console.log(childNodes);

        childNodes.forEach((node) => {
            switch (node.nodeType) {
                case Node.ELEMENT_NODE:
                    //如果是元素节点，判断是否有v-xxxx，如果有进行双向绑定
                    let attrs = node.attributes;
                    [...attrs].forEach(attr => {
                        switch (true) {
                            case attr.name === "v-model":
                                node.value = this.$data[attr.value];
                                node.addEventListener("input", () => {
                                    this.$data[attr.value] = node.value;
                                    // console.log(this.$data[attr.value]);
                                })
                                break;
                            case attr.name === "v-text":
                                node.innerText = this.$data[attr.value];
                                for (let i = 0; i < this.deps.length; i++) {
                                    let dep = this.deps[i];
                                    if (dep.key === attr.value) {
                                        dep.addSub(new Sub(attr.value, (newValue) => {
                                            node.innerText = newValue;

                                        }));
                                    }
                                }

                                break;
                            case attr.name === "v-html":
                                node.innerHTML = this.$data[attr.value];
                                for (let i = 0; i < this.deps.length; i++) {
                                    let dep = this.deps[i];
                                    if (dep.key === attr.value) {
                                        dep.addSub(new Sub(attr.value, (newValue) => {
                                            node.innerHTML = newValue;

                                        }));
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    })

                    //如果为元素节点，继续递归运行
                    if (node.childNodes.length > 0) {
                        this.compileNodes(node);
                    }
                    break;
                case Node.TEXT_NODE:
                    // console.log("文本节点");
                    let reg = /\{\{\s*(?<vName>[\w|$]+)\s*\}\}/;
                    if (reg.test(node.textContent)) {
                        const PROPERTY_NAME = reg.exec(node.textContent).groups.vName; //message
                        const PROPERTY_VALUE = node.textContent.replace(reg, this.$data[PROPERTY_NAME]); // "测试数据"
                        const FROM_INDEX = PROPERTY_VALUE.indexOf(this.$data[PROPERTY_NAME]);
                        console.log(FROM_INDEX);
                        node.textContent = PROPERTY_VALUE;

                        for (let i = 0; i < this.deps.length; i++) {
                            // console.log(this);
                            let dep = this.deps[i];
                            if (dep.key === PROPERTY_NAME) {
                                dep.addSub(new Sub(PROPERTY_NAME, (newValue) => {
                                    let oldValueLength = this.$data[PROPERTY_NAME].length;
                                    let strArr = node.textContent.split("");
                                    strArr.splice(FROM_INDEX, oldValueLength, newValue);
                                    node.textContent = strArr.join("");
                                }));
                                break;
                            }
                        }
                    }

                    break;
                default:
                    break;
            }
        })
    }
}