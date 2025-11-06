import { xml2json } from "xml-js";

import { ConversionType } from "../types/conversion-types";
import { BaseProvider, ConvertParams } from "./base-provider";

export class JsonProvider extends BaseProvider {
  convert({ document, convertType }: ConvertParams): string {
    if (convertType === ConversionType.XML) {
      return xml2json(document, { compact: true, spaces: 4 });
    }
    if (convertType === ConversionType.STRING) {
      return "JSON TO STRING";
    }

    throw Error("Invalid conversion type for JsonProvider");
  }

  validate(document: string): string[] {
    if (!document || document.trim().length === 0) {
      throw new Error("Invalid JSON format");
    }

    const parsed = JSON.parse(document);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error("Invalid JSON format");
    }

    return Object.keys(parsed);
  }
}
