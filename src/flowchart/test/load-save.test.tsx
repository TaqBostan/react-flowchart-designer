import { cleanup, fireEvent, render, prettyDOM, renderHook, waitFor, createEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { Flowchart } from '../index';
import { FlowchartHandles, useFlowchart } from '../hook';
import { LinkData, NodeData } from '../../base/types';

export const ns = "http://www.w3.org/2000/svg";

Object.defineProperty(global.SVGElement.prototype, 'getBBox', {
  writable: true,
  value: jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }),
});

it('Save: circle-rect link', () => {
  let circle = JSON.parse(`{ "id": 15, "X": 91, "Y": 119, "text": "Start", "shape": "circle" }`);
  let rect = JSON.parse(`{ "id": 20, "X": 96, "Y": 254, "text": "Shopping", "color": "red" }`);
  let link = JSON.parse(`{ "from": 15, "to": 20, "text": "Visit online store" }`);
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes([circle, rect], [link]);
  }
  const res = renderHook(useFlowchart);
  const _flowchart = render(
    <Flowchart setHandles={res.result.current.setHandles} width='1200px' height='600px' editable={true} onReady={onReady} />,
  );
  let { nodes, links } = res.result.current.flowchart!.getData();
  expect(nodes.length).toBe(2);
  expect(links.length).toBe(1);

  let n1 = nodes.find(n => n.id === 15)!, n2 = nodes.find(n => n.id === 20)!, lnk = links[0];
  expect(n1.X).toBe(91);
  expect(n1.Y).toBe(119);
  expect(n1.text).toBe('Start');
  expect(n1.shape).toBe('circle');
  expect(n1.color).toBe('transparent');
  expect(n2.X).toBe(96);
  expect(n2.Y).toBe(254);
  expect(n2.text).toBe('Shopping');
  expect(n2.shape).toBe('rectangle');
  expect(n2.color).toBe('red');
  expect(lnk.from).toBe(15);
  expect(lnk.to).toBe(20);
  expect(lnk.text).toBe("Visit online store");
  expect(lnk.type).toBe("solid");

});

it('Load: circle-rect link', () => {
  let circle = JSON.parse(`{ "id": 1, "X": 91, "Y": 119, "text": "Start", "shape": "circle", "color": "transparent" }`);
  let rect = JSON.parse(`{ "id": 2, "X": 96, "Y": 254, "text": "Shopping", "shape": "rectangle", "color": "transparent" }`);
  let link = JSON.parse(`{ "from": 1, "to": 2, "text": "Visit online store" }`);
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes([circle, rect], [link]);
  }
  const res = renderHook(useFlowchart);
  let { setHandles } = res.result.current;
  const _flowchart = render(
    <Flowchart setHandles={setHandles} width='1200px' height='600px' editable={true} onReady={onReady} />,
  );
  _flowchart.container.querySelector('defs')?.remove();
  let groups = _flowchart.container.querySelectorAll('g');
  expect(groups.length).toBe(4);
  let paths = groups[2].querySelectorAll('path');
  expect(paths.length).toBe(2);
  let path = groups[2].querySelector('path.connector')!;
  expect(path.getAttribute('d')).toBe('M111.3719985383098,152.66222151628156C118.05956109089826,185.7078018714474,125.05,220.25,113,254');

  let arrow = groups[2].querySelector('path:not(.connector)')!;
  expect(arrow.getAttribute('d')).toBe('M0,0l-9,5v-10l9,5');
  expect(arrow.getAttribute('transform')).toBe('translate(113,254) rotate(109.64844669725134)');

  expect(_flowchart.getByText('Visit online store')).toBeInTheDocument();
});

it('Load: circle', () => {
  let nodes = JSON.parse(`[{ "id": 20, "X": 91, "Y": 119, "text": "Start", "shape": "circle", "color": "transparent" }]`);
  let links: LinkData[] = [];
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes(nodes, links);
  }
  const res = renderHook(useFlowchart);
  let { setHandles } = res.result.current;
  const _flowchart = render(
    <Flowchart setHandles={setHandles} width='1200px' height='600px' editable={true} onReady={onReady} />,
  );
  _flowchart.container.querySelector('defs')?.remove();
  let groups = _flowchart.container.querySelectorAll('g');
  expect(groups.length).toBe(1);
  let group = groups[0];
  expect(group.getAttribute('transform')).toBe("translate(91,119)");

  let circles = _flowchart.container.getElementsByTagName('circle');
  expect(circles.length).toBe(1);
  expect(_flowchart.getByText('Start')).toBeInTheDocument();
});

