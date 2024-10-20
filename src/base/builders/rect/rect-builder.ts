import NodeBuilder from "../../node-builder";
import { Connector, Horizon, Point, Side, Node } from "../../types";
import Util from "../../util";
import { RectNode, RectSide } from "./rect-node";


export default class RectBuilder extends NodeBuilder<RectNode> {
  ofType<T>(node: T): boolean {
    return node instanceof RectNode;
  }

  setHorizon = function (this: RectNode, conn: Connector, p1: Point, c2: Point) {
    if (conn.horizon.point === undefined) conn.horizon.point = { X: 0, Y: 0 };
    let c1 = this.center(), horizontal = [c2.X - c1.X, c2.Y - c1.Y], sign = c2.X > c1.X ? 1 : -1;
    conn.horizon.point!.X = p1.X + horizontal[0] * conn.horizon.ratioH + sign * horizontal[1] * conn.horizon.ratioV;
    conn.horizon.point!.Y = p1.Y + horizontal[1] * conn.horizon.ratioH - sign * horizontal[0] * conn.horizon.ratioV;
  }

  updatePoints = function (this: RectNode, p: Point, hrz: Horizon, p2: Point, hrz2: Horizon) { }

  arrangeSide = function (this: RectNode, side: Side) {
    let _side = side as RectSide;
    let sideCenter = this.sideCenter(_side);
    let connectors = this.connectors.filter(c => c.side.equal(_side)), count = connectors.length;
    connectors.forEach(c => {
      if (c.self) c.slope = 0;
      else {
        let nextCenter = c.horizon.fakeP || c.nextNode.center(), vector = { X: nextCenter.X - sideCenter.X, Y: nextCenter.Y - sideCenter.Y };
        if (_side.vertical) c.slope = vector.Y === 0 ? 1000 * Math.sign(vector.X) : vector.X / vector.Y;
        else c.slope = vector.X === 0 ? 1000 * Math.sign(vector.Y) : vector.Y / vector.X;
      }
    })
    connectors.sort((c1, c2) => _side.firstSide ? (c2.slope - c1.slope) : (c1.slope - c2.slope));
    let dis = Math.min(15, (_side.vertical ? (this.width - 10) / count : (this.height - 10) / count));
    connectors.forEach((connector, i) => {
      connector.point = { ...sideCenter };
      if (_side.vertical) connector.point.X -= ((count - 1) / 2 - i) * dis;
      else connector.point.Y -= ((count - 1) / 2 - i) * dis;
    });
  }

  connSide = function (this: RectNode, hrz: Horizon, node2: Node, builder: RectBuilder): RectSide {
    if (this.id === node2.id) return new RectSide(true, true);
    let c1 = this.center(), c2 = node2.center(), sign = (c2.X - c1.X) > 0 ? 1 : -1;
    c2 = hrz.fakeP = Util.rotate(c2, c1, - sign * Math.atan2(hrz.ratioV, hrz.ratioH));
    return builder.getSide(c1, this.height, this.width, c2);
  }

  setPoint = function (this: RectNode, conn: Connector, hrzP: Point, builder: RectBuilder) {
    let center = this.center();
    let side = conn.side = builder.getSide(center, this.height, this.width, hrzP), sign = side.firstSide ? -1 : 1;
    let ConnP = conn.point! = this.sideCenter(side);
    let phi = Math.atan2(hrzP.Y - center.Y, hrzP.X - center.X);
    if (side.vertical) ConnP.X += sign * this.height / Math.tan(phi) / 2;
    else ConnP.Y += sign * this.width * Math.tan(phi) / 2;
  }

  setRatio = function (this: RectNode, conn: Connector) {
    let c1 = this.center(), p1 = conn.point!, c2 = conn.nextNode.center(), hrzP = conn.horizon.point!, sign = c2.X > c1.X ? 1 : -1;
    let deltaHrzX = hrzP.X - p1.X, deltaHrzY = hrzP.Y - p1.Y, deltaDestX = c2.X - c1.X, deltaDestY = c2.Y - c1.Y;
    let denominator = deltaDestX * deltaDestX + deltaDestY * deltaDestY;
    conn.horizon.ratioV = sign * (deltaHrzX * deltaDestY - deltaHrzY * deltaDestX) / denominator;
    conn.horizon.ratioH = (deltaHrzX * deltaDestX + deltaHrzY * deltaDestY) / denominator;
  }

  setSize(n: RectNode): void {
    n.box.setAttribute('x', '0');
    n.box.setAttribute('y', '0');
    n.box.setAttribute('height', n.height.toString());
    n.box.setAttribute('rx', '5');
    n.width = 14 + Math.max(30, n.label.getBBox().width);
    n.box.setAttribute('width', n.width.toString());
    n.source.setAttribute('x', (n.width - 20).toString());
    n.source.setAttribute('y', '9.5');
  }

  getSide(c: Point, h: number, w: number, hrzP: Point) {
    let vertical = Math.abs(hrzP.Y - c.Y) * w > Math.abs(hrzP.X - c.X) * h;
    let firstSide = vertical ? (hrzP.Y < c.Y) : (hrzP.X < c.X);
    return new RectSide(vertical, firstSide);
  }
}
