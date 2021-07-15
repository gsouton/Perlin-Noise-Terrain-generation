import {Vector2} from "../../vendors/three.js-r130/build/three.module.js";

function randomGradientVector2(){
    return new Vector2(Math.random(), Math.random());
}

function dotProductGradientandDistanceVector(ix, iy, x, y){
    let gradient = randomGradientVector2();

    // distance vector from corner to a point
    let dx = x - ix;
    let dy = y - iy;

    return gradient.x*dx + gradient.y*dy;
}

function interpolate(p0, p1, t){
    return (p0 - p1) * ((t*(t*6.0 -15.0) + 10.0) * t* t* t)+ p0;
}

export function perlin(x, y){
    // grid cell coordinates
    /**
     *      (x0,y0)------------------(x1, y0)
     *         |                         |
     *         |            (x,y)        |
     *         |                         |
     *         |                         |
     *         |                         |
     *      (x0, y1)-----------------(x1, y1)
     */
    let x0 = Math.round(x);
    let y0 = Math.round(y);
    let x1 = x0 + 1;
    let y1 = y0 + 1;

    // weight for interpolation
    let tx = x - x0;
    let ty = y - y0;
    
    let n0 = dotProductGradientandDistanceVector(x0, y0, x, y);
    let n1 = dotProductGradientandDistanceVector(x1, y0, x, y);
    let interpolation1 = interpolate(n0, n1, tx);

    n0 = dotProductGradientandDistanceVector(x0, y1, x, y);
    n1 = dotProductGradientandDistanceVector(x1, y1, x, y);
    let interpolation2 = interpolate(n0, n1, tx);

    return interpolate(interpolation1, interpolation2, ty)
}