it('Load: rect', () => {
  let nodes = JSON.parse(`[{ "id": 22, "X": 96, "Y": 254, "text": "Shopping", "shape": "rectangle", "color": "transparent" }]`);
  let links: LinkData[] = [];
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes(nodes, links);
  }
  const res = renderHook(useFlowchart);
  let { setHandles } = res.result.current;
  const _flowchart = render(
    <Flowchart setHandles={setHandles} width='1200px' height='600px' editable={true} onReady={onReady} />,
  );
  _flowchart.container.querySelector('defs')?.remove();
  let groups = _flowchart.container.querySelectorAll('g');
  expect(groups.length).toBe(1);
  let group = groups[0];
  expect(group.getAttribute('transform')).toBe("translate(96,254)");

  let rects = _flowchart.container.querySelectorAll('rect.grabbable');
  expect(rects.length).toBe(1);
  expect(_flowchart.getByText('Shopping')).toBeInTheDocument();
});

it('Load: rhombus', () => {
  let nodes = JSON.parse(`[{ "id": 27, "X": 728, "Y": 168, "text": "Item Selected?", "shape": "rhombus", "color": "transparent" }]`);
  let links: LinkData[] = [];
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes(nodes, links);
  }
  const res = renderHook(useFlowchart);
  let { setHandles } = res.result.current;
  const _flowchart = render(
    <Flowchart setHandles={setHandles} width='1200px' height='600px' editable={true} onReady={onReady} />,
  );
  _flowchart.container.querySelector('defs')?.remove();
  let groups = _flowchart.container.querySelectorAll('g');
  expect(groups.length).toBe(1);
  let group = groups[0];
  expect(group.getAttribute('transform')).toBe("translate(728,168)");

  let polygons = _flowchart.container.querySelectorAll('polygon.grabbable');
  expect(polygons.length).toBe(1);
  expect(_flowchart.getByText('Item Selected?')).toBeInTheDocument();
});

it('editable true', () => {
  let nodes = JSON.parse(`[{ "id": 20, "X": 91, "Y": 119, "text": "Start", "shape": "circle", "color": "transparent" }]`);
  let links: LinkData[] = [];
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes(nodes, links);
  }
  const res = renderHook(useFlowchart);
  let { setHandles } = res.result.current;
  const _flowchart = render(
    <Flowchart setHandles={setHandles} width='1200px' height='600px' editable={true} onReady={onReady} />,
  );
  _flowchart.container.querySelector('defs')?.remove();
  let source = _flowchart.container.querySelector('svg')!.getElementsByClassName('source pointer')[0];
  expect(source.getAttribute('width')).toEqual("12");
  expect(source.getAttribute('height')).toEqual("12");
});

it('editable false', () => {
  let nodes = JSON.parse(`[{ "id": 20, "X": 91, "Y": 119, "text": "Start", "shape": "circle", "color": "transparent" }]`);
  let links: LinkData[] = [];
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes(nodes, links);
  }
  const res = renderHook(useFlowchart);
  let { setHandles } = res.result.current;
  const _flowchart = render(
    <Flowchart setHandles={setHandles} width='1200px' height='600px' editable={false} onReady={onReady} />,
  );
  _flowchart.container.querySelector('defs')?.remove();
  let rects = _flowchart.container.querySelector('svg')!.getElementsByTagNameNS(ns, 'rect')!;
  for (let i = 0; i < rects.length; i++) {
    let rect = rects[i];
    expect(rect).not.toHaveClass("source");
    expect(rect).not.toHaveClass("pointer");
  }
});

it('Show content', () => {
  let nodes = JSON.parse(`[{ "id": 20, "X": 91, "Y": 119, "text": "Start", "shape": "circle", "color": "transparent" }]`);
  let links: LinkData[] = [];
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes(nodes, links);
  }
  const res = renderHook(useFlowchart);
  let { setHandles, flowchart } = res.result.current;
  const _flowchart = render(
    <Flowchart setHandles={setHandles} width='1200px' height='600px' onReady={onReady} />,
  );
  _flowchart.container.querySelector('defs')?.remove();
  // console.log(prettyDOM(_flowchart.container.querySelector('svg')!));
});