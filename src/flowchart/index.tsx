import React, { useRef, useEffect, CSSProperties } from 'react';
import { FlowchartHandles } from './hook';
import './index.css';
import Director from '../base/director';
import { LinkData, NodeData } from '../base/types';
import { RectNode } from '../base/builders/rect/rect-node';
import { CircleNode } from '../base/builders/circle/circ-node';
import { RhomNode } from '../base/builders/rhom/rhom-node';
import { HexaNode } from '../base/builders/hexa/hexa-node';

const Flowchart = (props: FlowchartProps) => {
  const wrapper = useRef<SVGSVGElement>(null);
  const getDirector = () => Director.instance;

  const getHandles = () => ({
    addRectNode(left: number, top: number, text: string, id?: number, color: string = "transparent") {
      return getDirector().addNode(new RectNode(id || 0, left, top, text, color));
    },
    addCircleNode(left: number, top: number, text: string, id?: number, color: string = "transparent") {
      return getDirector().addNode(new CircleNode(id || 0, left, top, text, color));
    },
    addRhomNode(left: number, top: number, text: string, id?: number, color: string = "transparent") {
      return getDirector().addNode(new RhomNode(id || 0, left, top, text, color));
    },
    addHexaNode(left: number, top: number, text: string, id?: number, color: string = "transparent") {
      return getDirector().addNode(new HexaNode(id || 0, left, top, text, color));
    },
    addNodes(nodes: NodeData[], links: LinkData[] = []) {
      let rectangles = nodes.filter(n => !n.shape || n.shape === 'rectangle').map(n => new RectNode(n.id || 0, n.X, n.Y, n.text, n.color || "transparent"))
      let circles = nodes.filter(n => n.shape === 'circle').map(n => new CircleNode(n.id || 0, n.X, n.Y, n.text, n.color || "transparent"))
      let rhombuses = nodes.filter(n => n.shape === 'rhombus').map(n => new RhomNode(n.id || 0, n.X, n.Y, n.text, n.color || "transparent"))
      let hexagons = nodes.filter(n => n.shape === 'hexagon').map(n => new HexaNode(n.id || 0, n.X, n.Y, n.text, n.color || "transparent"))
      getDirector().addNodes(rectangles);
      getDirector().addNodes(circles);
      getDirector().addNodes(rhombuses);
      getDirector().addNodes(hexagons);
      getDirector().addConns(links);
    },
    getData() {
      return getDirector().getData();
    },
    changeLinkType(id: number, type: string) {
      getDirector().changeConnType(id, type);
    }
  })

  const onload = React.useCallback((svg: SVGSVGElement) => {
    Director.init(svg, props.editable);
    props.setHandles({ ...getHandles(), svg });
    props.onReady?.({ ...getHandles(), svg });
  }, []);

  useEffect(() => {
    const onkeyup = (e: KeyboardEvent) => Director.instance.win_ku(e);
    if (wrapper.current) {
      onload(wrapper.current);
      window.addEventListener('keyup', onkeyup);
    }
    return () => {
      window.removeEventListener('keyup', onkeyup);
    }
  }, [wrapper, onload]);

  const wrapperCss: CSSProperties = {
    height: props.height,
    width: props.width
  };

  return (
    <div style={wrapperCss} className='wp-svg'>
      <svg ref={wrapper} style={{ top: 0, left: 0 }} className='the-svg'>
        <defs>
          <filter id="flt" width="2" height="2">
            <feOffset in="SourceAlpha" dx="1.5" dy="1.5" />
            <feGaussianBlur stdDeviation="2" />
            <feBlend in="SourceGraphic" in2="blurOut" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export interface FlowchartProps {
  height: string;
  width: string;
  editable?: boolean;
  onReady?: (annotator: FlowchartHandles) => any;
  setHandles: (handles: FlowchartHandles) => void;
}

export { Flowchart };