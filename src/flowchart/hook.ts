import { useState } from 'react';
import { LinkData, NodeData } from '../base/types';

export const useFlowchart = () => {
  const [handles, setHandles] = useState<FlowchartHandles>();
  return { setHandles, flowchart: handles };
};

export type FlowchartHandles = {
  addRectNode(left: number, top: number, text: string, id?: number, color?: string): number;
  addCircleNode(left: number, top: number, text: string, id?: number, color?: string): number;
  addRhomNode(left: number, top: number, text: string, id?: number, color?: string): number;
  addHexaNode(left: number, top: number, text: string, id?: number, color?: string): number;
  addNodes(nodes: NodeData[], links?: LinkData[]): void;
  getData(): { nodes: NodeData[], links: LinkData[] };
  changeLinkType(id: number, type: string): void;
  svg: SVGSVGElement;
}