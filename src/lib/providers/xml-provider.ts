import { json2xml } from "xml-js";

import { BaseProvider, ConvertParams } from "./base-provider";
import { ConversionType } from "../types/conversion-types";

export class XmlProvider extends BaseProvider {
  convert({ document,  convertType }: ConvertParams): string {
    if (convertType === ConversionType.JSON) {
      return json2xml(document, { compact: true, spaces: 4 });
    }
    if (convertType === ConversionType.STRING) {
      return "JSON TO STRING";
    }

    throw Error("Invalid conversion type for XmlProvider");
  }
  parse(document: string): boolean {
    throw new Error("Method not implemented.");
  }

  validate(document: string): boolean {
    if (!document || document.trim().length === 0) {
      return false;
    }
    return true;
  }
}
