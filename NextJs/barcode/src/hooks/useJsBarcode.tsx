import React, { useState } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  options?: JsBarcode.Options;
}

export function useJsBarcode<
  T extends SVGElement | HTMLCanvasElement | HTMLImageElement
>({
  ...props
}: BarcodeProps): {
  inputRef: React.RefObject<T | null>;
  error: string | null;
  isError: boolean;
} {
  const inputRef = React.useRef<T>(null);
  const { value, options } = props;
  const [error, setError] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  React.useEffect(() => {
    try {
      if (inputRef) {
        JsBarcode(inputRef.current, value, options);
      }
      setError(null);
      setIsError(false);
    } catch (err) {
      setIsError(true);
      setError(err as string);
    }
  }, [value, options]);

  return { inputRef, error, isError };
}

/*
The useBarcode function you're referring to uses TypeScript generics to create a flexible component or hook that can work with different types of elements for rendering barcodes. Here's a breakdown of how this works:

Generics
<T extends SVGElement | HTMLCanvasElement | HTMLImageElement>:
<T>: This declares T as a generic type parameter. It means the function can work with any type that fits the constraints defined by extends.

extends: This keyword is used to restrict T to only those types that are or inherit from SVGElement, HTMLCanvasElement, or HTMLImageElement. This means:
T could be:
  - SVGElement or any subtype of SVG elements.
  - HTMLCanvasElement, which represents a <canvas> element in HTML.
  - HTMLImageElement, which represents an <img> element in HTML.

Purpose and Usage
This type constraint allows useBarcode to be versatile in how it can render barcodes:

Rendering Flexibility: Depending on the implementation, useBarcode could dynamically choose how to render the barcode:
  - For SVGElement, it might generate SVG code directly into the element.
  - For HTMLCanvasElement, it could use the canvas API to draw the barcode.
  - For HTMLImageElement, it might set the src attribute with an encoded barcode image.

Type Safety: By specifying these types, TypeScript ensures that any operations performed inside useBarcode that relate to T will only be those that are applicable to all these element types or their common methods/properties. This prevents runtime errors where methods not applicable to one of these types might be called.

function useBarcode<T extends SVGElement | HTMLCanvasElement | HTMLImageElement>(
  element: T, 
  barcodeData: string, 
  options?: BarcodeOptions
) {
  if (element instanceof SVGElement) {
    /// SVG specific rendering logic
  } else if (element instanceof HTMLCanvasElement) {
    /// Canvas specific rendering logic
  } else {
    /// Image element specific logic, perhaps setting src to a generated image data URL
  }
}

/// Example usage:
const canvas = document.createElement('canvas');
useBarcode(canvas, '123456789012');

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
useBarcode(svg, '123456789012');
*/

/*
interface Options {
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  text?: string;
  fontOptions?: string;
  font?: string;
  textAlign?: string;
  textPosition?: string;
  textMargin?: number;
  fontSize?: number;
  background?: string;
  lineColor?: string;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  flat?: boolean;
  valid?: (valid: boolean) => void;
}
*/
