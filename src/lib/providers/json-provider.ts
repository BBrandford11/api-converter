import { json2xml } from "xml-js";
import { ConversionType } from "../types/conversion-types";
import { BaseProvider, ConvertParams } from "./base-provider";

export class JsonProvider extends BaseProvider {
  convert({ document, convertType }: ConvertParams): string {
    this.validate(document);


    if (convertType === ConversionType.XML) {
      return json2xml(document, {compact: true, ignoreComment: true, spaces: 4});
    }
    if (convertType === ConversionType.STRING) {
      return this.convertJsonToString(document);
    }

    throw Error("Invalid conversion type for JsonProvider");
  }

  private convertJsonToString(document: string): string {
    const parsed = JSON.parse(document);
    const segments: string[] = [];

    for (const segmentName of Object.keys(parsed)) {
      const segmentArray = parsed[segmentName];

      if (!Array.isArray(segmentArray)) {
        continue;
      }

      for (const segmentObject of segmentArray) {
        const values = Object.keys(segmentObject).map((key) => segmentObject[key]);
        const segmentString = `${segmentName}*${values.join("*")}~`;
        segments.push(segmentString);
      }
    }

    return segments.join("");
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
