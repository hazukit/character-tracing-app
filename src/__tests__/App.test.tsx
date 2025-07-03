import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import * as characterApi from '../services/characterApi';

// Mock the Character API
jest.mock('../services/characterApi');
const mockCharacterApi = characterApi as jest.Mocked<typeof characterApi>;

// Mock DrawingCanvas component
const mockClearCanvas = jest.fn();
jest.mock('../components/DrawingCanvas', () => ({
  DrawingCanvas: React.forwardRef(({ width, height }: { width: number; height: number }, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      clearCanvas: mockClearCanvas
    }));
    
    return (
      <div data-testid="drawing-canvas" data-width={width} data-height={height}>
        Mock Drawing Canvas
      </div>
    );
  })
}));

describe('App', () => {
  const mockCharacter = {
    id: 'cat',
    name: 'ねこ',
    image: '🐱',
    source: 'animals'
  };

  const mockDataSources = [
    { 
      name: 'animals', 
      description: '動物キャラクター',
      getRandomCharacter: jest.fn(),
      getAllCharacters: jest.fn()
    },
    { 
      name: 'shapes', 
      description: '基本図形',
      getRandomCharacter: jest.fn(),
      getAllCharacters: jest.fn()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockClearCanvas.mockClear();
    mockCharacterApi.getRandomCharacter.mockResolvedValue(mockCharacter);
    mockCharacterApi.getAvailableDataSources.mockReturnValue(mockDataSources);
    mockCharacterApi.setDataSource.mockImplementation(() => {});
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('should render app title', () => {
    render(<App />);
    expect(screen.getByText('文字なぞり練習')).toBeInTheDocument();
  });

  it('should display emoji character and name when loaded', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('character-image')).toBeInTheDocument();
    });

    const characterImage = screen.getByTestId('character-image');
    expect(characterImage).toHaveTextContent('🐱');

    expect(screen.getByTestId('display-text')).toHaveTextContent('ねこ');
  });

  it('should display Pokemon image as img tag when character has URL', async () => {
    const pokemonCharacter = {
      id: 'pokemon-25',
      name: 'ピカチュウ',
      image: 'https://pokeapi.co/media/sprites/pokemon/25.png',
      source: 'pokemon'
    };

    mockCharacterApi.getRandomCharacter.mockResolvedValue(pokemonCharacter);
    
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('character-image')).toBeInTheDocument();
    });

    const characterImage = screen.getByTestId('character-image');
    const imgElement = characterImage.querySelector('img');
    
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', 'https://pokeapi.co/media/sprites/pokemon/25.png');
    expect(imgElement).toHaveAttribute('alt', 'ピカチュウ');
    expect(imgElement).toHaveClass('character-img');

    expect(screen.getByTestId('display-text')).toHaveTextContent('ピカチュウ');
  });

  it('should show loading state initially', () => {
    render(<App />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should handle character fetch error', async () => {
    mockCharacterApi.getRandomCharacter.mockRejectedValue(new Error('API Error'));
    
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('キャラクターの読み込みに失敗しました')).toBeInTheDocument();
    });
  });

  it('should load new character when next button is clicked', async () => {
    const secondCharacter = {
      id: 'dog',
      name: 'いぬ',
      image: '🐶',
      source: 'animals'
    };

    mockCharacterApi.getRandomCharacter
      .mockResolvedValueOnce(mockCharacter)
      .mockResolvedValueOnce(secondCharacter);

    render(<App />);

    // Wait for initial character to load
    await waitFor(() => {
      expect(screen.getByText('ねこ')).toBeInTheDocument();
    });

    // Click next button
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    // Wait for new character to load
    await waitFor(() => {
      expect(screen.getByText('いぬ')).toBeInTheDocument();
    });

    expect(mockCharacterApi.getRandomCharacter).toHaveBeenCalledTimes(2);
  });

  it('should clear canvas when next button is clicked', async () => {
    render(<App />);

    // Wait for initial character to load
    await waitFor(() => {
      expect(screen.getByText('ねこ')).toBeInTheDocument();
    });

    // Click next button
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    // Canvas should be cleared
    expect(mockClearCanvas).toHaveBeenCalledTimes(1);
  });

  it('should disable next button while loading', async () => {
    render(<App />);

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();

    await waitFor(() => {
      expect(nextButton).not.toBeDisabled();
    });
  });

  it('should render drawing canvas', () => {
    render(<App />);
    
    const canvas = screen.getByTestId('drawing-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should display custom text when input is submitted', async () => {
    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('ねこ')).toBeInTheDocument();
    });

    const textInput = screen.getByTestId('custom-text-input');
    const submitButton = screen.getByTestId('submit-text-button');

    // Enter custom text
    fireEvent.change(textInput, { target: { value: 'hello' } });
    fireEvent.click(submitButton);

    // Should display custom text instead of character name
    expect(screen.getByTestId('display-text')).toHaveTextContent('hello');
    
    // Character image should show custom text icon
    expect(screen.getByTestId('character-image')).toHaveTextContent('📝');
  });

  it('should disable submit button when input is empty', () => {
    render(<App />);

    const submitButton = screen.getByTestId('submit-text-button');
    expect(submitButton).toBeDisabled();

    const textInput = screen.getByTestId('custom-text-input');
    fireEvent.change(textInput, { target: { value: 'test' } });
    expect(submitButton).not.toBeDisabled();

    fireEvent.change(textInput, { target: { value: '' } });
    expect(submitButton).toBeDisabled();
  });

  it('should clear custom text input and show character again when next is clicked', async () => {
    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('ねこ')).toBeInTheDocument();
    });

    // Enter custom text
    const textInput = screen.getByTestId('custom-text-input');
    const submitButton = screen.getByTestId('submit-text-button');
    
    fireEvent.change(textInput, { target: { value: 'custom' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('custom')).toBeInTheDocument();

    // Click next to load new character
    const nextButton = screen.getByTestId('next-button');
    fireEvent.click(nextButton);

    // Should show character again
    await waitFor(() => {
      expect(screen.getByTestId('character-image')).toBeInTheDocument();
    });
  });

  it('should render data source selector', () => {
    render(<App />);
    
    const selector = screen.getByTestId('data-source-select');
    expect(selector).toBeInTheDocument();
    // Data source selector should be present without label text
  });

  it('should change data source when selector is changed', async () => {
    render(<App />);
    
    const selector = screen.getByTestId('data-source-select');
    
    // Change to shapes
    fireEvent.change(selector, { target: { value: 'shapes' } });
    
    expect(mockCharacterApi.setDataSource).toHaveBeenCalledWith('shapes');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('character-tracing-data-source', 'shapes');
  });
});