import { json2xml, xml2json } from "xml-js";

import { BaseProvider, ConvertParams } from "./base-provider";
import { ConversionType } from "../types/conversion-types";

export class XmlProvider extends BaseProvider {
  convert({ document, convertType }: ConvertParams): string {
    if (convertType === ConversionType.JSON) {
      return json2xml(document, { compact: true, spaces: 4 });
    }
    if (convertType === ConversionType.STRING) {
      return this.convertXmlToString(document);
    }

    throw Error("Invalid conversion type for XmlProvider");
  }

  private convertXmlToString(document: string): string {
    // First convert XML to JSON string
    const jsonString = xml2json(document, { compact: true, spaces: 2 });
    // Parse the JSON string
    const parsed = JSON.parse(jsonString);
    
    // Extract the root object (xml-js wraps everything in a root key)
    const root = parsed.root || parsed;
    
    const segments: string[] = [];

    // Iterate over each segment name (e.g., "ProductID", "AddressID")
    for (const segmentName of Object.keys(root)) {
      // xml-js may wrap arrays, so handle both array and single object cases
      let segmentArray = root[segmentName];
      
      // If it's not an array, make it an array
      if (!Array.isArray(segmentArray)) {
        segmentArray = [segmentArray];
      }

      // For each object in the segment array
      for (const segmentObject of segmentArray) {
        // Extract and sort keys by their numeric suffix (ProductID1, ProductID2, etc.)
        const keys = Object.keys(segmentObject)
          .filter((key) => key.startsWith(segmentName) && key !== segmentName)
          .sort((a, b) => {
            const numA = parseInt(a.replace(segmentName, ""), 10);
            const numB = parseInt(b.replace(segmentName, ""), 10);
            return numA - numB;
          });

        // Build the segment string: SegmentName*value1*value2*value3~
        const values = keys.map((key) => segmentObject[key]._text || segmentObject[key]);
        const segmentString = `${segmentName}*${values.join("*")}~`;
        segments.push(segmentString);
      }
    }

    return segments.join("");
  }

  validate(document: string): string[] {
    if (!document || document.trim().length === 0) {
      throw new Error("Invalid XML format");
    }

    const trimmed = document.trim();

    // Must start with <
    if (!trimmed.startsWith("<")) {
      throw new Error("Invalid XML format");
    }

    // Basic check: must have a root element
    if (!trimmed.includes("<root>")) {
      throw new Error("Invalid XML format");
    }

    // Extract segment names (like ProductID, AddressID, etc.)
    const segments: string[] = [];
    const lines = trimmed.split("\n").filter((line) => line.trim().length > 0);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (
        trimmedLine.startsWith("<") &&
        !trimmedLine.startsWith("</") &&
        !trimmedLine.startsWith("<?") &&
        !trimmedLine.includes("root")
      ) {
        const segmentName = trimmedLine.substring(1, trimmedLine.indexOf(">"));
        if (segmentName && !segments.includes(segmentName)) {
          segments.push(segmentName);
        }
      }
    }

    return segments;
  }
}
