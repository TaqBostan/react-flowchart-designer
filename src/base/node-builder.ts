
import ConnectorBuilder from './connector-builder';
import { Connector, Horizon, Node, Point, Side, StaticData } from './types'
import Util from './util';

export default abstract class NodeBuilder<N extends Node> {
  static maxId: number = 0;
  org?: Point;
  node?: Node;
  nodes: Node[];
  ctr: HTMLElement;
  abstract ofType<T extends Node>(node: T): boolean;
  abstract setSize(n: Node): void;
  abstract updatePoints(this: N, p1: Point, hrz: Horizon, c2: Point, hrz2: Horizon) : void;
  abstract setHorizon(this: N, conn: Connector, origin: Point, dest: Point) : void;
  abstract arrangeSide(this: N, side: Side) : void;
  abstract connSide(this: N, hrz: Horizon, node2: Node, builder: NodeBuilder<N>): Side;
  abstract setPoint(this: N, conn: Connector, hrzP: Point, builder: NodeBuilder<N>) : void;
  abstract setRatio(this: N, conn: Connector) : void;

  constructor(public svg: SVGSVGElement, public connBuilder: ConnectorBuilder, public sd: StaticData, nodeType: any) {
    this.nodes = this.connBuilder.nodes;
    this.ctr = this.svg.parentElement!;
    this.assignProto(nodeType);
  }

  assignProto(nodeType: any) {
    let builder = this;
    nodeType.prototype.setHorizon = function (conn: Connector, origin: Point, dest: Point) { builder.setHorizon.apply(this, [conn, origin, dest]) }
    nodeType.prototype.updatePoints = function (p1: Point, hrz: Horizon, c2: Point, hrz2: Horizon) { builder.updatePoints.apply(this, [p1, hrz, c2, hrz2]) }
    nodeType.prototype.arrangeSide = function (side: Side) { builder.arrangeSide.apply(this, [side]) }
    nodeType.prototype.connSide = function (hrz: Horizon, node2: Node) { return builder.connSide.apply(this, [hrz, node2, builder]) }
    nodeType.prototype.setPoint = function (conn: Connector, hrzP: Point) { builder.setPoint.apply(this, [conn, hrzP, builder]) };
    nodeType.prototype.setRatio = function (conn: Connector) { builder.setRatio.apply(this, [conn]) };
  }

  add(n: Node): Node {
    if (n.id === 0) n.id = ++NodeBuilder.maxId;
    else if (n.id > NodeBuilder.maxId) NodeBuilder.maxId = n.id;
    n.grouping();
    this.svg.append(n.group);
    n.group.setAttribute('transform', `translate(${n.left},${n.top})`);
    n.box.setAttribute('class', 'grabbable');
    n.box.setAttribute('stroke', 'black');
    n.box.setAttribute('stroke-width', '1');
    n.box.setAttribute('fill', n.color);

    n.label.setAttribute('text-anchor', 'middle');
    n.label.setAttribute('class', 'no-select node-txt');
    n.label.innerHTML = n.text;

    if (ConnectorBuilder.editable) {
      n.source.setAttribute('class', 'source pointer');
      n.source.setAttribute('height', '12');
      n.source.setAttribute('width', '12');
      n.source.setAttribute('stroke', 'black');
      n.source.setAttribute('stroke-width', '0.5');
      n.source.setAttribute('rx', '3');
      n.source.setAttribute('fill', 'orange');
    }
    this.updateNode(n);
    return n;
  }

  updateNode(n: Node) {
    this.setSize(n);
    n.label.setAttribute('x', ((n.box as any).getBBox().width / 2).toString());
    n.label.setAttribute('y', n.labelY(n.label.getBBox().height).toString());
  }

  delete(n: Node) {
    n.group.remove();
  }

  nodeEvent(node: Node) {
    node.group.onmousedown = (event: MouseEvent) => this.node_md(event, node);
    node.group.onclick = (event: MouseEvent) => this.node_c(event, node);
    node.group.ondblclick = (event: MouseEvent) => this.node_dc(event, node);
  }

  node_c(e: MouseEvent, node: Node) {
    this.node = node;
    this.nodes.filter(n => n.selected).forEach(n => this.select(n, false));
    this.select(node, true);
    e.stopPropagation();
  }

  select(n: Node, is: boolean) {
    n.selected = is;
    n.box.setAttribute('stroke', is ? 'green' : 'black');
    n.box.setAttribute('stroke-width', is ? '2' : '1');
    n.box.setAttribute('filter', is ? 'url(#flt)' : '');
  }

  node_dc(e: MouseEvent, node: Node) {
    node.group.onmousedown = node.group.ondblclick = null;
    let lbl = node.label!, width = lbl.getBBox().width + 14, height = 17;
    lbl.setAttribute('visibility', 'hidden');
    lbl.setAttribute('width', (width + 2).toString());
    lbl.setAttribute('height', (height + 2).toString());
    let { foreign, input } = Util.createLabelInput(width, height, 7, node.labelY(height, false), lbl.innerHTML);
    lbl.after(foreign);
    input.focus();
    input.onmousedown = (e: MouseEvent) => e.stopPropagation();
    input.oninput = () => {
      lbl.innerHTML = input.value;
      lbl.setAttribute('width', `${input.offsetWidth + 2}`);
      input.style.width = (lbl.getBBox().width + 14) + "px";
      foreign.setAttribute("width", `${input.offsetWidth}`);
    }
    input.onblur = () => {
      input.onblur = () => {};
      node.text = lbl.innerHTML = input.value;
      lbl.removeAttribute('visibility');
      foreign.remove();
      this.updateNode(node);
      node.arrangeSides();
      this.connBuilder.updateAllConn(node);
      this.nodeEvent(node);
    }
    input.onkeyup = (e: KeyboardEvent) => {
      if (e.key === 'Enter') input.onblur?.(new FocusEvent('blur'));
    }
    e.stopPropagation();
  }

  node_md(e: MouseEvent, node: Node) {
    if (e.buttons === 1) {
      this.org = { X: e.clientX, Y: e.clientY };
      this.node = node;
      this.ctr.onmousemove = (event: MouseEvent) => this.node_mm(event);
      node.group.onmouseup = () => this.node_mu();
      e.stopPropagation();
    }
  }

  node_mm(e: MouseEvent) {
    if (this.node) {
      if (e.buttons !== 1) return this.node_mu();
      let dest = Util.mousePoint(this.org!, e, this.sd.scale);
      this.node.move(this.node.left + dest.X, this.node.top + dest.Y);
      this.node.connectors.forEach(connector => {
        connector.side = connector.fixSide || this.node!.connSide(connector.horizon, connector.nextNode);
        if (!connector.self) {
          let conn2 = connector.pairConn!, node2 = connector.nextNode, side2 = conn2.side = conn2.fixSide || node2.connSide(conn2.horizon, this.node!);
          node2.arrangeSide(side2);
          this.connBuilder.updateConn(node2, side2);
        }
      });
      this.node.arrangeSides();
      this.connBuilder.updateAllConn(this.node);
      this.org = { X: e.clientX, Y: e.clientY };
    }
  }

  node_mu() {
    this.ctr.onmousemove = null;
    this.node!.group.onmouseup = null;
    this.node = undefined;
  }
}