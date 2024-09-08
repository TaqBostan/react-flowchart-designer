import React, { FC } from 'react';
import { Flowchart } from './index';
import { FlowchartHandles, useFlowchart } from './hook';
import { LinkData, NodeData } from '../base/types';

export const FlowchartPrimary: FC = () => {
  const { setHandles, flowchart } = useFlowchart();
  const [txt, setTxt] = React.useState('node');
  const [data, setData] = React.useState<{ nodes: NodeData[], links: LinkData[] }>({ nodes: [], links: [] });
  const onReady = (flowchart: FlowchartHandles) => {
    let nodes = JSON.parse(`[ { "id": 22, "X": 96, "Y": 254, "text": "Shopping", "shape": "rectangle", "color": "transparent" }, { "id": 23, "X": 249, "Y": 402, "text": "Search items", "shape": "rectangle", "color": "transparent" }, { "id": 24, "X": 342, "Y": 266, "text": "Browse Items", "shape": "rectangle", "color": "transparent" }, { "id": 25, "X": 727, "Y": 43, "text": "Purchase made", "shape": "rectangle", "color": "transparent" }, { "id": 26, "X": 749, "Y": 428, "text": "View Item", "shape": "rectangle", "color": "transparent" }, { "id": 20, "X": 91, "Y": 119, "text": "Start", "shape": "circle", "color": "transparent" }, { "id": 21, "X": 999, "Y": 222, "text": "End", "shape": "circle", "color": "transparent" }, { "id": 27, "X": 728, "Y": 168, "text": "Item Selected?", "shape": "rhombus", "color": "transparent" }, { "id": 28, "X": 498, "Y": 394, "text": "Item Found?", "shape": "rhombus", "color": "transparent" } ]`);
    let links = JSON.parse(`[ { "id": 2, "from": 22, "to": 23, "text": "Use search bar", "type": "solid", "meta": { "ratioS": [ 0.128, -0.21 ], "ratioD": [ 0.293, -0.273 ] } }, { "id": 3, "from": 22, "to": 24, "text": "Browse", "type": "solid", "meta": { "ratioS": [ 0.214, 0.009 ], "ratioD": [ 0.19, -0.017 ] } }, { "id": 4, "from": 23, "to": 23, "text": "Another search", "type": "solid" }, { "id": 5, "from": 23, "to": 28, "text": "Click search button", "type": "solid", "meta": { "ratioS": [ 0.165, 0.008 ], "ratioD": [ 0.361, 0.012 ], "sideD": { "vertical": false, "firstSide": true } } }, { "id": 6, "from": 24, "to": 23, "text": "Use search bar", "type": "solid", "meta": { "ratioS": [ 0.226, -0.131 ], "ratioD": [ 0.245, -0.207 ] } }, { "id": 7, "from": 24, "to": 26, "text": "Click item", "type": "solid" }, { "id": 8, "from": 25, "to": 22, "text": "More shopping", "type": "solid" }, { "id": 9, "from": 25, "to": 21, "text": "", "type": "solid", "meta": { "ratioD": [ 0.25, 0.027 ] } }, { "id": 10, "from": 26, "to": 22, "type": "solid", "meta": { "ratioS": [ 0.244, 0.261 ], "ratioD": [ 0.239, 0.157 ] } }, { "id": 11, "from": 26, "to": 27, "type": "solid", "meta": { "ratioS": [ 0.199, 0.002 ], "ratioD": [ 0.33, 0.016 ], "sideD": { "vertical": true, "firstSide": false } } }, { "id": 1, "from": 20, "to": 22, "text": "Visit online store", "type": "solid", "meta": { "ratioS": [ 0.25, 0.047 ] } }, { "id": 12, "from": 27, "to": 22, "text": "More shopping", "type": "solid", "meta": { "ratioS": [ 0.218, -0.144 ], "sideS": { "vertical": false, "firstSide": true } } }, { "id": 13, "from": 27, "to": 25, "text": "Yes", "type": "solid", "meta": { "ratioS": [ 0.186, -0.035 ], "sideS": { "vertical": true, "firstSide": true }, "ratioD": [ 0.164, -0.022 ] } }, { "id": 14, "from": 27, "to": 21, "text": "No", "type": "solid", "meta": { "ratioD": [ 0.25, 0.015 ] } }, { "id": 15, "from": 28, "to": 26, "text": "Yes", "type": "solid", "meta": { "ratioD": [ 0.175, 0.011 ] } }, { "id": 16, "from": 28, "to": 23, "text": "No", "type": "solid", "meta": { "ratioS": [ 0.336, 0.102 ], "sideS": { "vertical": true, "firstSide": false }, "ratioD": [ 0.009, -0.501 ] } } ]`);
    flowchart.addNodes(nodes, links);
    setData(flowchart.getData());
  }

  return (
    <div className="App">
      <input type='text' value={txt} onChange={e => setTxt(e.target.value)} />
      <button onClick={() => { flowchart!.addRectNode(100, 100, txt) }}>Add Rectangle Node</button>
      <button onClick={() => { flowchart!.addCircleNode(100, 100, txt, undefined, "#27f17640") }}>Add Circle Node</button>
      <button onClick={() => { flowchart!.addRhomNode(100, 100, txt) }}>Add Rhombus Node</button>
      <button onClick={() => { flowchart!.addHexaNode(100, 100, txt) }}>Add Hexagon Node</button>
      <button onClick={() => { setData(flowchart!.getData()) }}>Get Nodes and Links</button>
      <input type="radio" id="solid" name="connType" onClick={e => flowchart!.changeLinkType(3, "solid")} />
      <label htmlFor="solid">Solid</label>
      <input type="radio" id="dashed" name="connType" onClick={e => flowchart!.changeLinkType(3, "dashed")} />
      <label htmlFor="dashed">Dashed</label>
      <div style={{ borderStyle: 'dotted', width: 'fit-content' }}>
        <Flowchart setHandles={setHandles} width='1200px' height='600px' editable={true} onReady={onReady} />
      </div>
      <h3>Nodes:</h3>
      <div>{JSON.stringify(data.nodes, null, 2)}</div>
      <br />
      <h3>Links:</h3>
      <div>{JSON.stringify(data.links, null, 2)}</div>
    </div>
  );
}