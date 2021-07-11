export class MinMaxGUIHelper {
	constructor(obj, minProp, maxProp, minDiff) {
		this.obj = obj;
		this.minProp = minProp;
		this.maxProp = maxProp;
		this.minDiff = minDiff;
	}
    get min(){
        return this.obj[this.minProp];
    }
    set min(v){
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDiff);
    }
    get max(){
        return this.obj[this.maxProp];
    }
    set max(v){
        this.obk[this.maxProp] = v;
        this.min = this.min; // this call the min setter
    }
}
