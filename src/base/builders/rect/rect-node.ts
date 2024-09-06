
import { Node, ns, Point, Side } from "../../types";

export class RectNode extends Node {
  box: SVGRectElement = document.createElementNS(ns, 'rect') as SVGRectElement;
  ratio = { h: 0.25, v: 0.1 };
  constructor(public id: number, public left: number, public top: number, public text: string, public color: string, public width: number = 0, public height: number = 30) {
    super(id, left, top, text, color, 'rectangle');
  }

  center(): Point {
    return { X: this.left + this.width / 2, Y: this.top + this.height / 2 };
  }

  sideCenter(side: RectSide): Point {
    let center = this.center(), sign = side.firstSide ? -1 : 1;
    if (side.vertical) return { X: center.X, Y: center.Y + sign * this.height / 2 };
    else return { X: center.X + sign * this.width / 2, Y: center.Y };
  }

  allSides(): Side[] {
    return [new RectSide(true, true), new RectSide(true, false), new RectSide(false, true), new RectSide(false, false)];
  }

  getHeight(): number {
    return this.height;
  }

  side(side: RectSide) {
    return new RectSide(side.vertical, side.firstSide);
  }
}


export class RectSide extends Side {
  constructor(public vertical: boolean, public firstSide: boolean) {
    super();
  }
  equal(s: RectSide): boolean {
    return s.vertical === this.vertical && s.firstSide === this.firstSide;
  }
}
