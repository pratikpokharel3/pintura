export interface Tool {
  name: string;
  size: number;
  color: string;
  drawing: boolean;
  lastPos: Position;
  shapeStart: Position | null;
  snapshot: ImageData | null;
}

export interface Position {
  x: number;
  y: number;
}
