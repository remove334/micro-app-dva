import { create } from "dva-core";
import { mergeObject } from "./tool";
let initModel;
(function () {
    if (!initModel) { // 保持唯一的全局model 多次调用injectModel 统一放到一起
        initModel = create();
        initModel.start();
    }
})();
function getGlobalStore() {
    return initModel._store;
}
function testMapState(mapState) {
    if (typeof mapState !== "function") {
        console.warn("推荐传入mapstate 函数控制数据提高性能 否则将会拿到全部的model的state");
        mapState = function (state) { return state; };
    }
    return mapState;
}
function connectPage(mapState) {
    mapState = testMapState(mapState);
    return function (options) {
        let _onLoad = options.onLoad || function () { };
        let _onUnload = options.onUnload || function () { };
        options.data = options.data || {};
        let unmountSubscribe;
        let globalStore = getGlobalStore();
        if (globalStore) {
            mergeObject(options.data, mapState.call({}, globalStore.getState()));
        }
        //注入dispatch
        options.dispatch = globalStore.dispatch;
        options.onLoad = function () {
            let _self = this;
            let arg = Array.from(arguments);
            unmountSubscribe = globalStore.subscribe(function (e) {
                _self.setData(mergeObject(_self.data, mapState.call({}, globalStore.getState())));
            });
            _onLoad.apply(_self, arg);
        };
        options.onUnload = function () {
            unmountSubscribe();
            let _self = this;
            let arg = Array.from(arguments);
            _onUnload.apply(_self, arg);
        };
        return options;
    };
}
function connectComponent(mapState) {
    mapState = testMapState(mapState);
    return function (options) {
        let _didMount = options.didMount || function () { };
        let _didUnmount = options.didUnmount || function () { };
        options.data = options.data || {};
        let unmountSubscribe;
        let globalStore = getGlobalStore();
        if (globalStore) {
            mergeObject(options.data, mapState.call({}, globalStore.getState()));
        }
        //注入dispatch
        options.didMount = function () {
            let _self = this;
            let arg = Array.from(arguments);
            _self.dispatch = globalStore.dispatch;
            unmountSubscribe = globalStore.subscribe(function (e) {
                _self.setData(mergeObject(_self.data, mapState.call({}, globalStore.getState())));
            });
            _didMount.apply(_self, arg);
        };
        options.onUnload = function () {
            unmountSubscribe();
            let _self = this;
            let arg = Array.from(arguments);
            _didUnmount.apply(_self, arg);
        };
        return options;
    };
}
function injectModel(...rest) {
    rest.flat(Infinity).forEach((model) => initModel.model(model));
    initModel.start();
}
export { connectPage, connectComponent, injectModel };
