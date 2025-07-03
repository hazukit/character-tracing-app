import { useRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DrawingCanvas } from '../DrawingCanvas';

// Mock HTML5 Canvas
const mockGetContext = jest.fn(() => ({
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  strokeStyle: '',
  lineWidth: 0,
  lineCap: '',
  lineJoin: ''
}));

HTMLCanvasElement.prototype.getContext = mockGetContext as any;

HTMLCanvasElement.prototype.setPointerCapture = jest.fn();
HTMLCanvasElement.prototype.releasePointerCapture = jest.fn();
HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
  left: 0,
  top: 0,
  width: 400,
  height: 200
})) as any;

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

describe('DrawingCanvas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render canvas', () => {
    render(<DrawingCanvas />);
    
    const canvas = screen.getByTestId('drawing-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should call onDrawingChange when drawing starts', () => {
    const mockOnDrawingChange = jest.fn();
    render(<DrawingCanvas onDrawingChange={mockOnDrawingChange} />);
    
    const canvas = screen.getByTestId('drawing-canvas');
    
    // Simulate pointer down (start drawing)
    fireEvent.pointerDown(canvas, {
      clientX: 100,
      clientY: 50,
      pointerId: 1
    });

    expect(mockOnDrawingChange).toHaveBeenCalledWith(true);
  });

  it('should clear canvas when clearCanvas is called', () => {
    const mockContext = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      lineJoin: ''
    };

    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext) as any;

    const mockOnDrawingChange = jest.fn();
    
    const TestComponent = () => {
      const canvasRef = useRef<{ clearCanvas: () => void } | null>(null);
      
      return (
        <div>
          <DrawingCanvas ref={canvasRef} onDrawingChange={mockOnDrawingChange} />
          <button 
            onClick={() => canvasRef.current?.clearCanvas()}
            data-testid="external-clear"
          >
            Clear
          </button>
        </div>
      );
    };

    render(<TestComponent />);
    
    const clearButton = screen.getByTestId('external-clear');
    fireEvent.click(clearButton);

    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockOnDrawingChange).toHaveBeenCalledWith(false);
  });

  it('should render canvas with correct attributes', () => {
    render(<DrawingCanvas />);
    
    const canvas = screen.getByTestId('drawing-canvas');
    
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe('CANVAS');
  });

  it('should handle pointer events correctly', () => {
    const mockContext = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      lineJoin: ''
    };

    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext) as any;

    render(<DrawingCanvas />);
    
    const canvas = screen.getByTestId('drawing-canvas');
    
    // Start drawing
    fireEvent.pointerDown(canvas, {
      clientX: 100,
      clientY: 50,
      pointerId: 1
    });

    // Move while drawing
    fireEvent.pointerMove(canvas, {
      clientX: 150,
      clientY: 75,
      pointerId: 1
    });

    // Stop drawing
    fireEvent.pointerUp(canvas, {
      pointerId: 1
    });

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it('should expose clearCanvas method through ref', () => {
    const TestComponent = () => {
      const canvasRef = useRef<{ clearCanvas: () => void } | null>(null);
      
      return (
        <div>
          <DrawingCanvas ref={canvasRef} />
          <button 
            onClick={() => canvasRef.current?.clearCanvas()}
            data-testid="external-clear"
          >
            External Clear
          </button>
        </div>
      );
    };

    const mockContext = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      lineJoin: ''
    };

    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext) as any;

    render(<TestComponent />);
    
    const externalClearButton = screen.getByTestId('external-clear');
    fireEvent.click(externalClearButton);

    expect(mockContext.clearRect).toHaveBeenCalled();
  });
});