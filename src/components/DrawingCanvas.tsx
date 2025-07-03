import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

// DrawingCanvasコンポーネントのプロパティ
interface DrawingCanvasProps {
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
>(({ onDrawingChange }, ref) => {
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,  // Canvas内のX座標
      y: (event.clientY - rect.top) * scaleY    // Canvas内のY座標
    };
  }, []);

  /**
   * 2点間の距離を計算
   */
  const getDistance = useCallback((from: Point, to: Point): number => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.sqrt(dx * dx + dy * dy);
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
    ctx.strokeStyle = '#000000';    // 線の色（黒）
    ctx.lineWidth = 10;             // 線の太さ
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
    
    // 前の点との距離をチェック（手のひらや誤タッチを無視）
    const distance = getDistance(lastPoint, currentPoint);
    const maxDistance = 80; // 最大許容距離（ピクセル）
    
    // 距離が大きすぎる場合は無視して位置だけ更新
    if (distance > maxDistance) {
      setLastPoint(currentPoint);
      return;
    }
    
    drawLine(lastPoint, currentPoint);
    setLastPoint(currentPoint);
  }, [isDrawing, lastPoint, getPointFromEvent, drawLine, getDistance]);

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    onDrawingChange?.(false);
  }, [onDrawingChange]);

  useImperativeHandle(ref, () => ({
    clearCanvas
  }), [clearCanvas]);

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // サイズが変わっていない場合は何もしない
    if (canvas.width === window.innerWidth && canvas.height === window.innerHeight) {
      return;
    }
    
    // 現在の描画内容を保存
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let imageData = null;
    if (hasDrawing && canvas.width > 0 && canvas.height > 0) {
      try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e) {
        console.warn('Failed to save canvas data:', e);
      }
    }
    
    // サイズを更新
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 描画内容を復元
    if (imageData) {
      try {
        ctx.putImageData(imageData, 0, 0);
      } catch (e) {
        console.warn('Failed to restore canvas data:', e);
      }
    }
  }, [hasDrawing]);

  // イベントハンドラーのrefを作成
  const handlersRef = useRef({
    pointerDown: handlePointerDown,
    pointerMove: handlePointerMove,
    pointerUp: handlePointerUp
  });

  // refを最新の関数で更新
  useEffect(() => {
    handlersRef.current = {
      pointerDown: handlePointerDown,
      pointerMove: handlePointerMove,
      pointerUp: handlePointerUp
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 初期サイズ設定
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // ラッパー関数を作成してrefから関数を呼び出す
    const onPointerDown = (e: PointerEvent) => handlersRef.current.pointerDown(e);
    const onPointerMove = (e: PointerEvent) => handlersRef.current.pointerMove(e);
    const onPointerUp = (e: PointerEvent) => handlersRef.current.pointerUp(e);

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, []); // 依存配列を空にする

  // リサイズイベントを別のuseEffectで処理
  useEffect(() => {
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [updateCanvasSize]);

  return (
    <canvas
      ref={canvasRef}
      id="drawing-canvas"
      className="drawing-canvas"
      aria-label="文字なぞり用キャンバス"
      role="img"
      data-testid="drawing-canvas"
    />
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';