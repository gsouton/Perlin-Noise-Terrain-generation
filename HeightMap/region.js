export class Region{
    constructor(height, color){
        this.height = height;
        this.color = color;
    }

    get color(){
        return this._color;
    }

    get height(){
        return this._height;
    }

    set color(value){
        this._color = value;
    }

    set height(value){
        this._height = value;
    }
}