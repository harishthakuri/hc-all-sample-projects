// import BarcodeComponent from "@/components/barcode/BarcodeComponent";
import EliteBarcode from "@/components/barcode/EliteBarcode";
import DialogPage from "./dialogPage";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* <BarcodeComponent /> */}
        <EliteBarcode />
        <DialogPage />
      </div>
    </div>
  );
}
