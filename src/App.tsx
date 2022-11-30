
import React, { useEffect, useState, useRef } from 'react';
import './App.css';

type DropZoneState =
  | 'nothing'
  | 'supported'
  | 'unsupported';

type DropZoneComponentState = {
  dropZoneState: DropZoneState;
  imgSrc?: string;
}

const objectUrls: Array<string> = [];
function App() {
  const [componentState, setComponentState] = useState<DropZoneComponentState>();
  const inputFile = useRef<HTMLInputElement>(null);
  useEffect(() => {
    return () => {
      while (objectUrls.length > 0) {
        const objectUrl = objectUrls.pop();
        if (!objectUrl) {
          continue;
        }
        URL.revokeObjectURL(objectUrl);
      }
    }
  }, []);

  function isSupportedType(item: DataTransferItem): boolean {
    const type = item.type;
    console.info(type);
    return type === 'image/png' || type === 'image/jpeg';
  }

  function loadImage(item: DataTransferItem) {
    console.log(item.kind);

    if (!isSupportedType(item)) {
      console.error(`Unsupported type ${item.type}`)
      setComponentState({
        ...componentState,
        dropZoneState: 'unsupported',
      });
      return;
    }

    switch (item.kind) {
      case 'string':
        item.getAsString((itemString) => {
          console.info(`itemString ${itemString}`);
          setComponentState({
            dropZoneState: 'supported',
            imgSrc: itemString,
          });
        });
        break;
      case 'file':
        const file = item.getAsFile();
        if (!file) {
          console.error('Unable to get item as file');
          return null;
        }
        const objectUrl = URL.createObjectURL(file);
        objectUrls.push(objectUrl);
        setComponentState({
          dropZoneState: 'supported',
          imgSrc: objectUrl,
        });
        break;
      default:
        console.error(`Unsupported file kind ${item.kind}`);
        return null;
    }
  }

  function onDropHandler(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    console.info('onDropHandler');

    // We display the first image we can find
    for (const item of e.dataTransfer.items) {
      const data = loadImage(item);
      if (!data) {
        continue;
      }
      return;
    }
  }

  function onDragOverHandler(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }


  return (
    <div className="App">
      <div
        id={"drop-zone"}
        className={`center ${componentState?.dropZoneState}`}
        onDrop={onDropHandler}
        onDragOver={onDragOverHandler}
      >
        {componentState?.dropZoneState === "unsupported" ? <p>Unsupported file type, please upload a jpeg or png image.</p> : <p>Drag an image into the <b>drop zone</b>.</p>}
      </div>
      {componentState?.imgSrc ? <img id={"dropped-image"} src={componentState?.imgSrc} /> : null}
      <input accept="image/png,image/jpeg" type='image' ref={inputFile} style={{ display: 'none' }} />
    </div>
  )
}

export default App
