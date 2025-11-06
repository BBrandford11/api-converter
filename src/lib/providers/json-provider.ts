import { xml2json } from "xml-js";

import { ConversionType } from "../types/conversion-types";
import { BaseProvider, ConvertParams } from "./base-provider";

export class JsonProvider extends BaseProvider {
  convert({ document, convertType }: ConvertParams): string {
    if (convertType === ConversionType.XML) {
      return xml2json(document, { compact: true, spaces: 4 });
    }
    if (convertType === ConversionType.STRING) {
      return this.convertJsonToString(document);
    }

    throw Error("Invalid conversion type for JsonProvider");
  }

  private convertJsonToString(document: string): string {
    const parsed = JSON.parse(document);
    const segments: string[] = [];

    // Iterate over each segment name (e.g., "ProductID", "AddressID")
    for (const segmentName of Object.keys(parsed)) {
      const segmentArray = parsed[segmentName];

      if (!Array.isArray(segmentArray)) {
        continue;
      }

      // For each object in the segment array
      for (const segmentObject of segmentArray) {
        // Extract and sort keys by their numeric suffix (ProductID1, ProductID2, etc.)
        const keys = Object.keys(segmentObject)
          .filter((key) => key.startsWith(segmentName))
          .sort((a, b) => {
            const numA = parseInt(a.replace(segmentName, ""), 10);
            const numB = parseInt(b.replace(segmentName, ""), 10);
            return numA - numB;
          });

        // Build the segment string: SegmentName*value1*value2*value3~
        const values = keys.map((key) => segmentObject[key]);
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
