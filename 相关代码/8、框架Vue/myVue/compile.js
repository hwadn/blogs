// 期望输入'#app'
class Compile{
	constructor(vm){
		// MyVue实例
		this.$vm = vm; 
		// 获取html节点
		this.$el = document.querySelector(this.$vm.el);
		// 将html节点转化为dom片段
		let frag = this.node2Fragment(this.$el);
		// 编译frag
		this.compiledFrag(frag);
		// 编译完成，挂载到页面
		this.$el.appendChild(frag);
	}
	// 将节点转化为dom片段
	node2Fragment(node){
		let frag = document.createDocumentFragment();
		let curNode = null;
		// 将node的子节点都转移到frag上
		while(curNode = node.firstChild){
			frag.appendChild(curNode);
		}
		return frag;
	}
	// 编译节点
	compiledFrag(frag){
		let children = frag.childNodes;
		children.forEach(child=>{
			// 是元素节点
			if(child.nodeType == 1){
				// 编译元素
				this.compileElement(child);
				// 递归编译子节点
				if(child.childNodes && child.childNodes.length >0){
					this.compiledFrag(child);
				}
			}
			// 是文本节点
			else if(child.nodeType == 3){
				// 编译文本
				this.compileText(child);
			}
		});
	}
	// 编译元素
	compileElement(elementNode){
		let attrs = elementNode.attributes;
		for(let i=0;i<attrs.length;i++){
			let key = attrs[i].name;
			let value = attrs[i].value;
			// 事件@
			if(key.indexOf('@') == 0){
				let event = key.substring(1);
				this.eventCompile(elementNode, event, value);
			}
			// 表单双向绑定， m-model
			if(key.indexOf('m-model') == 0){
				this.formCompile(elementNode, value);
			}
		}
	}
	//编译事件
	eventCompile(elementNode, event, callbackName){
		let fn = this.$vm.methods[callbackName];
		let callFn = fn.bind(this.$vm);
		elementNode.addEventListener(event, callFn);
	}
	// 编译表单
	formCompile(elementNode, dataKey){
		let vm = this.$vm;
		// view-model。dom更新，数据更新
		elementNode.addEventListener('input', function(event){
			let inputValue = event.target.value;
			vm.data[dataKey] = inputValue;
		});
		// model-view。数据更新，dom更新
		new Watcher(elementNode, vm, dataKey, function(){
			this.node.value = this.$vm.data[this.dataKey];
		});
		elementNode.value = this.$vm.data[dataKey];
	}
	// 编译文本
	compileText(textNode){
		// 有插值就编译
		let text = textNode.textContent;
		if(/\{\{(.*)\}\}/.test(text)){
			//更新文本
			this.textUpdate(textNode, RegExp.$1);
		}
	}
	// 更新文本
	textUpdate(textNode, dataKey){
		new Watcher(textNode, this.$vm, dataKey, function(){
			this.node.textContent = this.$vm.data[this.dataKey];
		});
		// 初始化，触发get
		textNode.textContent = this.$vm.data[dataKey];
	}
}