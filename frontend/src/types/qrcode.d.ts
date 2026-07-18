declare module "qrcode" {
  type QrColorOptions = {
    dark?: string;
    light?: string;
  };

  type QrToDataUrlOptions = {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    color?: QrColorOptions;
  };

  const QRCode: {
    toDataURL(text: string, options?: QrToDataUrlOptions): Promise<string>;
  };

  export default QRCode;
}
