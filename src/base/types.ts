export const ns = "http://www.w3.org/2000/svg";
export abstract class Node {
  group: SVGGElement = document.createElementNS(ns, 'g') as SVGGElement;
  label: SVGTextElement = document.createElementNS(ns, 'text') as SVGTextElement;
  source: SVGRectElement = document.createElementNS(ns, 'rect') as SVGRectElement;
  abstract box: SVGElement;
  abstract ratio: { h: number, v: number };
  pointer?: SVGPathElement;
  connectors: Connector[] = [];
  selected = false;
  abstract center(): Point;
  abstract allSides(): Side[];
  abstract getHeight(): number;
  abstract side(side: Side): Side;

  constructor(public id: number, public left: number, public top: number, public text: string, public color: string, public shape: string) {
  }

  arrangeSides() {
    this.allSides().forEach(s => this.arrangeSide(s));
  }

  setHorizon(conn: Connector, origin: Point, dest: Point) { }

  updatePoints(p: Point, hrz: Horizon, c2: Point, hrz2: Horizon) { }

  arrangeSide(side: Side) { }

  connSide(hrz: Horizon, node2: Node): Side { throw Error(); }

  setPoint(conn: Connector, hrzP: Point): void { throw Error(); }

  setRatio(conn: Connector): void { throw Error(); }

  grouping() {
    this.group.append(this.box);
    this.box.after(this.label);
    this.label.after(this.source);
  }

  move(left: number, top: number) {
    this.top = top;
    this.left = left;
    this.group.setAttribute('transform', `translate(${left},${top})`);
  }

  labelY(h: number, middle: boolean = true): number {
    return (this.getHeight() / 2 + (middle ? 1 : -1) * h / 2 - 3.5);
  }
}

export abstract class Side {
  abstract equal(s: Side): boolean;
}

export type NodeData = { id?: number, X: number, Y: number, text: string, color?: string, shape?: string }

export type Horizon = { point?: Point, ratioH: number, ratioV: number, elem?: SVGRectElement, fakeP?: Point }

export type Connector = {
  id: number,
  group: SVGGElement,
  path: SVGPathElement,
  label: { g: SVGGElement, box: SVGRectElement, size: Point, text?: string, elem: SVGTextElement } | undefined,
  arrow?: SVGPathElement,
  nextNode: Node,
  point?: Point,
  horizon: Horizon,
  slope: number,
  side: Side,
  fixSide?: Side,
  self: boolean,
  toDest: boolean,
  type: string,
  selected: boolean,
  pairConn?: Connector
}

export type LinkData = { id?: number, from: number, to: number, text?: string, type?: string, meta?: MetaData }

export type MetaData = { ratioS?: number[], ratioD?: number[], sideS?: Side, sideD?: Side }

export type Point = { X: number, Y: number }

export type StaticData = { scale: number }