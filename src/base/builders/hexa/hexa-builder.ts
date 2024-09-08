import NodeBuilder from "../../node-builder";
import { Connector, Horizon, Point, Side, Node } from "../../types";
import Util from "../../util";
import { HexaNode, HexaSide } from "./hexa-node";
export default class HexaBuilder extends NodeBuilder<HexaNode> {
  ofType<T>(node: T): boolean {
    return node instanceof HexaNode;
  }
  nodeProto(): void {
    let builder = this
    HexaNode.prototype.setHorizon = function (...params) { builder.setHorizon.apply(this, params) }
    HexaNode.prototype.updatePoints = function (...params) { builder.updatePoints.apply(this, params) }
    HexaNode.prototype.arrangeSide = function (...params) { builder.arrangeSide.apply(this, params) }
    HexaNode.prototype.connSide = function (...params) { return builder.connSide.apply(this, [...params, builder]) }
    HexaNode.prototype.setPoint = function (...params) { builder.setPoint.apply(this, [...params, builder]) };
    HexaNode.prototype.setRatio = function (...params) { builder.setRatio.apply(this, params) };
  }

  setHorizon = function (this: HexaNode, conn: Connector, p1: Point, c2: Point): void {
    if (conn.horizon.point === undefined) conn.horizon.point = { X: 0, Y: 0 };
    let hx: number, hy: number, side = conn.side as HexaSide, c1 = this.center();
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

  updatePoints = function (this: HexaNode, p: Point, hrz: Horizon, p2: Point, hrz2: Horizon): void { }

  arrangeSide = function (this: HexaNode, side: Side): void {
    let sideCenter = this.sideCenter(side as HexaSide);
    this.connectors.filter(c => c.side.equal(side as HexaSide)).forEach(c => { c.point = sideCenter; });
  }

  connSide = function (this: HexaNode, hrz: Horizon, node2: Node, builder: HexaBuilder): HexaSide {
    if (this.id === node2.id) return new HexaSide(true, true);
    else return builder.getSide(this.center(), node2.center());
  }

  setPoint = function (this: HexaNode, conn: Connector, hrzP: Point, builder: HexaBuilder) {
    let center = this.center();
    let side = conn.side = builder.getSide(center, hrzP);
    conn.point! = this.sideCenter(side);
  }

  setRatio = function (this: HexaNode, conn: Connector) {
    let c1 = this.center(), p1 = conn.point!, c2 = conn.nextNode.center(), hrzP = conn.horizon.point!,
      side = conn.fixSide = conn.side as HexaSide;
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

  setSize(n: HexaNode): void {
    n.box.setAttribute('x', '0');
    n.box.setAttribute('y', '0');
    n.diameter = 22 + Math.max(30, n.label.getBBox().width);
    let points = [[0, n.height / 2], [n.height / 2, 0], [n.diameter - n.height / 2, 0], [n.diameter, n.height / 2], [n.diameter - n.height / 2, n.height], [n.height / 2, n.height]];
    let strPoints = points.reduce((str, point) => `${str} ${point[0]},${point[1]}`, '');
    n.box.setAttribute('points', strPoints);
    n.source.setAttribute('x', (n.diameter - 25).toString());
    n.source.setAttribute('y', (n.height / 2 - 6).toString());
  }

  getSide(c: Point, hrzP: Point) {
    let vertical = Math.abs(hrzP.Y - c.Y) > Math.abs(hrzP.X - c.X);
    let firstSide = vertical ? (hrzP.Y < c.Y) : (hrzP.X < c.X);
    return new HexaSide(vertical, firstSide);
  }
}
