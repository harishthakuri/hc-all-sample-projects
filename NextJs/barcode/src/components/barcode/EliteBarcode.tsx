"use client";
import { Barcode } from "lucide-react";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import JsBarcode from "jsbarcode";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { useJsBarcode } from "@/hooks/useJsBarcode";

const EliteBarcode = () => {
  const [barcodeValue, setBarcodeValue] = useState<string>("12345678908");
  const [barcodeFormat, setBarcodeFormat] = useState<string>("UPC");

  const { inputRef, isError } = useJsBarcode<HTMLCanvasElement>({
    value: barcodeValue,
    options: {
      format: barcodeFormat as JsBarcode.Options["format"],
      flat: false,
      width: 3,
      height: 100,
      fontSize: 45,
      fontOptions: "bold",
    },
  });
  /*
html2canvas is a JavaScript library that allows you to take a snapshot of web page elements and convert them into a canvas image. 
Here’s how you can use html2canvas in your project, particularly if you're working with Next.js or any modern JavaScript framework
*/
  const downloadBarcode = async () => {
    const element = inputRef.current;
    if (element) {
      const canvas = await html2canvas(element as HTMLCanvasElement);
      const image = canvas.toDataURL("image/png");
      // Here you can handle the dataURL, like setting it to an img src or downloading it
      const link = document.createElement("a");
      link.download = "barcode.png";
      link.href = image;
      link.click();
    }
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center gap-2 self-center font-medium">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-8 w-10 items-start justify-center rounded-md bg-primary text-primary-foreground">
            <Barcode className="size-8" />
          </div>
          <div className="text-lg font-bold"> Elite Barcode Generator</div>
        </a>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl"></CardTitle>
          <CardDescription>
            UPC Barcode generator. Enter 11 digit only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <Label>Barcode format</Label>
                  <Select
                    value={barcodeFormat}
                    onValueChange={(e) => {
                      setBarcodeFormat(e);
                    }}
                  >
                    <SelectTrigger className="w-full font-semibold">
                      <SelectValue placeholder="Select Barcode Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {/* <SelectLabel>{barcodeFormat}</SelectLabel> */}
                        <SelectItem value="UPC">UPC</SelectItem>
                        <SelectItem value="CODE39">CODE39</SelectItem>
                        <SelectItem value="CODE128">CODE128</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Label htmlFor="barcodevalue">Barcode value</Label>
                  <Input
                    id="barcodevalue"
                    type="text"
                    value={barcodeValue}
                    onChange={(e) => setBarcodeValue(e.target.value)}
                    placeholder="Enter barcode value"
                    className="font-semibold"
                    required
                  />

                  <canvas
                    ref={inputRef}
                    width={300}
                    height={100}
                    style={{ display: !isError ? "block" : "none" }}
                  />

                  <Button
                    type="button"
                    style={{ display: !isError ? "block" : "none" }}
                    className="w-full text-lg"
                    onClick={downloadBarcode}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EliteBarcode;
