import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

// DrawingCanvasコンポーネントのプロパティ
interface DrawingCanvasProps {
  width: number;                                    // Canvasの幅
  height: number;                                   // Canvasの高さ
  onDrawingChange?: (hasDrawing: boolean) => void;  // 描画状態変化時のコールバック
}

// 座標を表すインターフェース
interface Point {
  x: number;  // X座標
  y: number;  // Y座標
}

/**
 * 文字なぞり用の描画Canvas
 * iPad/タブレットのペンや指での描画に対応
 */
export const DrawingCanvas = forwardRef<
  { clearCanvas: () => void },    // 外部に公開するメソッド
  DrawingCanvasProps
>(({ width, height, onDrawingChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);  // Canvasへの参照
  const [isDrawing, setIsDrawing] = useState(false);  // 現在描画中かどうか
  const [lastPoint, setLastPoint] = useState<Point | null>(null);  // 前回の描画点
  const [hasDrawing, setHasDrawing] = useState(false);  // 何か描画されているかどうか

  /**
   * ポインターイベントからCanvas上の座標を取得
   */
  const getPointFromEvent = useCallback((event: PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,  // Canvas内のX座標
      y: event.clientY - rect.top    // Canvas内のY座標
    };
  }, []);

  /**
   * 2点間に線を描画
   */
  const drawLine = useCallback((from: Point, to: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = '#ff6b6b';    // 線の色（赤系）
    ctx.lineWidth = 4;              // 線の太さ
    ctx.lineCap = 'round';          // 線の端を丸く
    ctx.lineJoin = 'round';         // 線の接続部を丸く
    ctx.stroke();
  }, []);

  const handlePointerDown = useCallback((event: PointerEvent) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(event.pointerId);
    setIsDrawing(true);
    const point = getPointFromEvent(event);
    setLastPoint(point);

    if (!hasDrawing) {
      setHasDrawing(true);
      onDrawingChange?.(true);
    }
  }, [getPointFromEvent, hasDrawing, onDrawingChange]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!isDrawing || !lastPoint) return;

    const currentPoint = getPointFromEvent(event);
    drawLine(lastPoint, currentPoint);
    setLastPoint(currentPoint);
  }, [isDrawing, lastPoint, getPointFromEvent, drawLine]);

  const handlePointerUp = useCallback((event: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.releasePointerCapture(event.pointerId);
    setIsDrawing(false);
    setLastPoint(null);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    setHasDrawing(false);
    onDrawingChange?.(false);
  }, [width, height, onDrawingChange]);

  useImperativeHandle(ref, () => ({
    clearCanvas
  }), [clearCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return (
    <div className="drawing-canvas-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="drawing-canvas"
        aria-label="文字なぞり用キャンバス"
        role="img"
        data-testid="drawing-canvas"
      />
      <button
        onClick={clearCanvas}
        className="canvas-clear-button"
        aria-label="描画をクリア"
        data-testid="clear-button"
      >
        クリア
      </button>
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';