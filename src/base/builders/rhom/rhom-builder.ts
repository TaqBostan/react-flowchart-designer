import NodeBuilder from "../../node-builder";
import { Connector, Horizon, Point, Side, Node } from "../../types";
import Util from "../../util";
import { RhomNode, RhomSide } from "./rhom-node";
export default class RhomBuilder extends NodeBuilder<RhomNode> {
  ofType<T>(node: T): boolean {
    return node instanceof RhomNode;
  }
  nodeProto(): void {
    let builder = this
    RhomNode.prototype.setHorizon = function (...params) { builder.setHorizon.apply(this, params) }
    RhomNode.prototype.updatePoints = function (...params) { builder.updatePoints.apply(this, params) }
    RhomNode.prototype.arrangeSide = function (...params) { builder.arrangeSide.apply(this, params) }
    RhomNode.prototype.connSide = function (...params) { return builder.connSide.apply(this, [...params, builder]) }
    RhomNode.prototype.setPoint = function (...params) { builder.setPoint.apply(this, [...params, builder]) };
    RhomNode.prototype.setRatio = function (...params) { builder.setRatio.apply(this, params) };
  }

  setHorizon = function (this: RhomNode, conn: Connector, p1: Point, c2: Point): void {
    if (conn.horizon.point === undefined) conn.horizon.point = { X: 0, Y: 0 };
    let hx: number, hy: number, side = conn.side as RhomSide, c1 = this.center();
    let distance = Math.sqrt(Math.pow((c2.X - c1.X), 2) + Math.pow((c2.Y - c1.Y), 2));
    if (side.vertical) {
      hy = (side.firstSide ? -1 : 1) * distance * conn.horizon.ratioH;
      if (Math.abs(hy) < 30) hy = Math.sign(hy) * 30;
      hx = - distance * conn.horizon.ratioV;
    }
    else {
      hx = (side.firstSide ? -1 : 1) * distance * conn.horizon.ratioH;
      if (Math.abs(hx) < 30) hx = Math.sign(hx) * 30;
      hy = distance * conn.horizon.ratioV;
    }
    conn.horizon.point!.X = p1.X + hx;
    conn.horizon.point!.Y = p1.Y + hy;
  }

  updatePoints = function (this: RhomNode, p: Point, hrz: Horizon, p2: Point, hrz2: Horizon): void { }

  arrangeSide = function (this: RhomNode, side: Side): void {
    let sideCenter = this.sideCenter(side as RhomSide);
    this.connectors.filter(c => c.side.equal(side as RhomSide)).forEach(c => { c.point = sideCenter; });
  }

  connSide = function (this: RhomNode, hrz: Horizon, node2: Node, builder: RhomBuilder): RhomSide {
    if (this.id === node2.id) return new RhomSide(true, true);
    else return builder.getSide(this.center(), node2.center());
  }

  setPoint = function (this: RhomNode, conn: Connector, hrzP: Point, builder: RhomBuilder) {
    let center = this.center();
    let side = conn.side = builder.getSide(center, hrzP);
    conn.point! = this.sideCenter(side);
  }

  setRatio = function (this: RhomNode, conn: Connector) {
    let c1 = this.center(), p1 = conn.point!, c2 = conn.nextNode.center(), hrzP = conn.horizon.point!,
      side = conn.fixSide = conn.side as RhomSide;
    let hy = hrzP.Y - p1.Y, hx = hrzP.X - p1.X;
    let distance = Math.sqrt(Math.pow((c2.X - c1.X), 2) + Math.pow((c2.Y - c1.Y), 2));
    if (side.vertical) {
      if (Math.abs(hy) < 30) hy = Math.sign(hy) * 30;
      conn.horizon.ratioH = (side.firstSide ? -1 : 1) * hy / distance;
      conn.horizon.ratioV = - hx / distance;
    }
    else {
      if (Math.abs(hx) < 30) hx = Math.sign(hx) * 30;
      conn.horizon.ratioH = (side.firstSide ? -1 : 1) * hx / distance;
      conn.horizon.ratioV = hy / distance;
    }
  }

  setSize(n: RhomNode): void {
    n.box.setAttribute('x', '0');
    n.box.setAttribute('y', '0');
    n.diameter = 22 + Math.max(20, n.label.getBBox().width);
    let points = [[0, n.diameter / 2], [n.diameter / 2, 0], [n.diameter, n.diameter / 2], [n.diameter / 2, n.diameter]];
    let strPoints = points.reduce((str, point) => `${str} ${point[0]},${point[1]}`, '');
    n.box.setAttribute('points', strPoints);
    n.source.setAttribute('x', (n.diameter - 25).toString());
    n.source.setAttribute('y', (n.diameter / 2 - 6).toString());
  }

  getSide(c: Point, hrzP: Point) {
    let vertical = Math.abs(hrzP.Y - c.Y) > Math.abs(hrzP.X - c.X);
    let firstSide = vertical ? (hrzP.Y < c.Y) : (hrzP.X < c.X);
    return new RhomSide(vertical, firstSide);
  }
}
