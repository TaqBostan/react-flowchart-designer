import { ns, Point } from './types'
export default class Util {
  static len = (v: number[]) => Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
  static createLabelInput(width: number, height: number, x: number, y: number, text: string | undefined) {
    let f = document.createElementNS(ns, 'foreignObject') as SVGForeignObjectElement;
    let div = document.createElement('div');
    let input = document.createElement('input');
    f.setAttribute("width", `${width}`);
    f.setAttribute("height", `${height}`);
    f.setAttribute("x", x.toString());
    f.setAttribute("y", y.toString());
    div.setAttribute("xmlns", ns);
    if (text) input.value = text;
    input.setAttribute("class", 'lbl-input');
    input.style.width = width + "px";
    div.append(input);
    f.append(div);
    return { foreign: f, input };
  }
  
  static mousePoint(p1: Point, p2: MouseEvent, scale: number, shift?: Point): Point
  {
    return { X: (p2.clientX - p1.X) / scale + (shift?.X || 0), Y: (p2.clientY - p1.Y) / scale + (shift?.Y || 0) }
  }

  static rotate = (pos: Point, center: Point, teta: number): Point => {
    let dx = pos.X - center.X, dy = pos.Y - center.Y;
    return {X: dx * Math.cos(teta) - dy * Math.sin(teta) + center.X, Y: dx * Math.sin(teta) + dy * Math.cos(teta) + center.Y};
  }

  static round(num: number, decimalPlace: number){
    let digit = Math.pow(10,decimalPlace)
    return Math.round((num + Number.EPSILON) * digit) / digit;
  }
}