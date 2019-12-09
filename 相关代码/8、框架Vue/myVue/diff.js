//节点类。children可能是文本
function Element(type, props, children){
	this.type = type;//String
	this.props = props;//Object
	this.children = children || [];//Array
}
//虚拟节点
function createElement(type, props, children){
	return new Element(type, props, children);
}
//转换为真实dom
function render(vnode){
	let el = document.createElement(vnode.type);
	let props = vnode.props;
	for(key in props){
		el.setAttribute(key, props[key]);
	}
	vnode.children.forEach(function(v){
		let childNode;
		//不是文本需要递归
		childNode = (v instanceof Element)?render(v):document.createTextNode(v);
		el.appendChild(childNode);
	});
	return el;
}
//比较虚拟dom
function diff(vnode,newNode){
	const patches = {};
	const index = {count:0};
	dfswalk(vnode, newNode, index, patches);
	return patches;
}
//节点只有2种情况，元素和文本
//vue的diff，只要节点标签类型或属性不一样，那就是节点不一样,就替换；若节点不存在，就删除；否则对比子节点
//react则不是，react的diff中，若节点类型一样则对比属性，属性不同就替换属性
function dfswalk(oldNode, newNode, index, patches){
	//都不存在
	if(!oldNode && !newNode){
		return;
	}
	//旧节点不存在，新节点存在—新增
	else if(!oldNode && newNode){
		patches[index.count] = {type:'append',appendNode:newNode};
	}
	//旧节点存在，新节点不存在—删除
	else if(oldNode && !newNode){
		patches[index.count] = {type:'remove'};
	}
	//都存在——替换
	else if(oldNode && newNode){
		//若是文本
		if(!(oldNode instanceof Element) && !(newNode instanceof Element)){
			if(oldNode != newNode){
				patches[index.count] = {type:'replace', replaceNode:newNode};
			}
		}
		//是节点
		else{
			//不相同，替换
			if(oldNode.type != newNode.type || !isAttr(oldNode.props, newNode.props)){
				patches[index.count] = {type:'replace', replaceNode:newNode};
			}
			//相同，递归
			else{
				childrenDiff(oldNode.children, newNode.children, index, patches);
			}
		}
	}
}
//属性比较，相同就true
function isAttr(oldAttr, newAttr){
	let oldKeys = Object.keys(oldAttr);
	let newKeys = Object.keys(newAttr);
	if(oldKeys.length != newKeys.length)return false;
	for(var i = 0;i<oldKeys.length;i++){
		var key = oldKeys[i];
		//新节点无此属性
		if(newKeys.indexOf(key) == -1){
			return false;
		}
		//有此属性，但属性值不同
		if(oldAttr[key] != newAttr[key]){
			return false;
		}
	}
	return true;
}
//
function childrenDiff(oldChildren, newChildren, index, patches){
	//都不存在
	if(oldChildren.length == 0 && newChildren.length == 0){
		//不存在子节点，退回一步计数
		index.count--;
		return;
	}
	//旧孩子不存在，新孩子存在——新增
	else if(oldChildren.length == 0 && newChildren.length != 0){
		patches[index.count] = {type:'appendChildren',appendChild:newChildren}
	}
	//旧孩子存在，新孩子不存在——删除
	else if(oldChildren.length != 0 && newChildren.length == 0){
		patches[index.count] = {type:'removeChildren'}
	}
	//都存在——改
	else{
		let maxLen = Math.max(oldChildren.length,newChildren.length);
		for(let i=0;i<maxLen;i++){
			//递归遍历子节点
			let oldchild = (i<oldChildren.length) ? oldChildren[i]:undefined;
			let newchild = (i<newChildren.length) ? newChildren[i]:undefined;
			index.count++;
			dfswalk(oldchild,newchild, index, patches);
		}
	}
}