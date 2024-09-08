
import { Node, ns, Point, Side } from "../../types";

export class HexaNode extends Node {
  box: SVGPolygonElement = document.createElementNS(ns, 'polygon') as SVGPolygonElement;
  ratio = { h: 0.25, v: 0 };
  constructor(public id: number, public left: number, public top: number, public text: string, public color: string, public diameter: number = 0, public height: number = 30) {
    super(id, left, top, text, color, 'hexagon');
  }

  center(): Point {
    return { X: this.left + this.diameter / 2, Y: this.top + this.height / 2 };
  }

  sideCenter(side: HexaSide): Point {
    let center = this.center(), sign = side.firstSide ? -1 : 1;
    if (side.vertical) return { X: center.X, Y: center.Y + sign * this.height / 2 };
    else return { X: center.X + sign * this.diameter / 2, Y: center.Y };
  }

  allSides(): Side[] {
    return [new HexaSide(true, true), new HexaSide(true, false), new HexaSide(false, true), new HexaSide(false, false)];
  }

  getHeight(): number {
    return this.height;
  }

  side(side: HexaSide) {
    return new HexaSide(side.vertical, side.firstSide);
  }
}

export class HexaSide extends Side {
  constructor(public vertical: boolean, public firstSide: boolean) {
    super();
  }
  equal(s: HexaSide): boolean {
    return s.vertical === this.vertical && s.firstSide === this.firstSide;
  }
}