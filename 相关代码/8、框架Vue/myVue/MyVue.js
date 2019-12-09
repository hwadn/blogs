//预期：new MyVue({data:...})
class MyVue{
	constructor(options){
		//html选择器
		this.el = options.el;
		// 数据
		this.data = options.data;
		// 数据
		this.methods = options.methods;
		// 对data做响应式
		this.observe(this.data);
		// 编译
		new Compile(this);
	}
	//遍历data，对data里的属性定义响应式
	observe(dataObj){
		if(dataObj == null)return;
		Object.keys(dataObj).forEach(key=>{
			this.defineReactive(dataObj, key, dataObj[key]);
		});
	}
	//定义响应式
	defineReactive(obj, key, value){
		let dep = new Dep();
		//如果value还是对象，做递归定义
		if(value instanceof Object)this.observe(value);
		Object.defineProperty(obj, key, {
			get(){
				// 若存在就收集
				Dep.target && dep.append(dep.target);
				// 收集之后就处理，等下一个
				Dep.target = null;
				return value;
			},
			set(newValue){
				//相同就不用修改
				if(newValue === value)return;
				value = newValue;
				// 修改就通知更新
				dep.notify();
			}
		});
	}
}
// 观察者类
class Watcher{
	constructor(node, vm, dataKey,callback){
		this.node = node;
		this.$vm = vm;
		this.dataKey = dataKey;
		this.callback = callback;
		// 暂存新建的观察者
		Dep.target = this;
	}
	// 更新
	update(){
		this.callback.call(this);
	}
}
//依赖类
class Dep{
	constructor(){
		this.deps = [];
	}
	// 收集
	append(){
		this.deps.push(Dep.target);
	}
	// 通知更新
	notify(){
		this.deps.forEach(watcher=>{
			watcher.update();
		});
	}
}