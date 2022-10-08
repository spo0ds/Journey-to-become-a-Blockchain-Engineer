declare module "react-qr-code" {
  import * as React from "react";

  export interface QRCodeProps extends React.SVGProps<SVGElement> {
    value: string;
    size?: number; // defaults to 128
    bgColor?: string; // defaults to '#FFFFFF'
    fgColor?: string; // defaults to '#000000'
    level?: string; // defaults to 'L' , Can be one of 'L,M,H,Q'
  }

  class QRCode extends React.Component<QRCodeProps, any> {
    render(): JSX.Element
  }

  export default QRCode;
}
