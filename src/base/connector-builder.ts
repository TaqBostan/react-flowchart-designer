import ConnHelper from './connection-helper';
import { Connector, Node, Point, Side, LinkData, ns, StaticData, Horizon } from './types';
import Util from './util';
export default class ConnectorBuilder {
  static editable: boolean;
  maxId: number = 0;
  org?: Point;
  sourceNode?: Node;
  connector?: Connector;
  ctr: HTMLElement;

  constructor(public svg: SVGSVGElement, public nodes: Node[], public sd: StaticData) {
    this.ctr = this.svg.parentElement!;
  }

  sourceAction(node: Node) {
    node.source.onmousedown = (event: MouseEvent) => this.source_md(event, node);
  }

  source_md(e: MouseEvent, node: Node) {
    if (e.buttons === 1) {
      let org = { X: node.left + node.source.getBBox().x + 6, Y: node.top + node.source.getBBox().y + 6 };
      this.org = { X: e.clientX, Y: e.clientY };
      this.sourceNode = node;
      this.sourceNode.pointer = ConnHelper.createPointer();
      this.nodes[0].group.before(this.sourceNode.pointer!);
      this.ctr.onmousemove = (event: MouseEvent) => this.source_mm(event, org);
      this.ctr.onmouseup = () => this.source_mu();
      this.nodes.forEach(n => {
        n.box.setAttribute('class', 'connectable');
        n.box.onmouseup = () => this.connect(n);
        n.box.before(n.label);
      });
      e.stopPropagation();
    }
  }

  source_mm(e: MouseEvent, org: Point) {
    if (e.buttons !== 1) return this.source_mu();
    let dest = Util.mousePoint(this.org!, e, this.sd.scale, org);
    this.sourceNode!.pointer!.setAttribute('d', ConnHelper.pointerInfo(org, dest).path);
  }

  source_mu() {
    this.sourceNode!.pointer!.remove();
    this.ctr.onmousemove = null;
    this.ctr.onmouseup = null;
    this.sourceNode = undefined;
    this.nodes.forEach(n => {
      n.box.setAttribute('class', 'grabbable');
      n.box.onmouseup = null;
      n.box.after(n.label);
    });
  }

  connect(node: Node, linkData?: LinkData) {
    if (this.sourceNode) {
      let originNode = this.sourceNode,metaData = linkData?.meta, type = (linkData?.type) ? linkData.type : "solid";
      if (originNode.connectors.some(c => c.nextNode.id === node.id && c.toDest)) return;
      let self = originNode.id === node.id;
      let originHorizon: Horizon = { ratioH: originNode.ratio.h, ratioV: originNode.ratio.v };
      if (metaData?.ratioS) originHorizon = { ratioH: metaData.ratioS[0], ratioV: metaData.ratioS[1] }
      let sideOrigin = metaData?.sideS ? originNode.side(metaData.sideS) : originNode.connSide(originHorizon, node);
      let group = document.createElementNS(ns, 'g') as SVGGElement;
      let path = ConnHelper.createConnector(type);
      let arrow = !self ? ConnHelper.createArrow(type) : undefined;
      group.append(path);
      if (!self) group.append(arrow!);
      this.svg.append(group);
      let connLabel = ConnHelper.addLabel(group, ConnectorBuilder.editable, linkData?.text);
      let originConn: Connector = {
        id: ++this.maxId,
        group,
        path,
        label: connLabel,
        arrow,
        nextNode: node,
        horizon: originHorizon,
        slope: 0,
        side: sideOrigin,
        self,
        toDest: true,
        type: type,
        selected: false
      }
      if (metaData?.sideS) originConn.fixSide = sideOrigin;
      originNode.connectors.push(originConn);
      if (ConnectorBuilder.editable) this.labelEvent(originNode, originConn);
      originNode.arrangeSide(sideOrigin);
      if (!self) {
        let horizon: Horizon = { ratioH: node.ratio.h, ratioV: node.ratio.v };
        if (metaData?.ratioD) horizon = { ratioH: metaData.ratioD[0], ratioV: metaData.ratioD[1] }
        let side = metaData?.sideD ? node.side(metaData.sideD) : node.connSide(horizon, originNode);
        let conn = { ...originConn, nextNode: originNode, horizon, side, toDest: false, point: undefined, pairConn: originConn };
        if (metaData?.sideD) conn.fixSide = side;
        else conn.fixSide = undefined;
        originConn.pairConn = conn;
        node.connectors.push(conn);
        node.arrangeSide(side);
        this.updateConn(node, side);
      }
      this.updateConn(originNode, sideOrigin);
    }
  }

  labelEvent(node: Node, conn: Connector) {
    conn.label!.g.onmousedown = (event: MouseEvent) => this.label_md(event, node, conn);
    conn.label!.g.ondblclick = () => this.label_dc(node, conn);
    conn.label!.g.onclick = (event: MouseEvent) => this.label_c(event, node, conn);
  }

