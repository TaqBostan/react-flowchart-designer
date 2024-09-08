A lightweight component to design flowcharts. Check out the [demo](https://d5y3kk.csb.app/) for some examples.

## Features

- Different shapes of nodes.
- Add/Remove/Move nodes
- Add/Remove/Reshape links between nodes
- Enable/Disable adding/editting/removing links
- Zoom and Pan
- Raw or typed input/output

![Screenshot of ImageAnnotator](https://github.com/TaqBostan/content/blob/main/flowchart.gif?raw=true)

## Usage

Install `react-flowchart-designer` using npm.

```shell
npm install react-flowchart-designer
```

Then you can just import the component and its hook:

```js
import { Flowchart, useFlowchart } from 'react-flowchart-designer';
```

and use it as below:

```js
const { setHandles, flowchart } = useFlowchart();
```

```js
<button onClick={() => { flowchart.addRectNode(50, 50, 'my node') }}>Add Node</button>
<Flowchart setHandles={setHandles} width='700px' height='400px' editable={true} />
```

Clicking the button creates a new node at `x = 50, y = 50`. Drag the orange square from one node to another to add links.

### Mouse and Keyboard events

- **click**: Edit/Stop Edit Links - Select Node/Link
- **double click**: Edit Node/Link text
- **mouse wheel**: Zoom
- **mouse drag**: Pan - Move Node/Link
- **Delete key**: Delete Node/Link

## Loading/Saving a Flowchart

Load/save a flowchart using the data model below:

```js
const load = () => {
  let nodes = [
    { id: 1, text: 'node1', X: 50, Y: 50 },
    { id: 2, text: 'node2', X: 150, Y: 50 },
  ];
  let links = [
    { from: 1, to: 2 },
    { from: 2, to: 2 },
  ];
  flowchart.addNodes(nodes, links);
}

const save = () => console.log(flowchart.getData()) // { nodes: […], links: […] }
```

```js
<button onClick={load}>Load</button>
<button onClick={save}>Save</button>
```

## Props

The following props can be defined on `Flowchart`:

| Prop | Type | Description | Default |
|---|---|---|---|
| `width` \* | `string` | Flowchart width |  |
| `height` \* | `string` | Flowchart height |  |
| `editable` | `boolean` | Enable/Disable adding/removing links | `false` |
| `onReady` | `FlowchartHandles => any` | When the flowchart is mounted |   |

(\*) required props

## Handles
You can access the handles using the `Flowchart` object as follows:

```js
<button onClick={() => { flowchart!.addRhomNode(100, 100, txt) }}>Add Rhombus Node</button>
```

Below is a list of all handles:
| Handle | Type | Description |
|---|---|---|
| `addRectNode` | `(left: number, top: number, text: string, id?: number, color?: string) => number` | Adds a rectangle node at `(left, top)`, returns its `id` |
| `addCircleNode` |`(left: number, top: number, text: string, id?: number, color?: string) => number`| Adds a circle node at `(left, top)`, returns its `id` |
| `addRhomNode` | `(left: number, top: number, text: string, id?: number, color?: string) => number`| Adds a rhombus node at `(left, top)`, returns its `id` |
| `addNodes` | `(nodes: NodeData[], links?: LinkData[]) => void`| Adds multiple nodes and links (see [Loading a Flowchart](#loadingsaving-a-flowchart)) |
| `getData` | `() => { nodes: NodeData[], links: LinkData[] }`| Gets all nodes and links (see [Saving a Flowchart](#loadingsaving-a-flowchart)) |
| `changeLinkType` |`(id: number, type: string) => void` | Changes the type of a link (solid/dashed)


## Node

Below is the data model for nodes:

| Prop | Type | Description | Default |
|---|---|---|---|
| `id` | `number` | Node identifier |  |
| `X` \* | `number` | The `x` position of the node |  |
| `Y` \* | `number` | The `y` position of the node |  |
| `text` \* | `string` | Node text |  |
| `color` | `string` | Node color | white |
| `shape` | `string` | Node shape can be `rectangle`, `circle`, or `rhombus` | `rectangle` |

(\*) required props

## Link

Below is the data model for links:

| Prop | Type | Description | Default |
|---|---|---|---|
| `from` \* | `number` | The `id` of the origin node |  |
| `to` \* | `number` | The `id` of the destination node |  |
| `text` | `string` | Link label |  |
| `type` | `string` | Link type (solid/dashed) | solid |
| `meta` | `object` | Information about the shape of the link | |

(\*) required props

## Contributing

- Fork the project.
- Make changes.
- Run the project in development mode: `npm run ladle`.
- Write your own tests and/or update existing ones in src/flowchart/test dir.
- Check the new features and changes using `flowchart.stories.tsx` or your own Stories (`*.stories.tsx`).
- Update README with appropriate docs.
- Commit and PR

## Dependencies

React Flowchart has no dependency. However the following peer dependencies must be specified by your project in order to avoid version conflicts:
[`react`](https://www.npmjs.com/package/react),
[`react-dom`](https://www.npmjs.com/package/react-dom).
NPM will not automatically install these for you but it will show you a warning message with instructions on how to install them.