import { cleanup, fireEvent, render, prettyDOM, renderHook, waitFor, createEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
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

it('add: rect', () => {
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
  res.result.current.flowchart!.addRectNode(100, 150, 'my rect');
  _flowchart.container.querySelector('defs')?.remove();
  let groups = _flowchart.container.querySelectorAll('svg > g');
  expect(groups.length).toBe(4);
  let group = groups[3];
  expect(group.getAttribute('transform')).toBe('translate(100,150)');
  expect(group.querySelectorAll('rect.grabbable').length).toBe(1);
  expect(group.querySelector('rect.grabbable')!.getAttribute('stroke')).toBe('black');
  expect(group.querySelectorAll('text.node-txt').length).toBe(1);
  expect(group.querySelector('text.node-txt')!.innerHTML).toBe('my rect');
  expect(group.querySelectorAll('rect.source').length).toBe(1);
});

it('click: rect', () => {
  let rect = JSON.parse(`{ "id": 2, "X": 96, "Y": 254, "text": "Shopping", "shape": "rectangle", "color": "transparent" }`);
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes([rect], []);
  }
  const res = renderHook(useFlowchart);
  let { setHandles } = res.result.current;
  const _flowchart = render(
    <Flowchart setHandles={setHandles} width='1200px' height='600px' editable={true} onReady={onReady} />,
  );
  res.result.current.flowchart!.addRectNode(100, 150, 'my rect');
  _flowchart.container.querySelector('defs')?.remove();
  let groups = _flowchart.container.querySelectorAll('svg > g');
  expect(groups.length).toBe(2);

  let oldGroup = groups[0];
  expect(oldGroup.getAttribute('transform')).toBe('translate(96,254)');
  let _rect = oldGroup.querySelector('rect.grabbable')!;
  expect(_rect).not.toHaveAttribute('filter', 'url(#flt)');
  fireEvent.click(oldGroup);
  expect(_rect).toHaveAttribute('filter', 'url(#flt)');

  let newGroup = groups[1];
  expect(newGroup.getAttribute('transform')).toBe('translate(100,150)');
  _rect = newGroup.querySelector('rect.grabbable')!;
  expect(_rect).not.toHaveAttribute('filter', 'url(#flt)');
  fireEvent.click(newGroup);
  expect(_rect).toHaveAttribute('filter', 'url(#flt)');
});

it('drag: rect', async () => {
  let rect = JSON.parse(`{ "id": 2, "X": 96, "Y": 254, "text": "Shopping", "shape": "rectangle", "color": "transparent" }`);
  const onReady = (flowchart: FlowchartHandles) => {
    flowchart.addNodes([rect], []);
  }
  const res = renderHook(useFlowchart);
  let { setHandles } = res.result.current;
  const _flowchart = render(
    <Flowchart setHandles={setHandles} width='1200px' height='600px' editable={true} onReady={onReady} />,
  );
  _flowchart.container.querySelector('defs')?.remove();
  let groups = _flowchart.container.querySelectorAll('svg > g');

  let oldGroup = groups[0];
  const user = userEvent.setup()
  await user.pointer([{keys: '[MouseLeft>]', target: oldGroup, coords: {
    clientX: 100,
    clientY: 260,
  }}, {target: _flowchart.container.children[0], coords: {
    clientX: 150,
    clientY: 270,
  }}, {keys: '[/MouseLeft]', target: oldGroup}])

  expect(oldGroup.getAttribute('transform')).toBe('translate(146,264)');
});