  label_dc(node: Node, conn: Connector) {
    conn.label!.g.onmousedown = conn.label!.g.ondblclick = null;
    let lbl = conn.label!, width = lbl.elem.getBBox().width + 14, height = 17;
    lbl.elem.setAttribute('visibility', 'hidden');
    lbl.box.setAttribute('width', (width + 2).toString());
    lbl.box.setAttribute('height', (height + 2).toString());
    let { foreign, input } = Util.createLabelInput(width, height, 1, 1, lbl.text);
    lbl.g.append(foreign);
    input.focus();
    input.oninput = () => {
      lbl.elem.textContent = input.value;
      input.style.width = (lbl.elem.getBBox().width + 14) + "px";
      foreign.setAttribute("width", `${input.offsetWidth}`);
      lbl.box.setAttribute('width', `${input.offsetWidth + 2}`);
    }
    input.onblur = () => {
      input.onblur = () => {};
      lbl.text = input.value;
      foreign.remove();
      lbl.g.remove();
      let connLabel = ConnHelper.addLabel(conn.group, ConnectorBuilder.editable, lbl.text);
      Object.assign(lbl, connLabel);
      this.updateAllConn(node);
      this.labelEvent(node, conn);
    }
    input.onkeyup = (e: KeyboardEvent) => {
      if (e.key === 'Enter') input.onblur?.(new FocusEvent('blur'));
    }
  }

  label_c(e: MouseEvent, node: Node, conn: Connector) {
    this.unselect();
    if (!conn.self) {
      this.addHrzDisc(node, conn);
      this.addHrzDisc(conn.nextNode, conn.pairConn!);
    }
    this.select(conn, true);
    e.stopPropagation();
  }

  label_md(e: MouseEvent, node: Node, connector: Connector) {
    if (e.buttons === 1) {
      this.org = { X: e.clientX, Y: e.clientY };
      let org = { X: e.clientX, Y: e.clientY };
      this.sourceNode = node;
      this.connector = connector;
      this.ctr.onmousemove = (event: MouseEvent) => this.label_mm(event, org);
      this.ctr.onmouseup = (event: MouseEvent) => this.label_mu(event, org);
      e.stopPropagation();
    }
  }

  label_mm(e: MouseEvent, org: Point) {
    if (e.buttons !== 1) return this.label_mu(e, org);
    let dest = Util.mousePoint(this.org!, e, this.sd.scale);
    let tran = `translate(${dest.X},${dest.Y})`;
    let { group, path, arrow, horizon } = this.connector!;
    let _horizon = this.connector!.pairConn?.horizon;
    let color = Math.abs(e.clientX - org.X) + Math.abs(e.clientY - org.Y) > 40 ? 'red' : 'green';
    group.setAttribute('transform', tran);
    horizon.elem?.setAttribute('transform', tran);
    _horizon?.elem?.setAttribute('transform', tran);
    path.setAttribute('stroke', color);
    arrow?.setAttribute('fill', color);
  }

  label_mu(e: MouseEvent, org: Point) {
    if (this.connector) {
      if (Math.abs(e.clientX - org.X) + Math.abs(e.clientY - org.Y) > 40) {
        let index1 = this.sourceNode!.connectors.findIndex(c => c.id === this.connector!.id)!;
        this.sourceNode!.connectors.splice(index1, 1);
        this.delete(this.connector!);
      }
      else this.connector.group.removeAttribute('transform');
      this.ctr.onmousemove = null;
      this.ctr.onmouseup = null;
      this.sourceNode = undefined;
      this.connector = undefined;
    }
  }

  addHrzDisc(node: Node, conn: Connector) {
    let disc = ConnHelper.createHrzDisc(conn.horizon.point!);
    conn.horizon.elem = disc;
    this.svg.append(disc);
    disc.onmousedown = (event: MouseEvent) => this.disc_md(event, node, conn);
    disc.onclick = (event: MouseEvent) => event.stopPropagation();
  }

  select(conn: Connector, is: boolean) {
    conn.selected = is;
    conn.path.setAttribute('stroke', is ? 'green' : conn.type === 'solid' ? 'black' : 'gray');
    conn.path.setAttribute('stroke-width', is ? '2' : '1');
    conn.path.setAttribute('filter', is ? 'url(#flt)' : '');
    conn.arrow?.setAttribute('fill', is ? 'green' : conn.type === 'solid' ? 'black' : 'gray');
  }

  unselect() {
    this.nodes
      .reduce((conns: Connector[], node) => [...conns, ...node.connectors], [])
      .filter(conn => conn.selected)
      .forEach(conn => {
        this.select(conn, false);
        if (!conn.self) {
          let _conn = conn.pairConn!;
          _conn.horizon.elem!.remove();
          _conn.horizon.elem = undefined;
          conn.horizon.elem!.remove();
          conn.horizon.elem = undefined;
        }
      });
  }

