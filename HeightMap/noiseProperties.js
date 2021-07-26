export class NoiseProperties{
    constructor(scale, maxScale, octaves, persistance, lacunarity, seed, offset){
        this.scale = scale;
        this.maxScale = maxScale;
        this.octaves = octaves;
        this.persistance = persistance;
        this.lacunarity = lacunarity;
        this.seed = seed;
        this.offset = offset;
    }


    get maxScale(){
        return this._maxScale;
    }

    get octaves(){
        return this._octaves;
    }

    get persistance(){
        return this._persistance;
    }

    get lacunarity(){
        return this._lacunarity;
    }

    get seed(){
        return this._seed
    }

    get offset(){
        return this._offset;
    }

    
    set scale(value){
        this._scale = value;
    }
    
    set maxScale(value){
        this._maxScale = value;
    }

    set octaves(value){
        this._octaves = value;
    }

    set persistance(value){
        this._persistance = value;
    }

    set lacunarity(value){
        this._lacunarity = value;
    }

    set seed(value){
        this._seed = value;
    }

    set offset(value){
        this._offset = value;
    }
}