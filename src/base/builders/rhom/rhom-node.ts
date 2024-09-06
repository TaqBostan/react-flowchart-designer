
import { Node, ns, Point, Side } from "../../types";

export class RhomNode extends Node {
  box: SVGPolygonElement = document.createElementNS(ns, 'polygon') as SVGPolygonElement;
  ratio = { h: 0.25, v: 0 };
  constructor(public id: number, public left: number, public top: number, public text: string, public color: string, public diameter: number = 0) {
    super(id, left, top, text, color, 'rhombus');
  }

  center(): Point {
    return { X: this.left + this.diameter / 2, Y: this.top + this.diameter / 2 };
  }

  sideCenter(side: RhomSide): Point {
    let center = this.center(), sign = side.firstSide ? -1 : 1;
    if (side.vertical) return { X: center.X, Y: center.Y + sign * this.diameter / 2 };
    else return { X: center.X + sign * this.diameter / 2, Y: center.Y };
  }

  allSides(): Side[] {
    return [new RhomSide(true, true), new RhomSide(true, false), new RhomSide(false, true), new RhomSide(false, false)];
  }

  getHeight(): number {
    return this.diameter;
  }

  side(side: RhomSide) {
    return new RhomSide(side.vertical, side.firstSide);
  }
}

export class RhomSide extends Side {
  constructor(public vertical: boolean, public firstSide: boolean) {
    super();
  }
  equal(s: RhomSide): boolean {
    return s.vertical === this.vertical && s.firstSide === this.firstSide;
  }
}