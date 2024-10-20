import CircleBuilder from "./builders/circle/circ-builder";
import RectBuilder from "./builders/rect/rect-builder";
import RhomBuilder from "./builders/rhom/rhom-builder";
import HexaBuilder from "./builders/hexa/hexa-builder";
import ConnectorBuilder from "./connector-builder";
import NodeBuilder from "./node-builder";
import { Connector, LinkData, MetaData, Node, Point, StaticData } from "./types";
import Util from "./util";
import { RectNode } from "./builders/rect/rect-node";
import { CircleNode } from "./builders/circle/circ-node";
import { RhomNode } from "./builders/rhom/rhom-node";
import { HexaNode } from "./builders/hexa/hexa-node";

export default class Director {
  static instance: Director;
  static sd = { scale: 1 };
  builders: NodeBuilder<Node>[];
  connBuilder: ConnectorBuilder;
  nodes: Node[] = [];
  org?: Point;

  constructor(public svg: SVGSVGElement) {
    let parent = svg.parentElement!;
    this.connBuilder = new ConnectorBuilder(svg, this.nodes, Director.sd);
    let params : [SVGSVGElement, ConnectorBuilder, StaticData] = [svg, this.connBuilder, Director.sd]
    this.builders = [
      new RectBuilder(...params, RectNode),
      new CircleBuilder(...params, CircleNode),
      new RhomBuilder(...params, RhomNode),
      new HexaBuilder(...params, HexaNode)
    ];
    parent.onmousedown = (event: MouseEvent) => this.drag_md(event);
    parent.onclick = () => this.parent_c();
    parent.addEventListener('wheel', (e: WheelEvent) => this.mousewheel(e))
  }

  getBuilder<T extends Node>(node: T): NodeBuilder<T> {
    return this.builders.find(b => b.ofType(node))! as NodeBuilder<T>;
  }

  parent_c() {
    this.nodes.filter(n => n.selected).forEach(n => this.getBuilder(n).select(n, false));
    this.connBuilder.unselect();
  }

  win_ku(e: KeyboardEvent) {
    if (e.key === 'Delete') {
      this.nodes.forEach((node, i, arr) => {
        if (node.selected) {
          node.connectors.forEach(conn => this.connBuilder.delete(conn));
          arr.splice(i, 1);
          this.getBuilder(node).delete(node);
        }
        else {
          node.connectors
            .forEach((conn, i, arr) => {
              if (conn.selected && conn.toDest) {
                this.connBuilder.delete(conn);
                arr.splice(i, 1);
              }
            });
        }
      });
    }
  }

  mousewheel(e: WheelEvent) {
    let { clientWidth: w, clientHeight: h, offsetLeft, offsetTop } = (e.currentTarget as HTMLElement)
    let scale = e.deltaY > 0 ? 0.8 : 1.25;
    let left = parseFloat(this.svg.style.left), top = parseFloat(this.svg.style.top);
    this.svg.style.left = (left + (scale - 1) * (w / 2 + left - (e.pageX - offsetLeft))) + 'px';
    this.svg.style.top = (top + (scale - 1) * (h / 2 + top - (e.pageY - offsetTop))) + 'px';
    Director.sd.scale *= scale;
    this.svg.style.transform = `scale(${Director.sd.scale})`
    e.preventDefault();
  }

  drag_md(e: MouseEvent) {
    if (e.buttons === 1) {
      let parent = this.svg.parentElement!;
      this.org = { X: e.clientX, Y: e.clientY };
      parent.onmousemove = (event: MouseEvent) => this.drag_mm(event);
      parent.onmouseup = () => this.drag_mu();
    }
  }

  drag_mm(e: MouseEvent) {
    if (this.org) {
      if (e.buttons !== 1) return this.drag_mu();
      this.svg.style.left = (parseFloat(this.svg.style.left) + (e.clientX - this.org.X)) + 'px';
      this.svg.style.top = (parseFloat(this.svg.style.top) + (e.clientY - this.org.Y)) + 'px';
      this.org = { X: e.clientX, Y: e.clientY };
    }
  }

  drag_mu() {
    this.svg.parentElement!.onmousemove = null;
    this.svg.parentElement!.onmouseup = null;
  }

  addNodes(nodes: Node[]) {
    nodes.forEach(node => this.addNode(node));
  }

  addConns(conns: LinkData[] = []) {
    conns.forEach(connector => {
      let origin = this.nodes.find(n => n.id === connector.from), destination = this.nodes.find(n => n.id === connector.to);
      if (!origin || !destination) throw Error('Node from/to not found!');
      this.connBuilder.sourceNode = origin;
      this.connBuilder.connect(destination, connector);
    });
  }

  getData() {
    return {
      nodes: this.nodes.map(n => ({ id: n.id, X: n.left, Y: n.top, text: n.text, shape: n.shape, color: n.color })),
      links: this.nodes.reduce(
        (conns: LinkData[], node) => [...conns,
        ...node.connectors
          .filter(n => n.toDest)
          .map(conn => {
            let c: LinkData = { id: conn.id, from: node.id, to: conn.nextNode.id, text: conn.label?.text, type: conn.type };
            if (!conn.self) {
              let meta: MetaData = {};
              if (node.ratio.h !== conn.horizon.ratioH || node.ratio.v !== conn.horizon.ratioV)
                meta.ratioS = [Util.round(conn.horizon.ratioH, 3), Util.round(conn.horizon.ratioV, 3)];
              if (conn.fixSide) meta.sideS = conn.fixSide;
              let _conn = conn.pairConn!;
              if (conn.nextNode.ratio.h !== _conn.horizon.ratioH || conn.nextNode.ratio.v !== _conn.horizon.ratioV)
                meta.ratioD = [Util.round(_conn.horizon.ratioH, 3), Util.round(_conn.horizon.ratioV, 3)];
              if (_conn.fixSide) meta.sideD = _conn.fixSide;
              if (Object.keys(meta).length) c.meta = meta;
            }
            return c;
          }

          )], [])
    };
  }

  changeConnType(id: number, type: string) {
    this.getConns()
      .filter(conn => conn.id === id)
      .forEach(connector => {
        connector.type = type;
        if (connector.arrow) this.connBuilder.setConnType(connector, type);
        this.connBuilder.setConnType(connector, type);
      });
  }

  addNode(node: Node): number {
    if (node.id !== 0 && this.nodes.some(n => n.id === node.id)) throw Error('Duplicate ID found: ' + node.id);
    let builder = this.getBuilder(node);
    builder.add(node);
    builder.nodeEvent(node);
    this.connBuilder.sourceAction(node);
    this.nodes.push(node);
    return node.id;
  }

  getConns() {
    return this.nodes.reduce((conns: Connector[], node) => [...conns, ...node.connectors], []);
  }

  static init(container: SVGSVGElement, editable: boolean = false) {
    Director.instance = new Director(container);
    ConnectorBuilder.editable = editable;
  }

  static setScale(scale: number) {
    Director.sd.scale = scale;
  }
}