  disc_md(e: MouseEvent, node: Node, connector: Connector) {
    if (e.buttons === 1) {
      this.connector = connector;
      this.org = { X: e.clientX, Y: e.clientY };
      this.ctr.onmousemove = (event: MouseEvent) => this.disc_mm(event, node);
      this.ctr.onmouseup = (event: MouseEvent) => this.disc_mu(node);
      e.stopPropagation();
    }
  }

  disc_mm(e: MouseEvent, node: Node) {
    if (e.buttons !== 1) return this.disc_mu(node);
    let { label: lbl, point, pairConn, horizon } = this.connector!, p1 = point!, p2 = pairConn!.point!,
      hPoint1 = horizon.fakeP = horizon.point!, hPoint2 = pairConn!.horizon.point!;
    let dest = Util.mousePoint(this.org!, e, this.sd.scale);
    hPoint1.X += dest.X, hPoint1.Y += dest.Y;
    node.setPoint(this.connector!, hPoint1);
    horizon.elem!.setAttribute("x", (hPoint1.X - 4).toString());
    horizon.elem!.setAttribute("y", (hPoint1.Y - 4).toString());
    let lblPoint = ConnHelper.labelPos(p1, p2, hPoint1, hPoint2);
    lbl?.g.setAttribute('transform', `translate(${lblPoint.X - lbl.size.X / 2},${lblPoint.Y - lbl.size.Y / 2})`);
    let pathD: string = ConnHelper.connInfo(p1, p2, hPoint1, hPoint2);
    this.connector!.path.setAttribute('d', pathD);
    if (!this.connector!.toDest) {
      let phi = Math.atan2(p1.Y - hPoint1.Y, p1.X - hPoint1.X);
      this.connector!.arrow!.setAttribute('transform', `translate(${p1.X},${p1.Y}) rotate(${phi * 180 / Math.PI})`);
    }
    this.org = { X: e.clientX, Y: e.clientY };
  }

  disc_mu(node: Node) {
    if (this.connector) {
      node.setRatio(this.connector!);
      node.arrangeSides();
      this.updateAllConn(node);
      this.ctr.onmousemove = null;
      this.ctr.onmouseup = null;
      this.connector = undefined;
    }
  }

  // removes a conn and only removes it from conn.nextNode.connectors array
  delete(conn: Connector) {
    if (!conn.self) {
      let index2 = conn.nextNode.connectors.findIndex(c => c.id === conn.id)!;
      conn.nextNode.connectors.splice(index2, 1);
    }
    conn.group.remove();
    conn.horizon.elem?.remove();
    conn.pairConn?.horizon.elem?.remove();
  }

  updateAllConn(node: Node) {
    node.allSides().forEach(s => this.updateConn(node, s));
  }

  updateConn(node: Node, side: Side) {
    let c1 = node.center();
    node.connectors.filter(c => c.side.equal(side)).forEach(conn => {
      let p1 = conn.point!;
      let pathD: string, labelPoint: Point;
      if (conn.self) {
        pathD = ConnHelper.roundPath(p1);
        labelPoint = { X: p1.X, Y: p1.Y - 43 };
      }
      else {
        let p2 = conn.pairConn!.point!, c2 = conn.nextNode.center();
        node.setHorizon(conn, p1, c2);
        conn.nextNode.setHorizon(conn.pairConn!, p2, c1);
        let h1 = conn.horizon, hPoint1 = h1.point!;
        let h2 = conn.pairConn!.horizon, hPoint2 = h2.point!;
        node.updatePoints(p1, h1, c2, h2);
        h1.elem?.setAttribute("x", (hPoint1.X - 4).toString());
        h1.elem?.setAttribute("y", (hPoint1.Y - 4).toString());
        pathD = ConnHelper.connInfo(p1, p2, hPoint1, hPoint2);
        let phi = conn.toDest ? Math.atan2(p2.Y - hPoint2.Y, p2.X - hPoint2.X) : Math.atan2(p1.Y - hPoint1.Y, p1.X - hPoint1.X);
        let dest = conn.toDest ? p2 : p1;
        conn.arrow!.setAttribute('transform', `translate(${dest.X},${dest.Y}) rotate(${phi * 180 / Math.PI})`);
        labelPoint = ConnHelper.labelPos(p1, p2, hPoint1, hPoint2);
      }
      let lbl = conn.label;
      lbl?.g.setAttribute('transform', `translate(${labelPoint.X - lbl.size.X / 2},${labelPoint.Y - lbl.size.Y / 2})`);
      conn.path.setAttribute('d', pathD);
    });
  }

  setConnType(conn: Connector, type: string) {
    ConnHelper.setArrow(conn.arrow!, type)
    ConnHelper.setPath(conn.path, type)
  }
}